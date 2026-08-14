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
        ${task.legalIssues ? `
          <div style="margin: 8px 0 6px 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px;">
            <strong style="color: #1e293b; display: block; margin-bottom: 2px;">1. สรุป ประเด็นข้อกฏหมาย / ข้อเท็จจริงที่คุยกัน:</strong>
            <span style="color: #475569; white-space: pre-wrap;">${task.legalIssues}</span>
          </div>
        ` : ''}
        ${task.actionPlan ? `
          <div style="margin: 6px 0 8px 0; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #10b981; font-size: 12px;">
            <strong style="color: #1e293b; display: block; margin-bottom: 2px;">2. สรุปความเห็น / มติที่ประชุม (ความเห็นควร / Action Plan ที่ต้องทำ):</strong>
            <span style="color: #475569; white-space: pre-wrap;">${task.actionPlan}</span>
          </div>
        ` : ''}
        ${!task.legalIssues && !task.actionPlan && task.description ? `<p style="color:#475569; margin-bottom:8px;">${task.description}</p>` : ''}
    `;

    if (task.updates.length > 0) {
      html += `<div class="updates"><strong style="font-size:12px;">ประวัติความคืบหน้า:</strong>`;
      task.updates.forEach((upd) => {
        const linkedSub = upd.subTaskId && task.subTasks ? task.subTasks.find(s => s.id === upd.subTaskId) : null;
        html += `
          <div class="update-item">
            <span class="update-user">${getUserName(upd.userId)}</span>
            <span class="update-time"> — ${formatDateTime(upd.timestamp)}${upd.isEdited ? ' (แก้ไขแล้ว)' : ''}</span>
            ${linkedSub ? `<br/><span style="font-size:11px; color:#d97706; font-weight:700;">📋 งานย่อย: ${linkedSub.title}</span>` : ''}
            <br/>${upd.message}
            ${upd.newStatus ? ` <span class="badge ${upd.newStatus}" style="margin-left:4px;">${STATUS_LABELS[upd.newStatus]}</span>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    // Sub-tasks
    if (task.subTasks && task.subTasks.length > 0) {
      const stDone = task.subTasks.filter(s => s.status === 'completed').length;
      html += `<div class="updates"><strong style="font-size:12px;">งานย่อย (${stDone}/${task.subTasks.length} เสร็จ):</strong>`;
      task.subTasks.forEach((sub, si) => {
        const subAssignees = (sub.assignees || []).map(id => getUserName(id)).join(', ');
        html += `
          <div class="update-item" style="padding: 6px 0 4px;">
            <span class="update-user">${si + 1}. ${sub.title}</span>
            <span class="badge ${sub.status}" style="margin-left:6px;">${STATUS_LABELS[sub.status] || sub.status}</span>
            ${sub.deadline ? `<span class="update-time" style="margin-left:6px;">กำหนด: ${formatDate(sub.deadline)}</span>` : ''}
            ${subAssignees ? `<span class="update-time" style="margin-left:6px;">ผู้รับผิดชอบ: ${subAssignees}</span>` : ''}
          </div>
        `;
        if (sub.updates && sub.updates.length > 0) {
          sub.updates.forEach((upd) => {
            html += `
              <div class="update-item" style="padding-left: 16px; font-size: 11px;">
                <span class="update-user">${getUserName(upd.userId)}</span>
                <span class="update-time"> — ${formatDateTime(upd.timestamp)}</span>
                <br/>${upd.message}
                ${upd.newStatus ? ` <span class="badge ${upd.newStatus}" style="margin-left:4px; font-size: 10px;">${STATUS_LABELS[upd.newStatus]}</span>` : ''}
              </div>
            `;
          });
        }
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

  printHtml(html);
}

function printHtml(html) {
  // Hidden iframe method - Works reliably on iOS Safari, Android, and Desktop without opening blank tabs
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  // Give browser time to load fonts & parse styles
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Error invoking print dialog:', err);
    }
    // Clean up iframe after print dialog
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 5000);
  }, 400);
}

export function exportSingleTaskToPdf(task, users, currentUser) {
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
    return u ? `${u.name}` : 'ไม่ทราบ';
  };

  const now = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const assigneeNames = (task.assignees || []).map((id) => getUserName(id)).join(', ') || 'ไม่ได้ระบุ';
  const creatorName = getUserName(task.createdBy);
  const currentUserName = currentUser ? getUserName(currentUser.id) : creatorName;

  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>สรุปสำนวนคดี - ${task.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Sarabun', -apple-system, sans-serif;
          color: #0f172a;
          background: #ffffff;
          font-size: 13px;
          line-height: 1.55;
          padding: 10px;
        }
        
        /* Header */
        .doc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #1e293b;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .doc-brand {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .doc-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }
        .doc-meta-right {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .doc-tag {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
          margin-top: 4px;
        }
        .doc-tag.pending { background: #e0f2fe; color: #0284c7; }
        .doc-tag.in-progress { background: #fef3c7; color: #b45309; }
        .doc-tag.completed { background: #dcfce7; color: #15803d; }

        /* Info Table */
        .info-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          background: #f8fafc;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .info-grid td {
          padding: 8px 12px;
          font-size: 12.5px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }
        .info-label {
          width: 18%;
          color: #475569;
          font-weight: 600;
          background: #f1f5f9;
        }
        .info-val {
          width: 32%;
          color: #0f172a;
          font-weight: 500;
        }

        /* Sections */
        .section-card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 14px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .section-head {
          padding: 8px 14px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-head.blue {
          background: #eff6ff;
          color: #1e40af;
          border-bottom: 1px solid #bfdbfe;
        }
        .section-head.green {
          background: #f0fdf4;
          color: #166534;
          border-bottom: 1px solid #bbf7d0;
        }
        .section-head.gray {
          background: #f8fafc;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
        }
        .section-body {
          padding: 12px 14px;
          font-size: 13px;
          color: #1e293b;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        /* Timeline Table */
        .timeline-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          font-size: 12px;
        }
        .timeline-table th {
          background: #f1f5f9;
          text-align: left;
          padding: 6px 10px;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #cbd5e1;
        }
        .timeline-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }

        /* Signatures */
        .signature-section {
          margin-top: 36px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .sig-block {
          width: 44%;
          text-align: center;
        }
        .sig-line {
          border-bottom: 1px dotted #94a3b8;
          height: 48px;
          margin-bottom: 8px;
        }
        .sig-name {
          font-weight: 600;
          font-size: 12px;
          color: #1e293b;
        }
        .sig-role {
          font-size: 11px;
          color: #64748b;
        }

        /* Footer */
        .footer-note {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 10.5px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="doc-header">
        <div>
          <div class="doc-brand">⚖️ LEGAL TASK TRACKER — สำนวนคดีและข้อกฎหมาย</div>
          <h1 class="doc-title">${task.title}</h1>
        </div>
        <div class="doc-meta-right">
          <div>วันที่พิมพ์: ${now}</div>
          <span class="doc-tag ${task.status}">สถานะ: ${STATUS_LABELS[task.status] || task.status}</span>
        </div>
      </div>

      <table class="info-grid">
        <tr>
          <td class="info-label">ความสำคัญ:</td>
          <td class="info-val">${PRIORITY_LABELS[task.priority] || task.priority}</td>
          <td class="info-label">กำหนดส่ง / นัดหมาย:</td>
          <td class="info-val">${formatDate(task.deadline)}</td>
        </tr>
        <tr>
          <td class="info-label">ผู้สร้างเคส:</td>
          <td class="info-val">${creatorName}</td>
          <td class="info-label">ผู้รับผิดชอบงาน:</td>
          <td class="info-val">${assigneeNames}</td>
        </tr>
      </table>

      ${task.legalIssues ? `
        <div class="section-card">
          <div class="section-head blue">
            <span>⚖️ 1. สรุป ประเด็นข้อกฏหมาย / ข้อเท็จจริงที่คุยกัน</span>
          </div>
          <div class="section-body">${task.legalIssues}</div>
        </div>
      ` : ''}

      ${task.actionPlan ? `
        <div class="section-card">
          <div class="section-head green">
            <span>📋 2. สรุปความเห็น / มติที่ประชุม (Action Plan ที่ต้องทำ)</span>
          </div>
          <div class="section-body">${task.actionPlan}</div>
        </div>
      ` : ''}

      ${!task.legalIssues && !task.actionPlan && task.description ? `
        <div class="section-card">
          <div class="section-head gray">
            <span>📄 รายละเอียดงาน</span>
          </div>
          <div class="section-body">${task.description}</div>
        </div>
      ` : ''}

      <div class="section-card">
        <div class="section-head gray">
          <span>🕒 ประวัติความคืบหน้าและการดำเนินงาน (${(task.updates || []).length} รายการ)</span>
        </div>
        <div class="section-body" style="padding: 0;">
          ${(task.updates || []).length > 0 ? `
            <table class="timeline-table">
              <thead>
                <tr>
                  <th style="width: 25%;">วัน - เวลา</th>
                  <th style="width: 20%;">ผู้บันทึก</th>
                  <th style="width: 40%;">รายละเอียดการดำเนินงาน</th>
                  <th style="width: 15%;">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                ${task.updates.map((u) => {
                  const linkedSub = u.subTaskId && task.subTasks ? task.subTasks.find(s => s.id === u.subTaskId) : null;
                  return `
                  <tr>
                    <td style="color: #64748b;">${formatDateTime(u.timestamp)}</td>
                    <td><strong>${getUserName(u.userId)}</strong></td>
                    <td>
                      ${linkedSub ? `<span style="font-size:10.5px; color:#d97706; font-weight:700; display:block; margin-bottom:2px;">📋 งานย่อย: ${linkedSub.title}</span>` : ''}
                      ${u.message}${u.isEdited ? ' <span style="font-size: 10px; color: #94a3b8; font-weight: normal;">(แก้ไขแล้ว)</span>' : ''}
                    </td>
                    <td><span class="doc-tag ${u.newStatus || task.status}">${STATUS_LABELS[u.newStatus || task.status]}</span></td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
          ` : `
            <div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 12px;">ยังไม่มีการบันทึกประวัติความคืบหน้า</div>
          `}
        </div>
      </div>

      ${task.subTasks && task.subTasks.length > 0 ? (() => {
        const stDone = task.subTasks.filter(s => s.status === 'completed').length;
        let subHtml = `
          <div class="section-card">
            <div class="section-head" style="background: #fefce8; color: #854d0e; border-bottom: 1px solid #fde68a;">
              <span>📋 รายการงานย่อย (${stDone}/${task.subTasks.length} เสร็จ)</span>
            </div>
            <div class="section-body" style="padding: 0;">
              <table class="timeline-table">
                <thead>
                  <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 30%;">ชื่องาน</th>
                    <th style="width: 15%;">สถานะ</th>
                    <th style="width: 20%;">ผู้รับผิดชอบ</th>
                    <th style="width: 15%;">กำหนดส่ง</th>
                    <th style="width: 15%;">อัพเดท</th>
                  </tr>
                </thead>
                <tbody>
        `;
        task.subTasks.forEach((sub, si) => {
          const subAssignees = (sub.assignees || []).map(id => getUserName(id)).join(', ') || '-';
          const subUpdatesCount = (sub.updates || []).length;
          subHtml += `
            <tr>
              <td>${si + 1}</td>
              <td><strong>${sub.title}</strong></td>
              <td><span class="doc-tag ${sub.status}">${STATUS_LABELS[sub.status] || sub.status}</span></td>
              <td>${subAssignees}</td>
              <td>${sub.deadline ? formatDate(sub.deadline) : '-'}</td>
              <td>${subUpdatesCount} รายการ</td>
            </tr>
          `;
        });
        subHtml += `</tbody></table></div></div>`;

        // Individual sub-task timelines
        task.subTasks.forEach((sub, si) => {
          if (sub.updates && sub.updates.length > 0) {
            subHtml += `
              <div class="section-card" style="margin-top: 8px;">
                <div class="section-head gray">
                  <span>🕒 ประวัติงานย่อย #${si + 1}: ${sub.title} (${sub.updates.length} รายการ)</span>
                </div>
                <div class="section-body" style="padding: 0;">
                  <table class="timeline-table">
                    <thead>
                      <tr>
                        <th style="width: 25%;">วัน - เวลา</th>
                        <th style="width: 20%;">ผู้บันทึก</th>
                        <th style="width: 40%;">รายละเอียด</th>
                        <th style="width: 15%;">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sub.updates.map((u) => `
                        <tr>
                          <td style="color: #64748b;">${formatDateTime(u.timestamp)}</td>
                          <td><strong>${getUserName(u.userId)}</strong></td>
                          <td>${u.message}${u.isEdited ? ' <span style="font-size: 10px; color: #94a3b8;">(แก้ไขแล้ว)</span>' : ''}</td>
                          <td>${u.newStatus ? `<span class="doc-tag ${u.newStatus}">${STATUS_LABELS[u.newStatus]}</span>` : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }
        });

        return subHtml;
      })() : ''}

      <div class="signature-section">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">( ${currentUserName} )</div>
          <div class="sig-role">ผู้จัดทำรายงาน / ผู้รับผิดชอบ</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-name">( .................................................... )</div>
          <div class="sig-role">ผู้ตรวจรับ / หัวหน้างาน</div>
        </div>
      </div>

      <div class="footer-note">
        เอกสารนี้ออกโดยระบบ Legal Task Tracker — สำหรับใช้เป็นบันทึกข้อความภายในสำนักงาน
      </div>
    </body>
    </html>
  `;

  printHtml(html);
}
