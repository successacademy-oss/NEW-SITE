document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;
  renderStudentNav('certificate.html');

  const content = document.getElementById('certificate-content');
  const params = new URLSearchParams(window.location.search);
  const regId = params.get('reg');

  const myRegs = getRegistrationsForUser(user.id);
  let registration = regId ? myRegs.find(r => r.id === regId) : myRegs.find(r => r.certificateStatus === 'AVAILABLE');

  if (!registration) {
    renderEmpty('No certificate found', 'You do not have a certificate for this course yet.');
    return;
  }

  if (registration.certificateStatus !== 'AVAILABLE') {
    renderEmpty(
      'Certificate not available yet',
      'Your certificate becomes available once your training is completed and confirmed by Admin.'
    );
    return;
  }

  const cert = getCertificates().find(c => c.registrationId === registration.id);
  if (!cert) {
    renderEmpty('Certificate not found', 'We could not locate your certificate record. Please contact Admin.');
    return;
  }

  renderCertificate(cert, registration);

  function renderEmpty(title, message) {
    content.innerHTML = `
      <div class="empty-state card" style="max-width:520px; margin:60px auto;">
        <h3>${title}</h3>
        <p>${message}</p>
        <a href="dashboard.html" class="btn btn-primary">Back to Dashboard</a>
      </div>
    `;
  }

  function renderCertificate(cert, reg) {
    const course = getCourseById(reg.courseId);
    content.innerHTML = `
      <div class="cert-wrap">
        <div class="cert-actions no-print">
          <button class="btn btn-gold" id="print-btn">Download / Print Certificate</button>
          <a href="verify.html" class="btn btn-outline">Verify a Certificate</a>
        </div>
        <div class="certificate" id="certificate">
          <div class="cert-brand">SUCCESS ACADEMY TECH DIGITAL SKILLS LEARNING</div>
          <div class="cert-title">Certificate of Completion</div>
          <p class="cert-presented">This certificate is proudly presented to</p>
          <div class="cert-name">${cert.studentName}</div>
          <p class="cert-for">for successfully completing</p>
          <div class="cert-course">${cert.courseName}${course ? ` — ${course.duration}` : ''}</div>
          <div class="cert-footer-row">
            <div class="cert-footer-item">
              <div class="line">${formatDate(cert.completionDate)}</div>
              <div class="cap">Completion Date</div>
            </div>
            <div class="cert-footer-item">
              <div class="line">Success Academy Tech Digital Skills Learning</div>
              <div class="cap">Authorized Signature</div>
            </div>
          </div>
          <div class="cert-id">Certificate ID: ${cert.certificateId}</div>
        </div>
        <p class="muted text-center" style="max-width:60ch;">This is a generated certificate record from the Success Academy Tech Digital Skills Learning platform. Anyone can verify it on our <a href="verify.html">certificate verification page</a> using the certificate ID above.</p>
      </div>
    `;
    document.getElementById('print-btn').addEventListener('click', () => window.print());
  }
});
