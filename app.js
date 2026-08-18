(() => {
"use strict";
const API="https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec";
const KEYS={profile:"classbl07-nova-profile-v1",tasks:"classbl07-nova-tasks-v1",notes:"classbl07-nova-notes-v1",cache:"classbl07-nova-schedule-v1",snapshot:"classbl07-nova-snapshot-v1",notifications:"classbl07-nova-notifications-v1",onboarded:"bl07_onboarded_v2"};
const COURSE_COLORS={SM:"#8b7cf6",DBST:"#5b8def",AIB:"#24b3a8",OS:"#f29a52",CV:"#36b5d8",PM:"#6f7bea",POM:"#ee7656",CB:"#d866ad",SBM:"#d6a43b",NWW:"#b07c59",MAAS:"#8f66cf",ACC:"#e15d69"};
const HOLIDAYS=Object.freeze({"2026-08-15":"Independence Day"});
window.BL07_HOLIDAYS=HOLIDAYS;
const state={all:[],classes:[],electives:[],profile:load(KEYS.profile,{name:"",section:"A",electives:[],theme:"system",homeOrder:"summary-first"}),tasks:load(KEYS.tasks,[]),notes:load(KEYS.notes,[]),notifications:load(KEYS.notifications,[]),selectedDate:isoToday(),calendarMonth:new Date(new Date().getFullYear(),new Date().getMonth(),1),taskFilter:"open",ledgerFilter:"all",messDay:weekdayKey(new Date()),meal:"breakfast",busFrom:"C&D Housing",busTo:"PGP Auditorium",timelineDay:"today",lastUpdated:null,calendarHighlight:null};
let editingTaskId=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const canonical=c=>String(c||"").toUpperCase().replace(/^NWLB$/,"NWW").split("-")[0];
const colorFor=c=>COURSE_COLORS[canonical(c)]||"#7b8aa2";
const venueOf=c=>c.venue||c.room||"Venue TBA";
function load(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function showToast(message){let toast=$("#appToast");if(!toast){toast=document.createElement("div");toast.id="appToast";toast.className="app-toast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");document.body.appendChild(toast)}toast.textContent=message;toast.classList.remove("show");requestAnimationFrame(()=>toast.classList.add("show"));clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400)}
function istParts(date=new Date()){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23",weekday:"long"}).formatToParts(date);return Object.fromEntries(parts.map(p=>[p.type,p.value]))}
function isoToday(){const p=istParts();return`${p.year}-${p.month}-${p.day}`}
function weekdayKey(d=new Date()){return istParts(d).weekday.toLowerCase()}
function minutes(t){const[h,m]=String(t||"00:00").split(":").map(Number);return h*60+m}
function dateTime(c,w="startTime"){return new Date(`${c.dateIso}T${c[w]||c[w==="startTime"?"start":"end"]}:00+05:30`)}
function fmtTime(t){const[h,m]=t.split(":").map(Number);return new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit"}).format(new Date(2026,0,1,h,m))}
function fmtRange(a,b){return`${fmtTime(a)}–${fmtTime(b)}`}
/* 24h digits for the split-flap hero (independent of the localized fmtTime above) */
function flapDigits(t){const[h,m]=String(t||"00:00").split(":").map(Number);return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`}
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
close:'<path d="m6 6 12 12M18 6 6 18"/>',swap:'<path d="M7 7h11l-3-3M17 17H6l3 3"/>',sunrise:'<path d="M4 18h16M6 14a6 6 0 0 1 12 0M12 3v4"/>',moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'
};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name]||""}</svg>`}
function renderIcons(){$$("[data-icon]").forEach(el=>{el.innerHTML=icon(el.dataset.icon)})}
function applyTheme(){const pref=state.profile.theme||"system",t=pref==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):pref;document.documentElement.dataset.theme=t;$('meta[name="theme-color"]').content=t==="dark"?"#1c1712":"#efe7d8"}
function filteredClasses(){const selected=new Set((state.profile.electives||[]).map(canonical));return state.all.filter(c=>c.type==="Core"?(state.profile.section==="A"?c.section==="A":c.section==="B"):selected.has(canonical(c.baseCode||c.code)))}
function migrateProfile(){state.profile.electives=[...new Set((state.profile.electives||[]).map(canonical))];save(KEYS.profile,state.profile)}
function classKey(c){return`${classIdentity(c)}|${c.endTime||""}|${venueOf(c)}`}
function classIdentity(c){return`${c.dateIso}|${c.startTime}|${canonical(c.code)}`}
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
  newList.forEach(c=>{const old=oldMap.get(classIdentity(c));if(!old&&c.status!=="Cancelled"&&dateTime(c,"endTime")>new Date())out.push({id:crypto.randomUUID(),classId:classIdentity(c),type:"added",code:c.code,title:`${c.code} class added`,text:`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)} · ${venueOf(c)}`,course:canonical(c.code),createdAt:Date.now(),read:false});else if(old&&old.status!=="Cancelled"&&c.status==="Cancelled")out.push({id:crypto.randomUUID(),classId:classIdentity(c),type:"cancelled",code:c.code,title:`${c.code} class cancelled`,text:`${fmtDate(c.dateIso,{day:"numeric",month:"short"})} · ${fmtTime(c.startTime)}`,course:canonical(c.code),createdAt:Date.now(),read:false})});
  return out.slice(0,12)
}
let _syncInFlight=false,_lastSyncAt=0;
async function syncSchedule(force=false){
  if(_syncInFlight)return;
  if(!force&&Date.now()-_lastSyncAt<30000)return;
  _syncInFlight=true;
  const pill=$("#syncPill"),refreshBtn=$("#refreshButton");
  if(pill){pill.className="sync-pill syncing";pill.innerHTML="<i></i><span>Checking</span>"}
  if(refreshBtn){refreshBtn.dataset.state="syncing";refreshBtn.setAttribute("aria-busy","true")}
  try{
    const u=new URL(API);u.searchParams.set("section",state.profile.section||"A");u.searchParams.set("electives",(state.profile.electives||[]).join(","));u.searchParams.set("includeCancelled","true");if(force)u.searchParams.set("_",Date.now());
    const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(!d.success)throw new Error(d.error||"API failed");
    const previous=load(KEYS.snapshot,[]),changes=compareSnapshots(previous,d.classes||[]);
    if(changes.length){state.notifications=[...changes,...state.notifications].slice(0,40);save(KEYS.notifications,state.notifications)}
    state.all=d.classes||[];state.electives=d.availableElectives||[];state.lastUpdated=d.updatedAt;save(KEYS.cache,{all:state.all,electives:state.electives,lastUpdated:state.lastUpdated});save(KEYS.snapshot,state.all);state.classes=filteredClasses();
    _lastSyncAt=Date.now();
    if(pill){pill.className="sync-pill ok";pill.innerHTML="<i></i><span>Updated now</span>"}
  }catch(e){
    const c=load(KEYS.cache,null);
    if(c){state.all=c.all||[];state.electives=c.electives||[];state.lastUpdated=c.lastUpdated;state.classes=filteredClasses()}
    if(pill){pill.className="sync-pill error";pill.innerHTML="<i></i><span>Offline</span>"}
    console.error(e);
  }finally{
    _syncInFlight=false;
    if(refreshBtn){refreshBtn.dataset.state="";refreshBtn.setAttribute("aria-busy","false")}
  }
  state.scheduleLoading=false;
  renderAll();
}
function scheduleIdleSync(){
  const run=()=>syncSchedule(false);
  if("requestIdleCallback"in window)requestIdleCallback(run,{timeout:2500});
  else setTimeout(run,1200);
}
function showPage(n){if(n==="home")state.timelineDay="today";$$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===n));$$("[data-page-target]").forEach(b=>b.classList.toggle("active",b.dataset.pageTarget===n));scrollTo({top:0,behavior:"auto"});if(n==="home")renderHome();if(n==="campus")renderCampus();if(n==="calendar")renderCalendar()}
function openCalendarPage(iso){if(iso){state.selectedDate=iso;const d=new Date(`${iso}T12:00:00+05:30`);state.calendarMonth=new Date(d.getFullYear(),d.getMonth(),1)}showPage("calendar")}
function renderDateStrip(){
  const el=$("#dateStrip");if(!el)return;
  const today=new Date(`${isoToday()}T12:00:00+05:30`),monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
  const labels=["MON","TUE","WED","THU","FRI","SAT","SUN"];let html="";
  for(let i=0;i<7;i++){
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    const iso=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
    const isToday=iso===isoToday(),count=state.classes.filter(c=>c.dateIso===iso&&c.status!=="Cancelled").length;
    html+=`<button class="date-pill ${isToday?"today":""}" data-date="${iso}"><span class="dow">${labels[i]}</span><span class="dnum">${d.getDate()}</span>${count?'<i class="dot"></i>':""}</button>`;
  }
  el.innerHTML=html;
  $$(".date-pill",el).forEach(b=>b.addEventListener("click",()=>openCalendarPage(b.dataset.date)));
}
function renderAll(){migrateProfile();state.classes=filteredClasses();renderProfile();renderCourseOptions();renderHome();renderCalendar();renderTasks();renderNotes();renderLedger();renderCampus();renderNotifications();renderIcons()}
function decorateTimelineDay(selector,classes,iso){
  const rail=$(selector),list=rail?.querySelector(".vertical-day-timeline");if(!rail)return;
  rail.querySelectorAll(".free-window-row,.timeline-holiday-banner").forEach(node=>node.remove());
  const holiday=HOLIDAYS[iso];
  if(holiday){const banner=document.createElement("div");banner.className="timeline-holiday-banner";banner.innerHTML=`<span>HOLIDAY</span><strong>${esc(holiday)}</strong>`;rail.prepend(banner)}
  if(!list)return;
  const cards=[...list.querySelectorAll(".vertical-class")];let previous=null;
  classes.forEach((current,index)=>{
    if(current.status==="Cancelled")return;
    if(previous){const gap=minutes(current.startTime)-minutes(previous.endTime);if(gap>=45){const row=document.createElement("div"),isLunch=minutes(previous.endTime)<=14*60+30&&minutes(current.startTime)>=13*60+30;row.className="free-window-row";row.innerHTML=`<span>${isLunch?"LUNCH + FREE TIME":"FREE WINDOW"}</span><strong>${esc(fmtTime(previous.endTime))} - ${esc(fmtTime(current.startTime))}</strong><small>${esc(compactDuration(gap))}</small>`;cards[index]?.before(row)}}
    previous=current;
  });
}
/* Split-flap tile builder for the hero — mechanical digit tiles, colon flap included. */
function buildFlapTiles(el,text){
  if(!el)return;
  el.innerHTML=[...text].map(ch=>`<div class="flap${ch===":"?" colon":""}">${esc(ch)}</div>`).join("");
}
function tagCountdown(totalMins){
  const m=Math.max(0,Math.round(totalMins));
  return m>=60?`${Math.floor(m/60)}H${m%60?String(m%60).padStart(2,"0")+"M":""}`:`${m}M`;
}
function renderHome(){
  $("#focusPanel")?.classList.toggle("is-loading",!!state.scheduleLoading);
  $$(".stat-tile").forEach(t=>t.classList.toggle("is-loading",!!state.scheduleLoading));
  $("#weekHeatmap")?.classList.toggle("is-loading",!!state.scheduleLoading);
  const now=new Date(),today=isoToday();$("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(now).toUpperCase();$("#dateOrbitDay").textContent=String(now.getDate()).padStart(2,"0");$("#dateOrbitMonth").textContent=new Intl.DateTimeFormat("en-IN",{month:"short"}).format(now).toUpperCase();const h=now.getHours(),firstName=String(state.profile.name||"").trim().split(/\s+/)[0],dayGreeting=`Good ${h<12?"morning":h<17?"afternoon":"evening"}`;$("#greeting").textContent=firstName?`${dayGreeting}, ${firstName}.`:`${dayGreeting}.`;
  const scheduled=state.classes.filter(c=>c.status!=="Cancelled").sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"));
  const todays=scheduled.filter(c=>c.dateIso===today),current=todays.find(c=>now>=dateTime(c,"startTime")&&now<dateTime(c,"endTime")),todayNext=todays.find(c=>now<dateTime(c,"startTime")),future=scheduled.find(c=>now<dateTime(c,"startTime")),focus=current||todayNext||future;
  const onBreak=!current&&!!todayNext&&todays.some(c=>dateTime(c,"endTime")<=now);
  const focusPanel=$("#focusPanel"),todayLeft=todays.filter(c=>dateTime(c,"endTime")>now).length;
  if(focus){
    const isNow=focus===current,isToday=focus.dateIso===today,isTomorrow=focus.dateIso===tomorrowIso();
    focusPanel.classList.remove("is-empty");focusPanel.classList.toggle("is-live",isNow);focusPanel.classList.toggle("is-upcoming",!isNow&&isToday);focusPanel.classList.toggle("is-future",!isToday);focusPanel.classList.toggle("is-break",onBreak);focusPanel.style.setProperty("--focus-course",colorFor(focus.code));focusPanel.dataset.focusDate=focus.dateIso;focusPanel.dataset.focusCourse=canonical(focus.code);
    focusPanel.classList.toggle("has-focus",true);
    buildFlapTiles($("#focusFlapRow"),flapDigits(focus.startTime));
    $("#focusPulse").style.display=isNow?"":"none";
    $("#focusEmptyIcon").hidden=true;
    $("#focusKicker").textContent=isNow?"IN PROGRESS":onBreak?`ON A BREAK · NEXT IN ${tagCountdown((dateTime(focus,"startTime")-now)/60000)}`:isToday?`STARTS IN ${tagCountdown((dateTime(focus,"startTime")-now)/60000)}`:isTomorrow?"TOMORROW":`UPCOMING · ${fmtDate(focus.dateIso,{day:"numeric",month:"short"})}`;
    $("#focusCode").hidden=false;$("#focusCode").textContent=canonical(focus.code);$("#focusTitle").textContent=focus.course;
    $("#focusRange").textContent=fmtRange(focus.startTime,focus.endTime);
    const progressBox=$("#heroProgress");
    if(isNow){const pct=Math.max(0,Math.min(100,((now-dateTime(focus,"startTime"))/(dateTime(focus,"endTime")-dateTime(focus,"startTime")))*100));progressBox.hidden=false;$("#heroProgressFill").style.width=`${pct}%`}
    else progressBox.hidden=true;
    $("#focusVenue").textContent=venueOf(focus);$("#focusFaculty").textContent=focus.faculty;$("#heroAddTask").hidden=false;
    const nextStripClass=scheduled[scheduled.indexOf(focus)+1];
    $("#heroNextInfo").textContent=nextStripClass?`${canonical(nextStripClass.code)} · ${fmtRange(nextStripClass.startTime,nextStripClass.endTime)} · ${venueOf(nextStripClass)}`:"None left";
    $("#heroLeftToday").textContent=`${todayLeft} ${todayLeft===1?"class":"classes"}`;
  }
  else{
    focusPanel.classList.add("is-empty");focusPanel.classList.remove("is-live","is-upcoming","is-future","is-break","has-focus");focusPanel.style.removeProperty("--focus-course");delete focusPanel.dataset.focusDate;
    buildFlapTiles($("#focusFlapRow"),"--:--");
    $("#focusPulse").style.display="none";
    $("#focusKicker").textContent=todays.length?"ALL DONE TODAY":"ALL CLEAR";
    $("#focusCode").hidden=true;
    const emptyIcon=$("#focusEmptyIcon");if(emptyIcon){emptyIcon.hidden=false;emptyIcon.innerHTML=icon(todays.length?"check":"moon")}
    $("#focusTitle").textContent=todays.length?"You're all done for today":"No classes today";
    $("#focusRange").textContent="—";$("#focusVenue").textContent="—";$("#focusFaculty").textContent="Open the calendar to look ahead";$("#heroAddTask").hidden=true;$("#heroProgress").hidden=true;
    $("#heroNextInfo").textContent="None left";$("#heroLeftToday").textContent=`${todayLeft} ${todayLeft===1?"class":"classes"}`;
  }
  const glance=$("#heroDayGlance"),todaysAll=state.classes.filter(c=>c.dateIso===today).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  if(glance){
    glance.hidden=!todaysAll.length;
    glance.innerHTML=todaysAll.map(c=>{
      const st=c.status==="Cancelled"?"cancelled":now>=dateTime(c,"endTime")?"done":now>=dateTime(c,"startTime")?"current":"upcoming";
      return`<span class="dot ${st}" style="--course:${colorFor(c.code)}" title="${esc(c.code)} · ${esc(fmtRange(c.startTime,c.endTime))}"></span>`;
    }).join("");
  }
  const timelineIso=state.timelineDay==="tomorrow"?tomorrowIso():today,timelineClasses=state.classes.filter(c=>c.dateIso===timelineIso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  $("#timelineDateTitle").textContent=state.timelineDay==="today"?"Today":"Tomorrow";
  $("#timelineFullDate").textContent=fmtDate(timelineIso,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("#todaySwitchDate").textContent=fmtDate(today,{day:"numeric",month:"short"});
  $("#tomorrowSwitchDate").textContent=fmtDate(tomorrowIso(),{day:"numeric",month:"short"});
  $$(".timeline-day-button").forEach(b=>b.classList.toggle("active",b.dataset.timelineDay===state.timelineDay));
  const showTimelineLunch=timelineClasses.some(c=>minutes(c.endTime)<=810)&&timelineClasses.some(c=>minutes(c.startTime)>=870);let timelineLunchAdded=false;
  $("#todayProgressRail").innerHTML=timelineClasses.length?`<div class="vertical-day-timeline">${timelineClasses.map(c=>{
    const status=c.status==="Cancelled"?"cancelled":timelineIso!==today?"upcoming":now>=dateTime(c,"endTime")?"done":now>=dateTime(c,"startTime")?"current":"upcoming",added=c.status!=="Cancelled"&&wasRecentlyAdded(c);
    let tagClass="",tagText="";
    if(status==="cancelled"){tagClass="off";tagText="CANC.";}
    else if(status==="done"){tagClass="done";tagText="DONE";}
    else if(status==="current"){tagClass="now";tagText="LIVE";}
    else if(timelineIso===today){tagText=tagCountdown((dateTime(c,"startTime")-now)/60000);}
    else{tagText="UPCOMING";}
    let prefix="";
    if(showTimelineLunch&&!timelineLunchAdded&&minutes(c.startTime)>=870){prefix='<div class="agenda-lunch-divider"><span>13:30–14:30</span><strong>Lunch break</strong></div>';timelineLunchAdded=true}
    return`${prefix}<article class="vertical-class ${status}" style="--course:${colorFor(c.code)}"><div class="vertical-time">${esc(fmtTime(c.startTime))}<small>${esc(fmtTime(c.endTime))}</small></div><div class="vertical-content"><div class="timeline-course-line"><span class="timeline-code-chip">${esc(c.code)}</span><strong>${esc(c.course)}</strong></div><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p>${added?'<span class="timeline-added">ADDED</span>':""}</div><span class="tag ${tagClass}">${esc(tagText)}</span></article>`}).join("")}</div>`:`<div class="empty-state"><span class="empty-state-icon">${icon("spark")}</span><p>Nothing scheduled</p><small>${state.timelineDay==="today"?"Enjoy your free day.":"Nothing scheduled tomorrow."}</small></div>`;
  decorateTimelineDay("#todayProgressRail",timelineClasses,timelineIso);
  const completed=timelineIso===today?timelineClasses.filter(c=>c.status!=="Cancelled"&&now>=dateTime(c,"endTime")).length:0;
  $("#progressSummary").textContent=timelineIso===today?`${completed} / ${timelineClasses.filter(c=>c.status!=="Cancelled").length}`:`${timelineClasses.filter(c=>c.status!=="Cancelled").length} classes`;
  const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(now.getDate()-((now.getDay()+6)%7));const nextMonday=new Date(monday);nextMonday.setDate(monday.getDate()+7);
  const week=state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"endTime")>now&&dateTime(c,"startTime")<nextMonday);
  const thisWeekAll=state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"startTime")>=monday&&dateTime(c,"startTime")<nextMonday);
  const totalWeekMins=thisWeekAll.reduce((s,c)=>s+Math.max(0,(dateTime(c,"endTime")-dateTime(c,"startTime"))/60000),0);
  const mins=week.reduce((s,c)=>s+Math.max(0,(dateTime(c,"endTime")-Math.max(now,dateTime(c,"startTime")))/60000),0),cancels=state.classes.filter(c=>c.status==="Cancelled"&&dateTime(c,"startTime")>=monday&&dateTime(c,"startTime")<nextMonday).length;
  $("#weekClasses").textContent=week.length;$("#weekHours").textContent=`${Math.floor(mins/60)}h ${Math.round(mins%60)}m`;$("#weekCancelled").textContent=cancels;
  $("#weekAdded").textContent=state.notifications.filter(n=>n.type==="added").length;
  const hoursPct=totalWeekMins?Math.round((mins/totalWeekMins)*100):0;
  $(".stat-ring")?.style.setProperty("--pct",hoursPct);
  /* Trend — this week's total classes vs last week's, so the numbers mean something rather than sitting alone. */
  const lastMonday=new Date(monday);lastMonday.setDate(monday.getDate()-7);
  const lastWeekAll=state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"startTime")>=lastMonday&&dateTime(c,"startTime")<monday);
  const trendEl=$("#weekTrend");
  if(trendEl){
    if(!thisWeekAll.length&&!lastWeekAll.length){trendEl.hidden=true}
    else{
      const diff=thisWeekAll.length-lastWeekAll.length;
      trendEl.hidden=false;
      trendEl.textContent=diff===0?"Same as last week":diff>0?`${diff} more class${diff>1?"es":""} than last week`:`${-diff} fewer class${-diff>1?"es":""} than last week`;
      trendEl.classList.toggle("trend-down",diff<0);trendEl.classList.toggle("trend-up",diff>0);
    }
  }
  /* Term-wide progress — classes completed/remaining and weeks left across the full term window. */
  const termStart=new Date("2026-08-03T00:00:00+05:30"),termEnd=new Date("2026-10-18T23:59:59+05:30");
  const termAll=state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"startTime")>=termStart&&dateTime(c,"startTime")<=termEnd);
  const termDone=termAll.filter(c=>dateTime(c,"endTime")<now).length,termLeft=Math.max(0,termAll.length-termDone);
  const termPct=termAll.length?Math.round(termDone/termAll.length*100):0,termWeeksLeft=Math.max(0,Math.ceil((termEnd-now)/(7*24*3600000)));
  $("#termProgressPct").textContent=`${termPct}%`;$("#termProgressBar").style.width=`${termPct}%`;
  $("#termDone").textContent=termDone;$("#termLeft").textContent=termLeft;$("#termWeeksLeft").textContent=termWeeksLeft;
  const termTotalMs=termEnd-termStart,sep1=new Date("2026-09-01T00:00:00+05:30"),oct1=new Date("2026-10-01T00:00:00+05:30");
  const sepTick=$("#termTickSep"),octTick=$("#termTickOct");
  if(sepTick)sepTick.style.left=`${Math.max(0,Math.min(100,((sep1-termStart)/termTotalMs)*100))}%`;
  if(octTick)octTick.style.left=`${Math.max(0,Math.min(100,((oct1-termStart)/termTotalMs)*100))}%`;
  /* Week intensity dots — one column per day Mon-Sun, a color-fill square by class count instead of a bar-height chart. */
  const dayLetters=["M","T","W","T","F","S","S"];
  const heatEl=$("#weekHeatmap");
  if(heatEl){
    const dayCounts=[];
    for(let i=0;i<7;i++){
      const d=new Date(monday);d.setDate(monday.getDate()+i);
      const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const dayClasses=state.classes.filter(c=>c.dateIso===iso),active=dayClasses.filter(c=>c.status!=="Cancelled"),hasCancelled=dayClasses.some(c=>c.status==="Cancelled");
      dayCounts.push({iso,count:active.length,hasCancelled});
    }
    const maxCount=Math.max(1,...dayCounts.map(d=>d.count));
    heatEl.innerHTML=dayCounts.map((d,i)=>{
      const isToday=d.iso===isoToday();
      const intensity=d.count?Math.max(.35,d.count/maxCount):0;
      const bg=d.count
        ?`color-mix(in srgb, var(--accent) ${Math.round(intensity*100)}%, var(--bg-panel))`
        :d.hasCancelled?"var(--danger-soft)":"var(--bg-panel)";
      const fg=d.count&&intensity>.55?"#fff":"var(--ink)";
      return`<div class="wk-dot-col ${isToday?"is-today":""}"><span class="sq" style="background:${bg};color:${fg}">${d.count||""}</span><small>${dayLetters[i]}</small></div>`;
    }).join("");
  }
  const unread=state.notifications.filter(n=>!n.read);
  $("#silentUpdateStrip").hidden=!unread.length;
  if(unread.length){
    const latest=unread[0];
    $("#silentUpdateTitle").textContent=latest.type==="added"?"Class added":latest.type==="cancelled"?"Class cancelled":latest.type==="venue"?"Venue changed":"Schedule updated";
    $("#silentUpdateText").textContent=`${latest.title} · ${latest.text}`;
  }
  $("#homeSyncText").textContent=relativeSyncText()
  renderHomeTasks()
  renderDateStrip()
}
function scheduleHtml(list,lunch=false){if(!list.length)return'<div class="empty-state"><span class="empty-state-icon">'+icon("spark")+'</span><p>Nothing scheduled</p><small>No classes on this day.</small></div>';const sorted=[...list].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime)),showLunch=lunch&&sorted.some(c=>minutes(c.endTime)<=810)&&sorted.some(c=>minutes(c.startTime)>=870);let html="",added=false;sorted.forEach(c=>{if(showLunch&&!added&&minutes(c.startTime)>=870){html+='<div class="lunch-row"><span>13:30</span><div><strong>Lunch break</strong><br><span>Until 14:30</span></div></div>';added=true}html+=`<article class="schedule-item ${c.status==="Cancelled"?"cancelled":""}" style="--course:${colorFor(c.code)}"><div class="schedule-time">${esc(fmtTime(c.startTime))}<br><span>${esc(fmtTime(c.endTime))}</span></div><div class="schedule-info"><strong>${esc(c.code)} · ${esc(c.course)}</strong><p>${esc(venueOf(c))} · ${esc(c.faculty)}</p>${c.status==="Cancelled"?'<span class="status-badge cancelled">CANCELLED</span>':""}</div></article>`});return html}

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
function compactDuration(total){
  const mins=Math.max(0,Math.round(total));
  return mins>=60?`${Math.floor(mins/60)}h${mins%60?` ${mins%60}m`:""}`:`${mins}m`;
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
function agendaTag(c){
  const status=agendaStatus(c);
  if(status==="Cancelled")return{cls:"off",text:"CANC."};
  if(status==="Completed")return{cls:"done",text:"DONE"};
  if(status==="Live")return{cls:"now",text:"LIVE"};
  if(status==="Upcoming")return{cls:"",text:tagCountdown((dateTime(c,"startTime")-new Date())/60000)};
  return{cls:"",text:"UPCOMING"};
}
function renderTermHeatmap(){
  const grid=$("#termHeatmapGrid");if(!grid)return;
  const termStart=new Date("2026-08-03T00:00:00+05:30"),termEnd=new Date("2026-10-18T23:59:59+05:30");
  const weeks=[];
  let cur=new Date(termStart);cur.setHours(0,0,0,0);cur.setDate(cur.getDate()-((cur.getDay()+6)%7));
  const now=new Date();let maxCount=0;
  while(cur<termEnd){
    const wStart=new Date(cur),wEnd=new Date(cur);wEnd.setDate(wEnd.getDate()+7);
    const count=state.classes.filter(c=>c.status!=="Cancelled"&&dateTime(c,"startTime")>=Math.max(wStart,termStart)&&dateTime(c,"startTime")<wEnd&&dateTime(c,"startTime")<=termEnd).length;
    maxCount=Math.max(maxCount,count);
    weeks.push({start:wStart,end:wEnd,count,isCurrent:now>=wStart&&now<wEnd});
    cur=wEnd;
  }
  grid.innerHTML=weeks.map(w=>{
    const pct=maxCount?Math.round((w.count/maxCount)*100):0;
    const label=`${String(w.start.getDate()).padStart(2,"0")} ${new Intl.DateTimeFormat("en-IN",{month:"short"}).format(w.start)}`;
    return`<button type="button" class="term-heatmap-row ${w.isCurrent?"is-current-week":""}" data-week-start="${w.start.toISOString()}"><span class="label">${esc(label)}</span><span class="bar-track"><span style="width:${pct}%"></span></span><span class="count">${w.count}</span></button>`;
  }).join("");
}
function agendaCardHtml(c){
  const status=agendaStatus(c), tag=agendaTag(c), cls=[
    "agenda-class-card",
    status==="Live"?"current":"",
    c.status==="Cancelled"?"cancelled":""
  ].filter(Boolean).join(" ");
  return `<article class="${cls}" data-class-id="${esc(classIdentity(c))}" style="--course:${colorFor(c.code)}">
    <div class="agenda-card-top">
      <div class="agenda-time-block">
        <time>${esc(fmtRange(c.startTime,c.endTime))}</time>
        <small>${esc(durationLabel(c))}</small>
      </div>
      <span class="tag ${tag.cls}">${esc(tag.text)}</span>
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
  const hasMorning=classes.some(c=>minutes(c.endTime)<=810),hasAfternoon=classes.some(c=>minutes(c.startTime)>=870);
  periods.forEach(period=>{
    const items=classes.filter(c=>agendaPeriod(c)===period).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
    if(items.length){
      html+=`<section class="agenda-group"><div class="agenda-group-title">${period}</div>${items.map(agendaCardHtml).join("")}</section>`;
      if(period==="Morning"&&hasMorning&&hasAfternoon)html+='<div class="agenda-lunch-divider"><span>13:30–14:30</span><strong>Lunch break</strong></div>';
    }
  });
  html+='</div>';
  if(tasks.length){
    html+=`<section class="agenda-task-section"><div class="agenda-task-heading">Tasks due</div><div class="task-list">${tasks.map(taskHtml).join("")}</div></section>`;
  }
  return html;
}
function showCalendarTooltip(target,iso){if(matchMedia("(hover: none)").matches)return;let tip=$("#calendarTooltip");if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));if(!list.length)return;tip.innerHTML=`<h4>${esc(fmtDate(iso))}</h4>${list.map(c=>`<div class="calendar-tooltip-row"><time>${esc(fmtTime(c.startTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("")}`;const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-220,r.bottom+8)}px`;tip.classList.add("show")}function hideCalendarTooltip(){$("#calendarTooltip")?.classList.remove("show")}function renderCalendar(){const d=state.calendarMonth,y=d.getFullYear(),m=d.getMonth();$("#calendarTitle").textContent=new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(d);const first=new Date(y,m,1),off=(first.getDay()+6)%7,start=new Date(y,m,1-off);let html="";for(let i=0;i<42;i++){const day=new Date(start);day.setDate(start.getDate()+i);const iso=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`,dayClasses=state.classes.filter(c=>c.dateIso===iso),classes=dayClasses.filter(c=>c.status!=="Cancelled"),hasCancelled=dayClasses.some(c=>c.status==="Cancelled"),isWeekend=day.getDay()===0||day.getDay()===6,badgeColor=classes.length?colorFor(classes[0].code):"",dayCourses=[...new Set(classes.map(c=>canonical(c.code)))],dimmed=state.calendarHighlight&&!dayCourses.includes(state.calendarHighlight);html+=`<button class="calendar-day ${day.getMonth()!==m?"outside":""} ${isWeekend?"weekend":""} ${iso===isoToday()?"today":""} ${iso===state.selectedDate?"selected":""} ${dimmed?"dimmed":""}" data-date="${iso}" data-courses="${esc(dayCourses.join(","))}"><span class="calendar-day-number">${day.getDate()}</span>${hasCancelled?'<span class="calendar-cancel-dot" title="Has a cancelled class"></span>':""}${classes.length?`<span class="calendar-class-count" style="--course:${badgeColor}">${classes.length}</span>`:hasCancelled?`<span class="calendar-class-count cancelled-only">0</span>`:""}</button>`}$("#calendarGrid").innerHTML=html;$$(".calendar-day").forEach(b=>{b.addEventListener("click",()=>{state.selectedDate=b.dataset.date;renderCalendar();requestAnimationFrame(()=>{const agenda=document.getElementById("dayAgenda");if(agenda&&window.matchMedia("(max-width:780px)").matches)agenda.scrollIntoView({behavior:"smooth",block:"start"})})});b.addEventListener("mouseenter",()=>showCalendarTooltip(b,b.dataset.date));b.addEventListener("mouseleave",hideCalendarTooltip)});const classes=state.classes.filter(c=>c.dateIso===state.selectedDate),tasks=state.tasks.filter(t=>t.date===state.selectedDate);$("#agendaDate").textContent=fmtDate(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("#agendaCount").textContent=classes.length+tasks.length;$("#dayAgenda").innerHTML=agendaHtml(classes,tasks);const used=[...new Set(state.classes.filter(c=>c.dateIso.startsWith(`${y}-${String(m+1).padStart(2,"0")}`)).map(c=>canonical(c.code)))];if(state.calendarHighlight&&!used.includes(state.calendarHighlight))state.calendarHighlight=null;$("#calendarLegend").innerHTML=used.map(c=>`<button type="button" class="legend-item ${c===state.calendarHighlight?"active":""}" style="--course:${colorFor(c)}" data-course="${esc(c)}"><i></i>${esc(c)}</button>`).join("");$("#calendarLegend").onclick=e=>{const btn=e.target.closest(".legend-item");if(!btn)return;state.calendarHighlight=state.calendarHighlight===btn.dataset.course?null:btn.dataset.course;renderCalendar()};bindTaskRows($("#dayAgenda"))}
/* Status-aware desktop calendar preview. This declaration intentionally
   replaces the compact legacy renderer above without touching calendar flow. */
function showCalendarTooltip(target,iso){
  if(matchMedia("(hover: none)").matches)return;
  let tip=$("#calendarTooltip");
  if(!tip){tip=document.createElement("div");tip.id="calendarTooltip";tip.className="calendar-tooltip";document.body.appendChild(tip)}
  const list=state.classes.filter(c=>c.dateIso===iso).sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
  if(!list.length)return;
  const scheduled=list.filter(c=>c.status!=="Cancelled"),cancelled=list.filter(c=>c.status==="Cancelled");
  const summary=`${scheduled.length} scheduled${cancelled.length?` · ${cancelled.length} cancelled`:""}`;
  const rows=scheduled.map(c=>`<div class="calendar-tooltip-row" style="--tooltip-course:${colorFor(c.code)}"><time>${esc(fmtRange(c.startTime,c.endTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong></div>`).join("");
  const cancelledRows=cancelled.map(c=>`<div class="calendar-tooltip-row cancelled" style="--tooltip-course:var(--danger)"><time>${esc(fmtRange(c.startTime,c.endTime))}</time><strong>${esc(c.code)} · ${esc(c.course)}</strong><span>CANCELLED</span></div>`).join("");
  tip.innerHTML=`<div class="calendar-tooltip-head"><h4>${esc(fmtDate(iso))}</h4><small>${esc(summary)}</small></div>${scheduled.length?rows:'<div class="calendar-tooltip-empty">No scheduled classes</div>'}${cancelledRows}`;
  const r=target.getBoundingClientRect();tip.style.left=`${Math.min(innerWidth-292,Math.max(12,r.left+r.width/2-130))}px`;tip.style.top=`${Math.min(innerHeight-240,r.bottom+8)}px`;tip.classList.add("show")
}
function shiftSelectedDate(delta){const day=new Date(`${state.selectedDate}T12:00:00+05:30`);day.setDate(day.getDate()+delta);state.selectedDate=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(day);state.calendarMonth=new Date(day.getFullYear(),day.getMonth(),1);const agenda=$("#dayAgenda");if(agenda){agenda.classList.remove("slide-prev","slide-next");agenda.classList.add(delta>0?"slide-next":"slide-prev")}renderCalendar();requestAnimationFrame(()=>requestAnimationFrame(()=>agenda?.classList.remove("slide-prev","slide-next")))}
function renderCourseOptions(){const selected=new Set((state.profile.electives||[]).map(canonical));const seen=new Set(),courses=[];state.all.forEach(c=>{const code=canonical(c.baseCode||c.code);const allowed=c.type==="Core"?c.section===state.profile.section:selected.has(code);if(allowed&&!seen.has(code)){seen.add(code);courses.push({code,course:c.course})}});const o=courses.sort((a,b)=>a.course.localeCompare(b.course)).map(e=>`<option value="${esc(e.code)}">${esc(e.code)} · ${esc(e.course)}</option>`).join("");["#quickTaskCourse","#taskCourse","#noteCourse"].forEach(s=>{const el=$(s);if(el)el.innerHTML='<option value="">General</option>'+o})}
function addTask(title,course,date){
  const t={id:crypto.randomUUID(),title,course:course||"General",date,completed:false,createdAt:Date.now()};
  state.tasks.unshift(t);
  save(KEYS.tasks,state.tasks);
  renderTasks();renderHomeTasks();renderCalendar();renderLedger();
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
  $("input",r)?.addEventListener("change",e=>{const t=state.tasks.find(x=>x.id===r.dataset.task);if(t){t.completed=e.target.checked;save(KEYS.tasks,state.tasks);syncTaskToGoogle(t);renderTasks();renderHomeTasks();renderCalendar();renderLedger()}});
  $(".delete-button",r)?.addEventListener("click",()=>{const t=state.tasks.find(x=>x.id===r.dataset.task);if(t)deleteGoogleTask(t);state.tasks=state.tasks.filter(x=>x.id!==r.dataset.task);save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar();renderLedger()});
  $(".task-item>div",r)?.addEventListener("click",()=>openTaskEditor(state.tasks.find(x=>x.id===r.dataset.task)));
})}
function renderHomeTasks(){const el=$("#homeTasks");if(!el)return;const a=state.tasks.filter(t=>!t.completed).slice(0,3);el.innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state"><span class="empty-state-icon">'+icon("check")+'</span><p>All caught up</p><small>No open tasks right now.</small></div>';bindTaskRows(el)}
const TASK_FILTERS=["open","today","upcoming","completed"];
function setTaskFilter(filter,direction="none"){if(!TASK_FILTERS.includes(filter))return;state.taskFilter=filter;$$(`.filter`).forEach(x=>x.classList.toggle("active",x.dataset.taskFilter===filter));const list=$("#taskList");if(list&&direction!=="none"){list.classList.remove("filter-slide-left","filter-slide-right");list.classList.add(direction==="left"?"filter-slide-left":"filter-slide-right")}renderTasks();requestAnimationFrame(()=>requestAnimationFrame(()=>list?.classList.remove("filter-slide-left","filter-slide-right")))}
function renderTasks(){const list=$("#taskList");if(!list)return;const t=isoToday();let a=state.tasks;if(state.taskFilter==="open")a=a.filter(x=>!x.completed);if(state.taskFilter==="today")a=a.filter(x=>!x.completed&&x.date===t);if(state.taskFilter==="upcoming")a=a.filter(x=>!x.completed&&x.date&&x.date>t);if(state.taskFilter==="completed")a=a.filter(x=>x.completed);list.innerHTML=a.length?a.map(taskHtml).join(""):'<div class="empty-state"><span class="empty-state-icon">'+icon("check")+'</span><p>Nothing here</p><small>Tasks matching this filter will appear here.</small></div>';bindTaskRows(list)}
function renderNotes(){const search=$("#noteSearch");const list=$("#noteList");if(!list)return;const q=(search?.value||"").toLowerCase(),a=state.notes.filter(n=>(n.title+" "+n.body+" "+n.course).toLowerCase().includes(q));list.innerHTML=a.length?a.map(n=>`<article class="note-card" data-note="${n.id}"><header><div><small>${esc(n.course||"GENERAL")}</small><h3>${esc(n.title)}</h3></div><button class="delete-button">×</button></header><p>${esc(n.body)}</p></article>`).join(""):'<div class="empty-state"><span class="empty-state-icon">'+icon("note")+'</span><p>No notes yet</p><small>Save something worth remembering.</small></div>';$$(".note-card .delete-button",list).forEach(b=>b.addEventListener("click",()=>{state.notes=state.notes.filter(n=>n.id!==b.closest(".note-card").dataset.note);save(KEYS.notes,state.notes);renderNotes();renderLedger()}))}

/* ===== Tasks & Notes ledger (Planner "Tasks & Notes" subtab + Home ledger icon) =====
   Merges tasks and notes into one numbered list per the locked spec. Reuses the
   same state.tasks/state.notes arrays and CRUD helpers — no schema changes. */
function ledgerItems(){
  const q=($("#ledgerSearch")?.value||"").trim().toLowerCase(),filter=state.ledgerFilter||"all";
  let items=[
    ...state.tasks.map(t=>({id:t.id,kind:"task",title:t.title,course:t.course,completed:t.completed,sortAt:t.createdAt||0})),
    ...state.notes.map(n=>({id:n.id,kind:"note",title:n.title,body:n.body,course:n.course,sortAt:n.createdAt||0}))
  ];
  if(filter!=="all")items=items.filter(i=>i.kind===(filter==="tasks"?"task":"note"));
  if(q)items=items.filter(i=>`${i.title||""} ${i.body||""} ${i.course||""}`.toLowerCase().includes(q));
  return items.sort((a,b)=>b.sortAt-a.sortAt);
}
function renderLedger(){
  const list=$("#ledgerList");if(!list)return;
  const items=ledgerItems();
  list.innerHTML=items.length?items.map((it,i)=>{
    const num=String(i+1).padStart(2,"0"),tag=it.course&&it.course!=="General"?canonical(it.course):"GEN";
    if(it.kind==="task"){
      return `<article class="ledgerrow" data-ledger-kind="task" data-ledger-id="${esc(it.id)}"><span class="n">${num}</span><span class="txt ${it.completed?"done":""}">${esc(it.title)}</span><span class="k">${esc(tag)}</span><button class="ledger-del" type="button" data-ledger-del="task" data-ledger-id="${esc(it.id)}" aria-label="Delete task">×</button></article>`;
    }
    return `<article class="ledgerrow" data-ledger-kind="note" data-ledger-id="${esc(it.id)}"><span class="n">${num}</span><span class="txt">${esc(it.title)}</span><span class="k">${esc(tag)}</span><button class="ledger-del" type="button" data-ledger-del="note" data-ledger-id="${esc(it.id)}" aria-label="Delete note">×</button></article><div class="ledger-body" id="ledgerBody-${esc(it.id)}" hidden>${esc(it.body||"")}</div>`;
  }).join(""):'<div class="empty-state"><span class="empty-state-icon">'+icon("note")+'</span><p>Nothing here yet</p><small>Tasks and notes you add will show up in this ledger.</small></div>';
  bindLedgerRows();
}
function bindLedgerRows(){
  $$(".ledgerrow").forEach(row=>{
    row.addEventListener("click",e=>{
      if(e.target.closest(".ledger-del"))return;
      const id=row.dataset.ledgerId;
      if(row.dataset.ledgerKind==="task"){
        const t=state.tasks.find(x=>x.id===id);if(!t)return;
        t.completed=!t.completed;save(KEYS.tasks,state.tasks);syncTaskToGoogle(t);
        renderTasks();renderHomeTasks();renderCalendar();renderLedger();
      }else{
        const body=$(`#ledgerBody-${CSS.escape(id)}`);
        if(body)body.hidden=!body.hidden;
      }
    });
  });
  $$("[data-ledger-del]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();
      const id=btn.dataset.ledgerId;
      if(btn.dataset.ledgerDel==="task"){
        const t=state.tasks.find(x=>x.id===id);if(t)deleteGoogleTask(t);
        state.tasks=state.tasks.filter(x=>x.id!==id);save(KEYS.tasks,state.tasks);
        renderTasks();renderHomeTasks();renderCalendar();
      }else{
        state.notes=state.notes.filter(x=>x.id!==id);save(KEYS.notes,state.notes);renderNotes();
      }
      renderLedger();
    });
  });
}
function busDate(b,t=false){const n=new Date(),[h,m]=b.time.split(":").map(Number),d=new Date(n);d.setHours(h,m,0,0);if(t)d.setDate(d.getDate()+1);return d}

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
  // Force render electives + restore any saved selections before opening
  renderOnboardingElectives();
  const section=state.profile.section||"A";
  const sec=dialog.querySelector(`input[name="onboardingSection"][value="${section}"]`);
  if(sec)sec.checked=true;
  const nameInput=$("#onboardingName");
  if(nameInput)nameInput.value=state.profile.name||"";
  const saved=new Set((state.profile.electives||[]).map(canonical));
  $$("#onboardingElectives input").forEach(cb=>cb.checked=saved.has(canonical(cb.value)));
  renderElectiveClashWarnings();
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

