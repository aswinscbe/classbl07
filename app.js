(() => {
"use strict";
const API="https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec";
const KEYS={profile:"classbl07-nova-profile-v1",tasks:"classbl07-nova-tasks-v1",notes:"classbl07-nova-notes-v1",cache:"classbl07-nova-schedule-v1",snapshot:"classbl07-nova-snapshot-v1",notifications:"classbl07-nova-notifications-v1"};
const COURSE_COLORS={SM:"#8b7cf6",DBST:"#5b8def",AIB:"#24b3a8",OS:"#f29a52",CV:"#36b5d8",PM:"#6f7bea",POM:"#ee7656",CB:"#d866ad",SBM:"#d6a43b",NWW:"#b07c59",MAAS:"#8f66cf",ACC:"#e15d69"};
const state={all:[],classes:[],electives:[],profile:load(KEYS.profile,{name:"Aswin S",section:"A",electives:[],theme:"system"}),tasks:load(KEYS.tasks,[]),notes:load(KEYS.notes,[]),notifications:load(KEYS.notifications,[]),selectedDate:isoToday(),calendarMonth:new Date(new Date().getFullYear(),new Date().getMonth(),1),taskFilter:"open",messDay:weekdayKey(new Date()),meal:"breakfast",busFrom:"C&D Housing",busTo:"PGP Auditorium",timelineDay:"today",lastUpdated:null};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const canonical=c=>String(c||"").toUpperCase().replace(/^NWLB$/,"NWW").split("-")[0];
const colorFor=c=>COURSE_COLORS[canonical(c)]||"#7b8aa2";
const venueOf=c=>c.venue||c.room||"Venue TBA";
function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function isoToday(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function weekdayKey(d){return["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][d.getDay()]}
function minutes(t){const[h,m]=String(t||"00:00").split(":").map(Number);return h*60+m}
function dateTime(c,w="startTime"){return new Date(`${c.dateIso}T${c[w]||c[w==="startTime"?"start":"end"]}:00+05:30`)}
function fmtTime(t){const[h,m]=t.split(":").map(Number);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(2026,0,1,h,m))}
function fmtDate(iso,o={weekday:"long",day:"numeric",month:"short"}){return new Intl.DateTimeFormat("en-IN",o).format(new Date(`${iso}T12:00:00+05:30`))}
function initials(n){return String(n||"AS").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function icon(name){const p={
home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
campus:'<path d="M4 20h16M6 20V9l6-4 6 4v11M9 20v-5h6v5"/>',
profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4-6 8-6s6.5 2 8 6"/>',
bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
theme:'<path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
faculty:'<circle cx="12" cy="8" r="3"/><path d="M5 21c1-4 3.3-6 7-6s6 2 7 6"/>',
spark:'<path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="m5 15 .7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Z"/>',
books:'<path d="M4 19V5h5v14H4Zm6 0V3h5v16h-5Zm6 0V7h4v12h-4Z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
check:'<path d="m5 12 4 4L19 6"/>',
note:'<path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
'chevron-left':'<path d="m15 18-6-6 6-6"/>','chevron-right':'<path d="m9 18 6-6-6-6"/>',
target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/>',
bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M7 18v3M17 18v3M4 11h16M8 7h8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
meal:'<path d="M7 3v8M4 3v5c0 2 1 3 3 3s3-1 3-3V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/>',
close:'<path d="m6 6 12 12M18 6 6 18"/>',swap:'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',sunrise:'<path d="M4 18h16M6 14a6 6 0 0 1 12 0M12 3v4"/>',moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>'
};return `<svg viewBox="0 0 24 24" aria-hidden="true">${p[name]||""}</svg>`}
function renderIcons(){$$("[data-icon]").forEach(el=>{el.innerHTML=icon(el.dataset.icon)})}
function applyTheme(){const pref=state.profile.theme||"system",t=pref==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):pref;document.documentElement.dataset.theme=t;$('meta[name="theme-color"]').content=t==="dark"?"#07111f":"#f4f6fb"}
function filteredClasses(){const selected=new Set((state.profile.electives||[]).map(canonical));return state.all.filter(c=>c.type==="Core"?(state.profile.section==="A"?c.section==="A":c.section==="B"):selected.has(canonical(c.baseCode||c.code)))}
function migrateProfile(){state.profile.electives=[...new Set((state.profile.electives||[]).map(canonical))];save(KEYS.profile,state.profile)}
function classKey(c){return`${c.dateIso}|${c.startTime}|${c.code}|${venueOf(c)}|${c.status}`}
function classIdentity(c){return`${c.dateIso}|${c.startTime}|${canonical(c.code)}`}
function tomorrowIso(){const d=new Date();d.setDate(d.getDate()+1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function wasRecentlyAdded(c){
  return state.notifications.some(n=>n.type==="added"&&!n.read&&n.code===c.code&&n.text.includes(fmtDate(c.dateIso,{day:"numeric",month:"short"})));
}
function relativeSyncText(){
  if(!state.lastUpdated)return"Schedule has not synced yet";
  const mins=Math.max(0,Math.round((Date.now()-new Date(state.lastUpdated).getTime())/60000));
  if(mins<1)return"Schedule synced just now";
  if(mins===1)return"Schedule synced 1 minute ago";
  if(mins<60)return`Schedule synced ${mins} minutes ago`;
  return`Schedule synced ${Math.floor(mins/60)} hour${Math.floor(mins/60)>1?"s":""} ago`;
}

function compareSnapshots(oldList,newList){
  if(!oldList||!oldList.length)return[];
  const oldMap=new Map(oldList.map(c=>[classKey(c),c])),newMap=new Map(newList.map(c=>[classKey(c),c])),out=[];
  newList.forEach(c=>{if(!oldMap.has(classKey(c)))out.push({id:crypto.randomUUID(),type:"added",code:c.code,title:`${c.code} class added`,text:`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`,course:canonical(c.code),createdAt:Date.now(),read:false})});
  oldList.forEach(c=>{if(c.status!=="Cancelled"){const match=newList.find(n=>n.dateIso===c.dateIso&&n.startTime===c.startTime&&canonical(n.code)===canonical(c.code));if(match&&match.status==="Cancelled")out.push({id:crypto.randomUUID(),type:"cancelled",code:c.code,title:`${c.code} class cancelled`,text:`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)}`,course:canonical(c.code),createdAt:Date.now(),read:false})}});
  return out.slice(0,12)
}
async function syncSchedule(force=false){
  const pill=$("#syncPill");pill.className="sync-pill";pill.innerHTML="<i></i><span>Connecting</span>";
  try{
    const u=new URL(API);u.searchParams.set("section",state.profile.section||"A");u.searchParams.set("electives",(state.profile.electives||[]).join(","));u.searchParams.set("includeCancelled","true");if(force)u.searchParams.set("_",Date.now());
    const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(!d.success)throw new Error(d.error||"API failed");
    const previous=load(KEYS.snapshot,[]),changes=compareSnapshots(previous,d.classes||[]);
    if(changes.length){state.notifications=[...changes,...state.notifications].slice(0,40);save(KEYS.notifications,state.notifications)}
    state.all=d.classes||[];state.electives=d.availableElectives||[];state.lastUpdated=d.updatedAt;save(KEYS.cache,{all:state.all,electives:state.electives,lastUpdated:state.lastUpdated});save(KEYS.snapshot,state.all);state.classes=filteredClasses();pill.className="sync-pill ok";pill.innerHTML="<i></i><span>Synced</span>"
  }catch(e){const c=load(KEYS.cache,null);if(c){state.all=c.all||[];state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}pill.className="sync-pill error";pill.innerHTML="<i></i><span>Offline</span>";console.error(e)}
  renderAll()
}
function showPage(n){$$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===n));$$("[data-page-target]").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===n));scrollTo({top:0,behavior:"smooth"});if(n==="planner")renderCalendar();if(n==="campus")renderCampus()}
function renderAll(){migrateProfile();state.classes=filteredClasses();renderProfile();renderCourseOptions();renderHome();renderCalendar();renderTasks();renderNotes();renderCampus();renderNotifications();renderIcons()}
function renderHome(){
  const now=new Date(),today=isoToday();$("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(now).toUpperCase();$("#dateOrbitDay").textContent=String(now.getDate()).padStart(2,"0");$("#dateOrbitMonth").textContent=new Intl.DateTimeFormat("en-IN",{month:"short"}).format(now).toUpperCase();const h=now.getHours();$("#greeting").textContent=`Good ${h<12?"morning":h<17?"afternoon":"evening"}, ${state.profile.name.split(" ")[0]||"there"}.`;
  const todays=state.classes.filter(c=>c.dateIso===today&&c.status!=="Cancelled").sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)),current=todays.find(c=>now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime")),next=todays.find(c=>now<dateTime(c,"startTime")),focus=current||next;
  if(focus){const isNow=!!current;$("#focusState").textContent=isNow?"HAPPENING NOW":"UP NEXT";$("#focusCode").textContent=focus.code;$("#focusTitle").textContent=focus.course;$("#focusTime").textContent=`${fmtTime(focus.startTime)} – ${fmtTime(focus.endTime)}`;$("#focusVenue").textContent=venueOf(focus);$("#focusFaculty").textContent=focus.faculty;$("#heroCourseDot").style.background=colorFor(focus.code);const target=isNow?dateTime(focus,"endTime"):dateTime(focus,"startTime"),diff=Math.max(0,Math.ceil((target-now)/60000));$("#focusCountdownLabel").textContent=isNow?"ENDS IN":"STARTS IN";$("#focusCountdown").textContent=diff>=60?`${Math.floor(diff/60)}h ${diff%60}m`:`${diff} min`;$("#focusProgress").style.width=`${isNow?Math.min(100,Math.max(0,((now-dateTime(focus,"startTime"))/(dateTime(focus,"endTime")-dateTime(focus,"startTime")))*100)):0}%`}
  else{$("#focusState").textContent="TODAY";$("#focusCode").textContent="CLEAR";$("#focusTitle").textContent=todays.length?"No more classes today":"No scheduled classes today";$("#focusTime").textContent="—";$("#focusVenue").textContent="—";$("#focusFaculty").textContent="Use Planner to look ahead";$("#focusCountdownLabel").textContent="STATUS";$("#focusCountdown").textContent="Done";$("#focusProgress").style.width="100%"}
  const remaining=state.classes.filter(c=>c.dateIso===today&&c.status!=="Cancelled"&&now<dateTime(c,"endTime"));$("#todayCount").textContent=remaining.length;$("#todaySchedule").innerHTML=scheduleHtml(remaining,true);
  const timelineIso=state.timelineDay==="tomorrow"?tomorrowIso():today,timelineClasses=state.classes.filter(c=>c.dateIso===timelineIso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  $("#timelineDateTitle").textContent=state.timelineDay==="today"?"Today":"Tomorrow";
  $("#timelineFullDate").textContent=fmtDate(timelineIso,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#todaySwitchDate").textContent=fmtDate(today,{day:"numeric",month:"short"});
  $("#tomorrowSwitchDate").textContent=fmtDate(tomorrowIso(),{day:"numeric",month:"short"});
  $$(".timeline-day-button").forEach(b=>b.classList.toggle("active",b.dataset.timelineDay===state.timelineDay));
  $("#todayProgressRail").innerHTML=timelineClasses.length?`<div class="vertical-day-timeline">${timelineClasses.map(c=>{const status=c.status==="Cancelled"?"cancelled":timelineIso!==today?"upcoming":now>=dateTime(c,"endTime")?"done":now>=dateTime(c,"startTime")?"current":"upcoming",added=wasRecentlyAdded(c);return`<article class="vertical-class ${status}" style="--course:${colorFor(c.code)}"><div class="vertical-time">${esc(fmtTime(c.startTime))}<small>${esc(fmtTime(c.endTime))}</small></div><div class="vertical-line"><span class="vertical-dot"></span></div><div class="vertical-content"><strong>${esc(c.code)} · ${esc(c.course)}${added?'<span class="timeline-added">ADDED</span>':""}</strong><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p><span class="vertical-status">${status==="current"?"HAPPENING NOW":status==="done"?"COMPLETED":status==="cancelled"?"CANCELLED":"UPCOMING"}</span></div></article>`}).join("")}</div>`:`<div class="empty-state">${state.timelineDay==="today"?"Enjoy your free day.":"Nothing scheduled tomorrow."}</div>`;
  const completed=timelineIso===today?timelineClasses.filter(c=>c.status!=="Cancelled"&&now>=dateTime(c,"endTime")).length:0;
  $("#progressSummary").textContent=timelineIso===today?`${completed} / ${timelineClasses.filter(c=>c.status!=="Cancelled").length}`:`${timelineClasses.filter(c=>c.status!=="Cancelled").length} classes`;
  const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(now.getDate()-((now.getDay()+6)%7));const nextMonday=new Date(monday);nextMonday.setDate(monday.getDate()+7);const week=state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"endTime")>now&&dateTime(c,"startTime")<nextMonday);const mins=week.reduce((s,c)=>s+Math.max(0,(dateTime(c,"endTime")-Math.max(now,dateTime(c,"startTime")))/60000),0),cancels=state.classes.filter(c=>c.status==="Cancelled"&&dateTime(c,"startTime")>=monday&&dateTime(c,"startTime")<nextMonday).length;$("#weekClasses").textContent=week.length;$("#weekHours").textContent=`${Math.floor(mins/60)}h ${Math.round(mins%60)}m`;$("#weekCancelled").textContent=cancels;const ts=new Date("2026-08-03T00:00:00+05:30"),te=new Date("2026-10-18T23:59:59+05:30"),ta=state.classes.filter(c=>dateTime(c,"startTime")>=ts&&dateTime(c,"startTime")<=te&&c.status!=="Cancelled"),td=ta.filter(c=>dateTime(c,"endTime")<now).length,tr=Math.max(0,ta.length-td),tp=ta.length?Math.round(td/ta.length*100):0,wl=Math.max(0,Math.ceil((te-now)/(7*24*3600000)));let tc=$("#termProgressCard");if(!tc){tc=document.createElement("section");tc.id="termProgressCard";tc.className="panel term-progress-card";$(".today-progress-card").after(tc)}tc.innerHTML=`<div class="panel-heading"><div><p class="overline">TERM III</p><h2>Progress</h2></div><span class="count-chip">${tp}%</span></div><div class="term-progress-bar"><span style="width:${tp}%"></span></div><div class="term-progress-stats"><article><strong>${td}</strong><span>classes completed</span></article><article><strong>${tr}</strong><span>classes remaining</span></article><article><strong>${wl}</strong><span>weeks remaining</span></article></div>`;
  const unread=state.notifications.filter(n=>!n.read);
  $("#silentUpdateStrip").hidden=!unread.length;
  if(unread.length){
    const latest=unread[0];
    $("#silentUpdateTitle").textContent=latest.type==="added"?"Class added":latest.type==="cancelled"?"Class cancelled":latest.type==="venue"?"Venue changed":"Schedule updated";
    $("#silentUpdateText").textContent=`${latest.title} · ${latest.text}`;
  }
  $("#homeSyncText").textContent=relativeSyncText()
  renderHomeTasks()
}
function scheduleHtml(list,lunch=false){if(!list.length)return'<div class="empty-state">Nothing scheduled.</div>';let html="",added=false;[...list].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)).forEach(c=>{if(lunch&&!added&&minutes(c.startTime)>=870){html+='<div class="lunch-row"><span>13:30</span><div><strong>Lunch break</strong><br><span>Until 14:30</span></div></div>';added=true}html+=`<article class="schedule-item ${c.status==="Cancelled"?"cancelled":""}" style="--course:${colorFor(c.code)}"><div class="schedule-time">${esc(fmtTime(c.startTime))}<br><span>${esc(fmtTime(c.endTime))}</span></div><div class="schedule-info"><strong>${esc(c.code)} · ${esc(c.course)}</strong><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p>${c.status==="Cancelled"?'<span class="status-badge cancelled">CANCELLED</span>':""}</div></article>`});return html}

