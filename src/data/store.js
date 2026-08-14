import {
  collection,
  doc,
  getDoc,
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
    subTasks: [],
  };

  const docRef = await withTimeout(addDoc(collection(db, 'tasks'), newTask));
  return { id: docRef.id, ...newTask };
}

export async function addTaskUpdate(taskId, userId, message, newStatus, subTaskId) {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) {
    throw new Error('ไม่พบข้อมูลงาน');
  }
  const taskData = taskSnap.data();

  const updateItem = {
    id: 'upd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId: userId || 'kay',
    message: String(message || '').trim(),
    timestamp: new Date().toISOString(),
  };
  if (newStatus) {
    updateItem.newStatus = newStatus;
  }
  if (subTaskId) {
    updateItem.subTaskId = subTaskId;
  }

  let currentSubTasks = taskData.subTasks || [];
  if (subTaskId && newStatus) {
    currentSubTasks = currentSubTasks.map((s) => {
      if (s.id === subTaskId) {
        return { ...s, status: newStatus };
      }
      return s;
    });
  }

  const newCaseStatus = currentSubTasks.length > 0
    ? computeCaseStatus(currentSubTasks)
    : (newStatus || taskData.status || 'pending');

  const updatePayload = {
    updates: arrayUnion(updateItem),
    subTasks: currentSubTasks,
  };
  if (newCaseStatus) {
    updatePayload.status = newCaseStatus;
  }

  await withTimeout(updateDoc(taskRef, updatePayload));
  return updateItem;
}

export async function editTaskUpdateMessage(taskId, updateId, newMessage, userId) {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) {
    throw new Error('ไม่พบข้อมูลงาน');
  }
  const taskData = taskSnap.data();
  const currentUpdates = taskData.updates || [];

  const updatedUpdates = currentUpdates.map((u) => {
    if (u.id === updateId) {
      const existingHistory = Array.isArray(u.editHistory) ? u.editHistory : [];
      const historyEntry = {
        previousMessage: u.message,
        editedAt: new Date().toISOString(),
        editedBy: userId || 'unknown',
      };
      return {
        ...u,
        message: String(newMessage || '').trim(),
        isEdited: true,
        lastEditedAt: new Date().toISOString(),
        lastEditedBy: userId || 'unknown',
        editHistory: [...existingHistory, historyEntry],
      };
    }
    return u;
  });

  await withTimeout(updateDoc(taskRef, { updates: updatedUpdates }));
  return updatedUpdates;
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

// ---------- Sub-tasks ----------

/** Compute case-level status from sub-tasks */
export function computeCaseStatus(subTasks) {
  if (!subTasks || subTasks.length === 0) return null; // no sub-tasks → use task's own status
  const allCompleted = subTasks.every((s) => s.status === 'completed');
  if (allCompleted) return 'completed';
  const anyInProgress = subTasks.some((s) => s.status === 'in-progress' || s.status === 'completed');
  if (anyInProgress) return 'in-progress';
  return 'pending';
}

export async function addSubTask(taskId, { title, assignees = [], deadline = '', createdBy = 'kay' }) {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) throw new Error('ไม่พบข้อมูลเคส');

  const newSubTask = {
    id: 'sub-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: String(title || '').trim(),
    assignees: Array.isArray(assignees) ? assignees : [],
    status: 'pending',
    deadline: deadline || '',
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'kay',
    updates: [],
  };

  const taskData = taskSnap.data();
  const currentSubTasks = taskData.subTasks || [];
  const updatedSubTasks = [...currentSubTasks, newSubTask];
  const newCaseStatus = computeCaseStatus(updatedSubTasks);

  const updatePayload = { subTasks: updatedSubTasks };
  if (newCaseStatus) updatePayload.status = newCaseStatus;

  await withTimeout(updateDoc(taskRef, updatePayload));
  return newSubTask;
}

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  'in-progress': 'กำลังทำ',
  completed: 'เสร็จแล้ว',
};

