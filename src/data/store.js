import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'ltt_current_user',
};

export const DEFAULT_USERS = [
  { id: 'kay', name: 'พี่กาย', emoji: '👨‍💼' },
  { id: 'mai', name: 'น้องมาย', emoji: '👩‍💻' },
  { id: 'kob', name: 'พี่กบ', emoji: '🧑‍💼' },
];

// ---------- Current User (Session stored locally per device) ----------

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ---------- Users (Real-time Firestore) ----------

export function subscribeUsers(onUpdate) {
  const usersRef = collection(db, 'users');

  return onSnapshot(
    usersRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default users atomically if collection is empty
        try {
          const batch = writeBatch(db);
          for (const u of DEFAULT_USERS) {
            batch.set(doc(db, 'users', u.id), u);
          }
          await batch.commit();
        } catch (err) {
          console.error('Error seeding default users:', err);
        }
        onUpdate(DEFAULT_USERS);
      } else {
        const existingIds = new Set(snapshot.docs.map((d) => d.id));
        // Backfill any missing default users
        const missingUsers = DEFAULT_USERS.filter((u) => !existingIds.has(u.id));
        if (missingUsers.length > 0) {
          try {
            const batch = writeBatch(db);
            for (const u of missingUsers) {
              batch.set(doc(db, 'users', u.id), u);
            }
            await batch.commit();
          } catch (err) {
            console.error('Error backfilling missing default users:', err);
          }
        }

        const usersList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        onUpdate(usersList);
      }
    },
    (error) => {
      console.error('Error listening to users:', error);
      onUpdate(DEFAULT_USERS);
    }
  );
}

export async function addUser(name, emoji) {
  const newUser = {
    name,
    emoji: emoji || '👤',
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, 'users'), newUser);
  return { id: docRef.id, ...newUser };
}

export async function removeUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}

// ---------- Tasks (Real-time Firestore) ----------

export function subscribeTasks(onUpdate) {
  const tasksRef = collection(db, 'tasks');

  return onSnapshot(
    tasksRef,
    (snapshot) => {
      const tasksList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      // Sort client-side by createdAt descending
      tasksList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(tasksList);
    },
    (error) => {
      console.error('Error listening to tasks:', error);
      onUpdate([]);
    }
  );
}

function withTimeout(promise, ms = 8000, errorMsg = 'การเชื่อมต่อ Database หมดเวลา (กรุณาตรวจแท็บ Rules ใน Firebase Console)') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms)),
  ]);
}

export async function createTask({
  title = '',
  legalIssues = '',
  actionPlan = '',
  description = '',
  createdBy = 'kay',
  assignees = [],
  priority = 'medium',
  deadline = '',
}) {
  const newTask = {
    title: String(title || '').trim(),
    legalIssues: String(legalIssues || '').trim(),
    actionPlan: String(actionPlan || '').trim(),
    description: String(description || '').trim(),
    createdBy: createdBy || 'kay',
    assignees: Array.isArray(assignees) ? assignees : [],
    priority: priority || 'medium',
    status: 'pending',
    deadline: deadline || '',
    createdAt: new Date().toISOString(),
    updates: [],
  };

  const docRef = await withTimeout(addDoc(collection(db, 'tasks'), newTask));
  return { id: docRef.id, ...newTask };
}

export async function addTaskUpdate(taskId, userId, message, newStatus) {
  const taskRef = doc(db, 'tasks', taskId);
  const updateItem = {
    id: 'upd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId: userId || 'kay',
    message: String(message || '').trim(),
    timestamp: new Date().toISOString(),
  };
  if (newStatus) {
    updateItem.newStatus = newStatus;
  }

  const updatePayload = {
    updates: arrayUnion(updateItem),
  };
  if (newStatus) {
    updatePayload.status = newStatus;
  }

  await withTimeout(updateDoc(taskRef, updatePayload));
  return updateItem;
}

export async function updateTask(taskId, updates) {
  const taskRef = doc(db, 'tasks', taskId);
  // Remove any undefined keys to prevent Firestore errors
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );
  await withTimeout(updateDoc(taskRef, cleanUpdates));
}

export async function deleteTask(taskId) {
  const taskRef = doc(db, 'tasks', taskId);
  await withTimeout(deleteDoc(taskRef));
}

// ---------- Stats ----------

export function getTaskStats(tasks = []) {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };
}
