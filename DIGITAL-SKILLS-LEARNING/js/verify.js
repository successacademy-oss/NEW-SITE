/* Certificate verification (prototype).
   This looks up certificate records in localStorage. In production this
   should query a secure backend/database so certificates can be verified
   from any device, not only the one that generated them. */

document.addEventListener('DOMContentLoaded', () => {
  renderStudentNav('verify.html');

  const form = document.getElementById('verify-form');
  const input = document.getElementById('cert-id-input');
  const field = document.getElementById('cert-id-field');
  const resultMount = document.getElementById('verify-result');

  const params = new URLSearchParams(window.location.search);
  const prefill = params.get('id');
  if (prefill) {
    input.value = prefill;
    doVerify(prefill);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldError(field);
    const value = input.value.trim();
    if (!value) {
      setFieldError(field, 'Enter a certificate ID to verify.');
      return;
    }
    doVerify(value);
  });

  function doVerify(certificateId) {
    const cert = findCertificateById(certificateId);
    if (!cert) {
      resultMount.innerHTML = `
        <div class="card verify-result-card">
          <div class="verify-status-invalid">✕ Certificate Not Found</div>
          <p class="muted" style="margin:0;">No certificate matches ID "${certificateId}". Double-check the ID and try again.</p>
        </div>
      `;
      return;
    }
    resultMount.innerHTML = `
      <div class="card verify-result-card">
        <div class="verify-status-valid">✓ Valid Certificate</div>
        <div class="summary-row-list">
          <div class="summary-row"><span class="label">Student Name</span><span class="value">${cert.studentName}</span></div>
          <div class="summary-row"><span class="label">Course</span><span class="value">${cert.courseName}</span></div>
          <div class="summary-row"><span class="label">Completion Date</span><span class="value">${formatDate(cert.completionDate)}</span></div>
          <div class="summary-row"><span class="label">Certificate ID</span><span class="value">${cert.certificateId}</span></div>
        </div>
      </div>
    `;
  }
});
