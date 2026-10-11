document.addEventListener('DOMContentLoaded', () => {
  /* If already logged in, skip straight to Courses */
  if (getCurrentUser()) {
    window.location.href = 'courses.html';
    return;
  }

  const tabLogin = document.getElementById('tab-login');
  const tabCreate = document.getElementById('tab-create');
  const loginForm = document.getElementById('login-form');
  const createForm = document.getElementById('create-form');

  function showLogin() {
    tabLogin.classList.add('active');
    tabCreate.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabCreate.setAttribute('aria-selected', 'false');
    loginForm.hidden = false;
    createForm.hidden = true;
  }
  function showCreate() {
    tabCreate.classList.add('active');
    tabLogin.classList.remove('active');
    tabCreate.setAttribute('aria-selected', 'true');
    tabLogin.setAttribute('aria-selected', 'false');
    createForm.hidden = false;
    loginForm.hidden = true;
  }

  tabLogin.addEventListener('click', showLogin);
  tabCreate.addEventListener('click', showCreate);
  document.getElementById('switch-to-create').addEventListener('click', showCreate);
  document.getElementById('switch-to-login').addEventListener('click', showLogin);

  setupPasswordToggle(document.getElementById('login-password-toggle'), document.getElementById('login-password'));
  setupPasswordToggle(document.getElementById('create-password-toggle'), document.getElementById('create-password'));
  setupPasswordToggle(document.getElementById('create-confirm-toggle'), document.getElementById('create-confirm'));

  /* ---------------- Login ---------------- */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailField = document.getElementById('login-email-field');
    const passwordField = document.getElementById('login-password-field');
    clearFieldError(emailField);
    clearFieldError(passwordField);

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let valid = true;
    if (!isValidEmail(email)) {
      setFieldError(emailField, 'Enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setFieldError(passwordField, 'Enter your password.');
      valid = false;
    }
    if (!valid) return;

    const result = loginStudent(email, password);
    if (!result.success) {
      showToast(result.message, 'error');
      setFieldError(passwordField, result.message);
      return;
    }
    showToast(`Welcome back, ${result.user.fullName.split(' ')[0]}!`, 'success');
    setTimeout(() => { window.location.href = 'courses.html'; }, 500);
  });

  /* ---------------- Create account ---------------- */
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameField = document.getElementById('create-name-field');
    const emailField = document.getElementById('create-email-field');
    const phoneField = document.getElementById('create-phone-field');
    const passwordField = document.getElementById('create-password-field');
    const confirmField = document.getElementById('create-confirm-field');
    [nameField, emailField, phoneField, passwordField, confirmField].forEach(clearFieldError);

    const fullName = document.getElementById('create-name').value.trim();
    const email = document.getElementById('create-email').value.trim();
    const phone = document.getElementById('create-phone').value.trim();
    const password = document.getElementById('create-password').value;
    const confirmPassword = document.getElementById('create-confirm').value;

    let valid = true;
    if (fullName.length < 3) {
      setFieldError(nameField, 'Enter your full name.');
      valid = false;
    }
    if (!isValidEmail(email)) {
      setFieldError(emailField, 'Enter a valid email address.');
      valid = false;
    }
    if (!isValidPhone(phone)) {
      setFieldError(phoneField, 'Enter a valid phone number.');
      valid = false;
    }
    if (password.length < 6) {
      setFieldError(passwordField, 'Password must be at least 6 characters.');
      valid = false;
    }
    if (password !== confirmPassword) {
      setFieldError(confirmField, 'Passwords do not match.');
      valid = false;
    }
    if (!valid) return;

    const result = createStudentUser({ fullName, email, phone, password });
    if (!result.success) {
      showToast(result.message, 'error');
      setFieldError(emailField, result.message);
      return;
    }
    showToast('Account created! You can now log in.', 'success');
    createForm.reset();
    showLogin();
    document.getElementById('login-email').value = email;
  });
});
