import React, { useState } from 'react';
import CustomSelect from './CustomSelect.jsx';
import EditTaskModal from './EditTaskModal.jsx';

const STATUS_MAP = {
  pending: { label: 'รอดำเนินการ', icon: 'fa-clock' },
  'in-progress': { label: 'กำลังทำ', icon: 'fa-spinner' },
  completed: { label: 'เสร็จแล้ว', icon: 'fa-circle-check' },
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ', icon: '🔵' },
  { value: 'in-progress', label: 'กำลังทำ', icon: '🟡' },
  { value: 'completed', label: 'เสร็จแล้ว', icon: '🟢' },
];

const PRIORITY_MAP = {
  high: { label: 'สูง', icon: '🔴' },
  medium: { label: 'ปานกลาง', icon: '🟡' },
  low: { label: 'ต่ำ', icon: '🔵' },
};

export default function TaskDetail({ task, users, currentUser, onBack, onUpdate, onEdit, onDelete }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState(task.status);

  const creatorUser = users.find((u) => u.id === task.createdBy);
  const assigneeUsers = users.filter((u) => task.assignees.includes(u.id));
  const status = STATUS_MAP[task.status] || STATUS_MAP.pending;
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!updateMessage.trim()) return;
    onUpdate(task.id, currentUser.id, updateMessage.trim(), updateStatus);
    setUpdateMessage('');
    setUpdateStatus(task.status);
    setShowUpdateModal(false);
  };

  const isOverdue = task.deadline && task.status !== 'completed' && new Date(task.deadline) < new Date();

  return (
    <div className="detail-view" id="task-detail">
      {/* Header section */}
      <div className="detail-header-section">
        <div className="detail-top-nav">
          <button className="detail-back" onClick={onBack}>
            <i className="fa-solid fa-chevron-left"></i>
            กลับ
          </button>
          <button
            className="btn-edit-task"
            onClick={() => setShowEditModal(true)}
            id="top-edit-task-btn"
          >
            <i className="fa-solid fa-pen-to-square"></i>
            แก้ไขข้อมูลงาน
          </button>
        </div>

        <h1 className="detail-title">{task.title}</h1>

        {task.legalIssues && (
          <div className="detail-section-card">
            <div className="detail-section-label">
              <i className="fa-solid fa-scale-balanced" style={{ color: 'var(--info)' }}></i>
              <span>1. สรุป ประเด็นข้อกฏหมาย / ข้อเท็จจริงที่คุยกัน</span>
            </div>
            <p className="detail-section-content">{task.legalIssues}</p>
          </div>
        )}

        {task.actionPlan && (
          <div className="detail-section-card">
            <div className="detail-section-label">
              <i className="fa-solid fa-list-check" style={{ color: 'var(--success)' }}></i>
              <span>2. สรุปความเห็น / มติที่ประชุม (ความเห็นควร / Action Plan ที่ต้องทำ)</span>
            </div>
            <p className="detail-section-content">{task.actionPlan}</p>
          </div>
        )}

        {!task.legalIssues && !task.actionPlan && task.description && (
          <p className="detail-description">{task.description}</p>
        )}

        <div className="detail-meta">
          <span className={`status-badge ${task.status}`}>
            <i className={`fa-solid ${status.icon}`}></i>
            {status.label}
          </span>
          <span className={`priority-badge ${task.priority}`}>
            {priority.icon} {priority.label}
          </span>
          {task.deadline && (
            <span className="detail-meta-item" style={{ color: isOverdue ? 'var(--danger)' : undefined }}>
              <i className="fa-regular fa-calendar"></i>
              {formatDate(task.deadline)}
              {isOverdue && ' (เลยกำหนด!)'}
            </span>
          )}
          {creatorUser && (
            <span className="detail-meta-item">
              <i className="fa-solid fa-user-pen"></i>
              สร้างโดย {creatorUser.name}
            </span>
          )}
        </div>

        {assigneeUsers.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
              ผู้รับผิดชอบ:
            </span>
            <div className="task-assignees">
              {assigneeUsers.map((u) => (
                <span key={u.id} className="task-assignee-chip">
                  <span className="chip-emoji">{u.emoji}</span>
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="timeline-section">
        <div className="timeline-title">
          <i className="fa-solid fa-clock-rotate-left"></i>
          ประวัติความคืบหน้า ({task.updates.length})
        </div>

        {task.updates.length > 0 ? (
          <div className="timeline">
            {[...task.updates].reverse().map((update) => {
              const updateUser = users.find((u) => u.id === update.userId);
              const statusChanged = update.newStatus !== task.status;
              return (
                <div key={update.id} className={`timeline-item ${statusChanged ? 'status-change' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <span className="timeline-user">
                        {updateUser ? updateUser.emoji : '👤'}{' '}
                        {updateUser ? updateUser.name : 'ไม่ทราบ'}
                      </span>
                      <span className="timeline-time">{formatDateTime(update.timestamp)}</span>
                    </div>
                    <p className="timeline-message">{update.message}</p>
                    {update.newStatus && (
                      <div className="timeline-status-change">
                        <span className={`status-badge ${update.newStatus}`} style={{ fontSize: 10 }}>
                          <i className={`fa-solid ${(STATUS_MAP[update.newStatus] || {}).icon}`}></i>
                          {(STATUS_MAP[update.newStatus] || {}).label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="timeline-empty">
            <i className="fa-regular fa-comment-dots"></i>
            <p>ยังไม่มีการอัพเดทความคืบหน้า</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="update-bar">
        <div className="btn-group" style={{ flexDirection: 'column', gap: 8 }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowUpdateModal(true)}
            id="open-update-btn"
          >
            <i className="fa-solid fa-comment-medical"></i>
            อัพเดทความคืบหน้า
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setShowEditModal(true)}
              id="bottom-edit-task-btn"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              แก้ไขข้อมูลงาน
            </button>
            <button
              className="btn btn-danger btn-sm"
              style={{ flex: 1 }}
              onClick={() => setShowDeleteConfirm(true)}
              id="delete-task-btn"
            >
              <i className="fa-regular fa-trash-can"></i>
              ลบงานนี้
            </button>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          users={users}
          onSave={(updatedData) => {
            onEdit(task.id, updatedData);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowUpdateModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-pen-to-square"></i>
                อัพเดทความคืบหน้า
              </h3>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate} className="modal-body">
              <div className="form-group">
                <label className="form-label">ข้อความ *</label>
                <textarea
                  className="form-textarea"
                  placeholder="เช่น ส่งเอกสารให้ศาลเรียบร้อยแล้ว..."
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  rows={4}
                  required
                  autoFocus
                  id="update-msg-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">เปลี่ยนสถานะ</label>
                <CustomSelect
                  value={updateStatus}
                  onChange={setUpdateStatus}
                  options={STATUS_OPTIONS}
                  id="update-status-sel"
                />
              </div>
              <button type="submit" className="btn btn-primary" id="submit-update-btn">
                <i className="fa-solid fa-paper-plane"></i>
                ส่งอัพเดท
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div className="modal-content">
            <div className="delete-confirm">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <h3 style={{ marginBottom: 8, fontSize: 17 }}>ยืนยันลบงานนี้?</h3>
              <p>"{task.title}" จะถูกลบอย่างถาวร</p>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  ยกเลิก
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    onDelete(task.id);
                    setShowDeleteConfirm(false);
                  }}
                  id="confirm-delete-btn"
                >
                  <i className="fa-regular fa-trash-can"></i>
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
