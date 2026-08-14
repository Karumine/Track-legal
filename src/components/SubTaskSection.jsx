import React, { useState } from 'react';
import CustomDatePicker from './CustomDatePicker.jsx';

const STATUS_MAP = {
  pending: { label: 'รอดำเนินการ', icon: 'fa-clock', color: 'var(--info)' },
  'in-progress': { label: 'กำลังทำ', icon: 'fa-spinner fa-spin', color: 'var(--warning)' },
  completed: { label: 'เสร็จแล้ว', icon: 'fa-circle-check', color: 'var(--success)' },
};

export default function SubTaskSection({
  task,
  users,
  currentUser,
  onAddSubTask,
  onUpdateSubTask,
  onDeleteSubTask,
  onOpenUpdateModal,
}) {
  const subTasks = task.subTasks || [];
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignees, setNewAssignees] = useState([]);
  const [newDeadline, setNewDeadline] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit sub-task modal
  const [editingSubTaskId, setEditingSubTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAssignees, setEditAssignees] = useState([]);
  const [editDeadline, setEditDeadline] = useState('');

  // Delete confirm
  const [deletingSubId, setDeletingSubId] = useState(null);

  const completedCount = subTasks.filter((s) => s.status === 'completed').length;
  const progressPercent = subTasks.length > 0 ? Math.round((completedCount / subTasks.length) * 100) : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  const toggleAssignee = (userId, setter, current) => {
    setter(current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]);
  };

  const handleAddSubTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || isAdding) return;
    try {
      setIsAdding(true);
      await onAddSubTask(task.id, {
        title: newTitle.trim(),
        assignees: newAssignees,
        deadline: newDeadline,
        createdBy: currentUser?.id || 'kay',
      });
      setNewTitle('');
      setNewAssignees([]);
      setNewDeadline('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding sub-task:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editingSubTaskId) return;
    await onUpdateSubTask(task.id, editingSubTaskId, {
      title: editTitle.trim(),
      assignees: editAssignees,
      deadline: editDeadline,
    });
    setEditingSubTaskId(null);
  };

  return (
    <div className="subtask-section" id="subtask-section">
      {/* Header with progress */}
      <div className="subtask-header">
        <div className="subtask-header-left">
          <i className="fa-solid fa-list-check"></i>
          <span>รายการงานย่อย ({subTasks.length})</span>
        </div>
        <button
          className="subtask-add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          id="add-subtask-btn"
        >
          <i className={`fa-solid ${showAddForm ? 'fa-xmark' : 'fa-plus'}`}></i>
          {showAddForm ? 'ยกเลิก' : 'เพิ่มงาน'}
        </button>
      </div>

      {/* Progress bar */}
      {subTasks.length > 0 && (
        <div className="subtask-progress">
          <div className="subtask-progress-bar">
            <div
              className="subtask-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="subtask-progress-text">
            {completedCount}/{subTasks.length} เสร็จ ({progressPercent}%)
          </span>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <form className="subtask-add-form" onSubmit={handleAddSubTask}>
          <div className="form-group">
            <label className="form-label">ชื่องานย่อย *</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น ร่างหนังสือแจ้งเตือน, ยื่นคำร้องต่อศาล..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              autoFocus
              id="subtask-title-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">มอบหมายให้</label>
            <div className="checkbox-chips compact">
              {users.map((user) => {
                const isSelected = newAssignees.includes(user.id);
                return (
                  <button
                    type="button"
                    key={user.id}
                    className={`checkbox-chip ${isSelected ? 'checked' : ''}`}
                    onClick={() => toggleAssignee(user.id, setNewAssignees, newAssignees)}
                  >
                    <span className="chip-emoji">{user.emoji}</span>
                    <span className="chip-name">{user.name}</span>
                    {isSelected && <i className="fa-solid fa-check chip-check"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">กำหนดส่ง</label>
            <CustomDatePicker
              value={newDeadline}
              onChange={setNewDeadline}
              placeholder="เลือกวัน..."
              placement="auto"
              id="subtask-deadline-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isAdding}
            id="save-subtask-btn"
          >
            {isAdding ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                กำลังเพิ่ม...
              </>
            ) : (
              <>
                <i className="fa-solid fa-plus"></i>
                บันทึกงานย่อย
              </>
            )}
          </button>
        </form>
      )}

      {/* Sub-task list */}
      <div className="subtask-list">
        {subTasks.length === 0 && !showAddForm && (
          <div className="subtask-empty">
            <i className="fa-regular fa-rectangle-list"></i>
            <p>ยังไม่มีงานย่อยในเคสนี้</p>
            <p className="empty-hint">กดปุ่ม "+ เพิ่มงาน" ด้านบนเพื่อแบ่งงานย่อย</p>
          </div>
        )}

        {subTasks.map((sub, index) => {
          const subStatus = STATUS_MAP[sub.status] || STATUS_MAP.pending;
          const subAssignees = users.filter((u) => (sub.assignees || []).includes(u.id));
          const isOverdue = sub.deadline && sub.status !== 'completed' && new Date(sub.deadline) < new Date();

          return (
            <div key={sub.id} className={`subtask-item ${sub.status}`}>
              <div className="subtask-item-header">
                {/* Checkbox status circle button */}
                <button
                  type="button"
                  className={`subtask-status-btn ${sub.status}`}
                  onClick={() => {
                    const nextStatus = sub.status === 'pending' ? 'in-progress'
                      : sub.status === 'in-progress' ? 'completed' : 'pending';
                    onUpdateSubTask(task.id, sub.id, { status: nextStatus });
                  }}
                  title={`สถานะ: ${subStatus.label} (คลิกเพื่อเปลี่ยน)`}
                >
                  <i className={`fa-solid ${
                    sub.status === 'completed' ? 'fa-circle-check'
                      : sub.status === 'in-progress' ? 'fa-circle-half-stroke'
                        : 'fa-circle'
                  }`}></i>
                </button>

                {/* Sub-task title & metadata */}
                <div className="subtask-item-info">
                  <div className="subtask-item-title-row">
                    <span className={`subtask-item-title ${sub.status === 'completed' ? 'done' : ''}`}>
                      {index + 1}. {sub.title}
                    </span>
                    <span className={`subtask-status-tag ${sub.status}`}>
                      {subStatus.label}
                    </span>
                  </div>

                  <div className="subtask-item-meta">
                    {subAssignees.map((u) => (
                      <span key={u.id} className="subtask-assignee-mini" title={u.name}>
                        {u.emoji} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.name}</span>
                      </span>
                    ))}
                    {sub.deadline && (
                      <span className={`subtask-deadline-mini ${isOverdue ? 'overdue' : ''}`}>
                        <i className="fa-regular fa-calendar"></i>
                        {formatDate(sub.deadline)}
                        {isOverdue && ' (เลยกำหนด!)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="subtask-item-actions">
                  <button
                    type="button"
                    className="subtask-quick-action-btn update"
                    onClick={() => onOpenUpdateModal && onOpenUpdateModal(sub.id)}
                    title="อัพเดทความคืบหน้างาย่อยนี้"
                  >
                    <i className="fa-solid fa-comment-dots"></i>
                    <span>อัพเดท</span>
                  </button>
                  <button
                    type="button"
                    className="subtask-icon-btn"
                    onClick={() => {
                      setEditingSubTaskId(sub.id);
                      setEditTitle(sub.title);
                      setEditAssignees(sub.assignees || []);
                      setEditDeadline(sub.deadline || '');
                    }}
                    title="แก้ไขข้อมูลงานย่อย"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    type="button"
                    className="subtask-icon-btn danger"
                    onClick={() => setDeletingSubId(sub.id)}
                    title="ลบงานย่อยนี้"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Sub-task Modal */}
      {editingSubTaskId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingSubTaskId(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-pen-to-square"></i>
                แก้ไขงานย่อย
              </h3>
              <button className="modal-close" onClick={() => setEditingSubTaskId(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">ชื่องานย่อย *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  autoFocus
                  id="edit-subtask-title-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">มอบหมายให้</label>
                <div className="checkbox-chips compact">
                  {users.map((user) => {
                    const isSelected = editAssignees.includes(user.id);
                    return (
                      <button
                        type="button"
                        key={user.id}
                        className={`checkbox-chip ${isSelected ? 'checked' : ''}`}
                        onClick={() => toggleAssignee(user.id, setEditAssignees, editAssignees)}
                      >
                        <span className="chip-emoji">{user.emoji}</span>
                        <span className="chip-name">{user.name}</span>
                        {isSelected && <i className="fa-solid fa-check chip-check"></i>}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">กำหนดส่ง</label>
                <CustomDatePicker
                  value={editDeadline}
                  onChange={setEditDeadline}
                  placeholder="เลือกวัน..."
                  placement="up"
                  id="edit-subtask-deadline-input"
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setEditingSubTaskId(null)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  onClick={handleSaveEdit}
                  id="save-edit-subtask-btn"
                >
                  <i className="fa-solid fa-check"></i>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sub-task Confirm */}
      {deletingSubId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeletingSubId(null)}>
          <div className="modal-content">
            <div className="delete-confirm">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <h3 style={{ marginBottom: 8, fontSize: 17 }}>ยืนยันลบงานย่อยนี้?</h3>
              <p>"{subTasks.find((s) => s.id === deletingSubId)?.title}" จะถูกลบ</p>
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={() => setDeletingSubId(null)}>
                  ยกเลิก
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    onDeleteSubTask(task.id, deletingSubId);
                    setDeletingSubId(null);
                  }}
                  id="confirm-delete-subtask-btn"
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
