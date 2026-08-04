/* ============================================================
   app.js — shared core logic for both pages.
   Every function here is defined exactly once. No overrides,
   no layered patches. If you need to change behavior, edit
   the function directly rather than adding a new one below it.
   ============================================================ */

const CONFIG = {
  API: "https://script.google.com/macros/s/AKfycbxQWG7cS3quE0C8BBtRVx8PExapIvuqAB5-KLGzQMnOoDNKBMcblxMpztO77jME6EwShQ/exec",
  PROFILE_KEY: "planner-profile-v1",
  SCHEDULE_CACHE_KEY: "planner-schedule-cache-v1",
};

/* ---------- Date & time parsing ----------
   The source sheet uses inconsistent formats, e.g.
   date: "Tuesday, 4 August, 2026"
   time: "9.15 -10.30" or "14.30-15.45"
   Both parsers are defensive: they try a fast path, then fall
   back to regex extraction so odd spacing/punctuation can't
   silently break class detection. */

function normDate(raw) {
  const s = String(raw || "").trim();
  const d = new Date(s);
  if (!isNaN(d)) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
  }
  const months = { January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12 };
  const m = s.match(/(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (m) {
    const mo = months[m[2]] || 1;
    return `${m[3]}-${String(mo).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return s;
}

function normTime(raw) {
  const cleaned = String(raw || "").replace(/\./g, ":").replace(/\s/g, "");
  const [start, end] = cleaned.split("-");
  const pad = (t) => (t || "00:00").padStart(5, "0");
  return [pad(start), pad(end)];
}

function stamp(dateKey, hhmm) {
  return new Date(`${dateKey}T${hhmm}:00+05:30`);
}

function istKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

/* ---------- Schedule fetching ---------- */

async function fetchSchedule() {
  try {
    const res = await fetch(`${CONFIG.API}?ts=${Date.now()}`);
    if (!res.ok) throw new Error("bad response");
    const payload = await res.json();
    const classes = (payload.classes || []).map((e) => {
      const [start, end] = normTime(e.time);
      return { ...e, date: normDate(e.date), start, end };
    });
    const normalized = { ...payload, classes };
    localStorage.setItem(CONFIG.SCHEDULE_CACHE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (err) {
    const cached = localStorage.getItem(CONFIG.SCHEDULE_CACHE_KEY);
    if (cached) return JSON.parse(cached);
    return { success: false, classes: [], availableElectives: [] };
  }
}

/* ---------- Profile ---------- */

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.PROFILE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(CONFIG.PROFILE_KEY, JSON.stringify(profile));
}

/* ---------- Personal filtering ----------
   Core classes: shown if they match the student's section,
   or if the class is marked for "All" sections.
   Elective classes: shown only if the student picked that
   subject's code during profile setup. Matching is done
   against whatever code the API currently sends — nothing
   here is hardcoded to a specific subject code, so a sheet
   rename never silently breaks this. */

function personalClasses(allClasses, profile) {
  if (!profile) return [];
  return allClasses.filter((e) => {
    if (e.status === "Cancelled") return true; // shown, but marked cancelled in UI
    if (e.type === "Core") {
      return e.section === profile.section || e.section === "All";
    }
    const code = e.baseCode || e.code;
    return (profile.electives || []).includes(code);
  });
}

function scheduled(list) {
  return list.filter((e) => e.status !== "Cancelled");
}

function ongoingClass(list) {
  const now = new Date();
  return scheduled(list).find((e) => stamp(e.date, e.start) <= now && stamp(e.date, e.end) > now) || null;
}

function nextClass(list) {
  const now = new Date();
  const upcoming = scheduled(list)
    .filter((e) => stamp(e.date, e.start) > now)
    .sort((a, b) => stamp(a.date, a.start) - stamp(b.date, b.start));
  return upcoming[0] || null;
}

function todaysClasses(list) {
  const today = istKey();
  return list
    .filter((e) => e.date === today)
    .sort((a, b) => stamp(a.date, a.start) - stamp(b.date, b.start));
}

/* ---------- Deterministic subject color ----------
   No hardcoded per-subject colors. Any code — current or
   renamed in the future — gets a stable, distinct hue. */

function subjectColor(code) {
  const str = String(code || "");
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 55% 42%)`;
}

/* ---------- Small formatting helpers ---------- */

function fmtTimeRange(e) {
  return `${e.start}–${e.end}`;
}

function fmtCountdown(ms) {
  if (ms <= 0) return "0m";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Dark mode ---------- */

function initTheme() {
  const saved = localStorage.getItem("planner-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("planner-theme", next);
}
