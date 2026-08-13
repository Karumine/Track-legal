import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import CreateTaskModal from './components/CreateTaskModal.jsx';
import ManageUsers from './components/ManageUsers.jsx';
import {
  getUsers,
  getCurrentUser,
  setCurrentUser,
  logout as logoutUser,
  addUser,
  removeUser,
  getTasks,
  createTask,
  addTaskUpdate,
  deleteTask,
  updateTask,
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
  const [users, setUsers] = useState(getUsers());
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());
  const [tasks, setTasks] = useState(getTasks());
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'detail' | 'manage-users'
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Refresh data from localStorage
  const refreshData = useCallback(() => {
    setUsers(getUsers());
    setTasks(getTasks());
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
    refreshData();
    showToast(`สวัสดี ${user.name}! 👋`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    setView('dashboard');
    setSelectedTaskId(null);
  };

  // ---------- Users ----------
  const handleAddUser = (name, emoji) => {
    addUser(name, emoji);
    refreshData();
    showToast(`เพิ่มผู้ใช้ "${name}" แล้ว`);
  };

  const handleRemoveUser = (userId) => {
    removeUser(userId);
    refreshData();
    showToast('ลบผู้ใช้แล้ว');
  };

  // ---------- Tasks ----------
  const handleCreateTask = (taskData) => {
    createTask(taskData);
    refreshData();
    setShowCreateModal(false);
    showToast('สร้างงานใหม่แล้ว! 📋');
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setView('detail');
  };

  const handleUpdateTask = (taskId, userId, message, newStatus) => {
    addTaskUpdate(taskId, userId, message, newStatus);
    refreshData();
    // Update the selected task view
    showToast('อัพเดทความคืบหน้าแล้ว! ✅');
  };

  const handleEditTask = (taskId, updatedData) => {
    updateTask(taskId, updatedData);
    refreshData();
    showToast('แก้ไขข้อมูลงานเรียบร้อย! ✏️');
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    refreshData();
    setView('dashboard');
    setSelectedTaskId(null);
    showToast('ลบงานแล้ว');
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
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
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
