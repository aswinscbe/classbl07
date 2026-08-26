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
    document.getElementById("onboardingDialog")?.addEventListener("click",event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