function isMainGateService(bus){return bus.from==="Main Gate"||bus.to==="Main Gate"}
const BUS_STOPS=["C&D Housing","Phase V Campus","PGP Auditorium","Main Gate"];
function serviceSupports(bus,from,to){
  const stops=routeStops(bus);
  const fromIndex=stops.indexOf(from);
  const toIndex=stops.indexOf(to);
  return fromIndex>=0&&toIndex>fromIndex;
}

/* Last-departure-of-the-day flag, computed per route direction (from -> to) straight off
   the existing sorted campus-data.js bus array — self-contained, doesn't touch bus logic. */
let _lastBusKeys=null;
function lastBusKeys(){
  if(_lastBusKeys)return _lastBusKeys;
  const byDirection=new Map();
  window.CAMPUS_DATA.bus.forEach(b=>{
    const key=`${b.from}→${b.to}`,cur=byDirection.get(key);
    if(!cur||minutes(b.time)>minutes(cur.time))byDirection.set(key,b);
  });
  _lastBusKeys=new Set([...byDirection.values()].map(b=>`${b.time}|${b.from}|${b.to}`));
  return _lastBusKeys;
}
function isLastBus(bus){return lastBusKeys().has(`${bus.time}|${bus.from}|${bus.to}`)}

const BUS_QUICK_ROUTES=[
  {from:"C&D Housing",to:"PGP Auditorium",label:"C&D → Aud."},
  {from:"PGP Auditorium",to:"C&D Housing",label:"Aud. → C&D"},
  {from:"Main Gate",to:"PGP Auditorium",label:"Gate → Aud."},
  {from:"PGP Auditorium",to:"Main Gate",label:"Aud. → Gate"}
];

