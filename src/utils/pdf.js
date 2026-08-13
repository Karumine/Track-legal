// PDF Export utility using browser print
// For a production app, consider html2pdf.js or jsPDF

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  'in-progress': 'กำลังทำ',
  completed: 'เสร็จแล้ว',
};

const PRIORITY_LABELS = {
  high: 'สูง',
  medium: 'ปานกลาง',
  low: 'ต่ำ',
};

export function exportTasksToPdf(tasks, users, currentUser) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserName = (id) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.emoji} ${u.name}` : 'ไม่ทราบ';
  };

  const now = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>รายงานสถานะงาน - Legal Task Tracker</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Sarabun', sans-serif; color: #1a1a2e; padding: 32px; font-size: 13px; }
        h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
        .subtitle { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        .meta { display: flex; gap: 24px; margin-bottom: 24px; font-size: 12px; color: #475569; border-bottom: 2px solid #0f172a; padding-bottom: 16px; }
        .task { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; page-break-inside: avoid; }
        .task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .task-title { font-size: 15px; font-weight: 700; }
        .badge { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
        .badge.pending { background: #dbeafe; color: #2563eb; }
        .badge.in-progress { background: #fef3c7; color: #d97706; }
        .badge.completed { background: #d1fae5; color: #059669; }
        .task-meta { color: #64748b; font-size: 12px; margin-bottom: 8px; }
        .updates { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e2e8f0; }
        .update-item { padding: 6px 0; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        .update-item:last-child { border-bottom: none; }
        .update-user { font-weight: 600; }
        .update-time { color: #94a3b8; font-size: 11px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; }
        .stats { display: flex; gap: 16px; margin-bottom: 20px; }
        .stat-box { flex: 1; padding: 12px; border-radius: 8px; text-align: center; }
        .stat-box.total { background: #f8fafc; }
        .stat-box.pending-s { background: #eff6ff; }
        .stat-box.progress-s { background: #fffbeb; }
        .stat-box.done-s { background: #ecfdf5; }
        .stat-num { font-size: 24px; font-weight: 800; }
        .stat-label { font-size: 11px; color: #64748b; }
      </style>
    </head>
    <body>
      <h1>📋 รายงานสถานะงาน – Legal Task Tracker</h1>
      <p class="subtitle">สร้างโดย: ${getUserName(currentUser.id)}</p>
      <div class="meta">
        <span>📅 วันที่พิมพ์: ${now}</span>
        <span>📊 จำนวนงานทั้งหมด: ${tasks.length} รายการ</span>
      </div>

      <div class="stats">
        <div class="stat-box total"><div class="stat-num">${tasks.length}</div><div class="stat-label">ทั้งหมด</div></div>
        <div class="stat-box pending-s"><div class="stat-num">${tasks.filter(t => t.status === 'pending').length}</div><div class="stat-label">รอดำเนินการ</div></div>
        <div class="stat-box progress-s"><div class="stat-num">${tasks.filter(t => t.status === 'in-progress').length}</div><div class="stat-label">กำลังทำ</div></div>
        <div class="stat-box done-s"><div class="stat-num">${tasks.filter(t => t.status === 'completed').length}</div><div class="stat-label">เสร็จแล้ว</div></div>
      </div>
  `;

  tasks.forEach((task, i) => {
    const assigneeNames = task.assignees.map((id) => getUserName(id)).join(', ');
    html += `
      <div class="task">
        <div class="task-header">
          <span class="task-title">${i + 1}. ${task.title}</span>
          <span class="badge ${task.status}">${STATUS_LABELS[task.status]}</span>
        </div>
        <div class="task-meta">
          ความสำคัญ: ${PRIORITY_LABELS[task.priority]} &nbsp;|&nbsp;
          กำหนดส่ง: ${formatDate(task.deadline)} &nbsp;|&nbsp;
          สร้างโดย: ${getUserName(task.createdBy)}
          ${assigneeNames ? `&nbsp;|&nbsp; มอบหมายให้: ${assigneeNames}` : ''}
        </div>
        ${task.description ? `<p style="color:#475569; margin-bottom:8px;">${task.description}</p>` : ''}
    `;

    if (task.updates.length > 0) {
      html += `<div class="updates"><strong style="font-size:12px;">ประวัติความคืบหน้า:</strong>`;
      task.updates.forEach((upd) => {
        html += `
          <div class="update-item">
            <span class="update-user">${getUserName(upd.userId)}</span>
            <span class="update-time"> — ${formatDateTime(upd.timestamp)}</span>
            <br/>${upd.message}
            ${upd.newStatus ? ` <span class="badge ${upd.newStatus}" style="margin-left:4px;">${STATUS_LABELS[upd.newStatus]}</span>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
  });

  html += `
      <div class="footer">
        เอกสารนี้สร้างจากระบบ Legal Task Tracker — พิมพ์เมื่อ ${now}
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}
