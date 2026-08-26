(() => {
  "use strict";
  const replacements = new Map([
    ["Â·", "·"], ["â€”", "—"], ["â€“", "–"], ["â€¦", "…"],
    ["â€™", "’"], ["Ã—", "×"], ["â†’", "→"], ["â€˜", "‘"],
    ["â€œ", "“"], ["â€", "”"]
  ]);
  const clean = value => {
    let output = String(value || "");
    replacements.forEach((correct, broken) => { output = output.split(broken).join(correct); });
    return output;
  };
  const repair = root => {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const fixed = clean(root.nodeValue);
      if (fixed !== root.nodeValue) root.nodeValue = fixed;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const fixed = clean(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    }
    if (root.querySelectorAll) root.querySelectorAll("[title],[aria-label],[placeholder]").forEach(el => {
      ["title", "aria-label", "placeholder"].forEach(name => {
        if (el.hasAttribute(name)) el.setAttribute(name, clean(el.getAttribute(name)));
      });
    });
  };
  const updateStateClasses = () => {
    // renderHome() already sets/removes .is-empty on #focusPanel directly; this hook is
    // kept as a safe no-op so the MutationObserver wiring below still has something to call.
  };
  const decorateCalendar = () => {
    document.querySelectorAll("#calendarGrid .calendar-day").forEach((day, index) => {
      day.classList.toggle("weekend", index % 7 > 4);
      const holiday=window.BL07_HOLIDAYS?.[day.dataset.date];
      day.classList.toggle("holiday",Boolean(holiday));
      let mark=day.querySelector(".calendar-holiday-mark");
      if(holiday&&!mark){mark=document.createElement("span");mark.className="calendar-holiday-mark";day.appendChild(mark)}
      if(mark){if(mark.textContent!==(holiday||""))mark.textContent=holiday||"";mark.hidden=!holiday}
    });
    const selected=document.querySelector("#calendarGrid .calendar-day.selected"),holiday=window.BL07_HOLIDAYS?.[selected?.dataset.date],agenda=document.getElementById("dayAgenda");
    let banner=agenda?.querySelector(":scope > .academic-date-banner");
    if(holiday&&agenda){if(!banner){banner=document.createElement("div");banner.className="academic-date-banner";agenda.prepend(banner)}if(banner.dataset.holiday!==holiday){banner.dataset.holiday=holiday;banner.innerHTML=`<span>HOLIDAY</span><strong>${holiday}</strong>`}}else banner?.remove();
  };
  const isoForOffset = offset => {
    const now = new Date();
    const india = new Date(now.toLocaleString("en-US", {timeZone:"Asia/Kolkata"}));
    india.setDate(india.getDate() + offset);
    return `${india.getFullYear()}-${String(india.getMonth()+1).padStart(2,"0")}-${String(india.getDate()).padStart(2,"0")}`;
  };
  const parseClassCard = card => {
    const id = card.dataset.classId || "";
    let date = id.split("|")[0] || "";
    let code = card.querySelector(".agenda-code-chip")?.textContent.trim() || "";
    let title = card.querySelector(".agenda-course-line h3")?.textContent.trim() || "";
    let time = card.querySelector(".agenda-time-block time")?.textContent.trim() || "";
    let meta = [...card.querySelectorAll(".agenda-meta-row span")].map(x=>x.textContent.trim()).filter(Boolean).join(" · ");
    if(card.id==="focusPanel"){
      date=card.dataset.focusDate||isoForOffset(0);
      code=document.getElementById("focusCode")?.textContent.trim()||"";
      title=document.getElementById("focusTitle")?.textContent.trim()||"";
      time=document.getElementById("focusRange")?.textContent.trim()||"";
      meta=[document.getElementById("focusVenue")?.textContent.trim(),document.getElementById("focusFaculty")?.textContent.trim()].filter(Boolean).join(" / ");
    }
    if (card.classList.contains("vertical-class")) {
      code = card.querySelector(".timeline-code-chip")?.textContent.trim() || "";
      title = card.querySelector(".vertical-content strong")?.childNodes[0]?.textContent?.trim() || card.querySelector(".vertical-content strong")?.textContent.trim() || "";
      const timeBox = card.querySelector(".vertical-time");
      const startText=timeBox?.childNodes[0]?.textContent?.trim()||"";
      const endText=timeBox?.querySelector("small")?.textContent?.trim()||"";
      time = [startText,endText].filter(Boolean).join("–");
      meta = card.querySelector(".vertical-content p")?.textContent.trim() || "";
      date = document.getElementById("timelineDateTitle")?.textContent.trim()==="Tomorrow" ? isoForOffset(1) : isoForOffset(0);
    }
    if (card.classList.contains("schedule-item")) {
      const raw = card.querySelector(".schedule-info strong")?.textContent.trim() || "";
      const pieces = raw.split("·").map(x=>x.trim());
      code = pieces.shift() || "";
      title = pieces.join(" · ");
      time = card.querySelector(".schedule-time")?.textContent.replace(/\s+/g," ").trim() || "";
      meta = card.querySelector(".schedule-info p")?.textContent.trim() || "";
      date = isoForOffset(0);
    }
    let calendar=card.querySelector(".open-calendar")?.href || "";
    if(!calendar&&date&&code){
      const times=time.match(/\d{1,2}:\d{2}\s*(?:am|pm)/gi)||[];
      const compact=value=>{const match=value?.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);if(!match)return"";let hour=Number(match[1]);if(match[3].toLowerCase()==="pm"&&hour<12)hour+=12;if(match[3].toLowerCase()==="am"&&hour===12)hour=0;return`${String(hour).padStart(2,"0")}${match[2]}00`};
      if(times.length>1){const day=date.replaceAll("-","");calendar=`https://calendar.google.com/calendar/render?action=TEMPLATE&ctz=Asia%2FKolkata&text=${encodeURIComponent(`${code} · ${title}`)}&dates=${day}T${compact(times[0])}/${day}T${compact(times[1])}&location=${encodeURIComponent(meta.split("·")[0]?.trim()||"")}`}
    }
    return {code:code.split("-")[0],fullCode:code,title,time,meta,date,calendar};
  };
  let activeClass = null;
  const openClassSheet = card => {
    activeClass = parseClassCard(card);
    document.getElementById("sheetClassCode").textContent = activeClass.fullCode || activeClass.code || "CLASS";
    document.getElementById("sheetClassTitle").textContent = activeClass.title || "Class details";
    document.getElementById("sheetClassMeta").textContent = [activeClass.time,activeClass.meta].filter(Boolean).join(" · ");
    const calendar = document.getElementById("sheetAddCalendar");
    calendar.hidden = !activeClass.calendar;
    if (activeClass.calendar) calendar.href = activeClass.calendar;
    document.getElementById("classActionDialog").showModal();
  };
  const openLinkedDialog = type => {
    if (!activeClass) return;
    document.getElementById("classActionDialog").close();
    const dialog = document.getElementById(type==="task" ? "taskDialog" : "noteDialog");
    const course = document.getElementById(type==="task" ? "taskCourse" : "noteCourse");
    if (course) course.value = activeClass.code;
    if (type==="task") {
      document.getElementById("taskTitle").value = "";
      document.getElementById("taskDate").value = activeClass.date || "";
    } else {
      document.getElementById("noteTitle").value = activeClass.title ? `${activeClass.fullCode || activeClass.code} note` : "";
      document.getElementById("noteBody").value = "";
    }
    dialog.showModal();
  };
  const start = () => {
    document.title = clean(document.title);
    repair(document.body);
    updateStateClasses();
    decorateCalendar();
    new MutationObserver(records => records.forEach(record => {
      record.addedNodes.forEach(repair);
      if (record.type === "characterData") repair(record.target);
      updateStateClasses();
      decorateCalendar();
    })).observe(document.body, {subtree:true, childList:true, characterData:true});
    document.addEventListener("click", event => {
      const card = event.target.closest(".vertical-class,.agenda-class-card,.schedule-item,#focusPanel:not(.is-empty)");
      if (card && !event.target.closest("button,a,input")) openClassSheet(card);
    });
    document.getElementById("sheetAddTask")?.addEventListener("click",()=>openLinkedDialog("task"));
    document.getElementById("sheetAddNote")?.addEventListener("click",()=>openLinkedDialog("note"));
    document.querySelector(".sheet-close")?.addEventListener("click",()=>document.getElementById("classActionDialog").close());
    document.getElementById("classActionDialog")?.addEventListener("click",event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
    document.getElementById("onboardingDialog")?.addEventListener("click",event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
