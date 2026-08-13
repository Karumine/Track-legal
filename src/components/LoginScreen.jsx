import React from 'react';

export default function LoginScreen({ users, onSelectUser, onManageUsers }) {
  return (
    <div className="login-screen">
      <div className="login-logo">
        <i className="fa-solid fa-scale-balanced"></i>
      </div>
      <h1 className="login-title">Legal Task Tracker</h1>
      <p className="login-subtitle">ระบบติดตามงานและรายงานความคืบหน้า</p>

      <div className="login-users">
        {users.map((user) => (
          <button
            key={user.id}
            className="login-user-btn"
            onClick={() => onSelectUser(user)}
            id={`login-btn-${user.id}`}
          >
            <span className="avatar">{user.emoji}</span>
            <span>{user.name}</span>
          </button>
        ))}

        {users.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            ยังไม่มีผู้ใช้ — กดเพิ่มผู้ใช้ด้านล่าง
          </p>
        )}
      </div>

      <button className="login-manage-btn" onClick={onManageUsers} id="manage-users-btn">
        <i className="fa-solid fa-users-gear" style={{ marginRight: 6 }}></i>
        จัดการผู้ใช้
      </button>
    </div>
  );
}
