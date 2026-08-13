import React, { useState } from 'react';

export default function CreateTaskModal({ users, currentUser, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');

  const otherUsers = users;

  const toggleAssignee = (userId) => {
    setAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      createdBy: currentUser.id,
      assignees,
      priority,
      deadline,
    });

    // Reset
    setTitle('');
    setDescription('');
    setAssignees([]);
    setPriority('medium');
    setDeadline('');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-folder-plus"></i>
            สร้างงานใหม่
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">ชื่อเคส / งาน *</label>
            <input
              type="text"
              className="form-input"
              placeholder="เช่น ตรวจสอบสัญญาเช่า ลูกค้า ABC"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              id="task-title-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">รายละเอียด</label>
            <textarea
              className="form-textarea"
              placeholder="อธิบายรายละเอียดงาน..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              id="task-description-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">มอบหมายให้</label>
            <div className="checkbox-group">
              {otherUsers.map((user) => (
                <label
                  key={user.id}
                  className={`checkbox-item ${assignees.includes(user.id) ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={assignees.includes(user.id)}
                    onChange={() => toggleAssignee(user.id)}
                  />
                  <span className="checkbox-mark">
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <span style={{ fontSize: 20 }}>{user.emoji}</span>
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">ความสำคัญ</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                id="task-priority-select"
              >
                <option value="high">🔴 สูง</option>
                <option value="medium">🟡 ปานกลาง</option>
                <option value="low">🔵 ต่ำ</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">กำหนดส่ง</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                id="task-deadline-input"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="save-task-btn">
            <i className="fa-solid fa-check"></i>
            สร้างงาน
          </button>
        </form>
      </div>
    </div>
  );
}
