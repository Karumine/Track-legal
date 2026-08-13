import React from 'react';

const STATUS_MAP = {
  pending: { label: 'รอดำเนินการ', icon: 'fa-clock' },
  'in-progress': { label: 'กำลังทำ', icon: 'fa-spinner' },
  completed: { label: 'เสร็จแล้ว', icon: 'fa-circle-check' },
};

const PRIORITY_MAP = {
  high: 'สูง',
  medium: 'ปานกลาง',
  low: 'ต่ำ',
};

export default function TaskCard({ task, users, onClick }) {
  const status = STATUS_MAP[task.status] || STATUS_MAP.pending;
  const assigneeUsers = users.filter((u) => task.assignees.includes(u.id));
  const creatorUser = users.find((u) => u.id === task.createdBy);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  const isOverdue = task.deadline && task.status !== 'completed' && new Date(task.deadline) < new Date();

  return (
    <div
      className={`task-card priority-${task.priority}`}
      onClick={() => onClick(task.id)}
      id={`task-card-${task.id}`}
    >
      <div className="task-card-header">
        <span className="task-card-title">{task.title}</span>
        <span className={`status-badge ${task.status}`}>
          <i className={`fa-solid ${status.icon}`}></i>
          {status.label}
        </span>
      </div>

      <div className="task-card-meta">
        <span className={`priority-badge ${task.priority}`}>
          <i className="fa-solid fa-flag"></i> {PRIORITY_MAP[task.priority]}
        </span>
        {task.deadline && (
          <span style={{ color: isOverdue ? 'var(--danger)' : undefined }}>
            <i className="fa-regular fa-calendar"></i>
            {formatDate(task.deadline)}
            {isOverdue && <span style={{ marginLeft: 4 }}>⚠️</span>}
          </span>
        )}
        {creatorUser && (
          <span>
            <i className="fa-solid fa-user-pen"></i>
            {creatorUser.name}
          </span>
        )}
        {task.updates.length > 0 && (
          <span>
            <i className="fa-solid fa-comments"></i>
            {task.updates.length}
          </span>
        )}
      </div>

      {assigneeUsers.length > 0 && (
        <div className="task-assignees">
          {assigneeUsers.map((u) => (
            <span key={u.id} className="task-assignee-chip">
              <span className="chip-emoji">{u.emoji}</span>
              {u.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
