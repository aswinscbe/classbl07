(() => {
"use strict";
const API="https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec";
const KEYS={profile:"classbl07-nova-profile-v1",tasks:"classbl07-nova-tasks-v1",notes:"classbl07-nova-notes-v1",cache:"classbl07-nova-schedule-v1",snapshot:"classbl07-nova-snapshot-v1",notifications:"classbl07-nova-notifications-v1",onboarded:"bl07_onboarded_v2"};
const COURSE_COLORS={SM:"#8b7cf6",DBST:"#5b8def",AIB:"#24b3a8",OS:"#f29a52",CV:"#36b5d8",PM:"#6f7bea",POM:"#ee7656",CB:"#d866ad",SBM:"#d6a43b",NWW:"#b07c59",MAAS:"#8f66cf",ACC:"#e15d69"};
const state={all:[],classes:[],electives:[],profile:load(KEYS.profile,{name:"Aswin S",section:"A",electives:[],theme:"system"}),tasks:load(KEYS.tasks,[]),notes:load(KEYS.notes,[]),notifications:load(KEYS.notifications,[]),selectedDate:isoToday(),calendarMonth:new Date(new Date().getFullYear(),new Date().getMonth(),1),taskFilter:"open",messDay:weekdayKey(new Date()),meal:"breakfast",busFrom:"Phase V Campus",busTo:"PGP Auditorium",timelineDay:"today",lastUpdated:null};
let editingTaskId=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const canonical=c=>String(c||"").toUpperCase().replace(/^NWLB$/,"NWW").split("-")[0];
const colorFor=c=>COURSE_COLORS[canonical(c)]||"#7b8aa2";
const venueOf=c=>c.venue||c.room||"Venue TBA";
function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function istParts(date=new Date()){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23",weekday:"long"}).formatToParts(date);return Object.fromEntries(parts.map(p=>[p.type,p.value]))}
function isoToday(){const p=istParts();return`${p.year}-${p.month}-${p.day}`}
function weekdayKey(d=new Date()){return istParts(d).weekday.toLowerCase()}
function minutes(t){const[h,m]=String(t||"00:00").split(":").map(Number);return h*60+m}
function dateTime(c,w="startTime"){return new Date(`${c.dateIso}T${c[w]||c[w==="startTime"?"start":"end"]}:00+05:30`)}
function fmtTime(t){const[h,m]=t.split(":").map(Number);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(2026,0,1,h,m))}
function fmtDate(iso,o={weekday:"long",day:"numeric",month:"short"}){return new Intl.DateTimeFormat("en-IN",o).format(new Date(`${iso}T12:00:00+05:30`))}
function initials(n){return String(n||"AS").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
function icon(name){const p={
home:'<path d="M3.5 11 12 3.5 20.5 11V20a1 1 0 0 1-1 1h-4v-6h-5v6H4.5a1 1 0 0 1-1-1Z"/>',
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
note:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 8h7M8 12h7M8 16h5"/>',
'chevron-left':'<path d="m15 18-6-6 6-6"/>','chevron-right':'<path d="m9 18 6-6-6-6"/>',
target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/>',
bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M7 18v3M17 18v3M4 11h16M8 7h8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>',
meal:'<path d="M7 3v8M4 3v5c0 2 1 3 3 3s3-1 3-3V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/>',
refresh:'<path d="M3 12a9 9 0 0 1 15.5-6.3M21 4v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3M3 20v-5h5"/>',
gcal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M12 14v3"/><path d="M11 14.5h2"/>',
gtasks:'<path d="m5 12 4 4L19 6"/><path d="M3 12h2M19 12h2"/>',
close:'<path d="m6 6 12 12M18 6 6 18"/>',swap:'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',sunrise:'<path d="M4 18h16M6 14a6 6 0 0 1 12 0M12 3v4"/>',moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>'
};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name]||""}</svg>`}
function renderIcons(){$$("[data-icon]").forEach(el=>{el.innerHTML=icon(el.dataset.icon)})}
function applyTheme(){const pref=state.profile.theme||"system",t=pref==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):pref;document.documentElement.dataset.theme=t;$('meta[name="theme-color"]').content=t==="dark"?"#0b1020":"#f5f7fb"}
function filteredClasses(){const selected=new Set((state.profile.electives||[]).map(canonical));return state.all.filter(c=>c.type==="Core"?(state.profile.section==="A"?c.section==="A":c.section==="B"):selected.has(canonical(c.baseCode||c.code)))}
function migrateProfile(){state.profile.electives=[...new Set((state.profile.electives||[]).map(canonical))];save(KEYS.profile,state.profile)}
function classKey(c){return`${classIdentity(c)}|${c.endTime||""}|${venueOf(c)}`}
function classIdentity(c){return`${c.dateIso}|${c.startTime}|${canonical(c.code)}`}
function tomorrowIso(){const d=new Date(`${isoToday()}T12:00:00+05:30`);d.setDate(d.getDate()+1);return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}
function isClassCompleted(c){
  if(c.status==="Cancelled")return false;
  if(c.dateIso!==isoToday())return false;
  return Date.now()>=dateTime(c,"endTime").getTime();
}
function wasRecentlyAdded(c){
  if(isClassCompleted(c))return false;
  return state.notifications.some(n=>n.type==="added"&&!n.read&&n.classId===classIdentity(c));
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
  const oldMap=new Map(oldList.map(c=>[classIdentity(c),c])),out=[];
  newList.forEach(c=>{const old=oldMap.get(classIdentity(c));if(!old&&c.status!=="Cancelled"&&dateTime(c,"endTime")>new Date())out.push({id:crypto.randomUUID(),classId:classIdentity(c),type:"added",code:c.code,title:`${c.code} class added`,text:`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`,course:canonical(c.code),createdAt:Date.now(),read:false});else if(old&&old.status!=="Cancelled"&&c.status==="Cancelled")out.push({id:crypto.randomUUID(),classId:classIdentity(c),type:"cancelled",code:c.code,title:`${c.code} class cancelled`,text:`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)}`,course:canonical(c.code),createdAt:Date.now(),read:false})});
  return out.slice(0,12)
}
let _syncInFlight=false,_lastSyncAt=0;
async function syncSchedule(force=false){
  if(_syncInFlight)return;
  if(!force&&Date.now()-_lastSyncAt<30000)return;
  _syncInFlight=true;
  const pill=$("#syncPill"),refreshBtn=$("#refreshButton");
  if(pill){pill.className="sync-pill syncing";pill.innerHTML="<i></i><span>Syncing</span>"}
  if(refreshBtn)refreshBtn.dataset.state="syncing";
  try{
    const u=new URL(API);u.searchParams.set("section",state.profile.section||"A");u.searchParams.set("electives",(state.profile.electives||[]).join(","));u.searchParams.set("includeCancelled","true");if(force)u.searchParams.set("_",Date.now());
    const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(!d.success)throw new Error(d.error||"API failed");
    const previous=load(KEYS.snapshot,[]),changes=compareSnapshots(previous,d.classes||[]);
    if(changes.length){state.notifications=[...changes,...state.notifications].slice(0,40);save(KEYS.notifications,state.notifications)}
    state.all=d.classes||[];state.electives=d.availableElectives||[];state.lastUpdated=d.updatedAt;save(KEYS.cache,{all:state.all,electives:state.electives,lastUpdated:state.lastUpdated});save(KEYS.snapshot,state.all);state.classes=filteredClasses();
    _lastSyncAt=Date.now();
    if(pill){pill.className="sync-pill ok";pill.innerHTML="<i></i><span>Synced</span>"}
  }catch(e){
    const c=load(KEYS.cache,null);
    if(c){state.all=c.all||[];state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}
    if(pill){pill.className="sync-pill error";pill.innerHTML="<i></i><span>Offline</span>"}
    console.error(e);
  }finally{
    _syncInFlight=false;
    if(refreshBtn)refreshBtn.dataset.state="";
  }
  renderAll();
}
function scheduleIdleSync(){
  const run=()=>syncSchedule(false);
  if("requestIdleCallback"in window)requestIdleCallback(run,{timeout:2500});
  else setTimeout(run,1200);
}
function showPage(n){if(n==="home")state.timelineDay="today";$$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===n));$$("[data-page-target]").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===n));scrollTo({top:0,behavior:"auto"});if(n==="home")renderHome();if(n==="planner")renderCalendar();if(n==="campus")renderCampus()}
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
  $("#todayProgressRail").innerHTML=timelineClasses.length?`<div class="vertical-day-timeline">${timelineClasses.map(c=>{const status=c.status==="Cancelled"?"cancelled":timelineIso!==today?"upcoming":now>=dateTime(c,"endTime")?"done":now>=dateTime(c,"startTime")?"current":"upcoming",added=wasRecentlyAdded(c);return`<article class="vertical-class ${status}" style="--course:${colorFor(c.code)}"><div class="vertical-time">${esc(fmtTime(c.startTime))}<small>${esc(fmtTime(c.endTime))}</small></div><div class="vertical-content"><div class="timeline-course-line"><span class="timeline-code-chip">${esc(c.code)}</span><strong>${esc(c.course)}${added?'<span class="timeline-added">ADDED</span>':""}</strong></div><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p><span class="vertical-status">${status==="current"?"HAPPENING NOW":status==="done"?"COMPLETED":status==="cancelled"?"CANCELLED":"UPCOMING"}</span></div></article>`}).join("")}</div>`:`<div class="empty-state">${state.timelineDay==="today"?"Enjoy your free day.":"Nothing scheduled tomorrow."}</div>`;
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
  if(c.dateIso<isoToday())return"Completed";
  if(c.dateIso===isoToday()&&now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime"))return"Live";
  if(c.dateIso===isoToday()&&now>=dateTime(c,"endTime"))return"Completed";
  if(c.dateIso===isoToday()&&now<dateTime(c,"startTime"))return"Upcoming";
  return"Scheduled";
}
function googleUrl(c){
  const start=String(c.startTime||"").replace(":","")+"00";
  const end=String(c.endTime||"").replace(":","")+"00";
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&ctz=Asia%2FKolkata&text="+
    encodeURIComponent(`${c.code} · ${c.course}`)+
    "&dates="+`${c.dateIso.replace(/-/g,"")}T${start}/${c.dateIso.replace(/-/g,"")}T${end}`+
    "&location="+encodeURIComponent(venueOf(c));
}
function agendaCardHtml(c){
  const status=agendaStatus(c), cls=[
    "agenda-class-card",
    status==="Live"?"current":"",
    c.status==="Cancelled"?"cancelled":""
  ].filter(Boolean).join(" ");
  return `<article class="${cls}" data-class-id="${esc(classIdentity(c))}" style="--course:${colorFor(c.code)}">
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
      <span class="agenda-actions"><button class="agenda-add-task" type="button" data-class-id="${esc(classIdentity(c))}">${icon("plus")} Add task</button>${c.status!=="Cancelled"?`<a class="open-calendar" href="${esc(googleUrl(c))}" target="_blank" rel="noopener" aria-label="Open in Google Calendar">${icon("gcal")} Calendar</a>`:""}</span>
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
function showCalendarTooltip(target,iso){if(matchMedia("(hover: none)").matches)return;let tip=$("#calendarTooltip");if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));if(!list.length)return;tip.innerHTML=`<h4>${esc(fmtDate(iso))}</h4>${list.map(c=>`<div class="calendar-tooltip-row"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("")}`;const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-220,r.bottom+8)}px`;tip.classList.add("show")}function hideCalendarTooltip(){$("#calendarTooltip")?.classList.remove("show")}function renderCalendar(){const d=state.calendarMonth,y=d.getFullYear(),m=d.getMonth();$("#calendarTitle").textContent=new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(d);const first=new Date(y,m,1),off=(first.getDay()+6)%7,start=new Date(y,m,1-off);let html="";for(let i=0;i<42;i++){const day=new Date(start);day.setDate(start.getDate()+i);const iso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`,classes=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled"),colors=classes.slice(0,4).map(c=>colorFor(c.code));html+=`<button class="calendar-day ${day.getMonth()!==m?"outside":""} ${iso===isoToday()?"today":""} ${iso===state.selectedDate?"selected":""}" data-date="${iso}"><span class="calendar-day-number">${day.getDate()}</span><span class="calendar-course-dots">${colors.map(c=>`<i style="--course:${c}"></i>`).join("")}</span><span class="calendar-class-count">${classes.length?`${classes.length} class${classes.length>1?"es":""}`:""}</span></button>`}$("#calendarGrid").innerHTML=html;$$(".calendar-day").forEach(b=>{b.addEventListener("click",()=>{state.selectedDate=b.dataset.date;renderCalendar();requestAnimationFrame(()=>{const agenda=document.getElementById("dayAgenda");if(agenda&&window.matchMedia("(max-width:780px)").matches)agenda.scrollIntoView({behavior:"smooth",block:"start"})})});b.addEventListener("mouseenter",()=>showCalendarTooltip(b,b.dataset.date));b.addEventListener("mouseleave",hideCalendarTooltip)});const classes=state.classes.filter(c=>c.dateIso===state.selectedDate),tasks=state.tasks.filter(t=>t.date===state.selectedDate);$("#agendaDate").textContent=fmtDate(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("#agendaCount").textContent=classes.length+tasks.length;$("#dayAgenda").innerHTML=agendaHtml(classes,tasks);const used=[...new Set(state.classes.filter(c=>c.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(c=>canonical(c.code)))];$("#calendarLegend").innerHTML=used.map(c=>`<span class="legend-item" style="--course:${colorFor(c)}"><i></i>${esc(c)}</span>`).join("");bindTaskRows($("#dayAgenda"))}
function renderCourseOptions(){const selected=new Set((state.profile.electives||[]).map(canonical));const seen=new Set(),courses=[];state.all.forEach(c=>{const code=canonical(c.baseCode||c.code);const allowed=c.type==="Core"?c.section===state.profile.section:selected.has(code);if(allowed&&!seen.has(code)){seen.add(code);courses.push({code,course:c.course})}});const o=courses.sort((a,b)=>a.course.localeCompare(b.course)).map(e=>`<option value="${esc(e.code)}">${esc(e.code)} · ${esc(e.course)}</option>`).join("");["#quickTaskCourse","#taskCourse","#noteCourse"].forEach(s=>{const el=$(s);if(el)el.innerHTML='<option value="">General</option>'+o})}
function addTask(title,course,date){
  const t={id:crypto.randomUUID(),title,course:course||"General",date,completed:false,createdAt:Date.now()};
  state.tasks.unshift(t);
  save(KEYS.tasks,state.tasks);
  renderTasks();renderHomeTasks();renderCalendar();
  if(_googleAccessToken)syncTaskToGoogle(t);
}
function taskHtml(t){return`<article class="task-item ${t.completed?"completed":""}" data-task="${t.id}" style="--course:${colorFor(t.course)}"><input type="checkbox" ${t.completed?"checked":""}><div><strong>${esc(t.title)}</strong><p>${esc(t.course||"General")}${t.date?` · ${esc(fmtDate(t.date,{day:"numeric",month:"short"}))}`:""}</p></div><button class="delete-button">×</button></article>`}
function openTaskEditor(t){
  if(!t)return;
  editingTaskId=t.id;
  $("#taskTitle").value=t.title||"";
  $("#taskCourse").value=t.course==="General"?"":canonical(t.course);
  $("#taskDate").value=t.date||"";
  $("#taskDialog h2").textContent="Edit task";
  $("#saveTaskButton").textContent="Save changes";
  clearDialogValidation($("#taskDialog"));
  $("#taskDialog").showModal();
}
function bindTaskRows(root){$$(".task-item",root).forEach(r=>{
  $("input",r)?.addEventListener("change",e=>{const t=state.tasks.find(x=>x.id===r.dataset.task);if(t){t.completed=e.target.checked;save(KEYS.tasks,state.tasks);syncTaskToGoogle(t);renderTasks();renderHomeTasks();renderCalendar()}});
  $(".delete-button",r)?.addEventListener("click",()=>{const t=state.tasks.find(x=>x.id===r.dataset.task);if(t)deleteGoogleTask(t);state.tasks=state.tasks.filter(x=>x.id!==r.dataset.task);save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar()});
  $(".task-item>div",r)?.addEventListener("click",()=>openTaskEditor(state.tasks.find(x=>x.id===r.dataset.task)));
})}
function renderHomeTasks(){const a=state.tasks.filter(t=>!t.completed).slice(0,3);$("#homeTasks").innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state">No open tasks.</div>';bindTaskRows($("#homeTasks"))}
function renderTasks(){const t=isoToday();let a=state.tasks;if(state.taskFilter==="open")a=a.filter(x=>!x.completed);if(state.taskFilter==="today")a=a.filter(x=>!x.completed&&x.date===t);if(state.taskFilter==="upcoming")a=a.filter(x=>!x.completed&&x.date&&x.date>t);if(state.taskFilter==="completed")a=a.filter(x=>x.completed);$("#taskList").innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state">Nothing here.</div>';bindTaskRows($("#taskList"))}
function renderNotes(){const q=$("#noteSearch").value.toLowerCase(),a=state.notes.filter(n=>(n.title+" "+n.body+" "+n.course).toLowerCase().includes(q));$("#noteList").innerHTML=a.length?a.map(n=>`<article class="note-card" data-note="${n.id}"><header><div><small>${esc(n.course||"GENERAL")}</small><h3>${esc(n.title)}</h3></div><button class="delete-button">×</button></header><p>${esc(n.body)}</p></article>`).join(""):'<div class="empty-state">No notes yet.</div>';$$(".note-card .delete-button").forEach(b=>b.addEventListener("click",()=>{state.notes=state.notes.filter(n=>n.id!==b.closest(".note-card").dataset.note);save(KEYS.notes,state.notes);renderNotes()}))}
function busDate(b,t=false){const n=new Date(),[h,m]=b.time.split(":").map(Number),d=new Date(n);d.setHours(h,m,0,0);if(t)d.setDate(d.getDate()+1);return d}const BUS_STOPS=["C&D Housing","Phase V Campus","PGP Auditorium","Main Gate"];

function busStopLabel(stop){
  if(stop==="Phase V Campus")return"Phase 5";
  if(stop==="PGP Auditorium")return"Auditorium";
  return stop;
}

/* Timeline swipe + day switch */
function setTimelineDay(day,direction){
  if(state.timelineDay===day)return;
  const rail=$("#todayProgressRail");
  if(!rail){state.timelineDay=day;renderHome();return}
  const xOffset=direction==="forward"?-42:direction==="backward"?42:0;
  rail.style.transition="transform .18s ease, opacity .18s ease";
  rail.style.transform=`translateX(${xOffset}px)`;
  rail.style.opacity="0";
  setTimeout(()=>{
    state.timelineDay=day;
    rail.style.transition="none";
    rail.style.transform=`translateX(${-xOffset}px)`;
    renderHome();
    requestAnimationFrame(()=>{
      rail.style.transition="transform .28s cubic-bezier(.34,1.56,.64,1), opacity .28s ease";
      rail.style.transform="translateX(0)";
      rail.style.opacity="1";
    });
  },180);
}
function bindSwipeGesture(el,onSwipe){
  if(!el)return;
  let sx=0,sy=0,active=false;
  const start=e=>{
    const p=e.touches?e.touches[0]:e;
    sx=p.clientX;sy=p.clientY;active=true;
  };
  const end=e=>{
    if(!active)return;active=false;
    const p=e.changedTouches?e.changedTouches[0]:e;
    const dx=p.clientX-sx,dy=p.clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.2){
      onSwipe(dx<0?"left":"right");
    }
  };
  el.addEventListener("touchstart",start,{passive:true});
  el.addEventListener("touchend",end);
  el.addEventListener("mousedown",start);
  el.addEventListener("mouseup",end);
}

/* Electives onboarding */
function openOnboardingManually(){
  const dialog=$("#onboardingDialog");
  if(!dialog)return;
  // Force render electives + restore any saved selections before opening
  renderOnboardingElectives();
  const section=state.profile.section||"A";
  const sec=dialog.querySelector(`input[name="onboardingSection"][value="${section}"]`);
  if(sec)sec.checked=true;
  const saved=new Set((state.profile.electives||[]).map(canonical));
  $$("#onboardingElectives input").forEach(cb=>cb.checked=saved.has(canonical(cb.value)));
  setOnboardingStep(1);
  dialog.showModal();
}

function routeStops(bus){
  const from=bus.from;
  const to=bus.to;

  // Internal shuttle routes.
  if(from==="C&D Housing"&&to==="PGP Auditorium"){
    return["C&D Housing","Phase V Campus","PGP Auditorium"];
  }
  if(from==="PGP Auditorium"&&to==="C&D Housing"){
    return["PGP Auditorium","Phase V Campus","C&D Housing"];
  }

  // Main Gate services pass through both C&D Housing and Phase V.
  // The source timetable stores only one intermediate stop, so the
  // complete travelled route is expanded here.
  if(from==="Main Gate"&&to==="PGP Auditorium"){
    return["Main Gate","C&D Housing","Phase V Campus","PGP Auditorium"];
  }
  if(from==="PGP Auditorium"&&to==="Main Gate"){
    return["PGP Auditorium","Phase V Campus","C&D Housing","Main Gate"];
  }

  // Safe fallback for any future timetable entry.
  const stops=[from];
  if(bus.via&&!stops.includes(bus.via)&&bus.via!==to)stops.push(bus.via);
  if(!stops.includes(to))stops.push(to);
  return stops;
}

function serviceSupports(bus,from,to){
  const stops=routeStops(bus);
  const fromIndex=stops.indexOf(from);
  const toIndex=stops.indexOf(to);
  return fromIndex>=0&&toIndex>fromIndex;
}

function getUpcomingBuses(){
  const now=new Date();
  const matching=window.CAMPUS_DATA.bus.filter(bus=>
    serviceSupports(bus,state.busFrom,state.busTo)
  );

  const laterToday=matching
    .map(bus=>({b:bus,d:busDate(bus)}))
    .filter(item=>item.d>now)
    .sort((a,b)=>a.d-b.d);

  if(laterToday.length)return laterToday;

  return matching
    .map(bus=>({b:bus,d:busDate(bus,true)}))
    .sort((a,b)=>a.d-b.d);
}

function renderCampus(){
  renderBusControls();
  renderBuses();
  renderMess();
}

function renderBusControls(){
  const options=BUS_STOPS.map(stop=>
    `<option value="${esc(stop)}">${esc(busStopLabel(stop))}</option>`
  ).join("");

  $("#busFrom").innerHTML=options;
  $("#busTo").innerHTML=options;
  $("#busFrom").value=state.busFrom;
  $("#busTo").value=state.busTo;

  // Common Phase 5 journeys remain one tap away.
  const quickRoutes=[
    ["Phase V Campus","PGP Auditorium"],
    ["PGP Auditorium","Phase V Campus"],
    ["Phase V Campus","Main Gate"],
    ["Main Gate","Phase V Campus"]
  ];

  $("#quickRoutes").innerHTML=quickRoutes.map(([from,to])=>
    `<button class="quick-route ${
      state.busFrom===from&&state.busTo===to?"active":""
    }" data-from="${esc(from)}" data-to="${esc(to)}">${
      esc(busStopLabel(from))
    } → ${esc(busStopLabel(to))}</button>`
  ).join("");

  $$(".quick-route").forEach(button=>
    button.addEventListener("click",()=>{
      state.busFrom=button.dataset.from;
      state.busTo=button.dataset.to;
      renderBusControls();
      renderBuses();
    })
  );
}

function renderBuses(){
  const upcoming=getUpcomingBuses();
  const first=upcoming[0];
  const now=new Date();

  if(first){
    $("#nextBusTime").textContent=fmtTime(first.b.time);
    $("#nextBusRoute").textContent=
      `${busStopLabel(state.busFrom)} → ${busStopLabel(state.busTo)}`;
    $("#nextBusMeta").textContent=
      first.b.mainGate?"Main Gate service":"Campus shuttle";

    const remaining=Math.ceil((first.d-now)/60000);
    $("#nextBusCountdown").textContent=remaining>=60
      ?`${Math.floor(remaining/60)}h ${remaining%60}m`
      :`${remaining} min`;

    const stops=routeStops(first.b);
    const fromIndex=stops.indexOf(state.busFrom);
    const toIndex=stops.indexOf(state.busTo);

    $("#nextBusVisual").innerHTML=stops
      .slice(fromIndex,toIndex+1)
      .map(stop=>
        `<div class="route-stop"><i></i><span>${
          esc(busStopLabel(stop))
        }</span></div>`
      ).join("");
  }else{
    $("#nextBusTime").textContent="—";
    $("#nextBusRoute").textContent="No direct service";
    $("#nextBusMeta").textContent="Try another origin or destination";
    $("#nextBusCountdown").textContent="—";
    $("#nextBusVisual").innerHTML="";
  }

  $("#upcomingBuses").innerHTML=upcoming.length
    ?upcoming.slice(0,5).map(({b})=>busRow(b)).join("")
    :'<div class="empty-state">No matching direct buses.</div>';

  const allMatching=window.CAMPUS_DATA.bus.filter(bus=>
    serviceSupports(bus,state.busFrom,state.busTo)
  );

  $("#fullBusList").innerHTML=allMatching.length
    ?allMatching.map(busRow).join("")
    :'<div class="empty-state">No matching direct buses.</div>';
}

function busRow(bus){
  const route=routeStops(bus).map(busStopLabel).join(" · ");
  return`<article class="bus-row ${bus.mainGate?"main-gate":""}">
    <time>${esc(fmtTime(bus.time))}</time>
    <div>
      <strong>${esc(busStopLabel(state.busFrom))} → ${
        esc(busStopLabel(state.busTo))
      }</strong>
      <p>${esc(route)}</p>
      ${bus.mainGate?'<span class="route-badge">MAIN GATE</span>':""}
    </div>
  </article>`;
}

function renderMess(){const ds=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];$("#messDayPills").innerHTML=ds.map(d=>`<button class="day-pill ${d===state.messDay?"active":""}" data-day="${d}">${d.slice(0,3).toUpperCase()}</button>`).join("");$$(".day-pill").forEach(b=>b.addEventListener("click",()=>{state.messDay=b.dataset.day;renderMess()}));$("#messDayTitle").textContent=state.messDay[0].toUpperCase()+state.messDay.slice(1);const menu=window.CAMPUS_DATA.mess[state.messDay],items=menu[state.meal]||[],nv=/chicken|fish|egg|omelette/i,sw=/gulab|halwa|ice cream|kheer|custard|badusha|sweet/i,non=items.filter(i=>nv.test(i)),sweet=items.filter(i=>sw.test(i)),veg=items.filter(i=>!nv.test(i)&&!sw.test(i));$("#messMenu").innerHTML=`<article class="meal-hero"><h3>${state.meal[0].toUpperCase()+state.meal.slice(1)}</h3>${veg.length?`<section class="food-section"><div class="food-section-title">Vegetarian</div><div class="food-items">${veg.map(i=>`<div class="food-item veg">${esc(i)}</div>`).join("")}</div></section>`:""}${non.length?`<section class="food-section"><div class="food-section-title">Non-vegetarian</div><div class="food-items">${non.map(i=>`<div class="food-item nonveg">${esc(i)}</div>`).join("")}</div></section>`:""}${sweet.length?`<section class="food-section"><div class="food-section-title">Dessert / Sweet</div><div class="food-items">${sweet.map(i=>`<div class="food-item sweet">${esc(i)}</div>`).join("")}</div></section>`:""}</article>`;$$(".meal-tab").forEach(b=>b.classList.toggle("active",b.dataset.meal===state.meal))}function renderProfile(){$("#profileName").value=state.profile.name||"";$("#profileSection").value=state.profile.section||"A";$("#profileTheme").value=state.profile.theme||"system";$("#profileDisplayName").textContent=state.profile.name||"Student";$("#profileSummary").textContent=`PGPBL · Section ${state.profile.section||"A"}`;$("#profileAvatar").textContent=initials(state.profile.name);$("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";$("#electiveChoices").innerHTML=(state.electives||[]).map(e=>`<label class="choice"><input type="checkbox" value="${esc(e.code)}" ${(state.profile.electives||[]).includes(canonical(e.code))?"checked":""}><span><strong>${esc(e.code)} · ${esc(e.course)}</strong><small>${esc(e.faculty)}</small></span></label>`).join("")}
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

/* ===== Google Tasks OAuth ===== */
const GOOGLE_CLIENT_ID="326019358906-4dpbtbmnp6rm6a7m8bikcir4a2pejiot.apps.googleusercontent.com";
const GOOGLE_TASKS_SCOPE="https://www.googleapis.com/auth/tasks";
const GOOGLE_TOKEN_KEY="classbl07-nova-google-token-v1";
const GOOGLE_LIST_KEY="classbl07-nova-google-list-v1";
let _googleTokenClient=null;
let _googleAccessToken=null;

function getSavedGoogleToken(){
  try{
    const raw=localStorage.getItem(GOOGLE_TOKEN_KEY);
    if(!raw)return null;
    const o=JSON.parse(raw);
    if(o?.access_token&&(!o.expires_at||Date.now()<o.expires_at-60000))return o;
  }catch(e){}
  return null;
}
function saveGoogleToken(o){
  _googleAccessToken=o.access_token;
  localStorage.setItem(GOOGLE_TOKEN_KEY,JSON.stringify(o));
}
function clearGoogleToken(){
  _googleAccessToken=null;
  localStorage.removeItem(GOOGLE_TOKEN_KEY);
  localStorage.removeItem(GOOGLE_LIST_KEY);
}
async function initGoogleTokenClient(){
  if(_googleTokenClient)return _googleTokenClient;
  if(!window.google?.accounts?.oauth2)return null;
  return new Promise(resolve=>{
    _googleTokenClient=window.google.accounts.oauth2.initTokenClient({
      client_id:GOOGLE_CLIENT_ID,
      scope:GOOGLE_TASKS_SCOPE,
      callback:()=>{}
    });
    resolve(_googleTokenClient);
  });
}
async function connectGoogleTasks(){
  try{
    const client=await initGoogleTokenClient();
    if(!client)throw new Error("Google Identity Services not loaded");
    client.callback=async resp=>{
      if(resp.error)return;
      saveGoogleToken({access_token:resp.access_token,expires_at:Date.now()+resp.expires_in*1000});
      try{await ensureGooglePlannerList();await pullGoogleTasks();for(const task of state.tasks.filter(t=>!t.googleTaskId))await syncTaskToGoogle(task)}catch(e){}
      renderGoogleTasksStatus();
    };
    client.requestAccessToken({prompt:"consent"});
  }catch(err){
    alert("Google Tasks sign-in failed: "+(err.message||err));
  }
}
function disconnectGoogleTasks(){
  if(!confirm("Disconnect Google Tasks? Your tasks in this app will stay."))return;
  if(_googleAccessToken){
    fetch(`https://oauth2.googleapis.com/revoke?token=${_googleAccessToken}`,{method:"POST"}).catch(()=>{});
  }
  clearGoogleToken();
  renderGoogleTasksStatus();
}
async function ensureGooglePlannerList(){
  const saved=localStorage.getItem(GOOGLE_LIST_KEY);
  if(saved)return saved;
  const r=await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists",{headers:{Authorization:`Bearer ${_googleAccessToken}`}});
  if(!r.ok)throw new Error("Could not list task lists");
  const data=await r.json();
  let list=(data.items||[]).find(l=>l.title==="BL07 Tasks");
  if(!list){
    const cr=await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists",{
      method:"POST",
      headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
      body:JSON.stringify({title:"BL07 Tasks"})
    });
    if(!cr.ok)throw new Error("Could not create BL07 Tasks list");
    list=await cr.json();
  }
  localStorage.setItem(GOOGLE_LIST_KEY,list.id);
  return list.id;
}
async function syncTaskToGoogle(task){
  if(!_googleAccessToken)return;
  try{
    const listId=await ensureGooglePlannerList();
    if(task.googleTaskId){
      // update existing
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${task.googleTaskId}`,{
        method:"PATCH",
        headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
        body:JSON.stringify({title:task.title,status:task.completed?"completed":"needsAction",due:task.date?`${task.date}T00:00:00.000Z`:null,notes:`ClassBL07|${task.course||"General"}`})
      });
    }else{
      const r=await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,{
        method:"POST",
        headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
        body:JSON.stringify({title:task.title,status:task.completed?"completed":"needsAction",due:task.date?`${task.date}T00:00:00.000Z`:undefined,notes:`ClassBL07|${task.course||"General"}`})
      });
      if(r.ok){
        const data=await r.json();
        task.googleTaskId=data.id;
        save(KEYS.tasks,state.tasks);
      }
    }
  }catch(err){
    console.warn("Google Tasks sync failed",err);
  }
}
async function deleteGoogleTask(task){if(!_googleAccessToken||!task.googleTaskId)return;try{const listId=await ensureGooglePlannerList();await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${task.googleTaskId}`,{method:"DELETE",headers:{Authorization:`Bearer ${_googleAccessToken}`}})}catch(err){console.warn("Google task deletion failed",err)}}
async function pullGoogleTasks(){if(!_googleAccessToken)return;const listId=await ensureGooglePlannerList();const r=await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,{headers:{Authorization:`Bearer ${_googleAccessToken}`}});if(!r.ok)throw new Error("Could not sync Google Tasks");const remote=(await r.json()).items||[];const byGoogle=new Map(state.tasks.filter(t=>t.googleTaskId).map(t=>[t.googleTaskId,t]));remote.forEach(item=>{if(!String(item.notes||"").startsWith("ClassBL07|"))return;const course=String(item.notes).split("|")[1]||"General",date=item.due?item.due.slice(0,10):"";const local=byGoogle.get(item.id);if(local)Object.assign(local,{title:item.title,course,date,completed:item.status==="completed"});else state.tasks.push({id:crypto.randomUUID(),googleTaskId:item.id,title:item.title,course,date,completed:item.status==="completed",createdAt:Date.now()})});save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar()}
function renderGoogleTasksStatus(){
  const connectedEl=$("#googleTasksConnected");
  const disconnectedEl=$("#googleTasksDisconnected");
  if(!connectedEl||!disconnectedEl)return;
  const saved=getSavedGoogleToken();
  if(saved||_googleAccessToken){
    connectedEl.hidden=false;
    disconnectedEl.hidden=true;
  }else{
    connectedEl.hidden=true;
    disconnectedEl.hidden=false;
  }
}

