import React, { useState } from 'react';
import TaskCard from './TaskCard.jsx';

export default function Dashboard({ tasks, users, currentUser, onTaskClick, onCreateTask }) {
  const [filter, setFilter] = useState('all');

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filteredTasks = tasks.filter((t) => {
    switch (filter) {
      case 'mine':
        return t.assignees.includes(currentUser.id) || t.createdBy === currentUser.id;
      case 'pending':
        return t.status === 'pending';
      case 'in-progress':
        return t.status === 'in-progress';
      case 'completed':
        return t.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <div className="dashboard" id="dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => setFilter('all')}>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">งานทั้งหมด</div>
        </div>
        <div className="stat-card pending" onClick={() => setFilter('pending')}>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">รอดำเนินการ</div>
        </div>
        <div className="stat-card in-progress" onClick={() => setFilter('in-progress')}>
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">กำลังทำ</div>
        </div>
        <div className="stat-card completed" onClick={() => setFilter('completed')}>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">เสร็จแล้ว</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'mine', label: 'ของฉัน' },
          { key: 'pending', label: 'รอดำเนินการ' },
          { key: 'in-progress', label: 'กำลังทำ' },
          { key: 'completed', label: 'เสร็จแล้ว' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="section-header">
        <span className="section-title">
          <i className="fa-solid fa-list-check"></i>
          รายการงาน ({filteredTasks.length})
        </span>
      </div>

      <div className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} users={users} onClick={onTaskClick} />
          ))
        ) : (
          <div className="empty-state">
            <i className="fa-solid fa-inbox"></i>
            <p>ไม่มีงานในหมวดนี้</p>
            <p className="empty-hint">กดปุ่ม + ด้านล่างเพื่อสร้างงานใหม่</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={onCreateTask} id="create-task-fab">
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
}
