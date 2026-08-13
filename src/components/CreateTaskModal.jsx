import React, { useState } from 'react';
import CustomSelect from './CustomSelect.jsx';
import CustomDatePicker from './CustomDatePicker.jsx';

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'สูง', icon: '🔴' },
  { value: 'medium', label: 'ปานกลาง', icon: '🟡' },
  { value: 'low', label: 'ต่ำ', icon: '🔵' },
];

export default function CreateTaskModal({ users, currentUser, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [legalIssues, setLegalIssues] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otherUsers = users;

  const toggleAssignee = (userId) => {
    setAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        legalIssues: legalIssues.trim(),
        actionPlan: actionPlan.trim(),
        description: [legalIssues.trim(), actionPlan.trim()].filter(Boolean).join('\n\n'),
        createdBy: currentUser?.id || users[0]?.id || 'kay',
        assignees,
        priority,
        deadline,
      });

      // Reset
      setTitle('');
      setLegalIssues('');
      setActionPlan('');
      setAssignees([]);
      setPriority('medium');
      setDeadline('');
    } catch (err) {
      console.error('Error in form submit:', err);
    } finally {
      setIsSubmitting(false);
    }
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
            <label className="form-label">
              1. สรุป ประเด็นข้อกฏหมาย / ข้อเท็จจริงที่คุยกัน
            </label>
            <textarea
              className="form-textarea"
              placeholder="ระบุข้อเท็จจริง ประเด็นที่หารือ หรือข้อกฎหมายที่เกี่ยวข้อง..."
              value={legalIssues}
              onChange={(e) => setLegalIssues(e.target.value)}
              rows={2}
              id="task-legal-issues-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              2. สรุปความเห็น / มติที่ประชุม (ความเห็นควร / Action Plan ที่ต้องทำ)
            </label>
            <textarea
              className="form-textarea"
              placeholder="ระบุความเห็นทางกฎหมาย มติที่ประชุม หรือขั้นตอน Action Plan..."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              rows={2}
              id="task-action-plan-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">มอบหมายให้</label>
            <div className="checkbox-chips">
              {otherUsers.map((user) => {
                const isSelected = assignees.includes(user.id);
                return (
                  <button
                    type="button"
                    key={user.id}
                    className={`checkbox-chip ${isSelected ? 'checked' : ''}`}
                    onClick={() => toggleAssignee(user.id)}
                  >
                    <span className="chip-emoji">{user.emoji}</span>
                    <span className="chip-name">{user.name}</span>
                    {isSelected && <i className="fa-solid fa-check chip-check"></i>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">ความสำคัญ</label>
              <CustomSelect
                value={priority}
                onChange={setPriority}
                options={PRIORITY_OPTIONS}
                placement="up"
                id="task-priority-select"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">กำหนดส่ง</label>
              <CustomDatePicker
                value={deadline}
                onChange={setDeadline}
                placeholder="เลือกวัน..."
                placement="up"
                id="task-deadline-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            id="save-task-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                กำลังสร้างงาน...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check"></i>
                สร้างงาน
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
