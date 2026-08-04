/* ============================================================
   tasks.js — local task list + Google Tasks sync.
   These two halves are intentionally isolated: if Google auth
   fails or the network is down, local tasks keep working.
   ============================================================ */

const TASKS_KEY = "planner-tasks-v1";
const NOTES_KEY = "planner-notes-v1";

const GOOGLE_TASKS_CLIENT_ID = "326019358906-4dpbtbmnp6rm6a7m8bikcir4a2pejiot.apps.googleusercontent.com";
const GOOGLE_TASKS_SCOPE = "https://www.googleapis.com/auth/tasks";

let googleToken = null;
let tokenClient = null;

/* ---------- Local tasks ---------- */

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTasks(list) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(list));
}

function addTask(title, due) {
  const list = loadTasks();
  list.push({ id: `local-${Date.now()}`, title, due: due || null, done: false, source: "local" });
  saveTasks(list);
  return list;
}

function toggleTask(id) {
  const list = loadTasks();
  const t = list.find((x) => x.id === id);
  if (t) t.done = !t.done;
  saveTasks(list);
  if (t && t.source === "google" && googleToken) {
    updateGoogleTask(t).catch(() => {});
  }
  return list;
}

function deleteTask(id) {
  const list = loadTasks().filter((x) => x.id !== id);
  saveTasks(list);
  return list;
}

/* ---------- Notes ---------- */

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotes(list) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(list));
}

function addNote(text) {
  const list = loadNotes();
  list.unshift({ id: `note-${Date.now()}`, text, createdAt: new Date().toISOString() });
  saveNotes(list);
  return list;
}

function deleteNote(id) {
  const list = loadNotes().filter((n) => n.id !== id);
  saveNotes(list);
  return list;
}

/* ---------- Google Tasks sync ---------- */

function initGoogleTasksClient(onTokenReceived) {
  if (typeof google === "undefined" || !google.accounts) return false;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_TASKS_CLIENT_ID,
    scope: GOOGLE_TASKS_SCOPE,
    callback: (response) => {
      if (response.error) return;
      googleToken = response.access_token;
      if (onTokenReceived) onTokenReceived();
    },
  });
  return true;
}

function requestGoogleTasksAccess() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken();
}

async function googleTasksApi(path, options = {}) {
  if (!googleToken) throw new Error("not authenticated");
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${googleToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Google Tasks API error: ${res.status}`);
  return res.json();
}

async function fetchGoogleTasks() {
  const data = await googleTasksApi("/lists/@default/tasks?showCompleted=true");
  const googleItems = (data.items || []).map((g) => ({
    id: `google-${g.id}`,
    googleId: g.id,
    title: g.title,
    due: g.due || null,
    done: g.status === "completed",
    source: "google",
  }));
  const local = loadTasks().filter((t) => t.source !== "google");
  saveTasks([...local, ...googleItems]);
  return loadTasks();
}

async function pushLocalTaskToGoogle(task) {
  const created = await googleTasksApi("/lists/@default/tasks", {
    method: "POST",
    body: JSON.stringify({ title: task.title, due: task.due || undefined }),
  });
  const list = loadTasks().map((t) =>
    t.id === task.id ? { ...t, id: `google-${created.id}`, googleId: created.id, source: "google" } : t
  );
  saveTasks(list);
  return list;
}

async function updateGoogleTask(task) {
  if (!task.googleId) return;
  await googleTasksApi(`/lists/@default/tasks/${task.googleId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: task.done ? "completed" : "needsAction" }),
  });
}
