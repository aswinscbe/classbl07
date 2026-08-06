(() => {
  "use strict";
  const API = "https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec";
  const KEYS = {
    profile: "classbl07-command-profile-v1",
    tasks: "classbl07-command-tasks-v1",
    notes: "classbl07-command-notes-v1",
    cache: "classbl07-command-schedule-v1",
    theme: "classbl07-command-theme-v1"
  };
  const state = {
    all: [], classes: [], electives: [], profile: load(KEYS.profile, {name:"Aswin S", section:"A", electives:[], theme:"system"}),
    tasks: load(KEYS.tasks, []), notes: load(KEYS.notes, []),
    selectedDate: isoToday(), calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    plannerTab:"calendar", taskFilter:"open", messDay: weekdayKey(new Date()), lastUpdated:null
  };
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const canonical = c => String(c||"").toUpperCase().replace(/^NWLB$/,"NWW").split("-")[0];
  const venueOf = c => c.venue || c.room || "Venue TBA";

  function load(key, fallback){ try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } }
  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function isoToday(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function weekdayKey(d){ return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][d.getDay()]; }
  function minutes(t){ const [h,m]=String(t||"00:00").split(":").map(Number); return h*60+m; }
  function dateTime(c, which="startTime"){ return new Date(`${c.dateIso}T${c[which]||c[which==="startTime"?"start":"end"]}:00+05:30`); }
  function formatTime(t){ const [h,m]=t.split(":").map(Number); return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(2026,0,1,h,m)); }
  function formatDate(iso, opts={weekday:"long",day:"numeric",month:"short"}){ return new Intl.DateTimeFormat("en-IN",opts).format(new Date(`${iso}T12:00:00+05:30`)); }
  function initials(name){ return String(name||"AS").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(); }

  function applyTheme(){
    const pref = state.profile.theme || localStorage.getItem(KEYS.theme) || "system";
    const theme = pref === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light") : pref;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme==="dark"?"#0b111b":"#f4f5f7";
  }
  function filteredClasses(){
    const selected = new Set((state.profile.electives||[]).map(canonical));
    return state.all.filter(c => c.type==="Core" ? (state.profile.section==="A"?c.section==="A":c.section==="B") : selected.has(canonical(c.baseCode||c.code)));
  }
  function migrateProfile(){
    state.profile.electives = [...new Set((state.profile.electives||[]).map(canonical))];
    save(KEYS.profile,state.profile);
  }
  async function syncSchedule(force=false){
    const pill=$("#syncPill"); pill.className="sync-pill"; pill.innerHTML="<i></i><span>Connecting</span>";
    try {
      const url = new URL(API);
      url.searchParams.set("section", state.profile.section || "A");
      url.searchParams.set("electives", (state.profile.electives||[]).join(","));
      url.searchParams.set("includeCancelled","true");
      if(force) url.searchParams.set("_",Date.now());
      const response = await fetch(url,{cache:"no-store"});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if(!data.success) throw new Error(data.error||"Schedule API failed");
      state.all = data.classes||[];
      state.electives = data.availableElectives||[];
      state.lastUpdated = data.updatedAt;
      save(KEYS.cache,{all:state.all,electives:state.electives,lastUpdated:state.lastUpdated});
      state.classes=filteredClasses();
      pill.className="sync-pill ok"; pill.innerHTML="<i></i><span>Synced</span>";
    } catch(err) {
      const cached=load(KEYS.cache,null);
      if(cached){ state.all=cached.all||[]; state.electives=cached.electives||[]; state.lastUpdated=cached.lastUpdated; state.classes=filteredClasses(); }
      pill.className="sync-pill error"; pill.innerHTML="<i></i><span>Offline</span>";
      console.error(err);
    }
    renderAll();
  }

  function showPage(name){
    $$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===name));
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===name));
    scrollTo({top:0,behavior:"smooth"});
    if(name==="planner") renderCalendar();
    if(name==="campus") renderCampus();
  }

  function renderAll(){
    migrateProfile();
    state.classes=filteredClasses();
    renderProfile();
    renderCourseOptions();
    renderHome();
    renderCalendar();
    renderTasks();
    renderNotes();
    renderCampus();
  }

  function renderHome(){
    const now=new Date();
    $("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(now).toUpperCase();
    const hour=now.getHours(); $("#greeting").textContent=`Good ${hour<12?"morning":hour<17?"afternoon":"evening"}, ${state.profile.name.split(" ")[0]||"there"}.`;
    const today=isoToday();
    const todays=state.classes.filter(c=>c.dateIso===today && c.status!=="Cancelled").sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
    const current=todays.find(c=>now>=dateTime(c,"startTime") && now<dateTime(c,"endTime"));
    const next=todays.find(c=>now<dateTime(c,"startTime"));
    const focus=current||next;
    const panel=$("#focusPanel");
    if(focus){
      const isNow=!!current;
      $("#focusState").textContent=isNow?"HAPPENING NOW":"UP NEXT";
      $("#focusCode").textContent=focus.code;
      $("#focusTitle").textContent=focus.course;
      $("#focusMeta").textContent=`${formatTime(focus.startTime)} – ${formatTime(focus.endTime)} · ${venueOf(focus)} · ${focus.faculty}`;
      const target=isNow?dateTime(focus,"endTime"):dateTime(focus,"startTime");
      const diff=Math.max(0,Math.ceil((target-now)/60000));
      $("#focusCountdownLabel").textContent=isNow?"ENDS IN":"STARTS IN";
      $("#focusCountdown").textContent=diff>=60?`${Math.floor(diff/60)}h ${diff%60}m`:`${diff} min`;
      const progress=isNow?Math.min(100,Math.max(0,((now-dateTime(focus,"startTime"))/(dateTime(focus,"endTime")-dateTime(focus,"startTime")))*100)):0;
      $("#focusProgress").style.width=`${progress}%`;
      panel.hidden=false;
    } else {
      $("#focusState").textContent="TODAY";
      $("#focusCode").textContent="CLEAR";
      $("#focusTitle").textContent=todays.length?"No more classes today":"No scheduled classes today";
      $("#focusMeta").textContent="Use the Planner to look ahead.";
      $("#focusCountdownLabel").textContent="STATUS"; $("#focusCountdown").textContent="Done"; $("#focusProgress").style.width="100%";
    }
    const remaining=state.classes.filter(c=>c.dateIso===today && c.status!=="Cancelled" && now<dateTime(c,"endTime"));
    $("#todayCount").textContent=remaining.length;
    $("#todaySchedule").innerHTML=scheduleHtml(remaining,true);

    const monday=new Date(now); monday.setHours(0,0,0,0); monday.setDate(now.getDate()-((now.getDay()+6)%7));
    const nextMonday=new Date(monday); nextMonday.setDate(monday.getDate()+7);
    const week=state.classes.filter(c=>c.status!=="Cancelled" && dateTime(c,"endTime")>now && dateTime(c,"startTime")<nextMonday);
    const mins=week.reduce((sum,c)=>sum+Math.max(0,(dateTime(c,"endTime")-Math.max(now,dateTime(c,"startTime")))/60000),0);
    const cancels=state.classes.filter(c=>c.status==="Cancelled" && dateTime(c,"startTime")>=monday && dateTime(c,"startTime")<nextMonday).length;
    $("#weekClasses").textContent=week.length; $("#weekHours").textContent=`${Math.floor(mins/60)}h ${Math.round(mins%60)}m`; $("#weekCancelled").textContent=cancels;
    renderHomeTasks();
  }

  function scheduleHtml(list, includeLunch=false){
    if(!list.length) return `<div class="empty-state">Nothing scheduled.</div>`;
    const sorted=[...list].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
    let html="", lunchAdded=false;
    sorted.forEach(c=>{
      if(includeLunch && !lunchAdded && minutes(c.startTime)>=14*60+30){
        html+=`<div class="lunch-row"><span>13:30</span><div><strong>Lunch break</strong><br><span>Until 14:30</span></div></div>`; lunchAdded=true;
      }
      html+=`<article class="schedule-item ${c.status==="Cancelled"?"cancelled":""}">
        <div class="schedule-time">${esc(formatTime(c.startTime))}<br><span>${esc(formatTime(c.endTime))}</span></div>
        <div class="schedule-info"><strong>${esc(c.code)} · ${esc(c.course)}</strong><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p>${c.status==="Cancelled"?'<span class="status-badge cancelled">CANCELLED</span>':""}</div>
      </article>`;
    });
    return html;
  }

  function renderCalendar(){
    const d=state.calendarMonth, y=d.getFullYear(), m=d.getMonth();
    $("#calendarTitle").textContent=new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(d);
    const first=new Date(y,m,1), offset=(first.getDay()+6)%7, start=new Date(y,m,1-offset);
    let html="";
    for(let i=0;i<42;i++){
      const day=new Date(start); day.setDate(start.getDate()+i);
      const iso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
      const has=state.classes.some(c=>c.dateIso===iso)||state.tasks.some(t=>t.date===iso);
      html+=`<button class="calendar-day ${day.getMonth()!==m?"outside":""} ${iso===isoToday()?"today":""} ${iso===state.selectedDate?"selected":""} ${has?"has-events":""}" data-date="${iso}">${day.getDate()}</button>`;
    }
    $("#calendarGrid").innerHTML=html;
    $$(".calendar-day").forEach(b=>b.addEventListener("click",()=>{state.selectedDate=b.dataset.date; renderCalendar();}));
    const classes=state.classes.filter(c=>c.dateIso===state.selectedDate);
    const tasks=state.tasks.filter(t=>t.date===state.selectedDate);
    $("#agendaDate").textContent=formatDate(state.selectedDate);
    $("#agendaCount").textContent=classes.length+tasks.length;
    $("#dayAgenda").innerHTML=scheduleHtml(classes,true)+(tasks.length?`<div class="task-list">${tasks.map(taskHtml).join("")}</div>`:"");
  }

  function renderCourseOptions(){
    const options=(state.electives||[]).map(e=>`<option value="${esc(e.code)}">${esc(e.code)} · ${esc(e.course)}</option>`).join("");
    ["#quickTaskCourse","#taskCourse","#noteCourse"].forEach(sel=>{ const el=$(sel); if(el) el.innerHTML='<option value="">General</option>'+options; });
  }

  function addTask(title,course,date){ state.tasks.unshift({id:crypto.randomUUID(),title,course,date,completed:false,createdAt:Date.now()}); save(KEYS.tasks,state.tasks); renderTasks(); renderHomeTasks(); renderCalendar(); }
  function taskHtml(t){ return `<article class="task-item ${t.completed?"completed":""}" data-task="${t.id}"><input type="checkbox" ${t.completed?"checked":""} aria-label="Complete task"><div><strong>${esc(t.title)}</strong><p>${esc(t.course||"General")}${t.date?` · ${esc(formatDate(t.date,{day:"numeric",month:"short"}))}`:""}</p></div><button class="delete-button" aria-label="Delete task">×</button></article>`; }
  function bindTaskRows(root){
    $$(".task-item",root).forEach(row=>{
      $("input",row).addEventListener("change",e=>{ const t=state.tasks.find(x=>x.id===row.dataset.task); if(t){t.completed=e.target.checked; save(KEYS.tasks,state.tasks); renderTasks(); renderHomeTasks(); renderCalendar();}});
      $(".delete-button",row).addEventListener("click",()=>{state.tasks=state.tasks.filter(x=>x.id!==row.dataset.task); save(KEYS.tasks,state.tasks); renderTasks(); renderHomeTasks(); renderCalendar();});
    });
  }
  function renderHomeTasks(){ const open=state.tasks.filter(t=>!t.completed).slice(0,3); $("#homeTasks").innerHTML=open.length?open.map(taskHtml).join(""):'<div class="empty-state">No open tasks.</div>'; bindTaskRows($("#homeTasks")); }
  function renderTasks(){
    const today=isoToday();
    let list=state.tasks;
    if(state.taskFilter==="open") list=list.filter(t=>!t.completed);
    if(state.taskFilter==="today") list=list.filter(t=>!t.completed&&t.date===today);
    if(state.taskFilter==="upcoming") list=list.filter(t=>!t.completed&&t.date&&t.date>today);
    if(state.taskFilter==="completed") list=list.filter(t=>t.completed);
    $("#taskList").innerHTML=list.length?list.map(taskHtml).join(""):'<div class="empty-state">Nothing here.</div>'; bindTaskRows($("#taskList"));
  }

  function renderNotes(){
    const q=$("#noteSearch").value.toLowerCase();
    const list=state.notes.filter(n=>(n.title+" "+n.body+" "+n.course).toLowerCase().includes(q));
    $("#noteList").innerHTML=list.length?list.map(n=>`<article class="note-card" data-note="${n.id}"><header><div><small>${esc(n.course||"GENERAL")}</small><h3>${esc(n.title)}</h3></div><button class="delete-button">×</button></header><p>${esc(n.body)}</p></article>`).join(""):'<div class="empty-state">No notes yet.</div>';
    $$(".note-card .delete-button").forEach(b=>b.addEventListener("click",()=>{ const id=b.closest(".note-card").dataset.note; state.notes=state.notes.filter(n=>n.id!==id); save(KEYS.notes,state.notes); renderNotes(); }));
  }

  function renderCampus(){
    renderBuses(); renderMess();
  }
  function busDate(bus, tomorrow=false){
    const now=new Date(); const [h,m]=bus.time.split(":").map(Number); const d=new Date(now); d.setHours(h,m,0,0); if(tomorrow) d.setDate(d.getDate()+1); return d;
  }
  function getUpcomingBuses(){
    const now=new Date(); const future=window.CAMPUS_DATA.bus.map(b=>({b,d:busDate(b)})).filter(x=>x.d>now).sort((a,b)=>a.d-b.d);
    if(future.length) return future;
    return window.CAMPUS_DATA.bus.map(b=>({b,d:busDate(b,true)})).sort((a,b)=>a.d-b.d);
  }
  function renderBuses(){
    const upcoming=getUpcomingBuses(), first=upcoming[0], now=new Date();
    if(first){
      $("#nextBusTime").textContent=formatTime(first.b.time);
      $("#nextBusRoute").textContent=`${first.b.from} → ${first.b.to}`;
      $("#nextBusMeta").textContent=`via ${first.b.via}${first.b.mainGate?" · Main Gate service":""}`;
      const diff=Math.ceil((first.d-now)/60000); $("#nextBusCountdown").textContent=diff>=60?`${Math.floor(diff/60)}h ${diff%60}m`:`${diff} min`;
    }
    $("#upcomingBuses").innerHTML=upcoming.slice(0,4).map(({b})=>busRow(b)).join("");
    $("#fullBusList").innerHTML=window.CAMPUS_DATA.bus.map(busRow).join("");
  }
  function busRow(b){ return `<article class="bus-row"><time>${esc(formatTime(b.time))}</time><div><strong>${esc(b.from)} → ${esc(b.to)}</strong><p>via ${esc(b.via)}${b.mainGate?" · Main Gate extension":""}</p></div></article>`; }
  function renderMess(){
    const days=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
    $("#messDayPills").innerHTML=days.map(d=>`<button class="day-pill ${d===state.messDay?"active":""}" data-day="${d}">${d.slice(0,3).toUpperCase()}</button>`).join("");
    $$(".day-pill").forEach(b=>b.addEventListener("click",()=>{state.messDay=b.dataset.day; renderMess();}));
    $("#messDayTitle").textContent=state.messDay[0].toUpperCase()+state.messDay.slice(1);
    const menu=window.CAMPUS_DATA.mess[state.messDay];
    $("#messMenu").innerHTML=["breakfast","lunch","dinner"].map(meal=>`<article class="meal-card"><h3>${meal.toUpperCase()}</h3><ul>${menu[meal].map(i=>`<li>${esc(i)}</li>`).join("")}</ul></article>`).join("");
  }

  function renderProfile(){
    $("#profileName").value=state.profile.name||"";
    $("#profileSection").value=state.profile.section||"A";
    $("#profileTheme").value=state.profile.theme||"system";
    $("#profileDisplayName").textContent=state.profile.name||"Student";
    $("#profileSummary").textContent=`PGPBL · Section ${state.profile.section||"A"}`;
    $("#profileAvatar").textContent=initials(state.profile.name);
    $("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";
    $("#electiveChoices").innerHTML=(state.electives||[]).map(e=>`<label class="choice"><input type="checkbox" value="${esc(e.code)}" ${(state.profile.electives||[]).includes(canonical(e.code))?"checked":""}><span><strong>${esc(e.code)} · ${esc(e.course)}</strong><small>${esc(e.faculty)}</small></span></label>`).join("");
  }

  function bind(){
    $$(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageTarget)));
    $$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
    $("#themeToggle").addEventListener("click",()=>{ const current=document.documentElement.dataset.theme; state.profile.theme=current==="dark"?"light":"dark"; save(KEYS.profile,state.profile); applyTheme(); renderProfile(); });
    $$(".subtab[data-planner-tab]").forEach(b=>b.addEventListener("click",()=>{ $$(".subtab[data-planner-tab]").forEach(x=>x.classList.toggle("active",x===b)); $$(".planner-view").forEach(v=>v.classList.toggle("active",v.dataset.plannerView===b.dataset.plannerTab)); }));
    $$(".subtab[data-campus-tab]").forEach(b=>b.addEventListener("click",()=>{ $$(".subtab[data-campus-tab]").forEach(x=>x.classList.toggle("active",x===b)); $$(".campus-view").forEach(v=>v.classList.toggle("active",v.dataset.campusView===b.dataset.campusTab)); }));
    $("#prevMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderCalendar();});
    $("#nextMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderCalendar();});
    $("#todayButton").addEventListener("click",()=>{state.selectedDate=isoToday();state.calendarMonth=new Date();state.calendarMonth.setDate(1);renderCalendar();});
    $("#quickTaskForm").addEventListener("submit",e=>{e.preventDefault();addTask($("#quickTaskTitle").value.trim(),$("#quickTaskCourse").value,$("#quickTaskDate").value);e.target.reset();});
    $("#openTaskForm").addEventListener("click",()=>$("#taskDialog").showModal());
    $("#saveTaskButton").addEventListener("click",e=>{ if(!$("#taskTitle").value.trim()) return; e.preventDefault();addTask($("#taskTitle").value.trim(),$("#taskCourse").value,$("#taskDate").value);$("#taskForm").reset();$("#taskDialog").close();});
    $("#taskFilters").addEventListener("click",e=>{const b=e.target.closest("[data-task-filter]");if(!b)return;state.taskFilter=b.dataset.taskFilter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderTasks();});
    $("#openNoteForm").addEventListener("click",()=>$("#noteDialog").showModal());
    $("#saveNoteButton").addEventListener("click",e=>{if(!$("#noteTitle").value.trim()||!$("#noteBody").value.trim())return;e.preventDefault();state.notes.unshift({id:crypto.randomUUID(),title:$("#noteTitle").value.trim(),body:$("#noteBody").value.trim(),course:$("#noteCourse").value,createdAt:Date.now()});save(KEYS.notes,state.notes);$("#noteForm").reset();$("#noteDialog").close();renderNotes();});
    $("#noteSearch").addEventListener("input",renderNotes);
    $("#profileForm").addEventListener("submit",e=>{e.preventDefault();state.profile={name:$("#profileName").value.trim(),section:$("#profileSection").value,electives:$$('#electiveChoices input:checked').map(x=>canonical(x.value)),theme:$("#profileTheme").value};save(KEYS.profile,state.profile);applyTheme();syncSchedule(true);});
    $("#refreshData").addEventListener("click",()=>syncSchedule(true));
    $("#resetData").addEventListener("click",()=>{if(confirm("Reset profile, tasks, notes and cached schedule?")){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));location.reload();}});
    matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if((state.profile.theme||"system")==="system")applyTheme();});
  }

  async function init(){
    applyTheme(); bind();
    const cached=load(KEYS.cache,null);
    if(cached){state.all=cached.all||[];state.electives=cached.electives||[];state.lastUpdated=cached.lastUpdated;state.classes=filteredClasses();}
    renderAll();
    await syncSchedule();
    setInterval(()=>{renderHome();renderBuses();},30000);
    if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(console.error);
  }
  document.addEventListener("DOMContentLoaded",init);
})();