function agendaPeriod(c){
  const m=minutes(c.startTime);
  if(m<12*60)return"Morning";
  if(m<17*60)return"Afternoon";
  return"Evening";
}
function durationLabel(c){
  const d=Math.max(0,minutes(c.endTime)-minutes(c.startTime));
  return`${d} min`;
}
function agendaStatus(c){
  if(c.status==="Cancelled")return"Cancelled";
  const now=new Date();
  if(c.dateIso===isoToday()&&now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime"))return"Live";
  if(c.dateIso===isoToday()&&now>=dateTime(c,"endTime"))return"Done";
  if(c.dateIso===isoToday()&&now<dateTime(c,"startTime"))return"Upcoming";
  return"Scheduled";
}
function agendaCardHtml(c){
  const status=agendaStatus(c), cls=[
    "agenda-class-card",
    status==="Live"?"current":"",
    c.status==="Cancelled"?"cancelled":""
  ].filter(Boolean).join(" ");
  return `<article class="${cls}" style="--course:${colorFor(c.code)}">
    <div class="agenda-card-top">
      <div class="agenda-time-block">
        <time>${esc(fmtTime(c.startTime))} – ${esc(fmtTime(c.endTime))}</time>
        <small>${esc(durationLabel(c))}</small>
      </div>
      <span class="agenda-status ${c.status==="Cancelled"?"cancelled":""}">${esc(status.toUpperCase())}</span>
    </div>
    <div class="agenda-card-body">
      <div class="agenda-course-line">
        <span class="agenda-code-chip">${esc(c.code)}</span>
        <h3>${esc(c.course)}</h3>
      </div>
      <div class="agenda-meta">
        <div class="agenda-meta-row">${icon("pin")}<span>${esc(venueOf(c))}</span></div>
        <div class="agenda-meta-row">${icon("faculty")}<span>${esc(c.faculty)}</span></div>
      </div>
    </div>
    <div class="agenda-card-footer">
      <span>${esc(c.type)}${c.section&&c.section!=="All"?` · Section ${esc(c.section)}`:""}</span>
      <span>${esc(c.timezoneLabel||"IST")}</span>
    </div>
  </article>`;
}
function agendaHtml(classes,tasks){
  if(!classes.length&&!tasks.length)return'<div class="agenda-empty">Nothing scheduled for this day.</div>';
  const periods=["Morning","Afternoon","Evening"];
  let html='<div class="day-agenda-groups">';
  periods.forEach(period=>{
    const items=classes.filter(c=>agendaPeriod(c)===period).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
    if(items.length){
      html+=`<section class="agenda-group"><div class="agenda-group-title">${period}</div>${items.map(agendaCardHtml).join("")}</section>`;
    }
  });
  html+='</div>';
  if(tasks.length){
    html+=`<section class="agenda-task-section"><div class="agenda-task-heading">Tasks due</div><div class="task-list">${tasks.map(taskHtml).join("")}</div></section>`;
  }
  return html;
}
function showCalendarTooltip(target,iso){if(matchMedia("(hover: none)").matches)return;let tip=$("#calendarTooltip");if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));if(!list.length)return;tip.innerHTML=`<h4>${esc(fmtDate(iso))}</h4>${list.map(c=>`<div class="calendar-tooltip-row"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("")}`;const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-220,r.bottom+8)}px`;tip.classList.add("show")}function hideCalendarTooltip(){$("#calendarTooltip")?.classList.remove("show")}function renderCalendar(){const d=state.calendarMonth,y=d.getFullYear(),m=d.getMonth();$("#calendarTitle").textContent=new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(d);const first=new Date(y,m,1),off=(first.getDay()+6)%7,start=new Date(y,m,1-off);let html="";for(let i=0;i<42;i++){const day=new Date(start);day.setDate(start.getDate()+i);const iso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`,classes=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled"),colors=classes.slice(0,4).map(c=>colorFor(c.code));html+=`<button class="calendar-day ${day.getMonth()!==m?"outside":""} ${iso===isoToday()?"today":""} ${iso===state.selectedDate?"selected":""}" data-date="${iso}"><span class="calendar-day-number">${day.getDate()}</span><span class="calendar-course-dots">${colors.map(c=>`<i style="--course:${c}"></i>`).join("")}</span><span class="calendar-class-count">${classes.length?`${classes.length} class${classes.length>1?"es":""}`:""}</span></button>`}$("#calendarGrid").innerHTML=html;$$(".calendar-day").forEach(b=>{b.addEventListener("click",()=>{state.selectedDate=b.dataset.date;renderCalendar()});b.addEventListener("mouseenter",()=>showCalendarTooltip(b,b.dataset.date));b.addEventListener("mouseleave",hideCalendarTooltip)});const classes=state.classes.filter(c=>c.dateIso===state.selectedDate),tasks=state.tasks.filter(t=>t.date===state.selectedDate);$("#agendaDate").textContent=fmtDate(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("#agendaCount").textContent=classes.length+tasks.length;$("#dayAgenda").innerHTML=agendaHtml(classes,tasks);const used=[...new Set(state.classes.filter(c=>c.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(c=>canonical(c.code)))];$("#calendarLegend").innerHTML=used.map(c=>`<span class="legend-item" style="--course:${colorFor(c)}"><i></i>${esc(c)}</span>`).join("");bindTaskRows($("#dayAgenda"))}
function renderCourseOptions(){const o=(state.electives||[]).map(e=>`<option value="${esc(e.code)}">${esc(e.code)} · ${esc(e.course)}</option>`).join("");["#quickTaskCourse","#taskCourse","#noteCourse"].forEach(s=>{const el=$(s);if(el)el.innerHTML='<option value="">General</option>'+o})}
function addTask(title,course,date){state.tasks.unshift({id:crypto.randomUUID(),title,course,date,completed:false,createdAt:Date.now()});save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar()}
function taskHtml(t){return`<article class="task-item ${t.completed?"completed":""}" data-task="${t.id}" style="--course:${colorFor(t.course)}"><input type="checkbox" ${t.completed?"checked":""}><div><strong>${esc(t.title)}</strong><p>${esc(t.course||"General")}${t.date?` · ${esc(fmtDate(t.date,{day:"numeric",month:"short"}))}`:""}</p></div><button class="delete-button">×</button></article>`}
function bindTaskRows(root){$$(".task-item",root).forEach(r=>{$("input",r)?.addEventListener("change",e=>{const t=state.tasks.find(x=>x.id===r.dataset.task);if(t){t.completed=e.target.checked;save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar()}});$(".delete-button",r)?.addEventListener("click",()=>{state.tasks=state.tasks.filter(x=>x.id!==r.dataset.task);save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar()})})}
function renderHomeTasks(){const a=state.tasks.filter(t=>!t.completed).slice(0,3);$("#homeTasks").innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state">No open tasks.</div>';bindTaskRows($("#homeTasks"))}
function renderTasks(){const t=isoToday();let a=state.tasks;if(state.taskFilter==="open")a=a.filter(x=>!x.completed);if(state.taskFilter==="today")a=a.filter(x=>!x.completed&&x.date===t);if(state.taskFilter==="upcoming")a=a.filter(x=>!x.completed&&x.date&&x.date>t);if(state.taskFilter==="completed")a=a.filter(x=>x.completed);$("#taskList").innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state">Nothing here.</div>';bindTaskRows($("#taskList"))}
function renderNotes(){const q=$("#noteSearch").value.toLowerCase(),a=state.notes.filter(n=>(n.title+" "+n.body+" "+n.course).toLowerCase().includes(q));$("#noteList").innerHTML=a.length?a.map(n=>`<article class="note-card" data-note="${n.id}"><header><div><small>${esc(n.course||"GENERAL")}</small><h3>${esc(n.title)}</h3></div><button class="delete-button">×</button></header><p>${esc(n.body)}</p></article>`).join(""):'<div class="empty-state">No notes yet.</div>';$$(".note-card .delete-button").forEach(b=>b.addEventListener("click",()=>{state.notes=state.notes.filter(n=>n.id!==b.closest(".note-card").dataset.note);save(KEYS.notes,state.notes);renderNotes()}))}
function busDate(b,t=false){const n=new Date(),[h,m]=b.time.split(":").map(Number),d=new Date(n);d.setHours(h,m,0,0);if(t)d.setDate(d.getDate()+1);return d}const BUS_STOPS=["C&D Housing","Phase V Campus","PGP Auditorium","Main Gate"];function routeStops(b){const s=[b.from];if(b.via&&!s.includes(b.via)&&b.via!==b.to)s.push(b.via);if(b.mainGate&&!s.includes("Main Gate")&&b.to!=="Main Gate")s.push("Main Gate");if(!s.includes(b.to))s.push(b.to);return s}function serviceSupports(b,f,t){const s=routeStops(b),i=s.indexOf(f),j=s.indexOf(t);return i>=0&&j>i}function getUpcomingBuses(){const n=new Date(),a=window.CAMPUS_DATA.bus.filter(b=>serviceSupports(b,state.busFrom,state.busTo));let f=a.map(b=>({b,d:busDate(b)})).filter(x=>x.d>n).sort((a,b)=>a.d-b.d);return f.length?f:a.map(b=>({b,d:busDate(b,true)})).sort((a,b)=>a.d-b.d)}function renderCampus(){renderBusControls();renderBuses();renderMess()}function renderBusControls(){const o=BUS_STOPS.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("");$("#busFrom").innerHTML=o;$("#busTo").innerHTML=o;$("#busFrom").value=state.busFrom;$("#busTo").value=state.busTo;const q=[["C&D Housing","PGP Auditorium"],["PGP Auditorium","C&D Housing"],["C&D Housing","Main Gate"],["Main Gate","C&D Housing"]];$("#quickRoutes").innerHTML=q.map(([f,t])=>`<button class="quick-route ${state.busFrom===f&&state.busTo===t?"active":""}" data-from="${esc(f)}" data-to="${esc(t)}">${esc(f.replace("C&D Housing","Housing").replace("PGP Auditorium","Auditorium"))} → ${esc(t.replace("C&D Housing","Housing").replace("PGP Auditorium","Auditorium"))}</button>`).join("");$$(".quick-route").forEach(b=>b.addEventListener("click",()=>{state.busFrom=b.dataset.from;state.busTo=b.dataset.to;renderBusControls();renderBuses()}))}function renderBuses(){const u=getUpcomingBuses(),f=u[0],n=new Date();if(f){$("#nextBusTime").textContent=fmtTime(f.b.time);$("#nextBusRoute").textContent=`${state.busFrom} → ${state.busTo}`;$("#nextBusMeta").textContent=f.b.mainGate?"Main Gate service":"Direct campus service";const d=Math.ceil((f.d-n)/60000);$("#nextBusCountdown").textContent=d>=60?`${Math.floor(d/60)}h ${d%60}m`:`${d} min`;const s=routeStops(f.b),i=s.indexOf(state.busFrom),j=s.indexOf(state.busTo);$("#nextBusVisual").innerHTML=s.slice(i,j+1).map(x=>`<div class="route-stop"><i></i><span>${esc(x)}</span></div>`).join("")}else{$("#nextBusTime").textContent="—";$("#nextBusRoute").textContent="No direct service";$("#nextBusMeta").textContent="Try another route";$("#nextBusCountdown").textContent="—";$("#nextBusVisual").innerHTML=""}$("#upcomingBuses").innerHTML=u.length?u.slice(0,5).map(({b})=>busRow(b)).join(""):'<div class="empty-state">No matching direct buses.</div>';const a=window.CAMPUS_DATA.bus.filter(b=>serviceSupports(b,state.busFrom,state.busTo));$("#fullBusList").innerHTML=a.length?a.map(busRow).join(""):'<div class="empty-state">No matching direct buses.</div>'}function busRow(b){return`<article class="bus-row ${b.mainGate?"main-gate":""}"><time>${esc(fmtTime(b.time))}</time><div><strong>${esc(state.busFrom)} → ${esc(state.busTo)}</strong><p>${esc(routeStops(b).join(" · "))}</p>${b.mainGate?'<span class="route-badge">MAIN GATE</span>':""}</div></article>`}function renderMess(){const ds=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];$("#messDayPills").innerHTML=ds.map(d=>`<button class="day-pill ${d===state.messDay?"active":""}" data-day="${d}">${d.slice(0,3).toUpperCase()}</button>`).join("");$$(".day-pill").forEach(b=>b.addEventListener("click",()=>{state.messDay=b.dataset.day;renderMess()}));$("#messDayTitle").textContent=state.messDay[0].toUpperCase()+state.messDay.slice(1);const menu=window.CAMPUS_DATA.mess[state.messDay],items=menu[state.meal]||[],nv=/chicken|fish|egg|omelette/i,sw=/gulab|halwa|ice cream|kheer|custard|badusha|sweet/i,non=items.filter(i=>nv.test(i)),sweet=items.filter(i=>sw.test(i)),veg=items.filter(i=>!nv.test(i)&&!sw.test(i));$("#messMenu").innerHTML=`<article class="meal-hero"><h3>${state.meal[0].toUpperCase()+state.meal.slice(1)}</h3>${veg.length?`<section class="food-section"><div class="food-section-title">Vegetarian</div><div class="food-items">${veg.map(i=>`<div class="food-item veg">${esc(i)}</div>`).join("")}</div></section>`:""}${non.length?`<section class="food-section"><div class="food-section-title">Non-vegetarian</div><div class="food-items">${non.map(i=>`<div class="food-item nonveg">${esc(i)}</div>`).join("")}</div></section>`:""}${sweet.length?`<section class="food-section"><div class="food-section-title">Dessert / Sweet</div><div class="food-items">${sweet.map(i=>`<div class="food-item sweet">${esc(i)}</div>`).join("")}</div></section>`:""}</article>`;$$(".meal-tab").forEach(b=>b.classList.toggle("active",b.dataset.meal===state.meal))}function renderProfile(){$("#profileName").value=state.profile.name||"";$("#profileSection").value=state.profile.section||"A";$("#profileTheme").value=state.profile.theme||"system";$("#profileDisplayName").textContent=state.profile.name||"Student";$("#profileSummary").textContent=`PGPBL · Section ${state.profile.section||"A"}`;$("#profileAvatar").textContent=initials(state.profile.name);$("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";$("#electiveChoices").innerHTML=(state.electives||[]).map(e=>`<label class="choice"><input type="checkbox" value="${esc(e.code)}" ${(state.profile.electives||[]).includes(canonical(e.code))?"checked":""}><span><strong>${esc(e.code)} · ${esc(e.course)}</strong><small>${esc(e.faculty)}</small></span></label>`).join("")}
function renderNotifications(){const unread=state.notifications.filter(n=>!n.read).length;$("#notificationBadge").hidden=!unread;$("#notificationBadge").textContent=unread;$("#notificationList").innerHTML=state.notifications.length?state.notifications.map(n=>`<article class="notification-item ${n.read?"":"unread"}" style="--course:${colorFor(n.course)}"><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p><time>${new Intl.RelativeTimeFormat("en",{numeric:"auto"}).format(-Math.max(1,Math.round((Date.now()-n.createdAt)/3600000)),"hour")}</time></article>`).join(""):'<div class="empty-state">No schedule updates.</div>'}
function openNotifications(){const d=$("#notificationDrawer");d.classList.add("open");d.setAttribute("aria-hidden","false")}
function closeNotifications(){const d=$("#notificationDrawer");d.classList.remove("open");d.setAttribute("aria-hidden","true")}

function clearDialogValidation(dialog){
  $$(".dialog-validation",dialog).forEach(el=>el.remove());
}
function showDialogValidation(dialog,message){
  clearDialogValidation(dialog);
  const p=document.createElement("p");
  p.className="dialog-validation";
  p.textContent=message;
  $(".dialog-actions",dialog)?.before(p);
}
function closeDialog(dialog,reset=false){
  clearDialogValidation(dialog);
  if(reset)$("form",dialog)?.reset();
  dialog.close();
}
function bindDismissibleDialog(dialog){
  dialog.addEventListener("click",e=>{if(e.target===dialog)closeDialog(dialog)});
  dialog.addEventListener("cancel",e=>{e.preventDefault();closeDialog(dialog)});
  $$(".dialog-close,.dialog-cancel",dialog).forEach(b=>b.addEventListener("click",()=>closeDialog(dialog)));
}
function bind(){
  $$("[data-page-target]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageTarget)));$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
  $("#themeToggle").addEventListener("click",()=>{state.profile.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";save(KEYS.profile,state.profile);applyTheme();renderProfile()});
  $("#timelineDaySwitch").addEventListener("click",e=>{const b=e.target.closest("[data-timeline-day]");if(!b)return;state.timelineDay=b.dataset.timelineDay;renderHome()});
  $("#notificationButton").addEventListener("click",openNotifications);$("#openUpdatesFromHome").addEventListener("click",openNotifications);$("#closeNotifications").addEventListener("click",closeNotifications);$("#notificationBackdrop").addEventListener("click",closeNotifications);$("#markNotificationsRead").addEventListener("click",()=>{state.notifications.forEach(n=>n.read=true);save(KEYS.notifications,state.notifications);renderNotifications();renderHome()});
  $$(".subtab[data-planner-tab]").forEach(b=>b.addEventListener("click",()=>{$$(".subtab[data-planner-tab]").forEach(x=>x.classList.toggle("active",x===b));$$(".planner-view").forEach(v=>v.classList.toggle("active",v.dataset.plannerView===b.dataset.plannerTab))}));
  $$(".subtab[data-campus-tab]").forEach(b=>b.addEventListener("click",()=>{$$(".subtab[data-campus-tab]").forEach(x=>x.classList.toggle("active",x===b));$$(".campus-view").forEach(v=>v.classList.toggle("active",v.dataset.campusView===b.dataset.campusTab))}));
  $("#prevMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderCalendar()});$("#nextMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderCalendar()});$("#todayButton").addEventListener("click",()=>{state.selectedDate=isoToday();state.calendarMonth=new Date();state.calendarMonth.setDate(1);renderCalendar()});
  $("#quickTaskForm").addEventListener("submit",e=>{e.preventDefault();addTask($("#quickTaskTitle").value.trim(),$("#quickTaskCourse").value,$("#quickTaskDate").value);e.target.reset()});
  const taskDialog=$("#taskDialog"),noteDialog=$("#noteDialog");
  bindDismissibleDialog(taskDialog);bindDismissibleDialog(noteDialog);
  $("#openTaskForm").addEventListener("click",()=>{clearDialogValidation(taskDialog);taskDialog.showModal()});
  $("#saveTaskButton").addEventListener("click",()=>{const title=$("#taskTitle").value.trim();if(!title){showDialogValidation(taskDialog,"Enter a task title, or close the window to discard.");return}addTask(title,$("#taskCourse").value,$("#taskDate").value);closeDialog(taskDialog,true)});
  $("#taskFilters").addEventListener("click",e=>{const b=e.target.closest("[data-task-filter]");if(!b)return;state.taskFilter=b.dataset.taskFilter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderTasks()});
  $("#openNoteForm").addEventListener("click",()=>{clearDialogValidation(noteDialog);noteDialog.showModal()});
  $("#saveNoteButton").addEventListener("click",()=>{const title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim();if(!title||!body){showDialogValidation(noteDialog,"Add a title and note only when you want to save. You can close this window anytime.");return}state.notes.unshift({id:crypto.randomUUID(),title,body,course:$("#noteCourse").value,createdAt:Date.now()});save(KEYS.notes,state.notes);closeDialog(noteDialog,true);renderNotes()});
  $("#noteSearch").addEventListener("input",renderNotes);
  $("#profileForm").addEventListener("submit",e=>{e.preventDefault();state.profile={name:$("#profileName").value.trim(),section:$("#profileSection").value,electives:$$('#electiveChoices input:checked').map(x=>canonical(x.value)),theme:$("#profileTheme").value};save(KEYS.profile,state.profile);applyTheme();syncSchedule(true)});$("#refreshData").addEventListener("click",()=>syncSchedule(true));$("#resetData").addEventListener("click",()=>{if(confirm("Reset profile, tasks, notes and cached schedule?")){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));location.reload()}});
  $("#busFrom").addEventListener("change",()=>{state.busFrom=$("#busFrom").value;renderBusControls();renderBuses()});$("#busTo").addEventListener("change",()=>{state.busTo=$("#busTo").value;renderBusControls();renderBuses()});$("#swapBusRoute").addEventListener("click",()=>{[state.busFrom,state.busTo]=[state.busTo,state.busFrom];renderBusControls();renderBuses()});$("#toggleFullBus").addEventListener("click",()=>{const l=$("#fullBusList"),c=l.classList.toggle("collapsed");$("#toggleFullBus").textContent=c?"Show all":"Collapse"});$("#mealTabs").addEventListener("click",e=>{const b=e.target.closest("[data-meal]");if(!b)return;state.meal=b.dataset.meal;renderMess()});$("#closeShortcutDialog").addEventListener("click",()=>$("#shortcutDialog").close());document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const k=e.key.toLowerCase();if(k==="h")showPage("home");else if(k==="p")showPage("planner");else if(k==="c")showPage("campus");else if(k==="r")syncSchedule(true);else if(k==="n")openNotifications();else if(e.key==="?")$("#shortcutDialog").showModal()});
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if((state.profile.theme||"system")==="system")applyTheme()})
}
async function init(){applyTheme();renderIcons();bind();const c=load(KEYS.cache,null);if(c){state.all=c.all||[];state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}renderAll();await syncSchedule();setInterval(()=>{renderHome();renderBuses()},30000);if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js").catch(console.error)}
document.addEventListener("DOMContentLoaded",init);
})();