export async function updateSubTask(taskId, subTaskId, updates, userId = 'kay') {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) throw new Error('ไม่พบข้อมูลเคส');

  const taskData = taskSnap.data();
  const currentSubTasks = taskData.subTasks || [];
  const targetSub = currentSubTasks.find((s) => s.id === subTaskId);

  // Extract editNote if passed
  const { editNote, ...rawUpdates } = updates;
  const cleanUpdates = Object.fromEntries(
    Object.entries(rawUpdates).filter(([_, v]) => v !== undefined)
  );

  const isStatusChanged = cleanUpdates.status && targetSub && cleanUpdates.status !== targetSub.status;
  const updatedSubTasks = currentSubTasks.map((s) =>
    s.id === subTaskId ? { ...s, ...cleanUpdates } : s
  );
  const newCaseStatus = computeCaseStatus(updatedSubTasks);

  const updatePayload = { subTasks: updatedSubTasks };
  if (newCaseStatus) updatePayload.status = newCaseStatus;

  // If status changed or editNote was provided, log an update in timeline for transparency
  if (isStatusChanged || editNote) {
    const oldStatusLabel = STATUS_LABELS[targetSub?.status] || targetSub?.status || 'รอดำเนินการ';
    const newStatusLabel = STATUS_LABELS[cleanUpdates.status] || cleanUpdates.status || 'รอดำเนินการ';

    let defaultMsg = `ปรับสถานะงานย่อย "${cleanUpdates.title || targetSub?.title || ''}" เป็น "${newStatusLabel}"`;
    if (isStatusChanged) {
      defaultMsg = `ปรับสถานะงานย่อย "${cleanUpdates.title || targetSub?.title || ''}" จาก "${oldStatusLabel}" เป็น "${newStatusLabel}"`;
    }

    const updateItem = {
      id: 'upd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      userId: userId || 'kay',
      message: editNote ? editNote.trim() : defaultMsg,
      newStatus: cleanUpdates.status || targetSub?.status,
      subTaskId: subTaskId,
      timestamp: new Date().toISOString(),
      isSubTaskEditLog: true,
    };
    updatePayload.updates = arrayUnion(updateItem);
  }

  await withTimeout(updateDoc(taskRef, updatePayload));
}

export async function deleteSubTask(taskId, subTaskId) {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) throw new Error('ไม่พบข้อมูลเคส');

  const taskData = taskSnap.data();
  const currentSubTasks = taskData.subTasks || [];
  const updatedSubTasks = currentSubTasks.filter((s) => s.id !== subTaskId);
  const newCaseStatus = computeCaseStatus(updatedSubTasks);

  const updatePayload = { subTasks: updatedSubTasks };
  if (newCaseStatus) updatePayload.status = newCaseStatus;
  else if (updatedSubTasks.length === 0) updatePayload.status = taskData.status || 'pending';

  await withTimeout(updateDoc(taskRef, updatePayload));
}

export async function addSubTaskUpdate(taskId, subTaskId, userId, message, newStatus) {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) throw new Error('ไม่พบข้อมูลเคส');

  const updateItem = {
    id: 'upd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    userId: userId || 'kay',
    message: String(message || '').trim(),
    timestamp: new Date().toISOString(),
  };
  if (newStatus) updateItem.newStatus = newStatus;

  const taskData = taskSnap.data();
  const currentSubTasks = taskData.subTasks || [];
  const updatedSubTasks = currentSubTasks.map((s) => {
    if (s.id === subTaskId) {
      const subUpdates = [...(s.updates || []), updateItem];
      const updatedSub = { ...s, updates: subUpdates };
      if (newStatus) updatedSub.status = newStatus;
      return updatedSub;
    }
    return s;
  });

  const newCaseStatus = computeCaseStatus(updatedSubTasks);
  const updatePayload = { subTasks: updatedSubTasks };
  if (newCaseStatus) updatePayload.status = newCaseStatus;

  await withTimeout(updateDoc(taskRef, updatePayload));
  return updateItem;
}

export async function editSubTaskUpdateMessage(taskId, subTaskId, updateId, newMessage, userId) {
  const taskRef = doc(db, 'tasks', taskId);
  const taskSnap = await withTimeout(getDoc(taskRef));
  if (!taskSnap.exists()) throw new Error('ไม่พบข้อมูลเคส');

  const taskData = taskSnap.data();
  const currentSubTasks = taskData.subTasks || [];
  const updatedSubTasks = currentSubTasks.map((s) => {
    if (s.id === subTaskId) {
      const updatedUpdates = (s.updates || []).map((u) => {
        if (u.id === updateId) {
          const existingHistory = Array.isArray(u.editHistory) ? u.editHistory : [];
          return {
            ...u,
            message: String(newMessage || '').trim(),
            isEdited: true,
            lastEditedAt: new Date().toISOString(),
            lastEditedBy: userId || 'unknown',
            editHistory: [...existingHistory, {
              previousMessage: u.message,
              editedAt: new Date().toISOString(),
              editedBy: userId || 'unknown',
            }],
          };
        }
        return u;
      });
      return { ...s, updates: updatedUpdates };
    }
    return s;
  });

  await withTimeout(updateDoc(taskRef, { subTasks: updatedSubTasks }));
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
