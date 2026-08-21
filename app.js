(() => {
"use strict";
const API="https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec";
const KEYS={profile:"classbl07-nova-profile-v1",tasks:"classbl07-nova-tasks-v1",notes:"classbl07-nova-notes-v1",cache:"classbl07-nova-schedule-v1",snapshot:"classbl07-nova-snapshot-v1",notifications:"classbl07-nova-notifications-v1",onboarded:"bl07_onboarded_v2"};
const COURSE_COLORS={SM:"#8b7cf6",DBST:"#5b8def",AIB:"#24b3a8",OS:"#f29a52",CV:"#36b5d8",PM:"#6f7bea",POM:"#ee7656",CB:"#d866ad",SBM:"#d6a43b",NWW:"#b07c59",MAAS:"#8f66cf",ACC:"#e15d69"};
const HOLIDAYS=Object.freeze({"2026-08-15":"Independence Day"});
window.BL07_HOLIDAYS=HOLIDAYS;
const state={all:[],classes:[],electives:[],profile:load(KEYS.profile,{name:"",section:"A",electives:[],theme:"system"}),tasks:load(KEYS.tasks,[]),notes:load(KEYS.notes,[]),notifications:load(KEYS.notifications,[]),notificationFilter:"all",selectedDate:isoToday(),calendarMonth:new Date(new Date().getFullYear(),new Date().getMonth(),1),taskFilter:"open",messDay:weekdayKey(new Date()),meal:"breakfast",busFrom:"Phase V Campus",busTo:"PGP Auditorium",timelineDay:"today",lastUpdated:null};
let editingTaskId=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const canonical=c=>String(c||"").toUpperCase().replace(/^NWLB$/,"NWW").split("-")[0];
const colorFor=c=>COURSE_COLORS[canonical(c)]||"#7b8aa2";
const venueOf=c=>c.venue||c.room||"Venue TBA";
const EXAM_SLOT_ORDER={Forenoon:0,Afternoon:1,Evening:2};
function filteredExams(){const selected=new Set((state.profile.electives||[]).map(canonical));return[...(window.EXAM_DATA||[])].filter(exam=>exam.type==="Core"||selected.has(canonical(exam.code))).sort((a,b)=>a.dateIso.localeCompare(b.dateIso)||(EXAM_SLOT_ORDER[a.slot]??9)-(EXAM_SLOT_ORDER[b.slot]??9))}
function examDayDistance(dateIso){const today=new Date(`${isoToday()}T00:00:00+05:30`),examDate=new Date(`${dateIso}T00:00:00+05:30`);return Math.round((examDate-today)/86400000)}
function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function showToast(message){let toast=$("#appToast");if(!toast){toast=document.createElement("div");toast.id="appToast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");document.body.appendChild(toast)}toast.className="app-toast";toast.textContent=message;requestAnimationFrame(()=>toast.classList.add("show"));clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400)}
function showUndoToast(message,onUndo){let toast=$("#appToast");if(!toast){toast=document.createElement("div");toast.id="appToast";toast.className="app-toast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");document.body.appendChild(toast)}toast.className="app-toast has-action";toast.innerHTML="";const label=document.createElement("span"),button=document.createElement("button");label.textContent=message;button.type="button";button.textContent="Undo";button.addEventListener("click",()=>{clearTimeout(showToast.timer);onUndo();toast.classList.remove("show");setTimeout(()=>toast.classList.remove("has-action"),220)},{once:true});toast.append(label,button);requestAnimationFrame(()=>toast.classList.add("show"));clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>{toast.classList.remove("show");setTimeout(()=>toast.classList.remove("has-action"),220)},5000)}
function istParts(date=new Date()){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23",weekday:"long"}).formatToParts(date);return Object.fromEntries(parts.map(p=>[p.type,p.value]))}
function isoToday(){const p=istParts();return`${p.year}-${p.month}-${p.day}`}
function weekdayKey(d=new Date()){return istParts(d).weekday.toLowerCase()}
function minutes(t){const[h,m]=String(t||"00:00").split(":").map(Number);return h*60+m}
function dateTime(c,w="startTime"){return new Date(`${c.dateIso}T${c[w]||c[w==="startTime"?"start":"end"]}:00+05:30`)}
function fmtTime(t){const[h,m]=t.split(":").map(Number);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(2026,0,1,h,m))}
function fmtDate(iso,o={weekday:"long",day:"numeric",month:"short"}){return new Intl.DateTimeFormat("en-IN",o).format(new Date(`${iso}T12:00:00+05:30`))}
function initials(n){return String(n||"ST").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}
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
function applyTheme(){const pref=state.profile.theme||"system",t=pref==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):pref;document.documentElement.dataset.theme=t;$('meta[name="theme-color"]').content=t==="dark"?"#130f15":"#f5f0f4"}
function filteredClasses(){const selected=new Set((state.profile.electives||[]).map(canonical));return state.all.filter(c=>c.type==="Core"?(state.profile.section==="A"?c.section==="A":c.section==="B"):selected.has(canonical(c.baseCode||c.code)))}
function migrateProfile(){state.profile.electives=[...new Set((state.profile.electives||[]).map(canonical))];save(KEYS.profile,state.profile)}
const CANCELLED_FILL_COLORS=new Set(["#ff0000","#cc0000","#c00000"]);
function normalizeFillColor(value){const fill=String(value||"").trim().toLowerCase();return /^#[0-9a-f]{3}$/.test(fill)?`#${fill.slice(1).split("").map(char=>char.repeat(2)).join("")}`:fill}
function normalizeScheduleClass(item){
  const status=String(item?.status||"").trim(),normalized=status.toLowerCase(),fill=normalizeFillColor(item?.fillColor);
  if(normalized==="cancelled"||normalized==="canceled"||CANCELLED_FILL_COLORS.has(fill))return{...item,status:"Cancelled"};
  if(normalized==="added")return{...item,status:"Added"};
  return{...item,status:status||"Scheduled"};
}
function normalizeScheduleClasses(items){return Array.isArray(items)?items.map(normalizeScheduleClass):[]}
function classKey(c){return`${classIdentity(c)}|${c.endTime||""}|${venueOf(c)}`}
function classIdentity(c){return`${c.dateIso}|${c.startTime}|${canonical(c.code)}`}
function notificationClass(n){return state.all.find(c=>classIdentity(c)===n.classId)}
function notificationExpiry(n){
  const stored=Number(n.expiresAt);if(Number.isFinite(stored)&&stored>0)return stored;
  const c=notificationClass(n);if(c)return dateTime(c,"endTime").getTime();
  const dateIso=n.dateIso||String(n.classId||"").split("|")[0];
  if(dateIso&&dateIso<isoToday())return 0;
  return Number(n.createdAt||0)+7*86400000;
}
function isNotificationActionable(n){return notificationExpiry(n)>Date.now()}
function pruneNotifications(){
  const current=state.notifications.filter(isNotificationActionable).slice(0,40);
  if(current.length!==state.notifications.length){state.notifications=current;save(KEYS.notifications,state.notifications)}
  return current;
}
function notificationRecord(c,type,title,text){return{id:crypto.randomUUID(),classId:classIdentity(c),dateIso:c.dateIso,startTime:c.startTime,endTime:c.endTime,expiresAt:dateTime(c,"endTime").getTime(),type,code:c.code,title,text,course:canonical(c.code),createdAt:Date.now(),read:false}}
function tomorrowIso(){const d=new Date(`${isoToday()}T12:00:00+05:30`);d.setDate(d.getDate()+1);return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}
function isClassCompleted(c){
  if(c.status==="Cancelled")return false;
  return Date.now()>=dateTime(c,"endTime").getTime();
}
function wasRecentlyAdded(c){
  if(isClassCompleted(c))return false;
  const fill=String(c.fillColor||"").toLowerCase(),addedFill=["#00ff00","#00b050","#70ad47","#92d050"].includes(fill);
  return c.status==="Added"||addedFill||state.notifications.some(n=>n.type==="added"&&n.classId===classIdentity(c));
}
function relativeSyncText(){
  const stamp=_lastSyncAt||new Date(state.lastUpdated||0).getTime();
  if(!stamp)return"Waiting for the first schedule check";
  const mins=Math.max(0,Math.floor((Date.now()-stamp)/60000));
  if(mins<1)return"Schedule checked just now";
  if(mins===1)return"Schedule checked 1 minute ago";
  if(mins<60)return`Schedule checked ${mins} minutes ago`;
  const hours=Math.floor(mins/60);return`Schedule checked ${hours} hour${hours>1?"s":""} ago`;
}

function compareSnapshots(oldList,newList){
  if(!oldList||!oldList.length)return[];
  const oldMap=new Map(oldList.map(c=>[classIdentity(c),c])),out=[];
  newList.forEach(c=>{const old=oldMap.get(classIdentity(c));if(!old&&c.status!=="Cancelled"&&dateTime(c,"endTime")>new Date())out.push(notificationRecord(c,"added",`${c.code} class added`,`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`));else if(old&&old.status!=="Cancelled"&&c.status==="Cancelled"&&dateTime(c,"endTime")>new Date())out.push(notificationRecord(c,"cancelled",`${c.code} class cancelled`,`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)}`));else if(old&&old.status!=="Cancelled"&&c.status!=="Cancelled"&&venueOf(old)!==venueOf(c)&&dateTime(c,"endTime")>new Date())out.push(notificationRecord(c,"venue",`${c.code} venue changed`,`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`))});
  return out.slice(0,12)
}
let _syncInFlight=false,_lastSyncAt=0,_syncAgain=false,_offlineRetryTimer=0;
function setAppState(kind="online",message=""){
  const banner=$("#appStateBanner"),text=$("#appStateText"),action=$("#appStateAction");if(!banner)return;
  banner.dataset.state=kind;banner.hidden=kind==="online";if(text)text.textContent=message||"You are offline. Showing the last saved schedule.";if(action){action.hidden=kind!=="update";action.textContent=kind==="update"?"Refresh":""}
}
function clearOfflineRetry(){if(_offlineRetryTimer){clearTimeout(_offlineRetryTimer);_offlineRetryTimer=0}}
function scheduleOfflineRetry(){
  clearOfflineRetry();
  _offlineRetryTimer=setTimeout(()=>{
    _offlineRetryTimer=0;
    if(navigator.onLine){setAppState("reconnecting","Connection restored. Refreshing schedule…");syncSchedule(true)}
    else scheduleOfflineRetry();
  },10000)
}
function recoverConnectivity(){setAppState("reconnecting","Connection restored. Refreshing schedule…");syncSchedule(true)}
async function syncSchedule(force=false){
  if(_syncInFlight){if(force)_syncAgain=true;return}
  if(!force&&Date.now()-_lastSyncAt<30000)return;
  _syncInFlight=true;
  document.body.classList.add("schedule-loading");
  const pill=$("#syncPill"),refreshBtn=$("#refreshButton");
  if(pill){pill.className="sync-pill syncing";pill.innerHTML="<i></i><span>Checking</span>"}
  if(refreshBtn){refreshBtn.dataset.state="syncing";refreshBtn.setAttribute("aria-busy","true")}
  try{
    const u=new URL(API);u.searchParams.set("section",state.profile.section||"A");u.searchParams.set("electives",(state.profile.electives||[]).join(","));u.searchParams.set("includeCancelled","true");if(force)u.searchParams.set("_",Date.now());
    const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(!d.success)throw new Error(d.error||"API failed");
    const previous=load(KEYS.snapshot,[]),incoming=normalizeScheduleClasses(d.classes),changes=compareSnapshots(previous,incoming);
    if(changes.length){const existing=new Set(state.notifications.map(n=>`${n.type}|${n.classId}|${n.text}`));state.notifications=[...changes.filter(n=>!existing.has(`${n.type}|${n.classId}|${n.text}`)),...state.notifications].slice(0,40);save(KEYS.notifications,state.notifications)}
    state.all=incoming;state.electives=d.availableElectives||[];state.lastUpdated=d.updatedAt;save(KEYS.cache,{all:state.all,electives:state.electives,lastUpdated:state.lastUpdated});save(KEYS.snapshot,state.all);state.classes=filteredClasses();
    _lastSyncAt=Date.now();
    clearOfflineRetry();
    setAppState("online");
    if(pill){pill.className="sync-pill ok";pill.innerHTML="<i></i><span>Updated now</span>"}
  }catch(e){
    const c=load(KEYS.cache,null);
    if(c){state.all=normalizeScheduleClasses(c.all);state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}
    if(pill){pill.className="sync-pill error";pill.innerHTML="<i></i><span>Offline</span>"}
    setAppState("offline",c?"You are offline. Showing the last saved schedule.":"Schedule could not load. Check your connection and try again.");
    scheduleOfflineRetry();
    console.error(e);
  }finally{
    _syncInFlight=false;
    document.body.classList.remove("schedule-loading");
    if(refreshBtn){refreshBtn.dataset.state="";refreshBtn.setAttribute("aria-busy","false")}
    if(_syncAgain){_syncAgain=false;setTimeout(()=>syncSchedule(true),0)}
  }
  renderAll();
}
function scheduleIdleSync(){
  const run=()=>syncSchedule(false);
  if("requestIdleCallback"in window)requestIdleCallback(run,{timeout:2500});
  else setTimeout(run,1200);
}
function setPlannerView(view="calendar"){$$(".subtab[data-planner-tab]").forEach(b=>b.classList.toggle("active",b.dataset.plannerTab===view));$$(".planner-view").forEach(v=>v.classList.toggle("active",v.dataset.plannerView===view));document.dispatchEvent(new CustomEvent("planner-view-change",{detail:{view}}))}
function showPage(n){if(n==="home")state.timelineDay="today";if(n==="planner"){state.selectedDate=isoToday();const today=new Date();state.calendarMonth=new Date(today.getFullYear(),today.getMonth(),1);setPlannerView("calendar")}$$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===n));$$("[data-page-target]").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===n));scrollTo({top:0,behavior:"auto"});if(n==="home")renderHome();if(n==="planner")renderCalendar();if(n==="campus")renderCampus()}
function openPlannerDate(iso){
  showPage("planner");
  state.selectedDate=iso;
  const date=new Date(`${iso}T12:00:00+05:30`);
  state.calendarMonth=new Date(date.getFullYear(),date.getMonth(),1);
  renderCalendar();
  requestAnimationFrame(()=>$("#dayAgenda")?.scrollIntoView({behavior:"smooth",block:"start"}));
}
function openExamPlanner(){showPage("planner");setPlannerView("exams")}
function renderAll(){migrateProfile();state.classes=filteredClasses();pruneNotifications();renderProfile();renderCourseOptions();renderHome();renderCalendar();renderExams();renderTasks();renderNotes();renderCampus();renderNotifications();renderIcons()}
function scheduleGapParts(current,next){
  const start=minutes(current.endTime),end=minutes(next.startTime),lunchStart=13*60+30,lunchEnd=14*60+30;
  if(end-start<30)return[];
  if(start<lunchEnd&&end>lunchStart){
    const lunchFrom=Math.max(start,lunchStart),lunchTo=Math.min(end,lunchEnd);
    const parts=[];
    if(lunchFrom-start>=30)parts.push({type:"free",duration:lunchFrom-start,startTime:current.endTime,endTime:`${String(Math.floor(lunchFrom/60)).padStart(2,"0")}:${String(lunchFrom%60).padStart(2,"0")}`,nextCode:"Lunch"});
    parts.push({type:"lunch",duration:lunchTo-lunchFrom,startTime:`${String(Math.floor(lunchFrom/60)).padStart(2,"0")}:${String(lunchFrom%60).padStart(2,"0")}`,endTime:`${String(Math.floor(lunchTo/60)).padStart(2,"0")}:${String(lunchTo%60).padStart(2,"0")}`,nextCode:canonical(next.code),nextTime:next.startTime});
    if(end-lunchTo>=30)parts.push({type:"free",duration:end-lunchTo,startTime:`${String(Math.floor(lunchTo/60)).padStart(2,"0")}:${String(lunchTo%60).padStart(2,"0")}`,endTime:next.startTime,nextCode:canonical(next.code),nextTime:next.startTime});
    return parts;
  }
  return[{type:"free",duration:end-start,startTime:current.endTime,endTime:next.startTime,nextCode:canonical(next.code),nextTime:next.startTime}];
}
function gapWindowHtml(part,{agenda=false,dateIso="",course=""}={}){
  const isLunch=part.type==="lunch",tag=agenda?"agenda-free-window":"free-window-row",action=!isLunch&&part.duration>=60?`<button type="button" class="free-window-action" data-free-date="${esc(dateIso)}" data-free-course="${esc(course)}">Add task</button>`:"",nextCopy=part.nextCode?`Next: ${esc(part.nextCode)}${part.nextTime?` at ${esc(fmtTime(part.nextTime))}`:""}`:"";
  return`<div class="${tag} ${isLunch?"lunch-window":""}"><span class="gap-window-label">${isLunch?"LUNCH":"FREE TIME"}</span><strong>${isLunch?`${esc(compactDuration(part.duration))} lunch break`:`${esc(compactDuration(part.duration))} available`}</strong><time>${esc(fmtTime(part.startTime))} – ${esc(fmtTime(part.endTime))}</time>${nextCopy?`<small>${nextCopy}</small>`:""}${action}</div>`;
}
function dayLoadStats(classes){
  const active=classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)),classMinutes=active.reduce((sum,c)=>sum+Math.max(0,minutes(c.endTime)-minutes(c.startTime)),0);let freeMinutes=0;
  active.slice(1).forEach((current,index)=>scheduleGapParts(active[index],current).forEach(part=>{if(part.type==="free")freeMinutes+=part.duration}));
  return{count:active.length,classMinutes,freeMinutes,end:active.at(-1)?.endTime||""};
}
function decorateTimelineDay(selector,classes,iso){
  const rail=$(selector),list=rail?.querySelector(".vertical-day-timeline");if(!rail)return;
  rail.querySelectorAll(".free-window-row,.short-break-row,.timeline-holiday-banner").forEach(node=>node.remove());
  const holiday=HOLIDAYS[iso];
  if(holiday){const banner=document.createElement("div");banner.className="timeline-holiday-banner";banner.innerHTML=`<span>HOLIDAY</span><strong>${esc(holiday)}</strong>`;rail.prepend(banner)}
  if(!list)return;
  const cards=[...list.querySelectorAll(".vertical-class")];let previous=null;
  classes.forEach(current=>{
    if(current.status==="Cancelled")return;
    if(previous){const target=cards.find(card=>card.dataset.classId===classIdentity(current));scheduleGapParts(previous,current).forEach(part=>{const shell=document.createElement("div");shell.innerHTML=gapWindowHtml(part,{dateIso:iso,course:canonical(current.code)});target?.before(shell.firstElementChild)})}
    previous=current;
  });
}
function fillSegments(target,percent){if(!target)return;const value=Math.round(Math.max(0,Math.min(100,percent)));if(!target.firstElementChild)target.innerHTML="<i></i>";target.style.setProperty("--focus-progress",`${value}%`);target.setAttribute("aria-valuenow",String(value))}
function renderWeekDensity(){
  const today=isoToday(),base=new Date(`${today}T12:00:00+05:30`),monday=new Date(base),daysFromMonday=(base.getUTCDay()+6)%7;monday.setDate(base.getDate()-daysFromMonday);
  const days=Array.from({length:7},(_,offset)=>{const date=new Date(monday);date.setDate(monday.getDate()+offset);const iso=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(date),classes=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled"),minutesTotal=classes.reduce((sum,c)=>sum+Math.max(0,minutes(c.endTime)-minutes(c.startTime)),0);return{iso,classes,minutesTotal}}),classTotal=days.reduce((sum,day)=>sum+day.classes.length,0),minuteTotal=days.reduce((sum,day)=>sum+day.minutesTotal,0);
  $("#weekDensitySummary").textContent=`${classTotal} ${classTotal===1?"class":"classes"} · ${compactDuration(minuteTotal)}`;
  $("#weekDensityDays").innerHTML=days.map(day=>{const weekday=fmtDate(day.iso,{weekday:"short"}),isToday=day.iso===today,label=`Open ${weekday}: ${day.classes.length} ${day.classes.length===1?"class":"classes"}, ${day.minutesTotal?compactDuration(day.minutesTotal):"clear"}`;return`<button type="button" class="density-day ${isToday?"today":""}" data-density-date="${day.iso}" aria-label="${esc(label)}"${isToday?' aria-current="date"':""}><span>${esc(weekday)}</span><strong>${day.classes.length}</strong></button>`}).join("");
}
function loadSummary(classes,boundary="end"){
  if(!classes.length)return"No classes scheduled";
  const total=classes.reduce((sum,c)=>sum+Math.max(0,minutes(c.endTime)-minutes(c.startTime)),0),sorted=[...classes].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)),edge=boundary==="start"?fmtTime(sorted[0].startTime):`Until ${fmtTime(sorted.at(-1).endTime)}`;
  return`${classes.length} ${classes.length===1?"class":"classes"} · ${compactDuration(total)} · ${edge}`;
}
function renderNextExam(){
  const card=$("#nextExamCard"),next=filteredExams().find(exam=>exam.dateIso>=isoToday());
  if(!card)return;
  const days=next?examDayDistance(next.dateIso):-1;
  card.hidden=!next||days<0||days>14;
  if(card.hidden)return;
  card.style.setProperty("--course",colorFor(next.code));
  $("#nextExamCode").textContent=next.code;
  $("#nextExamTitle").textContent=next.course;
  $("#nextExamMeta").textContent=`${fmtDate(next.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${next.slot} · Time TBA`;
  $("#nextExamCountdown").textContent=days===0?"Today":days===1?"Tomorrow":`${days} days`;
}
function examListCard(exam){
  const days=examDayDistance(exam.dateIso),status=days<0?"Completed":days===0?"Today":days===1?"Tomorrow":`${days} days`;
  return`<article class="exam-list-card ${days<0?"past":""}" style="--course:${colorFor(exam.code)}"><div class="exam-slot"><span>${esc(exam.slot)}</span><strong>${esc(status)}</strong></div><div class="exam-list-copy"><div class="exam-course-line"><span class="exam-code-chip">${esc(exam.code)}</span><h3>${esc(exam.course)}</h3></div><p><span>Time TBA</span><i>·</i><span>Venue TBA</span></p></div><div class="exam-card-actions">${days>=0?`<button type="button" class="exam-prep-button" data-exam-prep="${exam.dateIso}" data-exam-code="${esc(exam.code)}">Prep task</button>`:""}<button type="button" class="exam-day-button" data-exam-date="${exam.dateIso}">View day</button></div></article>`;
}
function renderExams(){
  const exams=filteredExams(),count=$("#examCount"),schedule=$("#examSchedule");
  if(!schedule)return;
  if(count)count.textContent=exams.length;
  if(!exams.length){schedule.innerHTML='<div class="empty-state">No exams match your selected courses.</div>';return}
  const groups=new Map();exams.forEach(exam=>{if(!groups.has(exam.dateIso))groups.set(exam.dateIso,[]);groups.get(exam.dateIso).push(exam)});
  schedule.innerHTML=[...groups].map(([date,items])=>`<section class="exam-day-group"><header><div><span>${esc(fmtDate(date,{weekday:"short"}))}</span><strong>${esc(fmtDate(date,{day:"numeric",month:"long",year:"numeric"}))}</strong></div><small>${items.length} ${items.length===1?"exam":"exams"}</small></header><div>${items.map(examListCard).join("")}</div></section>`).join("");
}
function renderHeroDayGlance(classes,now,dateIso){
  const glance=$("#heroDayGlance"),items=[...classes].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  if(!glance)return;
  glance.hidden=!items.length;
  glance.innerHTML=items.map(c=>{
    const status=c.status==="Cancelled"?"cancelled":dateIso<isoToday()||dateIso===isoToday()&&now>=dateTime(c,"endTime")?"done":dateIso===isoToday()&&now>=dateTime(c,"startTime")?"current":"upcoming";
    return`<span class="hero-class-segment ${status}" style="--course:${colorFor(c.code)}" aria-label="${esc(c.code)} · ${esc(fmtTime(c.startTime))} · ${status}"><i></i><b>${esc(canonical(c.code))}</b></span>`;
  }).join("");
}
function renderHome(){
  const now=new Date(),today=isoToday();$("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(now).toUpperCase();$("#dateOrbitDay").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"short"}).format(now);$("#dateOrbitMonth").textContent=`${now.getDate()} ${new Intl.DateTimeFormat("en-IN",{month:"short"}).format(now)}`;const h=now.getHours(),firstName=String(state.profile.name||"").trim().split(/\s+/)[0],dayGreeting=`Good ${h<12?"morning":h<17?"afternoon":"evening"}`;$("#greeting").textContent=firstName?`${dayGreeting} ${firstName}`:dayGreeting;
  const scheduled=state.classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"));
  const todays=scheduled.filter(c=>c.dateIso===today),current=todays.find(c=>now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime")),todayNext=todays.find(c=>now<dateTime(c,"startTime")),previous=todays.filter(c=>now>=dateTime(c,"endTime")).at(-1),future=scheduled.find(c=>now<dateTime(c,"startTime")),focus=current||todayNext||future,todayComplete=Boolean(todays.length&&!current&&!todayNext),loadDate=!todays.length||todayComplete?tomorrowIso():today,loadClasses=scheduled.filter(c=>c.dateIso===loadDate),loadIsToday=loadDate===today,loadIsTomorrow=loadDate===tomorrowIso(),loadLabel=loadIsToday?"Today":loadIsTomorrow?"Tomorrow":fmtDate(loadDate,{weekday:"long"}),loadValue=loadSummary(loadClasses,loadIsToday?"end":"start"),parts=istParts(now),nowMinutes=Number(parts.hour)*60+Number(parts.minute),isLunch=Boolean(!current&&todayNext&&nowMinutes>=13*60+30&&nowMinutes<Math.min(14*60+30,minutes(todayNext.startTime)));
  const focusPanel=$("#focusPanel");
  if(focus){
    const isNow=focus===current,isToday=focus.dateIso===today,isTomorrow=focus.dateIso===tomorrowIso(),isFree=Boolean(!current&&todayNext&&previous&&!isLunch),isClearToday=Boolean(!todays.length&&future),isDayDone=Boolean(todayComplete&&future),dayClasses=scheduled.filter(c=>c.dateIso===focus.dateIso),dayIndex=dayClasses.indexOf(focus),remaining=todays.filter(c=>dateTime(c,"endTime")>now).length;
    focusPanel.classList.remove("is-empty");focusPanel.classList.toggle("is-live",isNow);focusPanel.classList.toggle("is-lunch",isLunch);focusPanel.classList.toggle("is-free",isFree);focusPanel.classList.toggle("is-clear",isClearToday||isDayDone);focusPanel.classList.toggle("is-upcoming",!isNow&&!isFree&&!isLunch&&isToday);focusPanel.classList.toggle("is-future",!isToday);focusPanel.style.setProperty("--focus-course",isLunch?"var(--amber)":colorFor(focus.code));focusPanel.dataset.focusDate=focus.dateIso;
    $("#focusLiveCapsule").textContent=isNow?"NOW":isLunch?"LUNCH":isFree?"FREE":isClearToday?"CLEAR":isDayDone?"DONE":"NEXT";
    $("#focusKicker").textContent=isNow?"HAPPENING NOW":isLunch?"LUNCH BREAK":isFree?"FREE TIME":isClearToday?"TODAY IS CLEAR":isDayDone?"DAY COMPLETE":isToday?"UP NEXT":isTomorrow?"LOOKING AHEAD":"NEXT CLASS";
    $("#focusState").textContent=isNow?"In progress":isLunch?"Lunch break":isFree?"Free window":isClearToday?"Today is clear":isDayDone?"Day complete":isToday?"Next class":isTomorrow?"Looking ahead":fmtDate(focus.dateIso,{weekday:"long",day:"numeric",month:"short"});
    $("#focusDayLoad").textContent=isLunch?`${remaining} ${remaining===1?"class":"classes"} left`:isToday&&dayIndex>=0?`${dayIndex+1} of ${dayClasses.length}`:isTomorrow?`${dayClasses.length} tomorrow`:`${dayClasses.length} ${dayClasses.length===1?"class":"classes"}`;
    $("#focusCode").textContent=isLunch?"BREAK":canonical(focus.code);$("#focusTitle").textContent=isLunch?"Lunch break":(isFree||isClearToday||isDayDone?"Next · ":"")+focus.course;$("#focusTime").textContent=isLunch?`${fmtTime("13:30")} – ${fmtTime("14:30")}`:isFree?`${compactDuration((dateTime(focus,"startTime")-now)/60000)} free`:isClearToday?"Free today":isDayDone?"Done for today":`${fmtTime(focus.startTime)} – ${fmtTime(focus.endTime)}`;$("#focusVenue").textContent=isLunch?`Next ${canonical(focus.code)} · ${fmtTime(focus.startTime)}`:venueOf(focus);$("#focusFaculty").textContent=focus.faculty;$("#focusFacultyRow").hidden=isLunch||!focus.faculty;
    const target=isNow?dateTime(focus,"endTime"):dateTime(focus,"startTime"),diff=Math.max(0,Math.ceil((target-now)/60000));
    const lunchLeft=Math.max(0,14*60+30-nowMinutes);$("#focusCountdownLabel").textContent=isNow?`ENDS AT ${fmtTime(focus.endTime)}`:isLunch?"LUNCH ENDS":isFree?"NEXT CLASS":isClearToday||isDayDone?"NEXT UP":isToday?"STARTS IN":"DAY LOAD";
    $("#focusCountdown").textContent=isNow?`${compactDuration(diff)} left`:isLunch?`${compactDuration(lunchLeft)} left`:isFree?fmtTime(focus.startTime):isClearToday||isDayDone?fmtDate(focus.dateIso,{weekday:"short",day:"numeric",month:"short"}):isToday?compactDuration(diff):`${dayClasses.length} ${dayClasses.length===1?"class":"classes"}`;
    const context=$("#focusContext");context.hidden=false;$("#focusContextLabel").textContent=loadLabel;$("#focusContextValue").textContent=loadValue;
    const position=$("#focusPosition"),positionLabel=$("#focusPositionLabel"),positionValue=$("#focusPositionValue"),after=isNow?todays.find(c=>dateTime(c,"startTime")>=dateTime(focus,"endTime")):null;
    position.hidden=!(isNow||isLunch||isFree||isToday&&dayIndex>=0);
    positionLabel.textContent=isNow&&after?"NEXT":isNow?"TODAY":isLunch?"LUNCH ENDS":isFree?"NEXT":"TODAY";
    positionValue.textContent=isNow&&after?`${canonical(after.code)} · ${fmtTime(after.startTime)}`:isNow?"Final class":isLunch?compactDuration(lunchLeft):isFree?`${canonical(focus.code)} · ${fmtTime(focus.startTime)}`:dayIndex>=0?`Class ${dayIndex+1} of ${todays.length}`:"";
    const liveProgress=isNow?((now-dateTime(focus,"startTime"))/(dateTime(focus,"endTime")-dateTime(focus,"startTime")))*100:isLunch?((nowMinutes-(13*60+30))/60)*100:isFree&&previous?((now-dateTime(previous,"endTime"))/(dateTime(focus,"startTime")-dateTime(previous,"endTime")))*100:0,segments=$("#focusSegments");segments.hidden=!(isNow||isLunch||isFree);fillSegments(segments,liveProgress,12);
    const glanceDate=isToday?today:focus.dateIso;renderHeroDayGlance(state.classes.filter(c=>c.dateIso===glanceDate),now,glanceDate);
  }
  else{focusPanel.classList.add("is-empty");focusPanel.classList.remove("is-live","is-lunch","is-free","is-clear","is-upcoming","is-future");focusPanel.style.removeProperty("--focus-course");$("#focusLiveCapsule").textContent="DONE";$("#focusKicker").textContent=todays.length?"DAY COMPLETE":"YOUR SCHEDULE";$("#focusState").textContent=todays.length?"Day complete":"Today is clear";$("#focusDayLoad").textContent=todays.length?`${todays.length} done`:"No classes";$("#focusCode").textContent="CLEAR";$("#focusTitle").textContent="No upcoming classes";$("#focusTime").textContent=todays.length?"Done for today":"Free today";$("#focusVenue").textContent="—";$("#focusFaculty").textContent="";$("#focusFacultyRow").hidden=true;$("#focusCountdownLabel").textContent="STATUS";$("#focusCountdown").textContent="Clear";$("#focusContext").hidden=false;$("#focusContextLabel").textContent=loadLabel;$("#focusContextValue").textContent=loadValue;$("#focusSegments").hidden=true;fillSegments($("#focusSegments"),0,12);renderHeroDayGlance(state.classes.filter(c=>c.dateIso===today),now,today)}
  if(!focus){delete focusPanel.dataset.focusDate;$("#focusPosition").hidden=true}
  const timelineIso=state.timelineDay==="tomorrow"?tomorrowIso():today,timelineClasses=state.classes.filter(c=>c.dateIso===timelineIso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  $("#timelineDateTitle").textContent=state.timelineDay==="today"?"Today":"Tomorrow";
  $("#timelineFullDate").textContent=fmtDate(timelineIso,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#todaySwitchDate").textContent=fmtDate(today,{day:"numeric",month:"short"});
  $("#tomorrowSwitchDate").textContent=fmtDate(tomorrowIso(),{day:"numeric",month:"short"});
  $$(".timeline-day-button").forEach(b=>b.classList.toggle("active",b.dataset.timelineDay===state.timelineDay));
  let markerPlaced=false;
  const showTimeMarker=timelineIso===today&&timelineClasses.some(c=>c.status!=="Cancelled")&&now>=dateTime(timelineClasses.find(c=>c.status!=="Cancelled"),"startTime")&&now<=dateTime([...timelineClasses].reverse().find(c=>c.status!=="Cancelled"),"endTime");
  const currentTimeMarker=()=>`<div class="current-time-marker" aria-label="Current time ${esc(fmtTime(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`))}"><span>${esc(fmtTime(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`))}</span><i></i></div>`;
  let timelineCards=timelineClasses.map(c=>{
    const status=c.status==="Cancelled"?"cancelled":timelineIso!==today?"upcoming":now>=dateTime(c,"endTime")?"done":now>=dateTime(c,"startTime")?"current":"upcoming",added=c.status!=="Cancelled"&&wasRecentlyAdded(c),statusText=status==="current"?"Now":status==="done"?"Done":status==="cancelled"?"Cancelled":"Next";
    const marker=showTimeMarker&&!markerPlaced&&now<dateTime(c,"startTime")?(markerPlaced=true,currentTimeMarker()):"";
    return `${marker}<article class="vertical-class ${status}" data-class-id="${esc(classIdentity(c))}" style="--course:${colorFor(c.code)}" tabindex="0" role="button" aria-haspopup="dialog"><div class="vertical-time">${esc(fmtTime(c.startTime))}<small>${esc(fmtTime(c.endTime))}</small></div><div class="vertical-content"><div class="timeline-course-line"><span class="timeline-code-chip">${esc(c.code)}</span><strong>${esc(c.course)}</strong></div><p><span>${esc(venueOf(c))}</span><span>${esc(c.faculty)}</span></p><div class="timeline-status-row"><span class="vertical-status">${esc(statusText)}</span><span class="duration-chip">${esc(durationLabel(c))}</span>${added?'<span class="timeline-added">ADDED</span>':""}</div></div></article>`;
  }).join("");
  if(showTimeMarker&&!markerPlaced)timelineCards+=currentTimeMarker();
  const nextAfterClear=scheduled.find(c=>c.dateIso>timelineIso),nextClearHtml=nextAfterClear?`<button type="button" class="empty-next-class" data-empty-next-date="${esc(nextAfterClear.dateIso)}"><span>Next class</span><strong>${esc(canonical(nextAfterClear.code))} · ${esc(fmtDate(nextAfterClear.dateIso,{weekday:"short",day:"numeric",month:"short"}))}</strong><small>${esc(fmtTime(nextAfterClear.startTime))}</small></button>`:"";
  $("#todayProgressRail").innerHTML=timelineClasses.length?`<div class="vertical-day-timeline">${timelineCards}</div>`:`<div class="empty-state free-day-state"><strong>${state.timelineDay==="today"?"Clear day":"Tomorrow is clear"}</strong><span>No classes scheduled—your time is open.</span>${nextClearHtml}</div>`;
  $("#todayProgressRail .empty-next-class")?.addEventListener("click",event=>openPlannerDate(event.currentTarget.dataset.emptyNextDate));
  decorateTimelineDay("#todayProgressRail",timelineClasses,timelineIso);
  const completed=timelineIso===today?timelineClasses.filter(c=>c.status!=="Cancelled"&&now>=dateTime(c,"endTime")).length:0,stats=dayLoadStats(timelineClasses);
  $("#progressSummary").innerHTML=timelineIso===today?`<b>${completed}</b><span>done</span>`:`<b>${stats.count}</b><span>${stats.count===1?"class":"classes"}</span>`;
  const summary=$("#timelineLoadSummary");if(summary)summary.innerHTML=stats.count?`<span><b>${stats.count}</b> ${stats.count===1?"class":"classes"}</span><span><b>${esc(compactDuration(stats.classMinutes))}</b> class time</span>${stats.freeMinutes?`<span class="summary-free"><b>${esc(compactDuration(stats.freeMinutes))}</b> free</span>`:""}<span>Ends <b>${esc(fmtTime(stats.end))}</b></span>`:'<span class="summary-free"><b>Clear day</b></span>';
  const unread=state.notifications.filter(n=>!n.read);
  $("#silentUpdateStrip").hidden=!unread.length;
  if(unread.length){
    const latest=unread[0];
    $("#silentUpdateTitle").textContent=latest.type==="added"?"Class added":latest.type==="cancelled"?"Class cancelled":latest.type==="venue"?"Venue changed":"Schedule updated";
    $("#silentUpdateText").textContent=`${latest.title} · ${latest.text}`;
  }
  $("#homeSyncText").textContent=relativeSyncText();renderWeekDensity();renderNextExam()
  renderHomeTasks()
}
function scheduleHtml(list){if(!list.length)return'<div class="empty-state">Nothing scheduled.</div>';return[...list].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)).map(c=>`<article class="schedule-item ${c.status==="Cancelled"?"cancelled":""}" style="--course:${colorFor(c.code)}"><div class="schedule-time">${esc(fmtTime(c.startTime))}<br><span>${esc(fmtTime(c.endTime))}</span></div><div class="schedule-info"><strong>${esc(c.code)} · ${esc(c.course)}</strong><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p>${c.status==="Cancelled"?'<span class="status-badge cancelled">CANCELLED</span>':""}</div></article>`).join("")}

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
function currentTimeMarkerHtml(date=new Date()){
  const value=`${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
  return`<div class="current-time-marker" aria-label="Current time ${esc(fmtTime(value))}"><span>${esc(fmtTime(value))}</span><i></i></div>`
}
function compactDuration(total){
  const mins=Math.max(0,Math.round(total));
  return mins>=60?`${Math.floor(mins/60)}h${mins%60?` ${mins%60}m`:""}`:`${mins}m`;
}
function agendaStatus(c){
  if(c.status==="Cancelled")return"Cancelled";
  const now=new Date();
  if(c.dateIso<isoToday())return"Done";
  if(c.dateIso===isoToday()&&now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime"))return"Now";
  if(c.dateIso===isoToday()&&now>=dateTime(c,"endTime"))return"Done";
  return"Next";
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
    "planner-schedule-card",
    status==="Now"?"current":"",
    c.status==="Cancelled"?"cancelled":""
  ].filter(Boolean).join(" ");
  return `<article class="${cls}" data-class-id="${esc(classIdentity(c))}" style="--course:${colorFor(c.code)}" tabindex="0" role="button" aria-haspopup="dialog">
    <div class="agenda-time-block"><time><span>${esc(fmtTime(c.startTime))}</span><b>– ${esc(fmtTime(c.endTime))}</b></time></div>
    <div class="agenda-card-body">
      <div class="agenda-course-line">
        <span class="agenda-code-chip">${esc(c.code)}</span>
        <h3>${esc(c.course)}</h3>
      </div>
      <div class="agenda-meta"><div class="agenda-meta-row"><span class="agenda-venue">${esc(venueOf(c))}</span><span class="agenda-faculty">${esc(c.faculty)}</span></div></div>
      <div class="timeline-status-row"><span class="agenda-status ${c.status==="Cancelled"?"cancelled":""}">${esc(status)}</span><span class="duration-chip">${esc(durationLabel(c))}</span></div>
    </div>
  </article>`;
}
function agendaFreeWindowHtml(current,next){
  if(!current||!next||current.status==="Cancelled"||next.status==="Cancelled")return"";
  return scheduleGapParts(current,next).map(part=>gapWindowHtml(part,{agenda:true,dateIso:next.dateIso,course:canonical(next.code)})).join("");
}
function examAgendaHtml(exams){
  if(!exams.length)return"";
  return`<section class="agenda-exam-section"><div class="agenda-group-title">Exams</div>${exams.map(exam=>`<article class="agenda-exam-card" style="--course:${colorFor(exam.code)}"><div class="agenda-exam-slot"><span>${esc(exam.slot)}</span><strong>Time TBA</strong></div><div><div class="exam-course-line"><span class="exam-code-chip">${esc(exam.code)}</span><h3>${esc(exam.course)}</h3></div><p>Venue TBA · Report 10 minutes early</p></div></article>`).join("")}</section>`;
}
function agendaHtml(classes,tasks,exams=[]){
  if(!classes.length&&!tasks.length&&!exams.length)return'<div class="agenda-empty"><strong>Clear day</strong><span>No classes, exams, or tasks scheduled.</span></div>';
  const periods=["Morning","Afternoon","Evening"],agendaNow=new Date(),timedClasses=classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)),showTimeMarker=state.selectedDate===isoToday()&&timedClasses.length&&agendaNow>=dateTime(timedClasses[0],"startTime")&&agendaNow<=dateTime(timedClasses.at(-1),"endTime");
  let markerPlaced=false;
  let html=examAgendaHtml(exams)+'<div class="day-agenda-groups">';
  const activeClasses=classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  periods.forEach(period=>{
    const items=classes.filter(c=>agendaPeriod(c)===period).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
    if(items.length){
      html+=`<section class="agenda-group"><div class="agenda-group-title">${period}</div>${items.map(c=>{const index=activeClasses.indexOf(c),next=index>=0?activeClasses[index+1]:null,marker=showTimeMarker&&!markerPlaced&&agendaNow<dateTime(c,"startTime")?(markerPlaced=true,currentTimeMarkerHtml(agendaNow)):"";return marker+agendaCardHtml(c)+agendaFreeWindowHtml(c,next)}).join("")}</section>`;
    }
  });
  if(showTimeMarker&&!markerPlaced)html+=currentTimeMarkerHtml(agendaNow);
  html+='</div>';
  if(tasks.length){
    html+=`<section class="agenda-task-section"><div class="agenda-task-heading">Tasks due</div><div class="task-list">${tasks.map(taskHtml).join("")}</div></section>`;
  }
  return html;
}
function showCalendarTooltip(target,iso){if(matchMedia("(hover: none)").matches)return;let tip=$("#calendarTooltip");if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));if(!list.length)return;tip.innerHTML=`<h4>${esc(fmtDate(iso))}</h4>${list.map(c=>`<div class="calendar-tooltip-row"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("")}`;const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-220,r.bottom+8)}px`;tip.classList.add("show")}function hideCalendarTooltip(){$("#calendarTooltip")?.classList.remove("show")}function renderCalendar(){const d=state.calendarMonth,y=d.getFullYear(),m=d.getMonth();$("#calendarTitle").textContent=new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(d);const first=new Date(y,m,1),off=(first.getDay()+6)%7,start=new Date(y,m,1-off);let html="";for(let i=0;i<42;i++){const day=new Date(start);day.setDate(start.getDate()+i);const iso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`,classes=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled"),colors=classes.slice(0,4).map(c=>colorFor(c.code));html+=`<button class="calendar-day ${day.getMonth()!==m?"outside":""} ${iso===isoToday()?"today":""} ${iso===state.selectedDate?"selected":""}" data-date="${iso}"><span class="calendar-day-number">${day.getDate()}</span><span class="calendar-course-dots">${colors.map(c=>`<i style="--course:${c}"></i>`).join("")}</span><span class="calendar-class-count">${classes.length?`${classes.length} class${classes.length>1?"es":""}`:""}</span></button>`}$("#calendarGrid").innerHTML=html;$$(".calendar-day").forEach(b=>{b.addEventListener("click",()=>{state.selectedDate=b.dataset.date;renderCalendar();requestAnimationFrame(()=>{const agenda=document.getElementById("dayAgenda");if(agenda&&window.matchMedia("(max-width:780px)").matches)agenda.scrollIntoView({behavior:"smooth",block:"start"})})});b.addEventListener("mouseenter",()=>showCalendarTooltip(b,b.dataset.date));b.addEventListener("mouseleave",hideCalendarTooltip)});const classes=state.classes.filter(c=>c.dateIso===state.selectedDate),tasks=state.tasks.filter(t=>t.date===state.selectedDate);$("#agendaDate").textContent=fmtDate(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("#agendaCount").textContent=classes.length+tasks.length;$("#dayAgenda").innerHTML=agendaHtml(classes,tasks);const used=[...new Set(state.classes.filter(c=>c.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(c=>canonical(c.code)))];$("#calendarLegend").innerHTML=used.map(c=>`<span class="legend-item" style="--course:${colorFor(c)}"><i></i>${esc(c)}</span>`).join("");bindTaskRows($("#dayAgenda"))}
/* Status-aware desktop calendar preview. This declaration intentionally
   replaces the compact legacy renderer above without touching calendar flow. */
function showCalendarTooltip(target,iso){
  if(matchMedia("(hover: none)").matches)return;
  let tip=$("#calendarTooltip");
  if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}
  const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  const exams=filteredExams().filter(exam=>exam.dateIso===iso);
  if(!list.length&&!exams.length)return;
  const scheduled=list.filter(c=>c.status!=="Cancelled"),cancelled=list.filter(c=>c.status==="Cancelled");
  const summary=[scheduled.length?`${scheduled.length} scheduled`:"",cancelled.length?`${cancelled.length} cancelled`:"",exams.length?`${exams.length} ${exams.length===1?"exam":"exams"}`:""].filter(Boolean).join(" · ");
  const rows=scheduled.map(c=>`<div class="calendar-tooltip-row" style="--tooltip-course:${colorFor(c.code)}"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("");
  const cancelledRows=cancelled.map(c=>`<div class="calendar-tooltip-row cancelled" style="--tooltip-course:var(--danger)"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong><span>CANCELLED</span></div>`).join("");
  const examRows=exams.map(exam=>`<div class="calendar-tooltip-row exam" style="--tooltip-course:${colorFor(exam.code)}"><time>${esc(exam.slot)}</time><strong>${esc(exam.code)} · ${esc(exam.course)}</strong></div>`).join("");
  tip.innerHTML=`<div class="calendar-tooltip-head"><h4>${esc(fmtDate(iso))}</h4><small>${esc(summary)}</small></div>${rows}${cancelledRows}${examRows}`;
  const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-240,r.bottom+8)}px`;tip.classList.add("show")
}
function renderCalendar(){
  const d=state.calendarMonth,y=d.getFullYear(),m=d.getMonth(),exams=filteredExams();
  $("#calendarTitle").textContent=new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(d);
  const first=new Date(y,m,1),off=(first.getDay()+6)%7,start=new Date(y,m,1-off);let html="";
  for(let i=0;i<42;i++){
    const day=new Date(start);day.setDate(start.getDate()+i);
    const iso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`,classes=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled"),dayExams=exams.filter(exam=>exam.dateIso===iso),dayTasks=state.tasks.filter(task=>task.date===iso&&!task.completed),colors=classes.slice(0,4).map(c=>colorFor(c.code)),labels=[];
    if(classes.length)labels.push(`${classes.length} class${classes.length===1?"":"es"}`);if(dayExams.length)labels.push(`${dayExams.length} exam${dayExams.length===1?"":"s"}`);if(dayTasks.length)labels.push(`${dayTasks.length} task${dayTasks.length===1?"":"s"}`);
    html+=`<button class="calendar-day ${day.getMonth()!==m?"outside":""} ${iso===isoToday()?"today":""} ${iso===state.selectedDate?"selected":""} ${dayExams.length?"has-exam":""} ${dayTasks.length?"has-task":""}" data-date="${iso}"><span class="calendar-day-number">${day.getDate()}</span>${dayExams.length?'<span class="calendar-exam-marker">EXAM</span>':""}${dayTasks.length?'<span class="calendar-task-marker" aria-label="Open task">✓</span>':""}<span class="calendar-course-dots">${colors.map(c=>`<i style="--course:${c}"></i>`).join("")}</span><span class="calendar-class-count">${esc(labels.join(" · "))}</span></button>`;
  }
  $("#calendarGrid").innerHTML=html;
  $$(".calendar-day").forEach(button=>{button.addEventListener("click",()=>{state.selectedDate=button.dataset.date;renderCalendar();requestAnimationFrame(()=>{const agenda=$("#dayAgenda");if(agenda&&matchMedia("(max-width:780px)").matches)agenda.scrollIntoView({behavior:"smooth",block:"start"})})});button.addEventListener("mouseenter",()=>showCalendarTooltip(button,button.dataset.date));button.addEventListener("mouseleave",hideCalendarTooltip)});
  const classes=state.classes.filter(c=>c.dateIso===state.selectedDate),tasks=state.tasks.filter(t=>t.date===state.selectedDate),dayExams=exams.filter(exam=>exam.dateIso===state.selectedDate);
  $("#agendaDate").textContent=fmtDate(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const agendaBackToday=$("#agendaBackToday");if(agendaBackToday)agendaBackToday.hidden=state.selectedDate===isoToday();
  $("#agendaCount").textContent=classes.length+tasks.length+dayExams.length;
  const agendaStats=dayLoadStats(classes),agendaSummary=$("#agendaLoadSummary");if(agendaSummary)agendaSummary.textContent=agendaStats.count?`${agendaStats.count} ${agendaStats.count===1?"class":"classes"} · ${compactDuration(agendaStats.classMinutes)} class time${agendaStats.freeMinutes?` · ${compactDuration(agendaStats.freeMinutes)} free`:""} · Ends ${fmtTime(agendaStats.end)}`:dayExams.length?`${dayExams.length} ${dayExams.length===1?"exam":"exams"}`:"No classes";
  $("#dayAgenda").innerHTML=agendaHtml(classes,tasks,dayExams);
  const used=[...new Set([...state.classes.filter(c=>c.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(c=>canonical(c.code)),...exams.filter(exam=>exam.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(exam=>canonical(exam.code))])];
  $("#calendarLegend").innerHTML=used.map(c=>`<span class="legend-item" style="--course:${colorFor(c)}"><i></i>${esc(c)}</span>`).join("")+(exams.some(exam=>exam.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`))?'<span class="legend-item exam"><i></i>Exam</span>':"")+(state.tasks.some(task=>task.date?.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)&&!task.completed)?'<span class="legend-item task"><i></i>Task</span>':"");
  bindTaskRows($("#dayAgenda"));
}
function shiftSelectedDate(delta){const day=new Date(`${state.selectedDate}T12:00:00+05:30`);day.setDate(day.getDate()+delta);state.selectedDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(day);state.calendarMonth=new Date(day.getFullYear(),day.getMonth(),1);const agenda=$("#dayAgenda");if(agenda){agenda.classList.remove("slide-prev","slide-next");agenda.classList.add(delta>0?"slide-next":"slide-prev")}renderCalendar();requestAnimationFrame(()=>requestAnimationFrame(()=>agenda?.classList.remove("slide-prev","slide-next")))}
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
const TASK_FILTERS=["open","today","upcoming","completed"];
function setTaskFilter(filter,direction="none"){if(!TASK_FILTERS.includes(filter))return;state.taskFilter=filter;$$(`.filter`).forEach(x=>x.classList.toggle("active",x.dataset.taskFilter===filter));const list=$("#taskList");if(list&&direction!=="none"){list.classList.remove("filter-slide-left","filter-slide-right");list.classList.add(direction==="left"?"filter-slide-left":"filter-slide-right")}renderTasks();requestAnimationFrame(()=>requestAnimationFrame(()=>list?.classList.remove("filter-slide-left","filter-slide-right")))}
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
function bindSwipeGesture(el,onSwipe,{ignore="input,select,textarea,button,a",threshold=50}={}){
  if(!el)return;
  let sx=0,sy=0,active=false;
  const start=e=>{
    if(ignore&&e.target.closest?.(ignore)){active=false;return}
    const p=e.touches?e.touches[0]:e;
    sx=p.clientX;sy=p.clientY;active=true;
  };
  const end=e=>{
    if(!active)return;active=false;
    const p=e.changedTouches?e.changedTouches[0]:e;
    const dx=p.clientX-sx,dy=p.clientY-sy;
    if(Math.abs(dx)>threshold&&Math.abs(dx)>Math.abs(dy)*1.35){
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
  dialog.dataset.mode="profile";
  // Force render electives + restore any saved selections before opening
  renderOnboardingElectives();
  const section=state.profile.section||"A";
  const sec=dialog.querySelector(`input[name="onboardingSection"][value="${section}"]`);
  if(sec)sec.checked=true;
  const nameInput=$("#onboardingName");
  if(nameInput)nameInput.value=state.profile.name||"";
  const saved=new Set((state.profile.electives||[]).map(canonical));
  $$("#onboardingElectives input").forEach(cb=>cb.checked=saved.has(canonical(cb.value)));
  const back=$("#onboardingBack");if(back)back.textContent="Cancel";
  const finish=$("#finishOnboarding");if(finish)finish.textContent="Save electives";
  updateElectiveSelectionState();
  setOnboardingStep(2);
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

function isMainGateService(bus){return bus.from==="Main Gate"||bus.to==="Main Gate"}

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
      isMainGateService(first.b)?"Main Gate service":"Campus shuttle";

    const remaining=Math.max(0,Math.ceil((first.d-now)/60000));
    const nextDay=first.d.getDate()!==now.getDate()||first.d.getMonth()!==now.getMonth();
    $("#nextBusCountdown").previousElementSibling.textContent=nextDay?"Leaves tomorrow in":"Leaves in";
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
    $("#nextBusCountdown").previousElementSibling.textContent="Leaves in";
    $("#nextBusVisual").innerHTML="";
  }

  $("#upcomingBuses").innerHTML=upcoming.length
    ?upcoming.slice(0,5).map(({b,d})=>busRow(b,d)).join("")
    :'<div class="empty-state"><strong>No direct departures</strong><span>Try reversing the route or choosing another stop.</span></div>';

  const allMatching=window.CAMPUS_DATA.bus.filter(bus=>
    serviceSupports(bus,state.busFrom,state.busTo)
  );

  $("#fullBusList").innerHTML=allMatching.length
    ?allMatching.map(bus=>busRow(bus,busDate(bus))).join("")
    :'<div class="empty-state"><strong>No matching service</strong><span>Choose another origin or destination.</span></div>';
}

function busRow(bus,departure=busDate(bus)){
  const route=routeStops(bus).map(busStopLabel).join(" · ");
  const mainGate=isMainGateService(bus),now=new Date(),diff=Math.ceil((departure-now)/60000),isTomorrow=departure.getDate()!==now.getDate()||departure.getMonth()!==now.getMonth(),elapsed=diff<0,status=isTomorrow?"Tomorrow":elapsed?"Departed":diff<=1?"Due":diff<=8?"Leaving soon":"On time";
  return`<article class="bus-row ${mainGate?"main-gate":""} ${elapsed?"elapsed":""}">
    <time>${esc(fmtTime(bus.time))}</time>
    <div>
      <strong>${esc(busStopLabel(state.busFrom))} → ${
        esc(busStopLabel(state.busTo))
      }</strong>
      <p>${esc(route)}</p>
      <div class="bus-row-tags"><span class="departure-status ${elapsed?"departed":""}">${esc(status)}</span>${mainGate?'<span class="route-badge">MAIN GATE</span>':""}</div>
    </div>
  </article>`;
}

function renderMess(){const ds=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],hour=new Date().getHours(),liveMeal=hour<11?"breakfast":hour<16?"lunch":"dinner",todayKey=weekdayKey(new Date()),serving=state.messDay===todayKey&&state.meal===liveMeal;$("#messDayPills").innerHTML=ds.map(d=>`<button class="day-pill ${d===state.messDay?"active":""}" data-day="${d}">${d.slice(0,3).toUpperCase()}</button>`).join("");$$(".day-pill").forEach(b=>b.addEventListener("click",()=>{state.messDay=b.dataset.day;renderMess()}));$("#messDayTitle").textContent=state.messDay[0].toUpperCase()+state.messDay.slice(1);const servingState=$("#messServingState");if(servingState){servingState.textContent=serving?"Serving now":state.messDay===todayKey?`${liveMeal[0].toUpperCase()+liveMeal.slice(1)} is serving`:"Selected menu";servingState.classList.toggle("live",serving)}const menu=window.CAMPUS_DATA.mess[state.messDay],items=menu[state.meal]||[],nv=/chicken|fish|egg|omelette/i,sw=/gulab|halwa|ice cream|kheer|custard|badusha/i,non=items.filter(i=>nv.test(i)),sweet=items.filter(i=>sw.test(i)),veg=items.filter(i=>!nv.test(i)&&!sw.test(i));$("#messMenu").innerHTML=`<article class="meal-hero"><div class="meal-hero-title"><span>${serving?"NOW SERVING":"MENU"}</span><h3>${state.meal[0].toUpperCase()+state.meal.slice(1)}</h3></div>${veg.length?`<section class="food-section veg-section"><div class="food-section-title">Vegetarian</div><div class="food-items">${veg.map(i=>`<div class="food-item veg">${esc(i)}</div>`).join("")}</div></section>`:""}${non.length?`<section class="food-section nonveg-section"><div class="food-section-title">Non-vegetarian</div><div class="food-items">${non.map(i=>`<div class="food-item nonveg">${esc(i)}</div>`).join("")}</div></section>`:""}${sweet.length?`<section class="food-section sweet-section"><div class="food-section-title">Dessert / Sweet</div><div class="food-items">${sweet.map(i=>`<div class="food-item sweet">${esc(i)}</div>`).join("")}</div></section>`:""}</article>`;$$(".meal-tab").forEach(b=>{b.classList.toggle("active",b.dataset.meal===state.meal);b.classList.toggle("serving",b.dataset.meal===liveMeal&&state.messDay===todayKey)})}
function renderProfile(){$("#profileName").value=state.profile.name||"";$("#profileSection").value=state.profile.section||"A";$("#profileTheme").value=state.profile.theme||"system";$("#profileDisplayName").textContent=state.profile.name||"Student";$("#profileSummary").textContent=`PGPBL · Section ${state.profile.section||"A"}`;$("#profileAvatar").textContent=initials(state.profile.name);$("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";const selected=new Set((state.profile.electives||[]).map(canonical)),items=(state.electives||[]).filter(e=>selected.has(canonical(e.code)));const chips=$("#selectedElectiveChips");if(chips)chips.innerHTML=items.length?items.map(e=>`<span title="${esc(e.course)}"><b>${esc(e.code)}</b>${esc(e.course)}</span>`).join(""):'<em>No electives selected</em>'}
function renderNotifications(){
  const active=pruneNotifications(),unread=active.filter(n=>!n.read).length;$("#notificationBadge").hidden=!unread;$("#notificationBadge").textContent=unread;
  const mark=$("#markNotificationsRead");if(mark)mark.hidden=!unread;
  $$("[data-notification-filter]").forEach(button=>button.classList.toggle("active",button.dataset.notificationFilter===state.notificationFilter));
  const filtered=active.filter(n=>state.notificationFilter==="all"||state.notificationFilter==="added"&&n.type==="added"||state.notificationFilter==="changes"&&n.type!=="added");
  if(!filtered.length){$("#notificationList").innerHTML=`<div class="empty-state notification-empty"><span class="notification-empty-icon">✓</span><strong>All caught up</strong><span>${active.length?"No updates match this filter.":"New schedule changes will appear here."}</span></div>`;return}
  const today=isoToday(),tomorrow=tomorrowIso(),groups=[["Today",[]],["Tomorrow",[]],["Later",[]]];
  filtered.forEach(n=>{const dateIso=n.dateIso||String(n.classId||"").split("|")[0];(dateIso===today?groups[0]:dateIso===tomorrow?groups[1]:groups[2])[1].push(n)});
  const typeLabel=n=>n.type==="added"?"Added":n.type==="cancelled"?"Cancelled":"Venue";
  const relative=n=>{const mins=Math.max(1,Math.round((Date.now()-n.createdAt)/60000));return mins<60?`${mins}m ago`:mins<1440?`${Math.round(mins/60)}h ago`:`${Math.round(mins/1440)}d ago`};
  $("#notificationList").innerHTML=groups.filter(([,items])=>items.length).map(([label,items])=>`<section class="notification-group"><h3>${label}</h3>${items.map(n=>`<article class="notification-item notification-${esc(n.type)} ${n.read?"":"unread"}" style="--course:${colorFor(n.course)}"><div class="notification-course-mark">${esc(canonical(n.course||n.code).slice(0,3))}</div><div class="notification-item-copy"><div class="notification-item-top"><span class="notification-type">${typeLabel(n)}</span><time>${relative(n)}</time></div><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p><button type="button" class="notification-open-date" data-notification-date="${esc(n.dateIso||"")}">Open date</button></div><button class="notification-dismiss" type="button" data-dismiss-notification="${esc(n.id)}" aria-label="Dismiss ${esc(n.title)}">${icon("close")}</button></article>`).join("")}</section>`).join("");
}
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
const GOOGLE_NOTES_MIGRATION_KEY="classbl07-google-subject-notes-v1";
const GOOGLE_LIST_NAME_MIGRATION_KEY="classbl07-google-list-name-v1";
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
      try{await ensureGooglePlannerList();await pullGoogleTasks();await migrateGoogleTaskNotes();for(const task of state.tasks.filter(t=>!t.googleTaskId))await syncTaskToGoogle(task)}catch(e){}
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
  if(saved){await ensureGooglePlannerListName(saved);return saved}
  const r=await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists",{headers:{Authorization:`Bearer ${_googleAccessToken}`}});
  if(!r.ok)throw new Error("Could not list task lists");
  const data=await r.json();
  let list=(data.items||[]).find(l=>l.title==="Term 3 Planner")||(data.items||[]).find(l=>l.title==="BL07 Tasks");
  if(!list){
    const cr=await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists",{
      method:"POST",
      headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
      body:JSON.stringify({title:"Term 3 Planner"})
    });
    if(!cr.ok)throw new Error("Could not create the Term 3 Planner list");
    list=await cr.json();
  }
  localStorage.setItem(GOOGLE_LIST_KEY,list.id);
  await ensureGooglePlannerListName(list.id);
  return list.id;
}
async function ensureGooglePlannerListName(listId){
  if(!_googleAccessToken||!listId||localStorage.getItem(GOOGLE_LIST_NAME_MIGRATION_KEY)==="true")return;
  try{
    const response=await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${listId}`,{
      method:"PATCH",
      headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
      body:JSON.stringify({title:"Term 3 Planner"})
    });
    if(response.ok)localStorage.setItem(GOOGLE_LIST_NAME_MIGRATION_KEY,"true");
  }catch(error){console.warn("Google Tasks list rename failed",error)}
}
function googleTaskSubject(task){const code=canonical(task.course);const match=state.all.find(c=>canonical(c.code)===code)||state.electives.find(c=>canonical(c.code)===code);return match?.course||task.course||"General"}
function googleTaskCourse(note){const value=String(note||"General").replace(/^ClassBL07\|/,"");const direct=state.all.find(c=>c.course===value||canonical(c.code)===canonical(value))||state.electives.find(c=>c.course===value||canonical(c.code)===canonical(value));return direct?canonical(direct.code):value||"General"}
async function syncTaskToGoogle(task){
  if(!_googleAccessToken)return;
  try{
    const listId=await ensureGooglePlannerList();
    if(task.googleTaskId){
      // update existing
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${task.googleTaskId}`,{
        method:"PATCH",
        headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
        body:JSON.stringify({title:task.title,status:task.completed?"completed":"needsAction",due:task.date?`${task.date}T00:00:00.000Z`:null,notes:googleTaskSubject(task)})
      });
    }else{
      const r=await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,{
        method:"POST",
        headers:{Authorization:`Bearer ${_googleAccessToken}`,"Content-Type":"application/json"},
        body:JSON.stringify({title:task.title,status:task.completed?"completed":"needsAction",due:task.date?`${task.date}T00:00:00.000Z`:undefined,notes:googleTaskSubject(task)})
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
async function pullGoogleTasks(){if(!_googleAccessToken)return;const listId=await ensureGooglePlannerList();const r=await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,{headers:{Authorization:`Bearer ${_googleAccessToken}`}});if(!r.ok)throw new Error("Could not sync Google Tasks");const remote=(await r.json()).items||[],byGoogle=new Map(state.tasks.filter(t=>t.googleTaskId).map(t=>[t.googleTaskId,t]));remote.forEach(item=>{const course=googleTaskCourse(item.notes),date=item.due?item.due.slice(0,10):"",local=byGoogle.get(item.id);if(local)Object.assign(local,{title:item.title,course,date,completed:item.status==="completed"});else state.tasks.push({id:crypto.randomUUID(),googleTaskId:item.id,title:item.title,course,date,completed:item.status==="completed",createdAt:Date.now()})});save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar()}
let _lastGooglePull=0,_googlePullInFlight=false;
async function scheduleGoogleTasksSync(){if(!_googleAccessToken||_googlePullInFlight||Date.now()-_lastGooglePull<15000)return;_googlePullInFlight=true;try{await pullGoogleTasks();_lastGooglePull=Date.now()}catch(e){console.warn("Google Tasks refresh failed",e)}finally{_googlePullInFlight=false}}
async function migrateGoogleTaskNotes(){if(!_googleAccessToken||localStorage.getItem(GOOGLE_NOTES_MIGRATION_KEY)==="true")return;for(const task of state.tasks.filter(t=>t.googleTaskId))await syncTaskToGoogle(task);localStorage.setItem(GOOGLE_NOTES_MIGRATION_KEY,"true")}
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
  const dialog=$("#onboardingDialog");if(dialog)dialog.dataset.step=String(step);
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
  updateElectiveSelectionState();
}
function updateElectiveSelectionState(){const boxes=$$("#onboardingElectives input"),selected=boxes.filter(box=>box.checked).length,count=$("#electiveSelectionCount");if(count)count.textContent=`${selected} of ${boxes.length} selected`;const all=$("#selectAllElectives"),clear=$("#clearAllElectives");if(all)all.disabled=!boxes.length||selected===boxes.length;if(clear)clear.disabled=!selected}
function maybeOpenOnboarding(){
  const dialog=$("#onboardingDialog");
  if(!dialog||dialog.open)return;
  if(!shouldShowOnboarding())return;
  if(!state.electives.length)return;
  dialog.dataset.mode="setup";
  renderOnboardingElectives();
  // Pre-check saved electives so returning users see their current picks
  const saved=new Set((state.profile.electives||[]).map(canonical));
  $$("#onboardingElectives input").forEach(cb=>cb.checked=saved.has(canonical(cb.value)));
  const section=state.profile.section||"A";
  const sec=dialog.querySelector(`input[name="onboardingSection"][value="${section}"]`);
  if(sec)sec.checked=true;
  const nameInput=$("#onboardingName");
  if(nameInput)nameInput.value=state.profile.name||"";
  const back=$("#onboardingBack");if(back)back.textContent="Back";
  const finish=$("#finishOnboarding");if(finish)finish.textContent="Finish setup";
  updateElectiveSelectionState();
  setOnboardingStep(1);
  dialog.showModal();
}
function completeOnboarding(){
  const profileMode=$("#onboardingDialog")?.dataset.mode==="profile";
  const name=profileMode?state.profile.name:$("#onboardingName")?.value.trim()||"";
  if(!profileMode&&!name){$("#onboardingName")?.focus();$("#onboardingName")?.reportValidity();return}
  const section=profileMode?state.profile.section:$('input[name="onboardingSection"]:checked')?.value||"A";
  const electives=$$("#onboardingElectives input:checked").map(input=>canonical(input.value));
  state.profile={...state.profile,name,section,electives};
  save(KEYS.profile,state.profile);
  if(!profileMode)localStorage.setItem(KEYS.onboarded,"true");
  state.classes=filteredClasses();
  renderAll();
  $("#onboardingDialog")?.close();
  syncSchedule(true);
}
function bind(){
  $("#onboardingContinue")?.addEventListener("click",()=>{const input=$("#onboardingName");if(!input?.value.trim()){input?.focus();input?.reportValidity();return}setOnboardingStep(2)});
  $("#onboardingBack")?.addEventListener("click",()=>{$("#onboardingDialog")?.dataset.mode==="profile"?$("#onboardingDialog")?.close():setOnboardingStep(1)});
  $("#onboardingElectives")?.addEventListener("change",updateElectiveSelectionState);
  $("#selectAllElectives")?.addEventListener("click",()=>{$$("#onboardingElectives input").forEach(box=>box.checked=true);updateElectiveSelectionState()});
  $("#clearAllElectives")?.addEventListener("click",()=>{$$("#onboardingElectives input").forEach(box=>box.checked=false);updateElectiveSelectionState()});
  $("#onboardingForm")?.addEventListener("submit",event=>{event.preventDefault();completeOnboarding()});
  bindOutsideDismiss($("#taskDialog"));
  bindOutsideDismiss($("#noteDialog"));
  bindOutsideDismiss($("#onboardingDialog"));
  $$("[data-page-target]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageTarget)));$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
  $("#themeToggle").addEventListener("click",()=>{state.profile.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";save(KEYS.profile,state.profile);applyTheme();renderProfile()});
  $("#refreshButton")?.addEventListener("click",async e=>{const button=e.currentTarget;button.blur();await syncSchedule(true);button.blur()});
  $("#timelineDaySwitch").addEventListener("click",e=>{const b=e.target.closest("[data-timeline-day]");if(!b)return;setTimelineDay(b.dataset.timelineDay,"auto")});
  $("#focusPosition")?.addEventListener("click",event=>{event.stopPropagation();const iso=$("#focusPanel")?.dataset.focusDate;if(iso)openPlannerDate(iso)});
  const openFreeTask=button=>{editingTaskId=null;$("#taskTitle").value="";$("#taskCourse").value=button.dataset.freeCourse||"";$("#taskDate").value=button.dataset.freeDate||"";$("#taskDialog h2").textContent="Add task";$("#saveTaskButton").textContent="Save";clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal()};
  $("#todayProgressRail").addEventListener("click",e=>{const button=e.target.closest(".free-window-action");if(button){e.stopPropagation();openFreeTask(button)}});
  $("#todayProgressRail").addEventListener("keydown",e=>{if(!["Enter"," "].includes(e.key))return;const card=e.target.closest(".vertical-class");if(!card)return;e.preventDefault();card.click()});
  bindSwipeGesture($(".today-progress-card"),direction=>{
    const next=state.timelineDay==="today"?"tomorrow":"today";
    setTimelineDay(next,direction==="left"?"forward":"backward");
  });
  $("#notificationButton").addEventListener("click",openNotifications);$("#openUpdatesFromHome").addEventListener("click",openNotifications);$("#closeNotifications").addEventListener("click",closeNotifications);$("#notificationBackdrop").addEventListener("click",closeNotifications);
  $("#weekDensityDays")?.addEventListener("click",event=>{const day=event.target.closest("[data-density-date]");if(day)openPlannerDate(day.dataset.densityDate)});
  $("#notificationFilters")?.addEventListener("click",e=>{const button=e.target.closest("[data-notification-filter]");if(!button)return;state.notificationFilter=button.dataset.notificationFilter;renderNotifications()});
  $("#notificationList")?.addEventListener("click",e=>{const open=e.target.closest("[data-notification-date]");if(open){closeNotifications();openPlannerDate(open.dataset.notificationDate);return}const button=e.target.closest("[data-dismiss-notification]");if(!button)return;const removed=state.notifications.find(n=>n.id===button.dataset.dismissNotification);state.notifications=state.notifications.filter(n=>n.id!==button.dataset.dismissNotification);save(KEYS.notifications,state.notifications);renderNotifications();renderHome();showUndoToast("Notification dismissed",()=>{if(removed){state.notifications.unshift(removed);save(KEYS.notifications,state.notifications);renderNotifications();renderHome()}})});
  let notificationTouch=null;$("#notificationList")?.addEventListener("touchstart",e=>{const card=e.target.closest(".notification-item");if(card)notificationTouch={card,x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}},{passive:true});$("#notificationList")?.addEventListener("touchend",e=>{if(!notificationTouch)return;const dx=e.changedTouches[0].clientX-notificationTouch.x,dy=e.changedTouches[0].clientY-notificationTouch.y;if(Math.abs(dx)>72&&Math.abs(dx)>Math.abs(dy)*1.4)notificationTouch.card.querySelector("[data-dismiss-notification]")?.click();notificationTouch=null},{passive:true});
  $("#markNotificationsRead")?.addEventListener("click",()=>{state.notifications.forEach(n=>n.read=true);save(KEYS.notifications,state.notifications);renderNotifications();renderHome();showToast("Notifications marked as read")});
  $("#chooseElectivesInline")?.addEventListener("click",()=>openOnboardingManually());
  $("#connectGoogleTasks")?.addEventListener("click",()=>connectGoogleTasks());
  $("#disconnectGoogleTasks")?.addEventListener("click",()=>disconnectGoogleTasks());
  window.addEventListener("focus",()=>{const offline=$("#appStateBanner")?.dataset.state==="offline";offline?recoverConnectivity():scheduleIdleSync();scheduleGoogleTasksSync()});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){const offline=$("#appStateBanner")?.dataset.state==="offline";offline?recoverConnectivity():scheduleIdleSync();scheduleGoogleTasksSync()}});
  window.addEventListener("online",recoverConnectivity);
  window.addEventListener("offline",()=>{setAppState("offline","You are offline. Showing the last saved schedule.");scheduleOfflineRetry()});
  $("#appStateAction")?.addEventListener("click",()=>location.reload());
  $$(".subtab[data-planner-tab]").forEach(b=>b.addEventListener("click",()=>setPlannerView(b.dataset.plannerTab)));
  $$('[data-open-exams]').forEach(button=>button.addEventListener("click",openExamPlanner));
  $("#examSchedule")?.addEventListener("click",event=>{const prep=event.target.closest("[data-exam-prep]");if(prep){editingTaskId=null;$("#taskTitle").value=`Prepare for ${prep.dataset.examCode} exam`;$("#taskCourse").value=canonical(prep.dataset.examCode);$("#taskDate").value=prep.dataset.examPrep;$("#taskDialog h2").textContent="Add preparation task";$("#saveTaskButton").textContent="Save";clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal();return}const button=event.target.closest("[data-exam-date]");if(button)openPlannerDate(button.dataset.examDate)});
  $$(".subtab[data-campus-tab]").forEach(b=>b.addEventListener("click",()=>{$$(".subtab[data-campus-tab]").forEach(x=>x.classList.toggle("active",x===b));$$(".campus-view").forEach(v=>v.classList.toggle("active",v.dataset.campusView===b.dataset.campusTab))}));
  $("#prevMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderCalendar()});$("#nextMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderCalendar()});$("#todayButton").addEventListener("click",()=>{state.selectedDate=isoToday();state.calendarMonth=new Date();state.calendarMonth.setDate(1);renderCalendar()});
  $("#agendaPrevDay").addEventListener("click",()=>shiftSelectedDate(-1));$("#agendaNextDay").addEventListener("click",()=>shiftSelectedDate(1));
  $("#agendaBackToday")?.addEventListener("click",()=>{state.selectedDate=isoToday();const today=new Date();state.calendarMonth=new Date(today.getFullYear(),today.getMonth(),1);renderCalendar()});
  bindSwipeGesture($("#dayAgenda"),direction=>shiftSelectedDate(direction==="left"?1:-1),{ignore:"button,a,input,select,textarea",threshold:46});
  $("#dayAgenda").addEventListener("click",event=>{const freeButton=event.target.closest(".free-window-action");if(freeButton){event.stopPropagation();openFreeTask(freeButton);return}const button=event.target.closest(".agenda-add-task");if(!button)return;const c=state.classes.find(item=>classIdentity(item)===button.dataset.classId);if(!c)return;$("#taskTitle").value="";$("#taskCourse").value=canonical(c.code);$("#taskDate").value=c.dateIso;clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal()});
  $("#quickTaskForm").addEventListener("submit",e=>{e.preventDefault();addTask($("#quickTaskTitle").value.trim(),$("#quickTaskCourse").value,$("#quickTaskDate").value);e.target.reset()});
  const taskDialog=$("#taskDialog"),noteDialog=$("#noteDialog");
  bindDismissibleDialog(taskDialog);bindDismissibleDialog(noteDialog);
  $("#openTaskForm").addEventListener("click",()=>{editingTaskId=null;$("#taskTitle").value="";$("#taskCourse").value="";$("#taskDate").value="";$("#taskDialog h2").textContent="Add task";$("#saveTaskButton").textContent="Save";clearDialogValidation(taskDialog);taskDialog.showModal()});
  $("#saveTaskButton").addEventListener("click",()=>{const title=$("#taskTitle").value.trim();if(!title){showDialogValidation(taskDialog,"Enter a task title, or close the window to discard.");return}if(editingTaskId){const task=state.tasks.find(t=>t.id===editingTaskId);if(task){task.title=title;task.course=$("#taskCourse").value||"General";task.date=$("#taskDate").value;save(KEYS.tasks,state.tasks);syncTaskToGoogle(task);renderTasks();renderHomeTasks();renderCalendar()}editingTaskId=null}else addTask(title,$("#taskCourse").value,$("#taskDate").value);closeDialog(taskDialog,true)});
  $("#taskFilters").addEventListener("click",e=>{const b=e.target.closest("[data-task-filter]");if(!b)return;setTaskFilter(b.dataset.taskFilter)});
  bindSwipeGesture($("[data-planner-view='tasks'] .panel"),direction=>{const index=TASK_FILTERS.indexOf(state.taskFilter),next=Math.max(0,Math.min(TASK_FILTERS.length-1,index+(direction==="left"?1:-1)));if(next!==index)setTaskFilter(TASK_FILTERS[next],direction)},{ignore:"button,input,a,select,textarea",threshold:54});
  $("#openNoteForm").addEventListener("click",()=>{clearDialogValidation(noteDialog);noteDialog.showModal()});
  $("#saveNoteButton").addEventListener("click",()=>{const title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim();if(!title||!body){showDialogValidation(noteDialog,"Add a title and note only when you want to save. You can close this window anytime.");return}state.notes.unshift({id:crypto.randomUUID(),title,body,course:$("#noteCourse").value,createdAt:Date.now()});save(KEYS.notes,state.notes);closeDialog(noteDialog,true);renderNotes()});
  $("#noteSearch").addEventListener("input",renderNotes);
  $("#profileForm").addEventListener("submit",e=>{e.preventDefault();state.profile={name:$("#profileName").value.trim(),section:$("#profileSection").value,electives:[...(state.profile.electives||[])],theme:$("#profileTheme").value};save(KEYS.profile,state.profile);applyTheme();renderProfile();showToast("Profile updated successfully");syncSchedule(true)});$("#refreshData").addEventListener("click",async e=>{const button=e.currentTarget;button.blur();await syncSchedule(true);button.blur()});$("#resetData").addEventListener("click",()=>{if(confirm("Reset profile, tasks, notes and cached schedule?")){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));location.reload()}});
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
  if(c){state.all=normalizeScheduleClasses(c.all);state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}
  // Restore Google Tasks token silently
  const savedToken=getSavedGoogleToken();
  if(savedToken){_googleAccessToken=savedToken.access_token;initGoogleTokenClient().catch(()=>{});pullGoogleTasks().then(async()=>{await migrateGoogleTaskNotes();for(const task of state.tasks.filter(t=>!t.googleTaskId))await syncTaskToGoogle(task)}).catch(()=>{})}
  renderAll();
  renderGoogleTasksStatus();
  maybeOpenOnboarding();
  syncSchedule(false);
  setInterval(()=>{pruneNotifications();renderHome();renderNotifications();renderBuses()},30000);
  setInterval(()=>{if(document.visibilityState==="visible")scheduleIdleSync()},300000);
  setInterval(()=>scheduleGoogleTasksSync(),60000);
  if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js?v=20260821-readable1",{updateViaCache:"none"}).then(reg=>{const announce=worker=>{if(!worker)return;worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)setAppState("update","A newer dashboard version is ready.")})};announce(reg.installing);reg.addEventListener("updatefound",()=>announce(reg.installing))}).catch(console.error)
}
document.addEventListener("DOMContentLoaded",init);
})();


