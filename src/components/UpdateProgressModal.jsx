import React, { useState } from 'react';
import CustomSelect from './CustomSelect.jsx';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ', icon: '🔵' },
  { value: 'in-progress', label: 'กำลังทำ', icon: '🟡' },
  { value: 'completed', label: 'เสร็จแล้ว', icon: '🟢' },
];

export default function UpdateProgressModal({ task, currentUser, onSave, onClose }) {
  const [message, setMessage] = useState('');
  const [newStatus, setNewStatus] = useState(task.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSave(task.id, currentUser.id, message.trim(), newStatus);
    setMessage('');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-pen-to-square"></i>
            อัพเดทความคืบหน้า
          </h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">งาน</label>
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {task.title}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ข้อความความคืบหน้า *</label>
            <textarea
              className="form-textarea"
              placeholder="เช่น ส่งเอกสารให้ศาลเรียบร้อยแล้ว / รอตรวจสอบข้อมูลเพิ่มเติม..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
              id="update-message-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">เปลี่ยนสถานะเป็น</label>
            <CustomSelect
              value={newStatus}
              onChange={setNewStatus}
              options={STATUS_OPTIONS}
              placement="up"
              id="update-status-select"
            />
          </div>

          <button type="submit" className="btn btn-primary" id="save-update-btn">
            <i className="fa-solid fa-paper-plane"></i>
            ส่งอัพเดท
          </button>
        </form>
      </div>
    </div>
  );
}
