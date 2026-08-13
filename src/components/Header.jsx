import React from 'react';

export default function Header({ currentUser, onLogout, onExportPdf }) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-avatar">{currentUser.emoji}</div>
        <div className="header-info">
          <h2>{currentUser.name}</h2>
          <span>Legal Task Tracker</span>
        </div>
      </div>
      <div className="header-actions">
        <button className="icon-btn" onClick={onExportPdf} title="Export PDF" id="export-pdf-btn">
          <i className="fa-solid fa-file-pdf"></i>
        </button>
        <button className="icon-btn danger" onClick={onLogout} title="ออกจากระบบ" id="logout-btn">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </header>
  );
}