function renderCampus(){
  renderBusControls();
  renderBuses();
  renderMess();
}

function renderBusControls(){
  const options=BUS_STOPS.map(stop=>
    `<option value="${esc(stop)}">${esc(busStopLabel(stop))}</option>`
  ).join("");
  $("#busFrom").innerHTML=options;$("#busTo").innerHTML=options;
  $("#busFrom").value=state.busFrom;$("#busTo").value=state.busTo;

  const chips=$("#busFilterChips");
  if(chips){
    chips.innerHTML=BUS_QUICK_ROUTES.map(r=>
      `<button class="filter-chip ${state.busFrom===r.from&&state.busTo===r.to?"active":""}" data-from="${esc(r.from)}" data-to="${esc(r.to)}">${esc(r.label)}</button>`
    ).join("");
    $$(".filter-chip",chips).forEach(button=>
      button.addEventListener("click",()=>{
        state.busFrom=button.dataset.from;state.busTo=button.dataset.to;
        renderBusControls();renderBuses();
      })
    );
  }
}

function renderBuses(){
  const board=$("#busBoard");
  if(!board)return;
  const now=new Date();
  const services=window.CAMPUS_DATA.bus.filter(bus=>serviceSupports(bus,state.busFrom,state.busTo));

  const heroRoute=$("#nextBusRoute");
  if(heroRoute)heroRoute.textContent=`${busStopLabel(state.busFrom)} → ${busStopLabel(state.busTo)}`;

  if(!services.length){
    $("#nextBusTime").textContent="—";$("#nextBusMeta").textContent="No direct service on this route";
    $("#nextBusCountdown").textContent="—";$("#nextBusCountdown").previousElementSibling.textContent="Leaves in";
    $("#nextBusVisual").innerHTML="";
    const gateTags=$("#nextBusGateTags");if(gateTags)gateTags.innerHTML="";
    const ring=$("#countdownRing");if(ring){ring.style.setProperty("--pct",0);ring.classList.remove("urgent")}
    board.innerHTML='<div class="empty-state"><span class="empty-state-icon">'+icon("bus")+'</span><p>No service on this route</p><small>Try another origin or destination.</small></div>';
    return;
  }

  const withTimes=services.map(b=>({b,d:busDate(b)})).sort((a,b)=>a.d-b.d);
  let next=withTimes.find(item=>item.d>now);
  const nextDay=!next;
  if(!next)next=services.map(b=>({b,d:busDate(b,true)})).sort((a,b)=>a.d-b.d)[0];
  const nextKey=`${next.b.time}|${next.b.from}|${next.b.to}`;

  $("#nextBusTime").textContent=fmtTime(next.b.time);
  $("#nextBusMeta").textContent=isMainGateService(next.b)?"Main Gate service":"Campus shuttle";
  const gateTags=$("#nextBusGateTags");
  if(gateTags)gateTags.innerHTML=isLastBus(next.b)?'<span class="tag tag-last">LAST BUS</span>':"";

  const remaining=Math.max(0,Math.ceil((next.d-now)/60000));
  $("#nextBusCountdown").previousElementSibling.textContent=nextDay?"Leaves tomorrow in":"Leaves in";
  $("#nextBusCountdown").textContent=remaining>=60?`${Math.floor(remaining/60)}h ${remaining%60}m`:`${remaining} min`;
  const ringWindow=60,pct=Math.max(0,Math.min(100,Math.round((remaining/ringWindow)*100)));
  const ring=$("#countdownRing");
  if(ring){ring.style.setProperty("--pct",nextDay?100:pct);ring.classList.toggle("urgent",!nextDay&&remaining<=5)}

  const stops=routeStops(next.b);
  const fromIndex=stops.indexOf(state.busFrom),toIndex=stops.indexOf(state.busTo);
  $("#nextBusVisual").innerHTML=stops.slice(fromIndex,toIndex+1).map(stop=>
    `<div class="route-stop"><i></i><span>${esc(busStopLabel(stop))}</span></div>`
  ).join("");

  board.innerHTML=withTimes.map(({b})=>busRow(b,nextKey)).join("");
}

