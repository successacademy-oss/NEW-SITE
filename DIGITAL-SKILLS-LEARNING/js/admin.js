/* Prototype admin auth — see DSL_ADMIN_CREDENTIALS in app.js. A production
   system must authenticate Admin on a secure backend, not in client JS. */

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const navActions = document.getElementById('admin-nav-actions');

  if (getAdminSession()) {
    showDashboard();
  } else {
    showLogin();
  }

  function showLogin() {
    loginSection.hidden = false;
    dashboardSection.hidden = true;
    navActions.innerHTML = '';

    setupPasswordToggle(document.getElementById('admin-password-toggle'), document.getElementById('admin-password'));

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const userField = document.getElementById('admin-username-field');
      const passField = document.getElementById('admin-password-field');
      clearFieldError(userField);
      clearFieldError(passField);

      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;
      const result = adminLogin(username, password);
      if (!result.success) {
        setFieldError(passField, result.message);
        showToast(result.message, 'error');
        return;
      }
      showToast('Welcome back, Admin.', 'success');
      showDashboard();
    });
  }

  function showDashboard() {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    navActions.innerHTML = `<button class="nav-logout" id="admin-logout-btn" type="button" style="border:1px solid #F3D6D3; border-radius:8px; padding:9px 14px; background:transparent;">Logout</button>`;
    document.getElementById('admin-logout-btn').addEventListener('click', logoutAdmin);

    renderStats();

    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTab(tab.dataset.tab);
      });
    });
    renderTab('students');
  }

  function renderStats() {
    const regs = getRegistrations();
    const users = getUsers();
    const pendingPayments = regs.filter(r => r.paymentStatus === 'PAYMENT PENDING').length;
    const verifiedPayments = regs.filter(r => r.paymentStatus === 'PAID' || r.paymentStatus === 'PAYMENT VERIFIED').length;
    const completedTraining = regs.filter(r => r.trainingStatus === 'COMPLETED').length;
    const certsIssued = getCertificates().length;
    const projectsAwaitingYou = regs.filter(r => r.finalProjectRequested && !r.finalProjectCompleted).length;

    const stats = [
      { label: 'Students', value: users.length },
      { label: 'Registrations', value: regs.length },
      { label: 'Pending Payments', value: pendingPayments },
      { label: 'Verified Payments', value: verifiedPayments },
      { label: 'Final Projects Awaiting You', value: projectsAwaitingYou },
      { label: 'Completed Training', value: completedTraining },
      { label: 'Certificates Issued', value: certsIssued }
    ];
    document.getElementById('admin-stat-grid').innerHTML = stats.map(s => `
      <div class="card"><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>
    `).join('');
  }

  function renderTab(tab) {
    const panel = document.getElementById('admin-panel');
    if (tab === 'students') return renderStudents(panel);
    if (tab === 'registrations') return renderRegistrationsTab(panel);
    if (tab === 'payments') return renderPaymentsTab(panel);
    if (tab === 'progress') return renderProgressTab(panel);
    if (tab === 'certificates') return renderCertificatesTab(panel);
  }

  /* ---------------- Students ---------------- */
  function renderStudents(panel) {
    const users = getUsers();
    const regs = getRegistrations();
    if (!users.length) {
      panel.innerHTML = `<div class="empty-state card"><h3>No students yet</h3><p>Students will appear here once they create an account.</p></div>`;
      return;
    }
    panel.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Courses</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.id}</td>
                <td>${u.fullName}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td>${regs.filter(r => r.studentId === u.id).length}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------------- Course registrations ---------------- */
  function renderRegistrationsTab(panel) {
    const regs = getRegistrations();
    if (!regs.length) {
      panel.innerHTML = `<div class="empty-state card"><h3>No registrations yet</h3></div>`;
      return;
    }
    panel.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Student</th><th>Course</th><th>Fee</th><th>Registered</th><th>Payment</th><th>Training</th><th>Progress</th></tr></thead>
          <tbody>
            ${regs.map(r => `
              <tr>
                <td>${r.studentName}</td>
                <td>${r.courseName}</td>
                <td>${formatCurrency(r.price)}</td>
                <td>${formatDate(r.registrationDate)}</td>
                <td><span class="badge ${paymentBadgeClass(r.paymentStatus)}">${r.paymentStatus}</span></td>
                <td><span class="badge ${trainingBadgeClass(r.trainingStatus)}">${r.trainingStatus}</span></td>
                <td>${r.progress}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------------- Payments ---------------- */
  function renderPaymentsTab(panel) {
    const regs = getRegistrations();
    if (!regs.length) {
      panel.innerHTML = `<div class="empty-state card"><h3>No payments yet</h3></div>`;
      return;
    }
    panel.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Student</th><th>Course</th><th>Fee</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${regs.map(r => `
              <tr data-reg="${r.id}">
                <td>${r.studentName}<br><span class="muted">${r.email}</span></td>
                <td>${r.courseName}</td>
                <td>${formatCurrency(r.price)}</td>
                <td><span class="badge ${paymentBadgeClass(r.paymentStatus)}">${r.paymentStatus}</span></td>
                <td>
                  ${r.paymentStatus === 'PAID' || r.paymentStatus === 'PAYMENT VERIFIED'
                    ? `<button class="btn btn-outline btn-sm" data-action="unverify">Revoke</button>`
                    : `<button class="btn btn-teal btn-sm" data-action="verify">Verify Payment</button>`
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    panel.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const regId = row.dataset.reg;
        const action = btn.dataset.action;
        const newStatus = action === 'verify' ? 'PAYMENT VERIFIED' : 'NOT PAID';
        updateRegistration(regId, { paymentStatus: newStatus });
        showToast(action === 'verify' ? 'Payment verified. Course unlocked for student.' : 'Payment status reverted.', 'success');
        renderStats();
        renderPaymentsTab(panel);
      });
    });
  }

  /* ---------------- Training progress ---------------- */
  function renderProgressTab(panel) {
    const regs = getRegistrations().filter(r => r.paymentStatus === 'PAID' || r.paymentStatus === 'PAYMENT VERIFIED');
    if (!regs.length) {
      panel.innerHTML = `<div class="empty-state card"><h3>No verified students yet</h3><p>Training progress appears here once a student's payment is verified.</p></div>`;
      return;
    }
    panel.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Training Status</th><th>Final Project</th><th>Action</th></tr></thead>
          <tbody>
            ${regs.map(r => {
              const course = getCourseById(r.courseId);
              const allModulesDone = course && r.completedModules.length >= course.modules.length;
              const eligible = allModulesDone && r.finalProjectCompleted;
              return `
                <tr data-reg="${r.id}">
                  <td>${r.studentName}</td>
                  <td>${r.courseName}</td>
                  <td class="admin-progress-cell">
                    <div class="progress-track" style="margin-bottom:4px;"><div class="progress-fill" style="width:${r.progress}%;"></div></div>
                    <span class="muted">${r.progress}% · ${r.completedModules.length}/${course ? course.modules.length : 11} modules</span>
                  </td>
                  <td>
                    <select data-field="trainingStatus">
                      <option value="NOT STARTED" ${r.trainingStatus === 'NOT STARTED' ? 'selected' : ''}>NOT STARTED</option>
                      <option value="IN PROGRESS" ${r.trainingStatus === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                      <option value="COMPLETED" ${r.trainingStatus === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
                    </select>
                  </td>
                  <td>
                    ${r.finalProjectCompleted
                      ? '<span class="badge badge-completed">✓ Done</span>'
                      : r.finalProjectRequested
                        ? '<span class="badge badge-pending">Requested on WhatsApp</span><br><button class="btn btn-gold btn-sm" data-action="mark-project-done" style="margin-top:6px;">Mark Final Project Done</button>'
                        : '<span class="muted">Not requested yet</span>'
                    }
                  </td>
                  <td><button class="btn btn-outline btn-sm" data-action="save" ${!eligible && r.trainingStatus !== 'COMPLETED' ? '' : ''}>Save</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <p class="muted" style="margin-top:12px;">A student requests their final project from the video page, which messages you on WhatsApp and shows "Requested on WhatsApp" here. Once you've sent it and confirmed it's done, click "Mark Final Project Done." Then mark training COMPLETED once all modules + the final project are finished — this unlocks certificate generation.</p>
    `;
    panel.querySelectorAll('button[data-action="save"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const regId = row.dataset.reg;
        const trainingStatus = row.querySelector('select[data-field="trainingStatus"]').value;
        updateRegistration(regId, { trainingStatus });
        showToast('Training status updated.', 'success');
        renderStats();
        renderProgressTab(panel);
      });
    });
    panel.querySelectorAll('button[data-action="mark-project-done"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const regId = row.dataset.reg;
        const reg = getRegistrationById(regId);
        if (!reg) return;
        const course = getCourseById(reg.courseId);
        const progress = computeProgress({ ...reg, finalProjectCompleted: true }, course ? course.modules.length : 11);
        updateRegistration(regId, { finalProjectCompleted: true, progress });
        showToast('Final project marked done for ' + reg.studentName + '.', 'success');
        renderStats();
        renderProgressTab(panel);
      });
    });
  }

  /* ---------------- Certificates ---------------- */
  function renderCertificatesTab(panel) {
    const eligibleRegs = getRegistrations().filter(r => r.trainingStatus === 'COMPLETED');
    const certs = getCertificates();

    if (!eligibleRegs.length && !certs.length) {
      panel.innerHTML = `<div class="empty-state card"><h3>No completed training yet</h3><p>Certificates can be generated once a student's training is marked COMPLETED.</p></div>`;
      return;
    }

    panel.innerHTML = `
      <h3 style="margin-bottom:10px;">Ready to certify</h3>
      <div class="admin-table-wrap" style="margin-bottom:30px;">
        <table class="admin-table">
          <thead><tr><th>Student</th><th>Course</th><th>Completed</th><th>Certificate</th></tr></thead>
          <tbody>
            ${eligibleRegs.map(r => {
              const existingCert = certs.find(c => c.registrationId === r.id);
              return `
                <tr data-reg="${r.id}">
                  <td>${r.studentName}</td>
                  <td>${r.courseName}</td>
                  <td>Yes</td>
                  <td>${existingCert
                    ? `<span class="badge badge-verified">${existingCert.certificateId}</span>`
                    : `<button class="btn btn-gold btn-sm" data-action="generate">Generate Certificate</button>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <h3 style="margin-bottom:10px;">Issued certificates</h3>
      ${certs.length ? `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr><th>Certificate ID</th><th>Student</th><th>Course</th><th>Date</th></tr></thead>
            <tbody>
              ${certs.map(c => `
                <tr>
                  <td>${c.certificateId}</td>
                  <td>${c.studentName}</td>
                  <td>${c.courseName}</td>
                  <td>${formatDate(c.completionDate)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `<p class="muted">No certificates issued yet.</p>`}
    `;

    panel.querySelectorAll('button[data-action="generate"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('tr');
        const regId = row.dataset.reg;
        const reg = getRegistrationById(regId);
        if (!reg) return;
        addCertificate(reg);
        updateRegistration(regId, { certificateStatus: 'AVAILABLE' });
        showToast('Certificate generated for ' + reg.studentName + '.', 'success');
        renderStats();
        renderCertificatesTab(panel);
      });
    });
  }

  function paymentBadgeClass(status) {
    if (status === 'PAID' || status === 'PAYMENT VERIFIED') return 'badge-verified';
    if (status === 'PAYMENT PENDING') return 'badge-pending';
    return 'badge-notpaid';
  }
  function trainingBadgeClass(status) {
    if (status === 'COMPLETED') return 'badge-completed';
    if (status === 'IN PROGRESS') return 'badge-progress';
    return 'badge-notpaid';
  }
});