function bindOutsideDismiss(dialog){
  if(!dialog)return;
  dialog.addEventListener("click",event=>{
    if(event.target===dialog)dialog.close();
  });
  dialog.addEventListener("cancel",event=>{
    event.preventDefault();
    dialog.close();
  });
}


function shouldShowOnboarding(){
  if(localStorage.getItem(KEYS.onboarded)==="true")return false;
  const p=load(KEYS.profile,null);
  if(!p)return true;
  if(!p.section)return true;
  if(!p.electives||!p.electives.length)return true;
  return false;
}
function setOnboardingStep(step){
  $$(".onboarding-step").forEach(panel=>panel.classList.toggle("active",panel.dataset.onboardingStep===String(step)));
  $$("[data-onboarding-progress]").forEach(item=>item.classList.toggle("active",Number(item.dataset.onboardingProgress)<=step));
}
function renderOnboardingElectives(){
  const container=$("#onboardingElectives");
  if(!container)return;
  container.innerHTML=(state.electives||[]).map(item=>`
    <label class="onboarding-elective-choice">
      <input type="checkbox" value="${esc(canonical(item.code))}">
      <span><strong>${esc(item.code)} · ${esc(item.course)}</strong><small>${esc(item.faculty||"")}</small></span>
    </label>
  `).join("");
}
function maybeOpenOnboarding(){
  const dialog=$("#onboardingDialog");
  if(!dialog||dialog.open)return;
  if(!shouldShowOnboarding())return;
  if(!state.electives.length)return;
  renderOnboardingElectives();
  // Pre-check saved electives so returning users see their current picks
  const saved=new Set((state.profile.electives||[]).map(canonical));
  $$("#onboardingElectives input").forEach(cb=>cb.checked=saved.has(canonical(cb.value)));
  const section=state.profile.section||"A";
  const sec=dialog.querySelector(`input[name="onboardingSection"][value="${section}"]`);
  if(sec)sec.checked=true;
  setOnboardingStep(1);
  dialog.showModal();
}
function completeOnboarding(){
  const section=$('input[name="onboardingSection"]:checked')?.value||"A";
  const electives=$$("#onboardingElectives input:checked").map(input=>canonical(input.value));
  state.profile={...state.profile,section,electives};
  save(KEYS.profile,state.profile);
  localStorage.setItem(KEYS.onboarded,"true");
  state.classes=filteredClasses();
  renderAll();
  $("#onboardingDialog")?.close();
  syncSchedule(true);
}
function bind(){
  $("#onboardingContinue")?.addEventListener("click",()=>setOnboardingStep(2));
  $("#onboardingBack")?.addEventListener("click",()=>setOnboardingStep(1));
  $("#onboardingForm")?.addEventListener("submit",event=>{event.preventDefault();completeOnboarding()});
  bindOutsideDismiss($("#taskDialog"));
  bindOutsideDismiss($("#noteDialog"));
  $$("[data-page-target]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageTarget)));$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
  $("#themeToggle").addEventListener("click",()=>{state.profile.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";save(KEYS.profile,state.profile);applyTheme();renderProfile()});
  $("#refreshButton")?.addEventListener("click",()=>syncSchedule(true));
  $("#timelineDaySwitch").addEventListener("click",e=>{const b=e.target.closest("[data-timeline-day]");if(!b)return;setTimelineDay(b.dataset.timelineDay,"auto")});
  bindSwipeGesture($(".today-progress-card"),direction=>{
    const next=state.timelineDay==="today"?"tomorrow":"today";
    setTimelineDay(next,direction==="left"?"forward":"backward");
  });
  $("#notificationButton").addEventListener("click",openNotifications);$("#openUpdatesFromHome").addEventListener("click",openNotifications);$("#closeNotifications").addEventListener("click",closeNotifications);$("#notificationBackdrop").addEventListener("click",closeNotifications);
  $("#markNotificationsRead")?.addEventListener("click",()=>{state.notifications.forEach(n=>n.read=true);save(KEYS.notifications,state.notifications);renderNotifications();renderHome()});
  $("#clearNotifications")?.addEventListener("click",()=>{
    state.notifications=[];save(KEYS.notifications,state.notifications);renderNotifications();renderHome();
  });
  $("#chooseElectivesButton")?.addEventListener("click",()=>openOnboardingManually());
  $("#connectGoogleTasks")?.addEventListener("click",()=>connectGoogleTasks());
  $("#disconnectGoogleTasks")?.addEventListener("click",()=>disconnectGoogleTasks());
  window.addEventListener("focus",()=>scheduleIdleSync());
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")scheduleIdleSync()});
  window.addEventListener("online",()=>scheduleIdleSync());
  $$(".subtab[data-planner-tab]").forEach(b=>b.addEventListener("click",()=>{$$(".subtab[data-planner-tab]").forEach(x=>x.classList.toggle("active",x===b));$$(".planner-view").forEach(v=>v.classList.toggle("active",v.dataset.plannerView===b.dataset.plannerTab))}));
  $$(".subtab[data-campus-tab]").forEach(b=>b.addEventListener("click",()=>{$$(".subtab[data-campus-tab]").forEach(x=>x.classList.toggle("active",x===b));$$(".campus-view").forEach(v=>v.classList.toggle("active",v.dataset.campusView===b.dataset.campusTab))}));
  $("#prevMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderCalendar()});$("#nextMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderCalendar()});$("#todayButton").addEventListener("click",()=>{state.selectedDate=isoToday();state.calendarMonth=new Date();state.calendarMonth.setDate(1);renderCalendar()});
  $("#dayAgenda").addEventListener("click",event=>{const button=event.target.closest(".agenda-add-task");if(!button)return;const c=state.classes.find(item=>classIdentity(item)===button.dataset.classId);if(!c)return;$("#taskTitle").value="";$("#taskCourse").value=canonical(c.code);$("#taskDate").value=c.dateIso;clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal()});
  $("#quickTaskForm").addEventListener("submit",e=>{e.preventDefault();addTask($("#quickTaskTitle").value.trim(),$("#quickTaskCourse").value,$("#quickTaskDate").value);e.target.reset()});
  const taskDialog=$("#taskDialog"),noteDialog=$("#noteDialog");
  bindDismissibleDialog(taskDialog);bindDismissibleDialog(noteDialog);
  $("#openTaskForm").addEventListener("click",()=>{editingTaskId=null;$("#taskTitle").value="";$("#taskCourse").value="";$("#taskDate").value="";$("#taskDialog h2").textContent="Add task";$("#saveTaskButton").textContent="Save";clearDialogValidation(taskDialog);taskDialog.showModal()});
  $("#saveTaskButton").addEventListener("click",()=>{const title=$("#taskTitle").value.trim();if(!title){showDialogValidation(taskDialog,"Enter a task title, or close the window to discard.");return}if(editingTaskId){const task=state.tasks.find(t=>t.id===editingTaskId);if(task){task.title=title;task.course=$("#taskCourse").value||"General";task.date=$("#taskDate").value;save(KEYS.tasks,state.tasks);syncTaskToGoogle(task);renderTasks();renderHomeTasks();renderCalendar()}editingTaskId=null}else addTask(title,$("#taskCourse").value,$("#taskDate").value);closeDialog(taskDialog,true)});
  $("#taskFilters").addEventListener("click",e=>{const b=e.target.closest("[data-task-filter]");if(!b)return;state.taskFilter=b.dataset.taskFilter;$$(".filter").forEach(x=>x.classList.toggle("active",x===b));renderTasks()});
  $("#openNoteForm").addEventListener("click",()=>{clearDialogValidation(noteDialog);noteDialog.showModal()});
  $("#saveNoteButton").addEventListener("click",()=>{const title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim();if(!title||!body){showDialogValidation(noteDialog,"Add a title and note only when you want to save. You can close this window anytime.");return}state.notes.unshift({id:crypto.randomUUID(),title,body,course:$("#noteCourse").value,createdAt:Date.now()});save(KEYS.notes,state.notes);closeDialog(noteDialog,true);renderNotes()});
  $("#noteSearch").addEventListener("input",renderNotes);
  $("#profileForm").addEventListener("submit",e=>{e.preventDefault();state.profile={name:$("#profileName").value.trim(),section:$("#profileSection").value,electives:$$('#electiveChoices input:checked').map(x=>canonical(x.value)),theme:$("#profileTheme").value};save(KEYS.profile,state.profile);applyTheme();syncSchedule(true)});$("#refreshData").addEventListener("click",()=>syncSchedule(true));$("#resetData").addEventListener("click",()=>{if(confirm("Reset profile, tasks, notes and cached schedule?")){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));location.reload()}});
  $("#busFrom").addEventListener("change",()=>{state.busFrom=$("#busFrom").value;renderBusControls();renderBuses()});$("#busTo").addEventListener("change",()=>{state.busTo=$("#busTo").value;renderBusControls();renderBuses()});$("#swapBusRoute").addEventListener("click",()=>{[state.busFrom,state.busTo]=[state.busTo,state.busFrom];renderBusControls();renderBuses()});$("#toggleFullBus").addEventListener("click",()=>{const l=$("#fullBusList"),c=l.classList.toggle("collapsed");$("#toggleFullBus").textContent=c?"Show all":"Collapse"});$("#mealTabs").addEventListener("click",e=>{const b=e.target.closest("[data-meal]");if(!b)return;state.meal=b.dataset.meal;renderMess()});$("#closeShortcutDialog").addEventListener("click",()=>$("#shortcutDialog").close());document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const k=e.key.toLowerCase();if(k==="h")showPage("home");else if(k==="p")showPage("planner");else if(k==="c")showPage("campus");else if(k==="r")syncSchedule(true);else if(k==="n")openNotifications();else if(e.key==="?")$("#shortcutDialog").showModal()});
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if((state.profile.theme||"system")==="system")applyTheme()})
}
async function init(){
  const hour=new Date().getHours();
  state.meal=hour<11?"breakfast":hour<16?"lunch":"dinner";
  state.messDay=weekdayKey(new Date());
  applyTheme();
  renderIcons();
  bind();
  const c=load(KEYS.cache,null);
  if(c){state.all=c.all||[];state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}
  // Restore Google Tasks token silently
  const savedToken=getSavedGoogleToken();
  if(savedToken){_googleAccessToken=savedToken.access_token;initGoogleTokenClient().catch(()=>{});pullGoogleTasks().then(async()=>{for(const task of state.tasks.filter(t=>!t.googleTaskId))await syncTaskToGoogle(task)}).catch(()=>{})}
  renderAll();
  renderGoogleTasksStatus();
  maybeOpenOnboarding();
  syncSchedule(false);
  setInterval(()=>{renderHome();renderBuses()},30000);
  if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js?v=20260809-mobile1",{updateViaCache:"none"}).catch(console.error)
}
document.addEventListener("DOMContentLoaded",init);
})();
