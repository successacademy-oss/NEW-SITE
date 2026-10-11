document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;

  renderStudentNav('courses.html');
  renderCourses();

  function renderCourses() {
    const grid = document.getElementById('course-grid');
    const myRegs = getRegistrationsForUser(user.id);

    grid.innerHTML = COURSES.map(course => {
      const reg = myRegs.find(r => r.courseId === course.id);
      const buttonHtml = reg
        ? `<a href="payment.html?reg=${reg.id}" class="btn btn-outline btn-sm">View Registration</a>`
        : `<button class="btn btn-primary btn-sm" data-course="${course.id}">Register Course</button>`;

      return `
        <article class="card course-card">
          <div class="course-icon" aria-hidden="true">${course.icon}</div>
          <h3>${course.name}</h3>
          <p class="desc">${course.shortDesc}</p>
          <div class="course-meta">
            <span>Duration: ${course.duration}</span>
          </div>
          <div class="spread">
            <span class="course-price">${formatCurrency(course.price)}</span>
            ${buttonHtml}
          </div>
          ${reg ? `<span class="course-registered-tag">✓ Registered — ${reg.paymentStatus}</span>` : ''}
        </article>
      `;
    }).join('');

    grid.querySelectorAll('button[data-course]').forEach(btn => {
      btn.addEventListener('click', () => {
        const course = getCourseById(btn.dataset.course);
        const result = registerCourse(user, course);
        if (result.success) {
          showToast(`Registered for ${course.name}. Proceed to payment.`, 'success');
          setTimeout(() => {
            window.location.href = `payment.html?reg=${result.registration.id}`;
          }, 500);
        }
      });
    });
  }
});
