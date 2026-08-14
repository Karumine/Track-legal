import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import CreateTaskModal from './components/CreateTaskModal.jsx';
import ManageUsers from './components/ManageUsers.jsx';
import {
  DEFAULT_USERS,
  subscribeUsers,
  subscribeTasks,
  getCurrentUser,
  setCurrentUser,
  logout as logoutUser,
  addUser,
  removeUser,
  createTask,
  addTaskUpdate,
  editTaskUpdateMessage,
  deleteTask,
  updateTask,
  addSubTask,
  updateSubTask,
  deleteSubTask,
  addSubTaskUpdate,
  editSubTaskUpdateMessage,
} from './data/store.js';
import { exportTasksToPdf } from './utils/pdf.js';

// Toast component
function Toast({ toast, onHide }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => onHide(), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast, onHide]);

  if (!toast) return null;

  return (
    <div className={`toast ${toast.type}`}>
      <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
      {toast.message}
    </div>
  );
}

export default function App() {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'detail' | 'manage-users'
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Subscribe to real-time Firestore data
  useEffect(() => {
    const unsubUsers = subscribeUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    const unsubTasks = subscribeTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubTasks();
    };
  }, []);

  // Ensure focused inputs in modals/forms scroll into view above virtual keyboards on mobile
  useEffect(() => {
    const handleFocusIn = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) {
        setTimeout(() => {
          try {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (err) {
            // fallback
          }
        }, 280);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    return () => window.removeEventListener('focusin', handleFocusIn);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // ---------- Auth ----------
  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentUserState(user);
    showToast(`สวัสดี ${user.name}! 👋`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    setView('dashboard');
    setSelectedTaskId(null);
  };

  // ---------- Users ----------
  const handleAddUser = async (name, emoji) => {
    try {
      await addUser(name, emoji);
      showToast(`เพิ่มผู้ใช้ "${name}" แล้ว`);
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้', 'error');
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeUser(userId);
      showToast('ลบผู้ใช้แล้ว');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการลบผู้ใช้', 'error');
    }
  };

  // ---------- Tasks ----------
  const handleCreateTask = async (taskData) => {
    try {
      const created = await createTask(taskData);
      setShowCreateModal(false);
      if (created?.id) {
        setSelectedTaskId(created.id);
        setView('detail');
      } else {
        setView('dashboard');
      }
      showToast('สร้างงานใหม่สำเร็จแล้ว! 📋');
    } catch (err) {
      console.error('Error in handleCreateTask:', err);
      showToast('เกิดข้อผิดพลาดในการสร้างงาน: ' + (err.code || err.message || 'ตรวจ Security Rules'), 'error');
    }
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setView('detail');
  };

  const handleUpdateTask = async (taskId, userId, message, newStatus, subTaskId) => {
    try {
      await addTaskUpdate(taskId, userId, message, newStatus, subTaskId);
      showToast('อัพเดทความคืบหน้าแล้ว! ✅');
    } catch (err) {
      console.error('Error in handleUpdateTask:', err);
      showToast('เกิดข้อผิดพลาดในการอัพเดท: ' + (err.code || err.message || 'ตรวจ Security Rules'), 'error');
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    try {
      await updateTask(taskId, updatedData);
      showToast('แก้ไขข้อมูลงานเรียบร้อย! ✏️');
    } catch (err) {
      console.error('Error in handleEditTask:', err);
      showToast('เกิดข้อผิดพลาดในการแก้ไขงาน: ' + (err.code || err.message || 'ตรวจ Security Rules'), 'error');
    }
  };

  const handleEditUpdateMessage = async (taskId, updateId, newMessage) => {
    try {
      await editTaskUpdateMessage(taskId, updateId, newMessage, currentUser.id);
      showToast('แก้ไขข้อความเรียบร้อย! ✏️');
    } catch (err) {
      console.error('Error in handleEditUpdateMessage:', err);
      showToast('เกิดข้อผิดพลาดในการแก้ไขข้อความ: ' + (err.code || err.message || 'ตรวจ Security Rules'), 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setView('dashboard');
      setSelectedTaskId(null);
      showToast('ลบงานแล้ว');
    } catch (err) {
      console.error('Error in handleDeleteTask:', err);
      showToast('เกิดข้อผิดพลาดในการลบงาน: ' + (err.code || err.message || 'ตรวจ Security Rules'), 'error');
    }
  };

  // ---------- Sub-tasks ----------
  const handleAddSubTask = async (taskId, subTaskData) => {
    try {
      await addSubTask(taskId, subTaskData);
      showToast('เพิ่มงานย่อยแล้ว! 📌');
    } catch (err) {
      console.error('Error in handleAddSubTask:', err);
      showToast('เกิดข้อผิดพลาด: ' + (err.code || err.message), 'error');
    }
  };

  const handleUpdateSubTask = async (taskId, subTaskId, updates) => {
    try {
      await updateSubTask(taskId, subTaskId, updates);
    } catch (err) {
      console.error('Error in handleUpdateSubTask:', err);
      showToast('เกิดข้อผิดพลาด: ' + (err.code || err.message), 'error');
    }
  };

  const handleDeleteSubTask = async (taskId, subTaskId) => {
    try {
      await deleteSubTask(taskId, subTaskId);
      showToast('ลบงานย่อยแล้ว');
    } catch (err) {
      console.error('Error in handleDeleteSubTask:', err);
      showToast('เกิดข้อผิดพลาด: ' + (err.code || err.message), 'error');
    }
  };

  const handleAddSubTaskUpdate = async (taskId, subTaskId, userId, message, newStatus) => {
    try {
      await addSubTaskUpdate(taskId, subTaskId, userId, message, newStatus);
      showToast('อัพเดทงานย่อยแล้ว! ✅');
    } catch (err) {
      console.error('Error in handleAddSubTaskUpdate:', err);
      showToast('เกิดข้อผิดพลาด: ' + (err.code || err.message), 'error');
    }
  };

  const handleEditSubTaskUpdateMessage = async (taskId, subTaskId, updateId, newMessage) => {
    try {
      await editSubTaskUpdateMessage(taskId, subTaskId, updateId, newMessage, currentUser.id);
      showToast('แก้ไขข้อความเรียบร้อย! ✏️');
    } catch (err) {
      console.error('Error in handleEditSubTaskUpdateMessage:', err);
      showToast('เกิดข้อผิดพลาด: ' + (err.code || err.message), 'error');
    }
  };

  const handleExportPdf = () => {
    exportTasksToPdf(tasks, users, currentUser);
    showToast('กำลังสร้างรายงาน PDF...');
  };

  // ---------- Not logged in ----------
  if (!currentUser) {
    return (
      <div className="app-container">
        <Toast toast={toast} onHide={hideToast} />
        {view === 'manage-users' ? (
          <ManageUsers
            users={users}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
            onBack={() => setView('dashboard')}
          />
        ) : (
          <LoginScreen
            users={users}
            onSelectUser={handleLogin}
            onManageUsers={() => setView('manage-users')}
          />
        )}
      </div>
    );
  }

  // ---------- Logged in ----------
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;

  return (
    <div className="app-container">
      <Toast toast={toast} onHide={hideToast} />
      <Header currentUser={currentUser} onLogout={handleLogout} onExportPdf={handleExportPdf} />

      {view === 'detail' && selectedTask ? (
        <TaskDetail
          task={selectedTask}
          users={users}
          currentUser={currentUser}
          onBack={() => {
            setView('dashboard');
            setSelectedTaskId(null);
          }}
          onUpdate={handleUpdateTask}
          onEditUpdateMessage={handleEditUpdateMessage}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAddSubTask={handleAddSubTask}
          onUpdateSubTask={handleUpdateSubTask}
          onDeleteSubTask={handleDeleteSubTask}
          onAddSubTaskUpdate={handleAddSubTaskUpdate}
          onEditSubTaskUpdateMessage={handleEditSubTaskUpdateMessage}
        />
      ) : view === 'manage-users' ? (
        <ManageUsers
          users={users}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
          onBack={() => setView('dashboard')}
        />
      ) : (
        <Dashboard
          tasks={tasks}
          users={users}
          currentUser={currentUser}
          onTaskClick={handleTaskClick}
          onCreateTask={() => setShowCreateModal(true)}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          users={users}
          currentUser={currentUser}
          onSave={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
