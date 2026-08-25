(() => {
"use strict";
const API="https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec";
const KEYS={profile:"classbl07-nova-profile-v1",tasks:"classbl07-nova-tasks-v1",notes:"classbl07-nova-notes-v1",cache:"classbl07-nova-schedule-v1",snapshot:"classbl07-nova-snapshot-v1",notifications:"classbl07-nova-notifications-v1",onboarded:"bl07_onboarded_v2",ui:"classbl07-nova-ui-v1"};
const COURSE_COLORS={SM:"#8b7cf6",DBST:"#5b8def",AIB:"#24b3a8",OS:"#f29a52",CV:"#36b5d8",PM:"#6f7bea",POM:"#ee7656",CB:"#d866ad",SBM:"#d6a43b",NWW:"#b07c59",MAAS:"#8f66cf",ACC:"#e15d69"};
const HOLIDAYS=Object.freeze({"2026-08-15":"Independence Day"});
window.BL07_HOLIDAYS=HOLIDAYS;
const state={all:[],classes:[],electives:[],profile:load(KEYS.profile,{name:"",section:"A",electives:[],theme:"system"}),tasks:load(KEYS.tasks,[]),notes:load(KEYS.notes,[]),notifications:load(KEYS.notifications,[]),ui:load(KEYS.ui,{plannerTab:"calendar",campusTab:"bus",onlyUpcoming:false,completedCollapsed:true}),notificationFilter:"all",selectedDate:isoToday(),calendarMonth:new Date(new Date().getFullYear(),new Date().getMonth(),1),taskFilter:"open",messDay:weekdayKey(new Date()),meal:"breakfast",busFrom:"Phase V Campus",busTo:"PGP Auditorium",timelineDay:"today",lastUpdated:null};
let editingTaskId=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const canonical=c=>String(c||"").toUpperCase().replace(/^NWLB$/,"NWW").split("-")[0];
const colorFor=c=>COURSE_COLORS[canonical(c)]||"#7b8aa2";
const venueOf=c=>c.venue||c.room||"Venue TBA";
const SESSION_TARGET=24;
function subjectSessions(code){
  const wanted=canonical(code);
  return state.classes.filter(c=>c.status!=="Cancelled"&&canonical(c.code)===wanted).sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"));
}
function subjectSessionProgress(code,now=new Date()){
  const sessions=subjectSessions(code),completed=sessions.filter(c=>dateTime(c,"endTime")<=now).length;
  return{completed:Math.min(completed,SESSION_TARGET),remaining:Math.max(0,SESSION_TARGET-completed),scheduled:sessions.length,total:SESSION_TARGET};
}
function subjectSessionOrdinal(c){
  if(!c||c.status==="Cancelled")return 0;
  const identity=classIdentity(c),index=subjectSessions(c.code).findIndex(item=>classIdentity(item)===identity);
  return index<0?0:index+1;
}
const EXAM_SLOT_ORDER={Forenoon:0,Afternoon:1,Evening:2};
function filteredExams(){const selected=new Set((state.profile.electives||[]).map(canonical));return[...(window.EXAM_DATA||[])].filter(exam=>exam.type==="Core"||selected.has(canonical(exam.code))).sort((a,b)=>a.dateIso.localeCompare(b.dateIso)||(EXAM_SLOT_ORDER[a.slot]??9)-(EXAM_SLOT_ORDER[b.slot]??9))}
function examDayDistance(dateIso){const today=new Date(`${isoToday()}T00:00:00+05:30`),examDate=new Date(`${dateIso}T00:00:00+05:30`);return Math.round((examDate-today)/86400000)}
function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function saveUi(){save(KEYS.ui,state.ui)}
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
filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
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
const ADDED_FILL_COLORS=new Set(["#00ff00","#00b050","#70ad47","#92d050"]);
function normalizeFillColor(value){const fill=String(value||"").trim().toLowerCase();return /^#[0-9a-f]{3}$/.test(fill)?`#${fill.slice(1).split("").map(char=>char.repeat(2)).join("")}`:fill}
function normalizeScheduleClass(item){
  const status=String(item?.status||"").trim(),normalized=status.toLowerCase(),fill=normalizeFillColor(item?.fillColor);
  if(normalized==="cancelled"||normalized==="canceled"||CANCELLED_FILL_COLORS.has(fill))return{...item,status:"Cancelled"};
  if(normalized==="added"||ADDED_FILL_COLORS.has(fill))return{...item,status:"Added"};
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
function notificationRecord(c,type,title,text){const classId=classIdentity(c);return{id:`${type}|${classId}|${c.endTime||""}|${venueOf(c)}`,classId,dateIso:c.dateIso,startTime:c.startTime,endTime:c.endTime,expiresAt:dateTime(c,"endTime").getTime(),type,code:c.code,title,text,course:canonical(c.code),createdAt:Date.now(),read:false}}
function tomorrowIso(){const d=new Date(`${isoToday()}T12:00:00+05:30`);d.setDate(d.getDate()+1);return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}
function isClassCompleted(c){
  if(c.status==="Cancelled")return false;
  return Date.now()>=dateTime(c,"endTime").getTime();
}
function wasRecentlyAdded(c){
  if(isClassCompleted(c))return false;
  const fill=normalizeFillColor(c.fillColor),addedFill=ADDED_FILL_COLORS.has(fill);
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
function relativeTime(stamp){
  const mins=Math.max(0,Math.floor((Date.now()-new Date(stamp).getTime())/60000));
  if(mins<1)return"just now";
  if(mins===1)return"1 minute ago";
  if(mins<60)return`${mins} minutes ago`;
  const hours=Math.floor(mins/60);return`${hours} hour${hours>1?"s":""} ago`;
}

function compareSnapshots(oldList,newList){
  if(!oldList||!oldList.length)return newList.filter(c=>["Added","Cancelled"].includes(c.status)&&dateTime(c,"endTime")>new Date()).map(c=>c.status==="Added"?notificationRecord(c,"added",`${c.code} class added`,`${fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`):notificationRecord(c,"cancelled",`${c.code} class cancelled`,`${fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${fmtTime(c.startTime)}`)).slice(0,12);
  const oldMap=new Map(oldList.map(c=>[classIdentity(c),c])),out=[];
  newList.forEach(c=>{const old=oldMap.get(classIdentity(c)),future=dateTime(c,"endTime")>new Date(),explicitlyAdded=c.status==="Added"&&old?.status!=="Added";if(future&&c.status!=="Cancelled"&&(!old||explicitlyAdded))out.push(notificationRecord(c,"added",`${c.code} class added`,`${fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`));else if(future&&old&&old.status!=="Cancelled"&&c.status==="Cancelled")out.push(notificationRecord(c,"cancelled",`${c.code} class cancelled`,`${fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${fmtTime(c.startTime)}`));else if(future&&old&&old.status!=="Cancelled"&&c.status!=="Cancelled"&&venueOf(old)!==venueOf(c))out.push(notificationRecord(c,"venue",`${c.code} venue changed`,`${fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`))});
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
  const pill=$("#syncPill"),refreshBtn=$("#refreshButton");let syncResult="";
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
    syncResult="success";if(force&&navigator.vibrate)navigator.vibrate(18);
  }catch(e){
    const c=load(KEYS.cache,null);
    if(c){state.all=normalizeScheduleClasses(c.all);state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}
    if(pill){pill.className="sync-pill error";pill.innerHTML="<i></i><span>Offline</span>"}
    syncResult="error";
    setAppState("offline",c?"You are offline. Showing the last saved schedule.":"Schedule could not load. Check your connection and try again.");
    scheduleOfflineRetry();
    console.error(e);
  }finally{
    _syncInFlight=false;
    document.body.classList.remove("schedule-loading");
    if(refreshBtn){refreshBtn.dataset.state=syncResult;refreshBtn.setAttribute("aria-busy","false");setTimeout(()=>{if(refreshBtn.dataset.state===syncResult)refreshBtn.dataset.state=""},1200)}
    if(_syncAgain){_syncAgain=false;setTimeout(()=>syncSchedule(true),0)}
  }
  renderAll();
}
function scheduleIdleSync(){
  const run=()=>syncSchedule(false);
  if("requestIdleCallback"in window)requestIdleCallback(run,{timeout:2500});
  else setTimeout(run,1200);
}
function setPlannerView(view="calendar",remember=true){const valid=["calendar","exams","tasks","notes"].includes(view)?view:"calendar";if(remember){state.ui.plannerTab=valid;saveUi()}$$(".subtab[data-planner-tab]").forEach(b=>b.classList.toggle("active",b.dataset.plannerTab===valid));$$(".planner-view").forEach(v=>v.classList.toggle("active",v.dataset.plannerView===valid));if(remember&&matchMedia("(max-width:780px)").matches)requestAnimationFrame(()=>requestAnimationFrame(()=>$(`.planner-view[data-planner-view="${valid}"]`)?.scrollIntoView({behavior:"smooth",block:"start"})));document.dispatchEvent(new CustomEvent("planner-view-change",{detail:{view:valid}}))}
function setCampusView(view="bus",remember=true){const valid=["bus","mess"].includes(view)?view:"bus";if(remember){state.ui.campusTab=valid;saveUi()}$$(".subtab[data-campus-tab]").forEach(b=>b.classList.toggle("active",b.dataset.campusTab===valid));$$(".campus-view").forEach(v=>v.classList.toggle("active",v.dataset.campusView===valid))}
function showPage(n){hideCalendarTooltip();if(n==="home")state.timelineDay="today";if(n==="planner")setPlannerView(state.ui.plannerTab||"calendar",false);if(n==="campus")setCampusView(state.ui.campusTab||"bus",false);$$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===n));$$("[data-page-target]").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===n));scrollTo({top:0,behavior:"auto"});if(n==="home")renderHome();if(n==="planner")renderCalendar();if(n==="campus")renderCampus()}
function openPlannerDate(iso){
  showPage("planner");
  setPlannerView("calendar");
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
  const busiest=[...days].sort((a,b)=>b.classes.length-a.classes.length)[0],clearDays=days.filter(day=>!day.classes.length).length,insight=$("#weekDensityInsight");
  if(insight)insight.textContent=!classTotal?"The week is clear—no classes are currently scheduled.":`${fmtDate(busiest.iso,{weekday:"long"})} carries the most: ${busiest.classes.length} ${busiest.classes.length===1?"class":"classes"}${clearDays?` · ${clearDays} clear ${clearDays===1?"day":"days"}`:""}.`;
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
  card.hidden=!next||days<0;
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
function setPlannerTabBadge(selector,value){const badge=$(selector);if(!badge)return;const count=Math.max(0,Number(value)||0);badge.textContent=count>99?"99+":String(count);badge.hidden=count===0}
function updatePlannerTabBadges(){const openTasks=state.tasks.filter(task=>!task.completed).length;setPlannerTabBadge("#plannerExamBadge",filteredExams().filter(exam=>examDayDistance(exam.dateIso)>=0).length);setPlannerTabBadge("#plannerTaskBadge",openTasks);setPlannerTabBadge("#plannerNoteBadge",state.notes.length);const quick=$("#tasksQuickBadge");if(quick){quick.hidden=!openTasks;quick.textContent=openTasks>9?"9+":openTasks}}
function renderExams(){
  const exams=filteredExams(),count=$("#examCount"),schedule=$("#examSchedule");
  if(!schedule)return;
  if(count)count.textContent=exams.length;
  updatePlannerTabBadges();
  const examContext=$("#examContextLine"),next=exams.find(exam=>examDayDistance(exam.dateIso)>=0);
  if(examContext)examContext.textContent=next?`${canonical(next.code)} is next · ${examDayDistance(next.dateIso)===0?"today":examDayDistance(next.dateIso)===1?"tomorrow":`${examDayDistance(next.dateIso)} days away`}.`:exams.length?"All listed exams are complete.":"No exams match your selected courses.";
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
  const now=new Date(),today=isoToday(),dateParts=new Intl.DateTimeFormat("en-IN",{weekday:"short",day:"numeric",month:"short"}).formatToParts(now),datePart=type=>dateParts.find(part=>part.type===type)?.value||"";$("#todayLabel").textContent=`${datePart("weekday")} · ${datePart("day")} ${datePart("month")}`.toUpperCase();const h=now.getHours(),firstName=String(state.profile.name||"").trim().split(/\s+/)[0],dayGreeting=`Good ${h<12?"morning":h<17?"afternoon":"evening"}`;$("#greeting").textContent=firstName?`${dayGreeting} ${firstName}`:dayGreeting;
  const scheduled=state.classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"));
  const todays=scheduled.filter(c=>c.dateIso===today),current=todays.find(c=>now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime")),todayNext=todays.find(c=>now<dateTime(c,"startTime")),previous=todays.filter(c=>now>=dateTime(c,"endTime")).at(-1),future=scheduled.find(c=>now<dateTime(c,"startTime")),todayComplete=Boolean(todays.length&&!current&&!todayNext),finalJustEnded=Boolean(todayComplete&&previous===todays.at(-1)&&now-dateTime(previous,"endTime")<3*60000),focus=current||todayNext||(finalJustEnded?previous:future),loadDate=!todays.length||todayComplete?tomorrowIso():today,loadClasses=scheduled.filter(c=>c.dateIso===loadDate),loadIsToday=loadDate===today,loadIsTomorrow=loadDate===tomorrowIso(),loadLabel=loadIsToday?"Today":loadIsTomorrow?"Tomorrow":fmtDate(loadDate,{weekday:"long"}),loadValue=loadSummary(loadClasses,loadIsToday?"end":"start"),parts=istParts(now),nowMinutes=Number(parts.hour)*60+Number(parts.minute),isLunch=Boolean(!current&&todayNext&&nowMinutes>=13*60+30&&nowMinutes<Math.min(14*60+30,minutes(todayNext.startTime)));
  const contextLine=$("#homeContextLine");
  if(contextLine){
    const nextCode=todayNext?canonical(todayNext.code):"",futureCode=future?canonical(future.code):"";
    if(current)contextLine.textContent=`${canonical(current.code)} is underway. It ends at ${fmtTime(current.endTime)}.`;
    else if(isLunch&&todayNext)contextLine.textContent=`Lunch break now. ${nextCode} begins at ${fmtTime(todayNext.startTime)}.`;
    else if(todayNext&&previous)contextLine.textContent=`${compactDuration((dateTime(todayNext,"startTime")-now)/60000)} free before ${nextCode}.`;
    else if(todayNext)contextLine.textContent=todays.length===1?`One class today: ${nextCode} at ${fmtTime(todayNext.startTime)}.`:`${todays.length} classes ahead, starting with ${nextCode} at ${fmtTime(todayNext.startTime)}.`;
    else if(todayComplete)contextLine.textContent=future&&future.dateIso===tomorrowIso()?`Classes are done. Tomorrow begins with ${futureCode} at ${fmtTime(future.startTime)}.`:"Classes are done for today.";
    else if(future&&future.dateIso===tomorrowIso())contextLine.textContent=`No classes today. ${futureCode} begins tomorrow at ${fmtTime(future.startTime)}.`;
    else if(future)contextLine.textContent=`Your next class is ${futureCode} on ${fmtDate(future.dateIso,{weekday:"short",day:"numeric",month:"short"})}.`;
    else contextLine.textContent="Your schedule is clear.";
  }
  const focusPanel=$("#focusPanel");
  if(focus){
    const isNow=focus===current,isJustDone=finalJustEnded&&focus===previous,isToday=focus.dateIso===today,isTomorrow=focus.dateIso===tomorrowIso(),isFutureDay=!isToday,isFree=Boolean(!current&&todayNext&&previous&&!isLunch),isClearToday=Boolean(!todays.length&&future),isDayDone=Boolean(todayComplete&&future),dayClasses=scheduled.filter(c=>c.dateIso===focus.dateIso),dayIndex=dayClasses.indexOf(focus),finalClass=dayClasses.at(-1),isFinalLive=Boolean(isNow&&focus===finalClass),remaining=todays.filter(c=>dateTime(c,"endTime")>now).length,futureDate=fmtDate(focus.dateIso,{weekday:"short",day:"numeric",month:"short"});
    focusPanel.classList.remove("is-empty");focusPanel.classList.toggle("is-live",isNow);focusPanel.classList.toggle("is-final-live",isFinalLive);focusPanel.classList.toggle("is-just-done",isJustDone);focusPanel.classList.toggle("is-lunch",isLunch);focusPanel.classList.toggle("is-free",isFree);focusPanel.classList.toggle("is-clear",(isClearToday||isDayDone||isJustDone)&&!isFutureDay);focusPanel.classList.toggle("is-upcoming",!isNow&&!isFree&&!isLunch&&!isJustDone&&isToday);focusPanel.classList.toggle("is-future",isFutureDay);focusPanel.style.setProperty("--focus-course",colorFor(focus.code));focusPanel.dataset.focusDate=focus.dateIso;focusPanel.dataset.focusClassId=classIdentity(focus);$("#focusCourseAction").tabIndex=0;$("#focusCourseAction").removeAttribute("aria-disabled");
    $("#focusLiveCapsule").textContent=isFinalLive?"NOW · FINAL CLASS":isNow?"NOW":isJustDone?"DONE":isLunch||isFree?"NEXT":isFutureDay?(isTomorrow?"TOMORROW":"UPCOMING"):"NEXT";
    $("#focusKicker").textContent=isFinalLive?"LAST CLASS TODAY":isNow?"HAPPENING NOW":isJustDone?"FINAL CLASS COMPLETE":isLunch||isFree?"UP NEXT":isFutureDay?(isTomorrow?"FIRST CLASS TOMORROW":"LOOKING AHEAD"):"UP NEXT";
    $("#focusState").textContent=isFinalLive?"Final class in progress":isNow?"In progress":isJustDone?"Day complete":isLunch||isFree?"Next class":isFutureDay?(isTomorrow?`${dayClasses.length} ${dayClasses.length===1?"class":"classes"} tomorrow`:`Next class · ${futureDate}`):"Next class";
    $("#focusDayLoad").textContent=isJustDone?`${todays.length} completed`:isToday&&dayIndex>=0?`${dayIndex+1} of ${dayClasses.length} today`:futureDate;
    $("#focusCode").textContent=canonical(focus.code);$("#focusTitle").textContent=isJustDone?"Final class complete":focus.course;$("#focusTime").textContent=isJustDone?`Ended ${fmtTime(focus.endTime)}`:`${fmtTime(focus.startTime)} – ${fmtTime(focus.endTime)}`;$("#focusVenue").textContent=isJustDone?(future?`Next · ${fmtDate(future.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${canonical(future.code)} at ${fmtTime(future.startTime)}`:"Schedule complete"):venueOf(focus);$("#focusFaculty").textContent=focus.faculty;$("#focusFacultyRow").hidden=isJustDone||!focus.faculty;
    const venueChanged=state.notifications.some(n=>n.type==="venue"&&n.classId===classIdentity(focus)&&isNotificationActionable(n)),venueRow=$("#focusVenue")?.closest("span");venueRow?.classList.toggle("is-changed",venueChanged&&!isJustDone);
    const target=isNow?dateTime(focus,"endTime"):dateTime(focus,"startTime"),diff=Math.max(0,Math.ceil((target-now)/60000));
    const lunchLeft=Math.max(0,14*60+30-nowMinutes);$("#focusCountdownLabel").textContent=isNow?`Ends ${fmtTime(focus.endTime)}`:isFutureDay?"Starts":"Starts in";
    $("#focusCountdown").textContent=isNow?`${compactDuration(diff)} left`:isFutureDay?fmtTime(focus.startTime):compactDuration(diff);
    const countdownAction=$("#focusCountdownAction");countdownAction.hidden=isNow||isJustDone;countdownAction.dataset.classId=classIdentity(focus);countdownAction.setAttribute("aria-label",isFree||isLunch?`Open next class ${canonical(focus.code)} in Planner`:`Open ${canonical(focus.code)} in Planner`);
    const context=$("#focusContext");context.hidden=true;
    const position=$("#focusPosition"),positionLabel=$("#focusPositionLabel"),positionValue=$("#focusPositionValue"),after=dayClasses[dayIndex+1]||null,nextFocus=isJustDone?future:isNow?after:isLunch||isFree?focus:null;
    position.hidden=true;
    position.dataset.classId=nextFocus?classIdentity(nextFocus):classIdentity(focus);
    positionLabel.textContent=isJustDone&&nextFocus?(nextFocus.dateIso===tomorrowIso()?"TOMORROW":"NEXT CLASS"):nextFocus?"UP NEXT":isFinalLive?"AFTER THIS":isNow?"TODAY":isLunch||isFree?"UP NEXT":"TODAY";
    positionValue.textContent=isJustDone&&nextFocus?`${canonical(nextFocus.code)} · ${fmtTime(nextFocus.startTime)}`:nextFocus?`${canonical(nextFocus.code)} · ${fmtTime(nextFocus.startTime)}`:isFinalLive?"Day complete":isNow?`${todays.length} classes today`:isLunch||isFree?`${canonical(focus.code)} · ${fmtTime(focus.startTime)}`:dayIndex>=0?`${dayIndex+1} of ${todays.length}`:"";
    const sessionOrdinal=subjectSessionOrdinal(focus),sessionProgress=subjectSessionProgress(focus.code),sessionInsight=$("#focusSessionInsight"),finalInsight=$("#focusFinalInsight"),insightGrid=$("#heroInsightGrid"),sessionLabel=$("#focusSessionLabel"),finalLabel=$("#focusFinalLabel"),sessionValue=$("#focusSessionValue"),finalValue=$("#focusFinalValue");
    insightGrid.hidden=false;sessionInsight.hidden=false;finalInsight.hidden=false;finalInsight.removeAttribute("role");finalInsight.removeAttribute("tabindex");delete finalInsight.dataset.classId;
    if(isJustDone){sessionLabel.textContent="TODAY";sessionValue.textContent="Complete";finalLabel.textContent=future?"NEXT CLASS":"STATUS";finalValue.textContent=future?`${fmtDate(future.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${canonical(future.code)} ${fmtTime(future.startTime)}`:"Schedule complete";if(future){finalInsight.setAttribute("role","button");finalInsight.tabIndex=0;finalInsight.dataset.classId=classIdentity(future)}}
    else if(isLunch||isFree){sessionLabel.textContent=isLunch?"LUNCH":"FREE TIME";sessionValue.textContent=isLunch?`Ends ${fmtTime("14:30")}`:`${compactDuration(diff)} available`;finalLabel.textContent=focus===finalClass?"FINAL CLASS":"SESSION";finalValue.textContent=focus===finalClass?`${canonical(focus.code)} · ${fmtTime(focus.startTime)}`:sessionOrdinal?`Session ${sessionOrdinal} of ${SESSION_TARGET}`:`${sessionProgress.completed} of ${SESSION_TARGET} completed`}
    else{sessionLabel.textContent="SESSION";sessionValue.textContent=sessionOrdinal?`Session ${sessionOrdinal} of ${SESSION_TARGET}`:`${sessionProgress.completed} of ${SESSION_TARGET} completed`;finalLabel.textContent=isFinalLive?"AFTER THIS":isNow&&after?"UP NEXT":isToday?"FINAL CLASS":`DAY LOAD`;finalValue.textContent=isFinalLive?"Day complete":isNow&&after?`${canonical(after.code)} · ${fmtTime(after.startTime)}`:finalClass?`${canonical(finalClass.code)} · ${fmtTime(finalClass.startTime)}`:`${dayClasses.length} ${dayClasses.length===1?"class":"classes"}`;if(isNow&&after){finalInsight.setAttribute("role","button");finalInsight.tabIndex=0;finalInsight.dataset.classId=classIdentity(after)}}
    const liveProgress=$("#heroLiveProgress"),liveTrack=$(".hero-live-progress-track"),liveBar=$("#focusProgressBar");
    liveProgress.hidden=!isNow;
    if(isNow){
      const duration=Math.max(1,dateTime(focus,"endTime")-dateTime(focus,"startTime")),elapsed=Math.floor(Math.max(0,now-dateTime(focus,"startTime"))/60000)*60000,percent=Math.max(0,Math.min(100,Math.round(elapsed/duration*100))),remainingText=compactDuration(diff);
      $("#focusProgressLabel").textContent=`Ends ${fmtTime(focus.endTime)}`;$("#focusProgressValue").textContent=`${remainingText} left`;
      liveBar.style.width=`${percent}%`;liveTrack.setAttribute("aria-valuenow",String(percent));liveProgress.dataset.classId=classIdentity(focus);
    }else{liveBar.style.width="0%";liveTrack.setAttribute("aria-valuenow","0")}
    const segments=$("#focusSegments");segments.hidden=true;
    $("#heroDayGlance").hidden=true;
  }
  else{focusPanel.classList.add("is-empty");focusPanel.classList.remove("is-live","is-final-live","is-just-done","is-lunch","is-free","is-clear","is-upcoming","is-future");focusPanel.style.removeProperty("--focus-course");$("#focusLiveCapsule").textContent="DONE";$("#focusKicker").textContent=todays.length?"DAY COMPLETE":"YOUR SCHEDULE";$("#focusState").textContent=todays.length?"Day complete":"Today is clear";$("#focusDayLoad").textContent=todays.length?`${todays.length} done`:"No classes";$("#focusCode").textContent="CLEAR";$("#focusTitle").textContent="No upcoming classes";$("#focusTime").textContent=todays.length?"Done for today":"Free today";$("#focusVenue").textContent="—";$("#focusVenue")?.closest("span")?.classList.remove("is-changed");$("#focusFaculty").textContent="";$("#focusFacultyRow").hidden=true;$("#focusCountdownLabel").textContent="STATUS";$("#focusCountdown").textContent="Clear";$("#focusCountdownAction").hidden=true;$("#focusContext").hidden=false;$("#focusContextLabel").textContent=loadLabel;$("#focusContextValue").textContent=loadValue;$("#heroLiveProgress").hidden=true;$("#heroInsightGrid").hidden=true;$("#focusSegments").hidden=true;fillSegments($("#focusSegments"),0,12);renderHeroDayGlance(state.classes.filter(c=>c.dateIso===today),now,today)}
  if(!focus){delete focusPanel.dataset.focusDate;delete focusPanel.dataset.focusClassId;$("#focusPosition").hidden=true;$("#focusCourseAction").tabIndex=-1;$("#focusCourseAction").setAttribute("aria-disabled","true")}
  const timelineIso=state.timelineDay==="tomorrow"?tomorrowIso():today,timelineClasses=state.classes.filter(c=>c.dateIso===timelineIso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  $("#timelineDateTitle").textContent=state.timelineDay==="today"?"Today":"Tomorrow";
  $("#timelineFullDate").textContent=fmtDate(timelineIso,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#todaySwitchDate").textContent=fmtDate(today,{day:"numeric",month:"short"});
  $("#tomorrowSwitchDate").textContent=fmtDate(tomorrowIso(),{day:"numeric",month:"short"});
  $$(".timeline-day-button").forEach(b=>b.classList.toggle("active",b.dataset.timelineDay===state.timelineDay));
  let markerPlaced=false;
  const showTimeMarker=timelineIso===today&&timelineClasses.some(c=>c.status!=="Cancelled")&&now>=dateTime(timelineClasses.find(c=>c.status!=="Cancelled"),"startTime")&&now<=dateTime([...timelineClasses].reverse().find(c=>c.status!=="Cancelled"),"endTime");
  const currentTimeMarker=()=>`<div class="current-time-divider" aria-label="Current time ${esc(fmtTime(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`))}"><span>NOW · ${esc(fmtTime(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`))}</span></div>`;
  const immediateNext=timelineClasses.find(c=>c.status!=="Cancelled"&&(timelineIso!==today||dateTime(c,"endTime")>now));
  let timelineCards=timelineClasses.map(c=>{
    const status=c.status==="Cancelled"?"cancelled":timelineIso!==today?"upcoming":now>=dateTime(c,"endTime")?"done":now>=dateTime(c,"startTime")?"current":"upcoming",added=c.status!=="Cancelled"&&wasRecentlyAdded(c),statusText=status==="current"?"Now":status==="done"?"Done":status==="cancelled"?"Cancelled":c===immediateNext?"Next":"";
    const marker=showTimeMarker&&!markerPlaced&&now<dateTime(c,"startTime")?(markerPlaced=true,currentTimeMarker()):"";
    return `${marker}<article class="vertical-class ${status}" data-class-id="${esc(classIdentity(c))}" style="--course:${colorFor(c.code)}" tabindex="0" role="button" aria-haspopup="dialog"><div class="vertical-time">${esc(fmtTime(c.startTime))}<small>${esc(fmtTime(c.endTime))}</small></div><div class="vertical-content"><div class="timeline-course-line"><span class="timeline-code-chip">${esc(c.code)}</span><strong>${esc(c.course)}</strong></div><p><span>${esc(venueOf(c))}</span><span>${esc(c.faculty)}</span></p><div class="timeline-status-row">${statusText?`<span class="vertical-status">${esc(statusText)}</span>`:""}<span class="duration-chip">${esc(durationLabel(c))}</span><span class="session-chip">${c.status==="Cancelled"?"Not counted":`Session ${subjectSessionOrdinal(c)} of ${SESSION_TARGET}`}</span>${added?'<span class="timeline-added">ADDED</span>':""}</div></div></article>`;
  }).join("");
  if(showTimeMarker&&!markerPlaced)timelineCards+=currentTimeMarker();
  const nextAfterClear=scheduled.find(c=>c.dateIso>timelineIso),nextClearHtml=nextAfterClear?`<button type="button" class="empty-next-class" data-empty-next-date="${esc(nextAfterClear.dateIso)}"><span>Next class</span><strong>${esc(canonical(nextAfterClear.code))} · ${esc(fmtDate(nextAfterClear.dateIso,{weekday:"short",day:"numeric",month:"short"}))}</strong><small>${esc(fmtTime(nextAfterClear.startTime))}</small></button>`:"";
  $("#todayProgressRail").innerHTML=timelineClasses.length?`<div class="vertical-day-timeline">${timelineCards}</div>`:`<div class="empty-state free-day-state"><strong>${state.timelineDay==="today"?"Clear day":"Tomorrow is clear"}</strong><span>No classes scheduled—your time is open.</span>${nextClearHtml}</div>`;
  $("#todayProgressRail .empty-next-class")?.addEventListener("click",event=>openPlannerDate(event.currentTarget.dataset.emptyNextDate));
  decorateTimelineDay("#todayProgressRail",timelineClasses,timelineIso);
  const completed=timelineIso===today?timelineClasses.filter(c=>c.status!=="Cancelled"&&now>=dateTime(c,"endTime")).length:0,stats=dayLoadStats(timelineClasses);
  $("#progressSummary").innerHTML=timelineIso===today?`<b>${completed}</b><span>done</span>`:`<b>${stats.count}</b><span>${stats.count===1?"class":"classes"}</span>`;
  const summary=$("#timelineLoadSummary");if(summary)summary.innerHTML=stats.count?`<span><b>${stats.count}</b> ${stats.count===1?"class":"classes"} · ends <b>${esc(fmtTime(stats.end))}</b></span>`:'<span class="summary-free"><b>Clear day</b></span>';
  const timelineContext=$("#timelineContextLine"),activeTimeline=timelineClasses.filter(c=>c.status!=="Cancelled"),remaining=timelineIso===today?activeTimeline.filter(c=>dateTime(c,"endTime")>now).length:activeTimeline.length,firstTimeline=activeTimeline[0];
  if(timelineContext)timelineContext.textContent=!activeTimeline.length?"No classes scheduled—your time is open.":timelineIso===today?remaining?`${completed} complete · ${remaining} ${remaining===1?"class":"classes"} remaining.`:"Everything scheduled for today is complete.":`Starts with ${canonical(firstTimeline.code)} at ${fmtTime(firstTimeline.startTime)}.`;
  const unread=state.notifications.filter(n=>!n.read),heroChanges=unread.filter(n=>n.dateIso===today||focus&&n.classId===classIdentity(focus));
  $("#silentUpdateStrip").hidden=!heroChanges.length;
  if(heroChanges.length){
    const latest=heroChanges[0];
    $("#silentUpdateTitle").textContent=latest.type==="added"?"Class added":latest.type==="cancelled"?"Class cancelled":latest.type==="venue"?"Venue changed":"Schedule updated";
    $("#silentUpdateText").textContent=`${latest.title} · ${latest.text}`;
  }
  const stale=Boolean(state.lastUpdated&&Date.now()-new Date(state.lastUpdated).getTime()>30*60000),refreshButton=$("#refreshButton");refreshButton?.classList.toggle("is-stale",stale);if(refreshButton){refreshButton.title=stale?"Schedule may be outdated — sync now":"Sync schedule";refreshButton.setAttribute("aria-label",refreshButton.title)}
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
  return`<div class="current-time-divider" aria-label="Current time ${esc(fmtTime(value))}"><span>NOW · ${esc(fmtTime(value))}</span></div>`
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
  let status=agendaStatus(c);const next=upcomingClasses()[0];if(status==="Next"&&(!next||classIdentity(next)!==classIdentity(c)))status="";const cls=[
    "agenda-class-card",
    "planner-schedule-card",
    status==="Now"?"current":"",
    status==="Done"?"done":"",
    status==="Done"&&state.ui.completedCollapsed?"completed-collapsed":"",
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
      <div class="timeline-status-row">${status?`<span class="agenda-status ${c.status==="Cancelled"?"cancelled":""}">${esc(status)}</span>`:""}<span class="duration-chip">${esc(durationLabel(c))}</span><span class="session-chip">${c.status==="Cancelled"?"Not counted":`Session ${subjectSessionOrdinal(c)} of ${SESSION_TARGET}`}</span></div>
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
  const upcomingFilter=state.ui.onlyUpcoming&&state.selectedDate>=isoToday(),originalClassCount=classes.length;
  if(upcomingFilter)classes=classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"endTime")>new Date());
  const filteredToEmpty=upcomingFilter&&originalClassCount&&!classes.length;
  if(filteredToEmpty&&!tasks.length&&!exams.length)return'<div class="agenda-empty filtered-empty"><strong>No upcoming classes</strong><span>Turn off “Only upcoming” to see the complete day.</span></div>';
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
function isoFromDate(day){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(day)}
function weekStartFor(iso){const day=new Date(`${iso}T12:00:00+05:30`),offset=(day.getDay()+6)%7;day.setDate(day.getDate()-offset);return day}
function renderPlannerWeek(){
  const root=$("#plannerWeekDays");if(!root)return;
  const start=weekStartFor(state.selectedDate),end=new Date(start);end.setDate(start.getDate()+6);
  $("#plannerWeekRange").textContent=`${fmtDate(isoFromDate(start),{day:"numeric",month:"short"})} – ${fmtDate(isoFromDate(end),{day:"numeric",month:"short"})}`;
  const exams=filteredExams();
  root.innerHTML=Array.from({length:7},(_,index)=>{const day=new Date(start);day.setDate(start.getDate()+index);const iso=isoFromDate(day),count=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled").length,hasExam=exams.some(exam=>exam.dateIso===iso);return`<button type="button" class="planner-week-day ${iso===state.selectedDate?"selected":""} ${iso===isoToday()?"today":""} ${hasExam?"has-exam":""}" data-week-date="${iso}" aria-label="${esc(fmtDate(iso,{weekday:"long",day:"numeric",month:"long"}))}, ${count} ${count===1?"class":"classes"}"><span>${esc(fmtDate(iso,{weekday:"short"}))}</span><strong>${day.getDate()}</strong><i>${count||"·"}</i></button>`}).join("");
}
function setPlannerMonthView(open=false){
  hideCalendarTooltip();
  const view=$('[data-planner-view="calendar"]'),toggle=$("#toggleMonthView");
  if(!view||!toggle)return;
  view.classList.toggle("show-month",open);
  toggle.setAttribute("aria-expanded",String(open));
  toggle.setAttribute("aria-label",open?"Close month view":"Open month view");
  toggle.classList.toggle("is-active",open)
}

/* Removing the node prevents a stale preview from surviving navigation,
   touch emulation, viewport changes, or a calendar re-render. */
function hideCalendarTooltip(){
  $("#calendarTooltip")?.remove()
}

/* Status-aware desktop calendar preview. This declaration intentionally
   replaces the compact legacy renderer above without touching calendar flow. */
function showCalendarTooltip(target,iso){
  if(matchMedia("(hover: none)").matches||matchMedia("(max-width:780px)").matches){hideCalendarTooltip();return}
  let tip=$("#calendarTooltip");
  if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}
  const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  const exams=filteredExams().filter(exam=>exam.dateIso===iso);
  if(!list.length&&!exams.length){hideCalendarTooltip();return}
  const scheduled=list.filter(c=>c.status!=="Cancelled"),cancelled=list.filter(c=>c.status==="Cancelled");
  const summary=[scheduled.length?`${scheduled.length} scheduled`:"",cancelled.length?`${cancelled.length} cancelled`:"",exams.length?`${exams.length} ${exams.length===1?"exam":"exams"}`:""].filter(Boolean).join(" · ");
  const rows=scheduled.map(c=>`<div class="calendar-tooltip-row" style="--tooltip-course:${colorFor(c.code)}"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("");
  const cancelledRows=cancelled.map(c=>`<div class="calendar-tooltip-row cancelled" style="--tooltip-course:var(--danger)"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong><span>CANCELLED</span></div>`).join("");
  const examRows=exams.map(exam=>`<div class="calendar-tooltip-row exam" style="--tooltip-course:${colorFor(exam.code)}"><time>${esc(exam.slot)}</time><strong>${esc(exam.code)} · ${esc(exam.course)}</strong></div>`).join("");
  tip.innerHTML=`<div class="calendar-tooltip-head"><h4>${esc(fmtDate(iso))}</h4><small>${esc(summary)}</small></div>${rows}${cancelledRows}${examRows}`;
  const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-240,r.bottom+8)}px`;tip.classList.add("show")
}
function renderCalendar(){
  hideCalendarTooltip();
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
  $$(".calendar-day").forEach(button=>{button.addEventListener("click",()=>{state.selectedDate=button.dataset.date;setPlannerMonthView(false);renderCalendar();requestAnimationFrame(()=>$("#plannerWeekNavigator")?.scrollIntoView({behavior:"smooth",block:"start"}))});button.addEventListener("mouseenter",()=>showCalendarTooltip(button,button.dataset.date));button.addEventListener("mouseleave",hideCalendarTooltip)});
  const classes=state.classes.filter(c=>c.dateIso===state.selectedDate),tasks=state.tasks.filter(t=>t.date===state.selectedDate),dayExams=exams.filter(exam=>exam.dateIso===state.selectedDate);
  $("#agendaDate").textContent=fmtDate(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const agendaBackToday=$("#agendaBackToday");if(agendaBackToday)agendaBackToday.hidden=state.selectedDate===isoToday();
  $("#agendaCount").textContent=classes.length+tasks.length+dayExams.length;
  const agendaStats=dayLoadStats(classes),agendaSummary=$("#agendaLoadSummary");if(agendaSummary)agendaSummary.textContent=agendaStats.count?`${agendaStats.count} ${agendaStats.count===1?"class":"classes"} · ${compactDuration(agendaStats.classMinutes)} class time${agendaStats.freeMinutes?` · ${compactDuration(agendaStats.freeMinutes)} free`:""} · Ends ${fmtTime(agendaStats.end)}`:dayExams.length?`${dayExams.length} ${dayExams.length===1?"exam":"exams"}`:"No classes";
  const agendaContext=$("#agendaContextLine"),activeClasses=classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  if(agendaContext)agendaContext.textContent=activeClasses.length?state.selectedDate===isoToday()?`Today runs from ${fmtTime(activeClasses[0].startTime)} to ${fmtTime(activeClasses.at(-1).endTime)}.`:`First class is ${canonical(activeClasses[0].code)} at ${fmtTime(activeClasses[0].startTime)}.`:dayExams.length?`${dayExams.length===1?canonical(dayExams[0].code):dayExams.length+" exams"} on this date.`:tasks.length?`${tasks.length} ${tasks.length===1?"task":"tasks"} saved for this day.`:"Nothing scheduled—this day is open.";
  $("#dayAgenda").innerHTML=agendaHtml(classes,tasks,dayExams);
  const used=[...new Set([...state.classes.filter(c=>c.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(c=>canonical(c.code)),...exams.filter(exam=>exam.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(exam=>canonical(exam.code))])];
  $("#calendarLegend").innerHTML=used.map(c=>`<span class="legend-item" style="--course:${colorFor(c)}"><i></i>${esc(c)}</span>`).join("")+(exams.some(exam=>exam.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`))?'<span class="legend-item exam"><i></i>Exam</span>':"")+(state.tasks.some(task=>task.date?.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)&&!task.completed)?'<span class="legend-item task"><i></i>Task</span>':"");
  bindTaskRows($("#dayAgenda"));
  updateAgendaControls(classes);
  renderPlannerWeek();
}
function shiftSelectedDate(delta){const day=new Date(`${state.selectedDate}T12:00:00+05:30`);day.setDate(day.getDate()+delta);state.selectedDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(day);state.calendarMonth=new Date(day.getFullYear(),day.getMonth(),1);const agenda=$("#dayAgenda");if(agenda){agenda.classList.remove("slide-prev","slide-next");agenda.classList.add(delta>0?"slide-next":"slide-prev")}renderCalendar();requestAnimationFrame(()=>requestAnimationFrame(()=>agenda?.classList.remove("slide-prev","slide-next")))}
function upcomingClasses(code=""){const now=new Date(),wanted=canonical(code);return state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"startTime")>now&&(!wanted||canonical(c.code)===wanted)).sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"))}
function nextSubjectClass(code,afterIdentity=""){
  const wanted=canonical(code);if(!wanted)return null;
  let after=Date.now();
  if(afterIdentity){const active=state.classes.find(c=>classIdentity(c)===afterIdentity);if(active)after=dateTime(active,"startTime").getTime()}
  return state.classes.filter(c=>c.status!=="Cancelled"&&canonical(c.code)===wanted&&dateTime(c,"startTime").getTime()>after).sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"))[0]||null
}
function scrollToPlannerClass(c,{announce=true}={}){
  if(!c){if(announce)showToast("No upcoming classes scheduled");return}
  showPage("planner");setPlannerView("calendar");state.selectedDate=c.dateIso;const date=new Date(`${c.dateIso}T12:00:00+05:30`);state.calendarMonth=new Date(date.getFullYear(),date.getMonth(),1);renderCalendar();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const identity=classIdentity(c),card=$$("[data-class-id]").find(element=>element.dataset.classId===identity);card?.scrollIntoView({behavior:"smooth",block:"center"});card?.classList.add("planner-target");setTimeout(()=>card?.classList.remove("planner-target"),1800)}))
}
function scrollTodayFocus(){
  const now=new Date(),today=isoToday(),classes=state.classes.filter(c=>c.dateIso===today&&c.status!=="Cancelled").sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime")),target=classes.find(c=>now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime"))||classes.find(c=>dateTime(c,"startTime")>now);
  showPage("planner");setPlannerView("calendar");state.selectedDate=today;state.calendarMonth=new Date(now.getFullYear(),now.getMonth(),1);renderCalendar();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const identity=target?classIdentity(target):"",card=target?$$('[data-class-id]').find(element=>element.dataset.classId===identity):$("#dayAgenda");card?.scrollIntoView({behavior:"smooth",block:target?"center":"start"});if(target){card.classList.add("planner-target");setTimeout(()=>card.classList.remove("planner-target"),1800)}else showToast(classes.length?"Today’s classes are complete":"No classes scheduled today")}))
}
function updateNextSubjectLookup(){
  const select=$("#nextSubjectSelect"),result=$("#nextSubjectResult");if(!select||!result)return;
  const code=select.value,next=nextSubjectClass(code);
  result.hidden=!code;
  result.disabled=!next;
  $("#nextSubjectResultLabel").textContent=code?`Next ${code}`:"Next class";
  $("#nextSubjectResultValue").textContent=next?`${fmtDate(next.dateIso,{weekday:"short",day:"numeric",month:"short"})} · ${fmtTime(next.startTime)}`:"No future class scheduled";
  $("#nextSubjectResultMeta").textContent=next?`${venueOf(next)} · ${next.course}`:"";
  result.dataset.classId=next?classIdentity(next):""
}
function updateAgendaControls(classes=[]){
  const past=state.selectedDate<isoToday(),completed=classes.filter(c=>agendaStatus(c)==="Done").length,only=$("#onlyUpcomingClasses"),toggle=$("#toggleCompletedClasses"),jump=$("#jumpNextClass");
  if(only){const active=Boolean(state.ui.onlyUpcoming);only.disabled=past;only.classList.toggle("is-active",active);only.classList.toggle("is-disabled",past);only.setAttribute("aria-pressed",String(active));only.setAttribute("title",past?"Upcoming filtering is unavailable for past dates":active?"Show all scheduled classes":"Show only future, non-cancelled classes");const label=only.querySelector(".agenda-filter-label");if(label)label.textContent=active?"Upcoming only":"Upcoming"}
  if(toggle){toggle.hidden=!completed;toggle.disabled=Boolean(state.ui.onlyUpcoming&&!past);toggle.querySelector("span:last-child").textContent=state.ui.completedCollapsed?`Show completed (${completed})`:"Collapse completed"}
  if(jump)jump.disabled=!upcomingClasses().length;
  updateNextSubjectLookup()
}
window.BL07NextSubject=(code,afterIdentity="")=>{const c=nextSubjectClass(code,afterIdentity);return c?{id:classIdentity(c),code:canonical(c.code),date:fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"}),time:fmtTime(c.startTime),venue:venueOf(c),course:c.course}:null};
window.BL07OpenPlannerClass=id=>{const c=state.classes.find(item=>classIdentity(item)===id);if(c)scrollToPlannerClass(c)};
function renderCourseOptions(){const selected=new Set((state.profile.electives||[]).map(canonical));const seen=new Set(),courses=[];state.all.forEach(c=>{const code=canonical(c.baseCode||c.code);const allowed=c.type==="Core"?c.section===state.profile.section:selected.has(code);if(allowed&&!seen.has(code)){seen.add(code);courses.push({code,course:c.course})}});const o=courses.sort((a,b)=>a.course.localeCompare(b.course)).map(e=>`<option value="${esc(e.code)}">${esc(e.code)} · ${esc(e.course)}</option>`).join("");["#quickTaskCourse","#taskCourse","#noteCourse"].forEach(s=>{const el=$(s);if(el)el.innerHTML='<option value="">General</option>'+o});const subject=$("#nextSubjectSelect");if(subject){const current=subject.value;subject.innerHTML='<option value="">Choose a subject</option>'+o;subject.value=[...subject.options].some(option=>option.value===current)?current:"";updateNextSubjectLookup()}}
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
function renderTasks(){const t=isoToday();let a=state.tasks;if(state.taskFilter==="open")a=a.filter(x=>!x.completed);if(state.taskFilter==="today")a=a.filter(x=>!x.completed&&x.date===t);if(state.taskFilter==="upcoming")a=a.filter(x=>!x.completed&&x.date&&x.date>t);if(state.taskFilter==="completed")a=a.filter(x=>x.completed);$("#taskList").innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state">Nothing here.</div>';bindTaskRows($("#taskList"));updatePlannerTabBadges()}
function renderNotes(){const q=$("#noteSearch").value.toLowerCase(),a=state.notes.filter(n=>(n.title+" "+n.body+" "+n.course).toLowerCase().includes(q));$("#noteList").innerHTML=a.length?a.map(n=>`<article class="note-card" data-note="${n.id}"><header><div><small>${esc(n.course||"GENERAL")}</small><h3>${esc(n.title)}</h3></div><button class="delete-button">×</button></header><p>${esc(n.body)}</p></article>`).join(""):'<div class="empty-state">No notes yet.</div>';$$(".note-card .delete-button").forEach(b=>b.addEventListener("click",()=>{state.notes=state.notes.filter(n=>n.id!==b.closest(".note-card").dataset.note);save(KEYS.notes,state.notes);renderNotes()}));updatePlannerTabBadges()}
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
  el.addEventListener("pointerdown",start,{passive:true});
  el.addEventListener("pointerup",end);
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

function isIntermediateBusStop(bus,stop=state.busFrom){return routeStops(bus).indexOf(stop)>0}
function getRecentOriginDeparture(){
  const now=new Date();
  return window.CAMPUS_DATA.bus.filter(bus=>serviceSupports(bus,state.busFrom,state.busTo)&&isIntermediateBusStop(bus)).map(bus=>({b:bus,d:busDate(bus)})).filter(item=>item.d<=now).sort((a,b)=>b.d-a.d)[0]||null;
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
  const upcoming=getUpcomingBuses(),first=upcoming[0],recent=getRecentOriginDeparture(),uncertain=Boolean(recent),display=uncertain?recent:first;
  const now=new Date();
  const upcomingHeading=$("#upcomingBuses")?.closest(".panel")?.querySelector("h2");if(upcomingHeading)upcomingHeading.textContent="Next departures";
  const busContext=$("#busContextLine");
  if(busContext)busContext.textContent=uncertain?`Origin departure times shown · ${busStopLabel(state.busFrom)} arrival varies.`:upcoming.length?`${upcoming.length} upcoming direct ${upcoming.length===1?"service":"services"} from ${busStopLabel(state.busFrom)} to ${busStopLabel(state.busTo)}.`:`No upcoming direct service for this route.`;

  if(display){
    $("#nextBusEyebrow").textContent=uncertain?"NEXT ORIGIN DEPARTURE":"NEXT DEPARTURE";
    $("#nextBusTime").textContent=fmtTime((uncertain&&first?first:display).b.time);
    $("#nextBusRoute").textContent=
      `${busStopLabel(state.busFrom)} → ${busStopLabel(state.busTo)}`;
    $("#nextBusMeta").textContent=uncertain?`${busStopLabel(state.busFrom)} arrival varies`:isMainGateService(display.b)?"Main Gate service":"Campus shuttle";

    const countdownTarget=uncertain?first:display,remaining=countdownTarget?Math.max(0,Math.ceil((countdownTarget.d-now)/60000)):0;
    const nextDay=Boolean(countdownTarget&&(countdownTarget.d.getDate()!==now.getDate()||countdownTarget.d.getMonth()!==now.getMonth()));
    $("#nextBusCountdownLabel").textContent=uncertain?"LAST ORIGIN DEPARTURE":nextDay?"Leaves tomorrow in":"Leaves in";
    $("#nextBusDay").hidden=!nextDay;
    const countdownHint=$("#nextBusCountdownHint");
    if(uncertain){$("#nextBusCountdown").textContent=fmtTime(display.b.time);countdownHint.hidden=true}
    else{$("#nextBusCountdown").textContent=countdownTarget?(remaining>=60?`${Math.floor(remaining/60)}h ${remaining%60}m`:`${remaining} min`):"No more today";countdownHint.hidden=true}

    const stops=routeStops(display.b);
    const fromIndex=stops.indexOf(state.busFrom);
    const toIndex=stops.indexOf(state.busTo);

    $("#nextBusVisual").innerHTML=stops
      .slice(fromIndex,toIndex+1)
      .map(stop=>
        `<div class="route-stop"><i></i><span>${
          esc(busStopLabel(stop))
        }</span></div>`
      ).join("");
    $("#busArrivalNote").hidden=true;
  }else{
    $("#nextBusEyebrow").textContent="NEXT DEPARTURE";
    $("#nextBusTime").textContent="—";
    $("#nextBusRoute").textContent="No direct service";
    $("#nextBusMeta").textContent="Try another origin or destination";
    $("#nextBusCountdown").textContent="—";
    $("#nextBusCountdownLabel").textContent="Leaves in";
    $("#nextBusCountdownHint").hidden=true;
    $("#nextBusDay").hidden=true;
    $("#nextBusVisual").innerHTML="";
    $("#busArrivalNote").hidden=true;
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
  const mainGate=isMainGateService(bus),intermediate=isIntermediateBusStop(bus),now=new Date(),diff=Math.ceil((departure-now)/60000),isTomorrow=departure.getDate()!==now.getDate()||departure.getMonth()!==now.getMonth(),elapsed=diff<0,status=isTomorrow?"Tomorrow":intermediate?"Origin time":elapsed?"Departed":diff<=1?"Due":diff<=8?"Leaving soon":"On time";
  return`<article class="bus-row ${mainGate?"main-gate":""} ${elapsed?"elapsed":""}">
    <time>${esc(fmtTime(bus.time))}</time>
    <div>
      <strong>${esc(busStopLabel(state.busFrom))} → ${
        esc(busStopLabel(state.busTo))
      }</strong>
      <p>${esc(route)}</p>
      <div class="bus-row-tags"><span class="departure-status ${elapsed&&!intermediate?"departed":""}">${esc(status)}</span>${mainGate?'<span class="route-badge">MAIN GATE</span>':""}</div>
    </div>
  </article>`;
}

function renderMess(){const ds=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],hour=new Date().getHours(),liveMeal=hour<11?"breakfast":hour<16?"lunch":"dinner",todayKey=weekdayKey(new Date()),serving=state.messDay===todayKey&&state.meal===liveMeal;$("#messDayPills").innerHTML=ds.map(d=>`<button class="day-pill ${d===state.messDay?"active":""}" data-day="${d}">${d.slice(0,3).toUpperCase()}</button>`).join("");$$(".day-pill").forEach(b=>b.addEventListener("click",()=>{state.messDay=b.dataset.day;renderMess()}));$("#messDayTitle").textContent=state.messDay[0].toUpperCase()+state.messDay.slice(1);const servingState=$("#messServingState");if(servingState){servingState.textContent=serving?"Serving now":state.messDay===todayKey?`${liveMeal[0].toUpperCase()+liveMeal.slice(1)} is serving`:"Selected menu";servingState.classList.toggle("live",serving)}const messContext=$("#messContextLine");if(messContext)messContext.textContent=serving?`${state.meal[0].toUpperCase()+state.meal.slice(1)} is being served now.`:state.messDay===todayKey?`${liveMeal[0].toUpperCase()+liveMeal.slice(1)} is being served now · viewing ${state.meal}.`:`Viewing ${state.messDay[0].toUpperCase()+state.messDay.slice(1)} ${state.meal}.`;const menu=window.CAMPUS_DATA.mess[state.messDay],items=menu[state.meal]||[],nv=/chicken|fish|egg|omelette/i,sw=/gulab|halwa|ice cream|kheer|custard|badusha/i,non=items.filter(i=>nv.test(i)),sweet=items.filter(i=>sw.test(i)),veg=items.filter(i=>!nv.test(i)&&!sw.test(i));$("#messMenu").innerHTML=`<article class="meal-hero"><div class="meal-hero-title"><span>${serving?"NOW SERVING":"MENU"}</span><h3>${state.meal[0].toUpperCase()+state.meal.slice(1)}</h3></div>${veg.length?`<section class="food-section veg-section"><div class="food-section-title">Vegetarian</div><div class="food-items">${veg.map(i=>`<div class="food-item veg">${esc(i)}</div>`).join("")}</div></section>`:""}${non.length?`<section class="food-section nonveg-section"><div class="food-section-title">Non-vegetarian</div><div class="food-items">${non.map(i=>`<div class="food-item nonveg">${esc(i)}</div>`).join("")}</div></section>`:""}${sweet.length?`<section class="food-section sweet-section"><div class="food-section-title">Dessert / Sweet</div><div class="food-items">${sweet.map(i=>`<div class="food-item sweet">${esc(i)}</div>`).join("")}</div></section>`:""}</article>`;$$(".meal-tab").forEach(b=>{b.classList.toggle("active",b.dataset.meal===state.meal);b.classList.toggle("serving",b.dataset.meal===liveMeal&&state.messDay===todayKey)})}
function renderCourseProgress(){
  const root=$("#courseProgressGrid");if(!root)return;
  const courses=new Map();state.classes.forEach(c=>{const code=canonical(c.code);if(!courses.has(code))courses.set(code,c.course)});
  const entries=[...courses].sort(([a],[b])=>a.localeCompare(b)).map(([code,course])=>({code,course,progress:subjectSessionProgress(code)}));
  const completed=entries.reduce((sum,item)=>sum+item.progress.completed,0),remaining=entries.reduce((sum,item)=>sum+item.progress.remaining,0);
  if($("#profileTotalCompleted"))$("#profileTotalCompleted").textContent=completed;
  if($("#profileTotalRemaining"))$("#profileTotalRemaining").textContent=`${remaining} remaining`;
  root.innerHTML=entries.map(({code,course,progress})=>{const percent=Math.min(100,Math.round(progress.completed/SESSION_TARGET*100));return`<article class="course-progress-item" style="--course:${colorFor(code)};--session-progress:${percent}%" title="${esc(course)}"><div class="course-progress-ring"><strong>${progress.completed}</strong><span>/${SESSION_TARGET}</span></div><div><span class="course-progress-code">${esc(code)}</span><strong>${esc(course)}</strong><p>${progress.remaining} sessions left</p></div></article>`}).join("")||'<div class="empty-state">Course progress will appear after the schedule loads.</div>';
}
function renderProfile(){const syncText=state.lastUpdated?`Synced ${relativeTime(state.lastUpdated)}`:"Schedule not synced",syncSummary=$("#profileSyncStatus");$("#profileName").value=state.profile.name||"";$("#profileSection").value=state.profile.section||"A";$("#profileTheme").value=state.profile.theme||"system";$("#profileDisplayName").textContent=state.profile.name||"Student";$("#profileSummary").textContent=`PGPBL · Section ${state.profile.section||"A"}`;$("#profileAvatar").textContent=initials(state.profile.name);if(syncSummary){syncSummary.textContent=syncText;syncSummary.classList.toggle("synced",Boolean(state.lastUpdated))}$("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";const selected=new Set((state.profile.electives||[]).map(canonical)),items=(state.electives||[]).filter(e=>selected.has(canonical(e.code)));const chips=$("#selectedElectiveChips");if(chips)chips.innerHTML=items.length?items.map(e=>`<span title="${esc(e.course)}"><b>${esc(e.code)}</b>${esc(e.course)}</span>`).join(""):'<em>No electives selected</em>';renderCourseProgress()}
function renderNotifications(){
  const active=pruneNotifications().sort((a,b)=>`${a.dateIso||""}|${a.startTime||""}`.localeCompare(`${b.dateIso||""}|${b.startTime||""}`)||(a.type==="cancelled"?-1:a.type==="added"?0:1)-(b.type==="cancelled"?-1:b.type==="added"?0:1)),unread=active.filter(n=>!n.read).length;$("#notificationBadge").hidden=!unread;$("#notificationBadge").textContent=unread;
  const headCopy=$("#notificationHeadCopy");if(headCopy)headCopy.textContent=active.length?`${active.length} active ${active.length===1?"change":"changes"}${unread?` · ${unread} unread`:""}`:"Your upcoming schedule is unchanged.";
  const mark=$("#markNotificationsRead");if(mark)mark.hidden=!unread;
  $$("[data-notification-filter]").forEach(button=>button.classList.toggle("active",button.dataset.notificationFilter===state.notificationFilter));
  const filtered=active.filter(n=>state.notificationFilter==="all"||state.notificationFilter==="added"&&n.type==="added"||state.notificationFilter==="changes"&&n.type!=="added");
  if(!filtered.length){$("#notificationList").innerHTML=`<div class="empty-state notification-empty"><span class="notification-empty-icon">✓</span><strong>All caught up</strong><span>${active.length?"No updates match this filter.":"New schedule changes will appear here."}</span></div>`;return}
  const typeLabel=n=>n.type==="added"?"Added":n.type==="cancelled"?"Cancelled":"Venue";
  $("#notificationList").innerHTML=`<section class="notification-group schedule-change-group"><div class="notification-group-heading"><span>SCHEDULE CHANGES</span><strong>${filtered.length}</strong></div>${filtered.map(n=>`<article class="notification-item notification-${esc(n.type)} ${n.read?"":"unread"}" style="--course:${colorFor(n.course)}"><div class="notification-item-copy"><div class="notification-item-kicker"><span class="notification-course-mark">${esc(canonical(n.course||n.code).slice(0,4))}</span><span class="notification-type">${typeLabel(n)}</span></div><strong>${esc(n.title)}</strong><p>${esc(n.text)}</p><button type="button" class="notification-open-date" data-notification-date="${esc(n.dateIso||"")}">Open in Planner <span aria-hidden="true">→</span></button></div><button class="notification-dismiss" type="button" data-dismiss-notification="${esc(n.id)}" aria-label="Dismiss ${esc(n.title)}">${icon("close")}</button></article>`).join("")}</section>`;
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
  $("#tasksQuickButton")?.addEventListener("click",()=>{showPage("planner");setPlannerView("tasks")});
  $("#timelineDaySwitch").addEventListener("click",e=>{const b=e.target.closest("[data-timeline-day]");if(!b)return;setTimelineDay(b.dataset.timelineDay,"auto")});
  const openHeroPlannerTarget=element=>{const id=element?.dataset.classId||$("#focusPanel")?.dataset.focusClassId,c=state.classes.find(item=>classIdentity(item)===id);if(c)scrollToPlannerClass(c);else{const iso=$("#focusPanel")?.dataset.focusDate;if(iso)openPlannerDate(iso)}};
  [$("#focusPosition"),$("#focusCountdownAction"),$("#heroLiveProgress")].forEach(element=>{element?.addEventListener("click",event=>{event.stopPropagation();openHeroPlannerTarget(event.currentTarget)});element?.addEventListener("keydown",event=>{if(!["Enter"," "].includes(event.key))return;event.preventDefault();event.currentTarget.click()})});
  $("#focusFinalInsight")?.addEventListener("click",event=>{if(event.currentTarget.getAttribute("role")!=="button")return;event.stopPropagation();openHeroPlannerTarget(event.currentTarget)});$("#focusFinalInsight")?.addEventListener("keydown",event=>{if(event.currentTarget.getAttribute("role")!=="button"||!["Enter"," "].includes(event.key))return;event.preventDefault();event.currentTarget.click()});
  $("#focusCourseAction")?.addEventListener("keydown",event=>{if(!["Enter"," "].includes(event.key))return;event.preventDefault();event.currentTarget.click()});
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
  document.addEventListener("scroll",hideCalendarTooltip,true);
  window.addEventListener("resize",hideCalendarTooltip,{passive:true});
  $("#appStateAction")?.addEventListener("click",()=>location.reload());
  $$(".subtab[data-planner-tab]").forEach(b=>b.addEventListener("click",()=>setPlannerView(b.dataset.plannerTab)));
  $$('[data-open-exams]').forEach(button=>button.addEventListener("click",openExamPlanner));
  $("#examSchedule")?.addEventListener("click",event=>{const prep=event.target.closest("[data-exam-prep]");if(prep){editingTaskId=null;$("#taskTitle").value=`Prepare for ${prep.dataset.examCode} exam`;$("#taskCourse").value=canonical(prep.dataset.examCode);$("#taskDate").value=prep.dataset.examPrep;$("#taskDialog h2").textContent="Add preparation task";$("#saveTaskButton").textContent="Save";clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal();return}const button=event.target.closest("[data-exam-date]");if(button)openPlannerDate(button.dataset.examDate)});
  $$(".subtab[data-campus-tab]").forEach(b=>b.addEventListener("click",()=>setCampusView(b.dataset.campusTab)));
  $("#prevMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderCalendar()});$("#nextMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderCalendar()});$("#todayButton").addEventListener("click",scrollTodayFocus);
  $("#plannerWeekDays")?.addEventListener("click",event=>{const day=event.target.closest("[data-week-date]");if(!day)return;state.selectedDate=day.dataset.weekDate;const date=new Date(`${state.selectedDate}T12:00:00+05:30`);state.calendarMonth=new Date(date.getFullYear(),date.getMonth(),1);renderCalendar()});
  $("#prevWeek")?.addEventListener("click",()=>shiftSelectedDate(-7));$("#nextWeek")?.addEventListener("click",()=>shiftSelectedDate(7));$("#weekTodayButton")?.addEventListener("click",scrollTodayFocus);
  $("#toggleMonthView")?.addEventListener("click",event=>setPlannerMonthView(event.currentTarget.getAttribute("aria-expanded")!=="true"));
  $("#closeMonthView")?.addEventListener("click",()=>setPlannerMonthView(false));
  $("#agendaPrevDay").addEventListener("click",()=>shiftSelectedDate(-1));$("#agendaNextDay").addEventListener("click",()=>shiftSelectedDate(1));
  $("#agendaBackToday")?.addEventListener("click",scrollTodayFocus);
  $("#jumpNextClass")?.addEventListener("click",()=>scrollToPlannerClass(upcomingClasses()[0]||null));
  $("#toggleCompletedClasses")?.addEventListener("click",()=>{state.ui.completedCollapsed=!state.ui.completedCollapsed;saveUi();renderCalendar()});
  $("#onlyUpcomingClasses")?.addEventListener("click",()=>{state.ui.onlyUpcoming=!state.ui.onlyUpcoming;saveUi();renderCalendar()});
  $("#nextSubjectSelect")?.addEventListener("change",updateNextSubjectLookup);
  $("#nextSubjectResult")?.addEventListener("click",event=>{const c=state.classes.find(item=>classIdentity(item)===event.currentTarget.dataset.classId);if(c)scrollToPlannerClass(c)});
  bindSwipeGesture($("#dayAgenda"),direction=>shiftSelectedDate(direction==="left"?1:-1),{ignore:"button,a,input,select,textarea",threshold:46});
  bindSwipeGesture($("#plannerWeekNavigator"),direction=>shiftSelectedDate(direction==="left"?7:-7),{ignore:"input,select,textarea,a",threshold:44});
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
  $("#toggleProfileGuide")?.addEventListener("click",e=>{const panel=e.currentTarget.closest(".profile-features-panel"),collapsed=panel.classList.toggle("guide-collapsed");e.currentTarget.setAttribute("aria-expanded",String(!collapsed));e.currentTarget.setAttribute("aria-label",collapsed?"Expand app guide":"Collapse app guide")});
  $("#busFrom").addEventListener("change",()=>{state.busFrom=$("#busFrom").value;renderBusControls();renderBuses()});$("#busTo").addEventListener("change",()=>{state.busTo=$("#busTo").value;renderBusControls();renderBuses()});$("#swapBusRoute").addEventListener("click",()=>{[state.busFrom,state.busTo]=[state.busTo,state.busFrom];renderBusControls();renderBuses()});$("#toggleFullBus").addEventListener("click",()=>{const l=$("#fullBusList"),c=l.classList.toggle("collapsed");$("#toggleFullBus").textContent=c?"Show all":"Collapse"});$("#mealTabs").addEventListener("click",e=>{const b=e.target.closest("[data-meal]");if(!b)return;state.meal=b.dataset.meal;renderMess()});$("#closeShortcutDialog").addEventListener("click",()=>$("#shortcutDialog").close());document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)||document.querySelector("dialog[open]"))return;const plannerCalendar=$("#plannerPage")?.classList.contains("active")&&$('[data-planner-view="calendar"]')?.classList.contains("active");if(plannerCalendar&&e.key==="ArrowLeft"){e.preventDefault();shiftSelectedDate(-1);return}if(plannerCalendar&&e.key==="ArrowRight"){e.preventDefault();shiftSelectedDate(1);return}const k=e.key.toLowerCase();if(k==="h")showPage("home");else if(k==="p")showPage("planner");else if(k==="c")showPage("campus");else if(k==="r")syncSchedule(true);else if(k==="n")openNotifications();else if(e.key==="?")$("#shortcutDialog").showModal()});
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
  if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js?v=20260825-system7",{updateViaCache:"none"}).then(reg=>{const announce=worker=>{if(!worker)return;worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)setAppState("update","A newer dashboard version is ready.")})};announce(reg.installing);reg.addEventListener("updatefound",()=>announce(reg.installing))}).catch(console.error)
}
document.addEventListener("DOMContentLoaded",init);
})();


