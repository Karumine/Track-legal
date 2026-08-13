import React, { useState } from 'react';

const EMOJI_OPTIONS = ['👨‍💼', '👩‍💻', '🧑‍💼', '👩‍⚖️', '👨‍⚖️', '🧑‍💻', '👩‍💼', '🦸', '🦹', '🧑‍🎓', '👷', '🕵️'];

export default function ManageUsers({ users, onAddUser, onRemoveUser, onBack }) {
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('👤');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddUser(newName.trim(), newEmoji);
    setNewName('');
    setNewEmoji('👤');
  };

  return (
    <div className="manage-users" id="manage-users">
      {/* Header */}
      <div className="detail-header-section">
        <button className="detail-back" onClick={onBack}>
          <i className="fa-solid fa-chevron-left"></i>
          กลับ
        </button>
        <h1 className="detail-title" style={{ fontSize: 18 }}>
          <i className="fa-solid fa-users-gear" style={{ color: 'var(--accent)', marginRight: 8 }}></i>
          จัดการผู้ใช้
        </h1>
      </div>

      {/* User List */}
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <div className="user-item-left">
              <div className="user-item-emoji">{user.emoji}</div>
              <span className="user-item-name">{user.name}</span>
            </div>
            <button
              className="icon-btn danger"
              onClick={() => {
                if (window.confirm(`ลบผู้ใช้ "${user.name}" ?`)) {
                  onRemoveUser(user.id);
                }
              }}
              title="ลบผู้ใช้"
            >
              <i className="fa-regular fa-trash-can"></i>
            </button>
          </div>
        ))}

        {users.length === 0 && (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <i className="fa-solid fa-users-slash"></i>
            <p>ยังไม่มีผู้ใช้</p>
          </div>
        )}
      </div>

      {/* Add User Form */}
      <div className="add-user-form">
        <label className="form-label" style={{ marginBottom: 10 }}>
          <i className="fa-solid fa-user-plus" style={{ color: 'var(--accent)', marginRight: 6 }}></i>
          เพิ่มผู้ใช้ใหม่
        </label>
        <form onSubmit={handleAdd}>
          <div className="add-user-row">
            <button
              type="button"
              className="form-input emoji-input"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ cursor: 'pointer' }}
            >
              {newEmoji}
            </button>
            <input
              type="text"
              className="form-input"
              placeholder="ชื่อผู้ใช้..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              id="new-user-name-input"
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px' }} id="add-user-btn">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>

          {showEmojiPicker && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 12,
                padding: 12,
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
            >
              {EMOJI_OPTIONS.map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setNewEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{
                    fontSize: 24,
                    padding: 6,
                    background: newEmoji === emoji ? 'var(--accent-soft)' : 'transparent',
                    border: newEmoji === emoji ? '1px solid var(--accent)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
