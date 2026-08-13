// ==========================================
// localStorage Data Store
// ==========================================

const STORAGE_KEYS = {
  USERS: 'ltt_users',
  TASKS: 'ltt_tasks',
  CURRENT_USER: 'ltt_current_user',
};

const DEFAULT_USERS = [
  { id: 'kay', name: 'พี่กาย', emoji: '👨‍💼' },
  { id: 'mai', name: 'น้องมาย', emoji: '👩‍💻' },
  { id: 'kob', name: 'พี่กบ', emoji: '🧑‍💼' },
];

// ---------- Users ----------

export function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(raw);
}

export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function addUser(name, emoji) {
  const users = getUsers();
  const id = 'user-' + Date.now().toString(36);
  const newUser = { id, name, emoji };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function removeUser(userId) {
  let users = getUsers();
  users = users.filter((u) => u.id !== userId);
  saveUsers(users);
}

export function getUserById(userId) {
  return getUsers().find((u) => u.id === userId) || null;
}

// ---------- Current User (Session) ----------

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ---------- Tasks ----------

export function getTasks() {
  const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function createTask({ title, description, createdBy, assignees, priority, deadline }) {
  const tasks = getTasks();
  const newTask = {
    id: 'task-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title,
    description: description || '',
    createdBy,
    assignees: assignees || [],
    priority: priority || 'medium',
    status: 'pending',
    deadline: deadline || '',
    createdAt: new Date().toISOString(),
    updates: [],
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
}

export function getTaskById(taskId) {
  return getTasks().find((t) => t.id === taskId) || null;
}

export function addTaskUpdate(taskId, userId, message, newStatus) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const update = {
    id: 'upd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId,
    message,
    newStatus: newStatus || task.status,
    timestamp: new Date().toISOString(),
  };

  task.updates.push(update);
  if (newStatus) task.status = newStatus;
  saveTasks(tasks);
  return task;
}

export function deleteTask(taskId) {
  let tasks = getTasks();
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks(tasks);
}

export function updateTask(taskId, updates) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasks(tasks);
  return tasks[idx];
}

// ---------- Stats ----------

export function getTaskStats(tasks) {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };
}