function busRow(bus,nextKey){
  const isNext=nextKey===`${bus.time}|${bus.from}|${bus.to}`;
  const last=isLastBus(bus),mainGate=isMainGateService(bus);
  return`<article class="board-row ${isNext?"next":""}">
    <span class="t">${esc(fmtTime(bus.time))}</span>
    <div class="r">
      <strong>${esc(busStopLabel(bus.from))} → ${esc(busStopLabel(bus.to))}</strong>
      <span>${esc(routeStops(bus).map(busStopLabel).join(" · "))}</span>
    </div>
    <div class="board-row-badges">
      ${isNext?'<span class="tag tag-next">NEXT</span>':""}
      ${mainGate?'<span class="tag tag-gate">MAIN GATE</span>':""}
      ${last?'<span class="tag tag-last">LAST BUS</span>':""}
    </div>
  </article>`;
}

function renderMess(){const ds=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];$("#messDayPills").innerHTML=ds.map(d=>`<button class="day-pill ${d===state.messDay?"active":""}" data-day="${d}">${d.slice(0,3).toUpperCase()}</button>`).join("");$$(".day-pill").forEach(b=>b.addEventListener("click",()=>{state.messDay=b.dataset.day;renderMess()}));$("#messDayTitle").textContent=state.messDay[0].toUpperCase()+state.messDay.slice(1);const menu=window.CAMPUS_DATA.mess[state.messDay],items=menu[state.meal]||[],nv=/chicken|fish|egg|omelette/i,sw=/gulab|halwa|ice cream|kheer|custard|badusha|sweet/i,non=items.filter(i=>nv.test(i)),sweet=items.filter(i=>sw.test(i)),veg=items.filter(i=>!nv.test(i)&&!sw.test(i));$("#messMenu").innerHTML=`<article class="meal-hero"><h3>${state.meal[0].toUpperCase()+state.meal.slice(1)}</h3>${veg.length?`<section class="food-section"><div class="food-section-title">Vegetarian</div><div class="food-items">${veg.map(i=>`<div class="food-item veg">${esc(i)}</div>`).join("")}</div></section>`:""}${non.length?`<section class="food-section"><div class="food-section-title">Non-vegetarian</div><div class="food-items">${non.map(i=>`<div class="food-item nonveg">${esc(i)}</div>`).join("")}</div></section>`:""}${sweet.length?`<section class="food-section"><div class="food-section-title">Dessert / Sweet</div><div class="food-items">${sweet.map(i=>`<div class="food-item sweet">${esc(i)}</div>`).join("")}</div></section>`:""}</article>`;const nowHour=new Date().getHours(),currentMeal=nowHour<11?"breakfast":nowHour<16?"lunch":"dinner";$$(".meal-tab").forEach(b=>{b.classList.toggle("active",b.dataset.meal===state.meal);b.classList.toggle("is-now",b.dataset.meal===currentMeal&&b.dataset.meal!==state.meal)})}function renderProfile(){$("#profileName").value=state.profile.name||"";$("#profileSection").value=state.profile.section||"A";$("#profileTheme").value=state.profile.theme||"system";$("#profileDisplayName").textContent=state.profile.name||"Student";$("#profileSummary").textContent=`PGPBL · Section ${state.profile.section||"A"}`;$("#profileAvatar").textContent=initials(state.profile.name);$("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";$("#electiveChoices").innerHTML=(state.electives||[]).map(e=>`<label class="choice"><input type="checkbox" value="${esc(e.code)}" ${(state.profile.electives||[]).includes(canonical(e.code))?"checked":""}><span><strong>${esc(e.code)} · ${esc(e.course)}</strong><small>${esc(e.faculty)}</small></span></label>`).join("")}
/* Deterministic CSS-only barcode heights, seeded off the student's name so it doesn't
   flicker on every re-render but still looks like a real ticket stub. */
function barcodeHtml(seed){
  let h=0;for(const ch of String(seed||"BL07"))h=(h*31+ch.charCodeAt(0))>>>0;
  const bars=[];
  for(let i=0;i<28;i++){h=(h*1103515245+12345)>>>0;bars.push(8+(h%19))}
  return bars.map(v=>`<i style="height:${v}px"></i>`).join("");
}
function renderProfile(){$("#profileName").value=state.profile.name||"";$("#profileSection").value=state.profile.section||"A";$("#profileTheme").value=state.profile.theme||"system";
  $("#stubName").textContent=state.profile.name||"Student";
  $("#stubSection").textContent=`Section ${state.profile.section||"A"}`;
  const avatarDisc=$("#profileAvatarDisc");if(avatarDisc){avatarDisc.setAttribute("data-initials",initials(state.profile.name));avatarDisc.classList.toggle("section-b",state.profile.section==="B")}
  const bc=$("#stubBarcode");if(bc)bc.innerHTML=barcodeHtml(state.profile.name||state.profile.section);
  $("#lastUpdated").textContent=state.lastUpdated?`Updated ${new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(state.lastUpdated))}`:"Not synced yet";const selected=new Set((state.profile.electives||[]).map(canonical)),items=(state.electives||[]).filter(e=>selected.has(canonical(e.code)));const chips=$("#selectedElectiveChips");if(chips)chips.innerHTML=items.length?items.map(e=>`<span title="${esc(e.course)}"><b>${esc(e.code)}</b>${esc(e.course)}</span>`).join(""):'<em>No electives selected</em>'}
/* Gate-change / status tag for a notification, matching the bus gate-board and timeline
   tag language depending on what kind of schedule change it is. Presentation only — the
   underlying diff/notification detection in compareSnapshots() is untouched. */
function notificationTagHtml(n){
  if(n.type==="venue")return`<span class="badge badge-venue">Venue changed</span>`;
  if(n.type==="added")return`<span class="badge badge-added">Added</span>`;
  if(n.type==="cancelled")return`<span class="badge badge-cancelled">Cancelled</span>`;
  return"";
}
function renderNotifications(){const unread=state.notifications.filter(n=>!n.read).length;$("#notificationBadge").hidden=!unread;$("#notificationBadge").textContent=unread;$("#notificationList").innerHTML=state.notifications.length?state.notifications.map(n=>`<article class="notification-item ${n.read?"":"unread"}" style="--course:${colorFor(n.course)}"><div class="notification-row"><strong>${esc(n.title)}</strong>${notificationTagHtml(n)}</div><p>${esc(n.text)}</p><time>${new Intl.RelativeTimeFormat("en",{numeric:"auto"}).format(-Math.max(1,Math.round((Date.now()-n.createdAt)/3600000)),"hour")}</time></article>`).join(""):'<div class="empty-state"><span class="empty-state-icon">'+icon("bell")+'</span><p>No schedule updates</p><small>We’ll let you know when something changes.</small></div>'}
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
async function pullGoogleTasks(){if(!_googleAccessToken)return;const listId=await ensureGooglePlannerList();const r=await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`,{headers:{Authorization:`Bearer ${_googleAccessToken}`}});if(!r.ok)throw new Error("Could not sync Google Tasks");const remote=(await r.json()).items||[],byGoogle=new Map(state.tasks.filter(t=>t.googleTaskId).map(t=>[t.googleTaskId,t]));remote.forEach(item=>{const course=googleTaskCourse(item.notes),date=item.due?item.due.slice(0,10):"",local=byGoogle.get(item.id);if(local)Object.assign(local,{title:item.title,course,date,completed:item.status==="completed"});else state.tasks.push({id:crypto.randomUUID(),googleTaskId:item.id,title:item.title,course,date,completed:item.status==="completed",createdAt:Date.now()})});save(KEYS.tasks,state.tasks);renderTasks();renderHomeTasks();renderCalendar();renderLedger()}
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
  renderElectiveClashWarnings();
}

/* ===== Elective clash detector =====
   Self-contained addition: checks every pair of currently-checked electives in the
   onboarding/profile picker for overlapping class slots in the real schedule data
   (state.all), and surfaces any overlap inline. Does not touch schedule-sync logic. */
function timeOverlap(aStart,aEnd,bStart,bEnd){return minutes(aStart)<minutes(bEnd)&&minutes(bStart)<minutes(aEnd)}
function detectElectiveClashes(selectedCodes){
  const codes=[...new Set(selectedCodes.map(canonical))];
  const slots=[];
  codes.forEach(code=>{
    state.all.filter(c=>canonical(c.baseCode||c.code)===code&&c.status!=="Cancelled").forEach(c=>slots.push({code,dateIso:c.dateIso,startTime:c.startTime,endTime:c.endTime}));
  });
  const seen=new Set(),out=[];
  for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++){
    const a=slots[i],b=slots[j];
    if(a.code===b.code||a.dateIso!==b.dateIso)continue;
    if(!timeOverlap(a.startTime,a.endTime,b.startTime,b.endTime))continue;
    const key=[a.code,b.code].sort().join("|")+a.dateIso+a.startTime;
    if(seen.has(key))continue;
    seen.add(key);
    out.push({a:a.code,b:b.code,dateIso:a.dateIso,aTime:fmtRange(a.startTime,a.endTime),bTime:fmtRange(b.startTime,b.endTime)});
  }
  return out;
}
function renderElectiveClashWarnings(){
  const container=$("#electiveClashWarnings");
  if(!container)return;
  const selected=$$("#onboardingElectives input:checked").map(i=>i.value);
  const clashes=detectElectiveClashes(selected);
  container.innerHTML=clashes.length?clashes.map(c=>`<div class="clash-warning"><span class="badge badge-cancelled">Clash</span><span>${esc(c.a)} × ${esc(c.b)} — ${esc(fmtDate(c.dateIso,{weekday:"short",day:"numeric",month:"short"}))}, ${esc(c.aTime)}</span></div>`).join(""):"";
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
  const nameInput=$("#onboardingName");
  if(nameInput)nameInput.value=state.profile.name||"";
  renderElectiveClashWarnings();
  setOnboardingStep(1);
  dialog.showModal();
}
function completeOnboarding(){
  const name=$("#onboardingName")?.value.trim()||"";
  if(!name){$("#onboardingName")?.focus();$("#onboardingName")?.reportValidity();return}
  const section=$('input[name="onboardingSection"]:checked')?.value||"A";
  const electives=$$("#onboardingElectives input:checked").map(input=>canonical(input.value));
  state.profile={...state.profile,name,section,electives};
  save(KEYS.profile,state.profile);
  localStorage.setItem(KEYS.onboarded,"true");
  state.classes=filteredClasses();
  renderAll();
  $("#onboardingDialog")?.close();
  syncSchedule(true);
}
function bind(){
  $("#onboardingContinue")?.addEventListener("click",()=>{const input=$("#onboardingName");if(!input?.value.trim()){input?.focus();input?.reportValidity();return}setOnboardingStep(2)});
  $("#onboardingElectives")?.addEventListener("change",e=>{if(e.target.matches('input[type="checkbox"]'))renderElectiveClashWarnings()});
  $("#onboardingBack")?.addEventListener("click",()=>setOnboardingStep(1));
  $("#onboardingForm")?.addEventListener("submit",event=>{event.preventDefault();completeOnboarding()});
  bindOutsideDismiss($("#taskDialog"));
  bindOutsideDismiss($("#noteDialog"));
  bindOutsideDismiss($("#onboardingDialog"));
  $$("[data-page-target]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageTarget)));$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
  $("#themeToggle").addEventListener("click",()=>{state.profile.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";save(KEYS.profile,state.profile);applyTheme();renderProfile()});
  $("#topMoreButton")?.addEventListener("click",e=>{e.stopPropagation();const menu=$("#topMoreMenu"),open=menu.classList.toggle("open");$("#topMoreButton").setAttribute("aria-expanded",String(open))});
  document.addEventListener("click",e=>{const menu=$("#topMoreMenu");if(menu&&menu.classList.contains("open")&&!e.target.closest("#topMoreMenu,#topMoreButton")){menu.classList.remove("open");$("#topMoreButton").setAttribute("aria-expanded","false")}});
  $("#topMoreMenu")?.addEventListener("click",e=>{if(e.target.closest("button")){$("#topMoreMenu").classList.remove("open");$("#topMoreButton")?.setAttribute("aria-expanded","false")}});
  $("#refreshButton")?.addEventListener("click",async e=>{const button=e.currentTarget;button.blur();await syncSchedule(true);button.blur()});
  $("#timelineDaySwitch").addEventListener("click",e=>{const b=e.target.closest("[data-timeline-day]");if(!b)return;setTimelineDay(b.dataset.timelineDay,"auto")});
  bindSwipeGesture($(".today-progress-card"),direction=>{
    const next=state.timelineDay==="today"?"tomorrow":"today";
    setTimelineDay(next,direction==="left"?"forward":"backward");
  },{ignore:"input,select,textarea,a"});
  $("#notificationButton").addEventListener("click",openNotifications);$("#openUpdatesFromHome").addEventListener("click",openNotifications);$("#closeNotifications").addEventListener("click",closeNotifications);$("#notificationBackdrop").addEventListener("click",closeNotifications);
  $("#markNotificationsRead")?.addEventListener("click",()=>{state.notifications.forEach(n=>n.read=true);save(KEYS.notifications,state.notifications);renderNotifications();renderHome();closeNotifications();showToast("Notifications marked as read")});
  $("#clearNotifications")?.addEventListener("click",()=>{
    state.notifications=[];save(KEYS.notifications,state.notifications);renderNotifications();renderHome();closeNotifications();showToast("Notifications cleared");
  });
  $("#chooseElectivesInline")?.addEventListener("click",()=>openOnboardingManually());
  $("#connectGoogleTasks")?.addEventListener("click",()=>connectGoogleTasks());
  $("#disconnectGoogleTasks")?.addEventListener("click",()=>disconnectGoogleTasks());
  window.addEventListener("focus",()=>{scheduleIdleSync();scheduleGoogleTasksSync()});
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){scheduleIdleSync();scheduleGoogleTasksSync()}});
  window.addEventListener("online",()=>scheduleIdleSync());
  $$(".subtab[data-campus-tab]").forEach(b=>b.addEventListener("click",()=>{$$(".subtab[data-campus-tab]").forEach(x=>x.classList.toggle("active",x===b));$$(".campus-view").forEach(v=>v.classList.toggle("active",v.dataset.campusView===b.dataset.campusTab))}));
  $("#prevMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()-1,1);renderCalendar()});$("#nextMonth").addEventListener("click",()=>{state.calendarMonth=new Date(state.calendarMonth.getFullYear(),state.calendarMonth.getMonth()+1,1);renderCalendar()});$("#todayButton").addEventListener("click",()=>{state.selectedDate=isoToday();state.calendarMonth=new Date();state.calendarMonth.setDate(1);renderCalendar()});
  $("#agendaPrevDay").addEventListener("click",()=>shiftSelectedDate(-1));$("#agendaNextDay").addEventListener("click",()=>shiftSelectedDate(1));
  bindSwipeGesture($("#dayAgenda"),direction=>shiftSelectedDate(direction==="left"?1:-1),{ignore:"button,a,input,select,textarea",threshold:46});
  $("#dayAgenda").addEventListener("click",event=>{const button=event.target.closest(".agenda-add-task");if(!button)return;const c=state.classes.find(item=>classIdentity(item)===button.dataset.classId);if(!c)return;$("#taskTitle").value="";$("#taskCourse").value=canonical(c.code);$("#taskDate").value=c.dateIso;clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal()});
  $("#heroAddTask")?.addEventListener("click",()=>{const panel=$("#focusPanel");if(!panel.dataset.focusCourse)return;$("#taskTitle").value="";$("#taskCourse").value=panel.dataset.focusCourse;$("#taskDate").value=panel.dataset.focusDate||"";clearDialogValidation($("#taskDialog"));$("#taskDialog").showModal()});
  $("#ledgerButton")?.addEventListener("click",()=>{renderLedger();$("#ledgerDialog").showModal()});
  $("#ledgerSearch")?.addEventListener("input",renderLedger);
  $("#ledgerFilters")?.addEventListener("click",e=>{const b=e.target.closest("[data-ledger-filter]");if(!b)return;state.ledgerFilter=b.dataset.ledgerFilter;$$("#ledgerFilters .filter").forEach(x=>x.classList.toggle("active",x===b));renderLedger()});
  bindDismissibleDialog($("#ledgerDialog"));
  bindDismissibleDialog($("#termHeatmapDialog"));
  $("#closeTermHeatmap")?.addEventListener("click",()=>closeDialog($("#termHeatmapDialog")));
  $("#termProgressCard")?.addEventListener("click",()=>{renderTermHeatmap();$("#termHeatmapDialog").showModal()});
  $("#termHeatmapGrid")?.addEventListener("click",e=>{
    const row=e.target.closest(".term-heatmap-row");if(!row)return;
    const weekStart=new Date(row.dataset.weekStart);
    state.selectedDate=`${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,"0")}-${String(weekStart.getDate()).padStart(2,"0")}`;
    state.calendarMonth=new Date(weekStart.getFullYear(),weekStart.getMonth(),1);
    closeDialog($("#termHeatmapDialog"));
    showPage("calendar");
  });
  $(".stat-tiles")?.addEventListener("click",e=>{
    const tile=e.target.closest("[data-stat-action]");if(!tile)return;
    const action=tile.dataset.statAction;
    if(action==="added"){openNotifications();return}
    if(action==="cancelled"){
      const now=new Date();
      const nextCancelled=state.classes.filter(c=>c.status==="Cancelled"&&dateTime(c,"startTime")>=now).sort((a,b)=>dateTime(a,"startTime")-dateTime(b,"startTime"))[0];
      if(nextCancelled){state.selectedDate=nextCancelled.dateIso;state.calendarMonth=new Date(nextCancelled.dateIso+"T00:00:00");state.calendarMonth.setDate(1)}
    }
    showPage("calendar");
  });
  const taskDialog=$("#taskDialog"),noteDialog=$("#noteDialog");
  bindDismissibleDialog(taskDialog);bindDismissibleDialog(noteDialog);
  $("#openTaskForm").addEventListener("click",()=>{editingTaskId=null;$("#taskTitle").value="";$("#taskCourse").value="";$("#taskDate").value="";$("#taskDialog h2").textContent="Add task";$("#saveTaskButton").textContent="Save";clearDialogValidation(taskDialog);taskDialog.showModal()});
  $("#saveTaskButton").addEventListener("click",()=>{const title=$("#taskTitle").value.trim();if(!title){showDialogValidation(taskDialog,"Enter a task title, or close the window to discard.");return}if(editingTaskId){const task=state.tasks.find(t=>t.id===editingTaskId);if(task){task.title=title;task.course=$("#taskCourse").value||"General";task.date=$("#taskDate").value;save(KEYS.tasks,state.tasks);syncTaskToGoogle(task);renderTasks();renderHomeTasks();renderCalendar();renderLedger()}editingTaskId=null}else addTask(title,$("#taskCourse").value,$("#taskDate").value);closeDialog(taskDialog,true)});
  $("#taskFilters")?.addEventListener("click",e=>{const b=e.target.closest("[data-task-filter]");if(!b)return;setTaskFilter(b.dataset.taskFilter)});
  $("#openNoteForm").addEventListener("click",()=>{clearDialogValidation(noteDialog);noteDialog.showModal()});
  $("#saveNoteButton").addEventListener("click",()=>{const title=$("#noteTitle").value.trim(),body=$("#noteBody").value.trim();if(!title||!body){showDialogValidation(noteDialog,"Add a title and note only when you want to save. You can close this window anytime.");return}state.notes.unshift({id:crypto.randomUUID(),title,body,course:$("#noteCourse").value,createdAt:Date.now()});save(KEYS.notes,state.notes);closeDialog(noteDialog,true);renderNotes();renderLedger()});
  $("#noteSearch")?.addEventListener("input",renderNotes);
  $("#profileForm").addEventListener("submit",e=>{e.preventDefault();state.profile={name:$("#profileName").value.trim(),section:$("#profileSection").value,electives:[...(state.profile.electives||[])],theme:$("#profileTheme").value,homeOrder:state.profile.homeOrder||"summary-first"};save(KEYS.profile,state.profile);applyTheme();renderProfile();showToast("Profile updated successfully");syncSchedule(true)});$("#refreshData").addEventListener("click",async e=>{const button=e.currentTarget;button.blur();await syncSchedule(true);button.blur()});$("#resetData").addEventListener("click",()=>{if(confirm("Reset profile, tasks, notes and cached schedule?")){Object.values(KEYS).forEach(k=>localStorage.removeItem(k));localStorage.removeItem("classbl07-home-order-v1");location.reload()}});
$("#busFrom").addEventListener("change",()=>{state.busFrom=$("#busFrom").value;renderBusControls();renderBuses()});$("#busTo").addEventListener("change",()=>{state.busTo=$("#busTo").value;renderBusControls();renderBuses()});$("#swapBusRoute").addEventListener("click",()=>{[state.busFrom,state.busTo]=[state.busTo,state.busFrom];renderBusControls();renderBuses()});$("#mealTabs").addEventListener("click",e=>{const b=e.target.closest("[data-meal]");if(!b)return;state.meal=b.dataset.meal;renderMess()});$("#closeShortcutDialog").addEventListener("click",()=>$("#shortcutDialog").close());document.addEventListener("keydown",e=>{if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName))return;const k=e.key.toLowerCase();if(k==="h")showPage("home");else if(k==="p")showPage("calendar");else if(k==="c")showPage("campus");else if(k==="r")syncSchedule(true);else if(k==="n")openNotifications();else if(e.key==="?")$("#shortcutDialog").showModal()});
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
  else state.scheduleLoading=true;
  // Restore Google Tasks token silently
  const savedToken=getSavedGoogleToken();
  if(savedToken){_googleAccessToken=savedToken.access_token;initGoogleTokenClient().catch(()=>{});pullGoogleTasks().then(async()=>{await migrateGoogleTaskNotes();for(const task of state.tasks.filter(t=>!t.googleTaskId))await syncTaskToGoogle(task)}).catch(()=>{})}
  renderAll();
  renderGoogleTasksStatus();
  maybeOpenOnboarding();
  syncSchedule(false);
  setInterval(()=>{renderHome();renderBuses()},30000);
  setInterval(()=>{if(document.visibilityState==="visible")scheduleIdleSync()},300000);
  setInterval(()=>scheduleGoogleTasksSync(),60000);
  if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js?v=20260817-earthy1",{updateViaCache:"none"}).catch(console.error)
}
document.addEventListener("DOMContentLoaded",init);
})();
