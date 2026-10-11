document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;
  renderStudentNav('dashboard.html');

  document.getElementById('welcome-heading').textContent = `Welcome, ${user.fullName.split(' ')[0]}`;
  document.getElementById('student-id-line').textContent = `Student ID: ${user.id}`;

  const regs = getRegistrationsForUser(user.id);

  renderStats(regs);
  renderRegistrations(regs);

  function isVerified(reg) {
    return reg.paymentStatus === 'PAID' || reg.paymentStatus === 'PAYMENT VERIFIED';
  }

  function renderStats(regs) {
    const paid = regs.filter(isVerified).length;
    const pending = regs.filter(r => r.paymentStatus === 'PAYMENT PENDING' || r.paymentStatus === 'NOT PAID').length;
    const inProgress = regs.filter(r => r.trainingStatus === 'IN PROGRESS').length;
    const completed = regs.filter(r => r.trainingStatus === 'COMPLETED').length;
    const overall = regs.length ? Math.round(regs.reduce((sum, r) => sum + r.progress, 0) / regs.length) : 0;

    const stats = [
      { label: 'Registered Courses', value: regs.length },
      { label: 'Paid Courses', value: paid },
      { label: 'Pending Payments', value: pending },
      { label: 'Courses In Progress', value: inProgress },
      { label: 'Completed Courses', value: completed },
      { label: 'Overall Progress', value: `${overall}%` }
    ];

    document.getElementById('stat-grid').innerHTML = stats.map(s => `
      <div class="card stat-card">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
  }

  function renderRegistrations(regs) {
    const list = document.getElementById('registration-list');
    if (!regs.length) {
      list.innerHTML = `
        <div class="empty-state card">
          <h3>No courses yet</h3>
          <p>You haven't registered for a course. Browse our courses to get started.</p>
          <a href="courses.html" class="btn btn-primary">Browse Courses</a>
        </div>
      `;
      return;
    }

    list.innerHTML = regs.map(reg => {
      const verified = isVerified(reg);
      const paymentBadgeClass = verified ? 'badge-verified' : (reg.paymentStatus === 'PAYMENT PENDING' ? 'badge-pending' : 'badge-notpaid');
      const trainingBadgeClass = reg.trainingStatus === 'COMPLETED' ? 'badge-completed' : (reg.trainingStatus === 'IN PROGRESS' ? 'badge-progress' : 'badge-notpaid');

      const actionHtml = verified
        ? `<a href="video.html?reg=${reg.id}" class="btn btn-primary btn-sm">Continue Learning</a>`
        : `<button class="btn btn-primary btn-sm" disabled>Continue Learning</button>
           <p class="reg-locked-note">Your payment must be verified by Admin before you can access the course.</p>`;

      const certAction = reg.certificateStatus === 'AVAILABLE'
        ? `<a href="certificate.html?reg=${reg.id}" class="btn btn-gold btn-sm" style="margin-top:8px;">View Certificate</a>`
        : '';

      return `
        <article class="card reg-card">
          <div class="reg-main">
            <h3>${reg.courseName}</h3>
            <div class="reg-badges">
              <span class="badge ${paymentBadgeClass}">${verified ? '✓ ' : ''}${reg.paymentStatus}</span>
              <span class="badge ${trainingBadgeClass}">${reg.trainingStatus}</span>
            </div>
            <div class="reg-progress">
              <div class="progress-label"><span>Progress</span><span>${reg.progress}%</span></div>
              <div class="progress-track"><div class="progress-fill" style="width:${reg.progress}%;"></div></div>
            </div>
          </div>
          <div class="reg-action">
            <p class="muted" style="margin-bottom:8px;">${formatCurrency(reg.price)}</p>
            ${actionHtml}
            ${certAction}
          </div>
        </article>
      `;
    }).join('');
  }
});
