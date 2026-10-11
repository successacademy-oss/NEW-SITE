document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;
  renderStudentNav('payment.html');

  const params = new URLSearchParams(window.location.search);
  const regId = params.get('reg');
  let registration = regId ? getRegistrationById(regId) : null;

  /* Fall back: if no reg id supplied, use the student's most recent registration */
  if (!registration) {
    const myRegs = getRegistrationsForUser(user.id);
    registration = myRegs[myRegs.length - 1] || null;
  }

  const layout = document.getElementById('payment-layout');

  if (!registration || registration.studentId !== user.id) {
    layout.innerHTML = `
      <div class="empty-state card" style="grid-column: 1 / -1;">
        <h3>No course registration found</h3>
        <p>Register for a course first, then come back here to pay.</p>
        <a href="courses.html" class="btn btn-primary">Browse Courses</a>
      </div>
    `;
    return;
  }

  render();

  function statusBannerHtml() {
    if (registration.paymentStatus === 'PAID' || registration.paymentStatus === 'PAYMENT VERIFIED') {
      return `<div class="status-banner verified">✓ <div><strong>Payment Verified</strong><br>Your payment has been verified. You can now access your course.</div></div>`;
    }
    if (registration.paymentStatus === 'PAYMENT PENDING') {
      return `<div class="status-banner pending">⏳ <div><strong>Payment Pending</strong><br>Your payment is waiting for Admin verification.</div></div>`;
    }
    return `<div class="status-banner notpaid">! <div><strong>Not Paid</strong><br>Pay through WhatsApp below to start the verification process.</div></div>`;
  }

  function render() {
    const course = getCourseById(registration.courseId);
    const waMessage = `Hello, I want to make payment for my Success Academy Tech Digital Skills Learning course.\n\nStudent Name: ${registration.studentName}\nEmail: ${registration.email}\nPhone: ${registration.phone}\nCourse: ${registration.courseName}\nCourse Fee: ${formatCurrency(registration.price)}\n\nPlease provide payment instructions.`;

    layout.innerHTML = `
      <div>
        ${statusBannerHtml()}
        <div class="card payment-card">
          <h3>Registration Summary</h3>
          <div class="summary-row"><span class="label">Student Name</span><span class="value">${registration.studentName}</span></div>
          <div class="summary-row"><span class="label">Email</span><span class="value">${registration.email}</span></div>
          <div class="summary-row"><span class="label">Phone</span><span class="value">${registration.phone}</span></div>
          <div class="summary-row"><span class="label">Course</span><span class="value">${registration.courseName}</span></div>
          <div class="summary-row"><span class="label">Course Fee</span><span class="value">${formatCurrency(registration.price)}</span></div>
          <div class="summary-row"><span class="label">Registration Date</span><span class="value">${formatDate(registration.registrationDate)}</span></div>
          <div class="summary-row"><span class="label">Payment Status</span><span class="value"><span class="badge ${badgeClass(registration.paymentStatus)}">${registration.paymentStatus}</span></span></div>
        </div>
      </div>

      <div class="stack">
        <div class="whatsapp-box">
          <h3>Pay Through WhatsApp</h3>
          <p class="muted">Tap below to open WhatsApp with your details pre-filled. Our team will confirm your payment method and mark it verified once received.</p>
          <a class="btn btn-teal" id="whatsapp-pay-btn" target="_blank" rel="noopener">Pay via WhatsApp (${WHATSAPP_NUMBER.replace('234', '0')})</a>
          <p class="muted" style="margin-top:12px;">After you contact us, your status will show <strong>PAYMENT PENDING</strong> until Admin verifies it. This can take a short while — no need to register again.</p>
        </div>
        <a href="dashboard.html" class="btn btn-outline btn-block">Go to Dashboard</a>
      </div>
    `;

    document.getElementById('whatsapp-pay-btn').href = whatsappLink(WHATSAPP_NUMBER, waMessage);
    document.getElementById('whatsapp-pay-btn').addEventListener('click', () => {
      if (registration.paymentStatus === 'NOT PAID') {
        const updated = updateRegistration(registration.id, { paymentStatus: 'PAYMENT PENDING' });
        if (updated) {
          registration = updated;
          showToast('Payment marked as pending. Admin will verify it shortly.', 'info');
          render();
        }
      }
    });
  }

  function badgeClass(status) {
    if (status === 'PAID' || status === 'PAYMENT VERIFIED') return 'badge-verified';
    if (status === 'PAYMENT PENDING') return 'badge-pending';
    return 'badge-notpaid';
  }
});
