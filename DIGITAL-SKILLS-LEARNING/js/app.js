/* ==========================================================================
   SUCCESS ACADEMY TECH DIGITAL SKILLS LEARNING — app.js
   Shared functions used across every page: users, sessions, registrations,
   certificates and the course catalog. Keep ALL localStorage access going
   through the functions in this file so every page reads/writes the same
   shape of data.

   NOTE (prototype disclaimer): this app stores everything in the browser's
   localStorage. That is fine for a demo, but it is NOT secure authentication
   or secure record-keeping — anyone with access to the browser/devtools can
   read or edit this data. A production version needs a real backend with
   a database, hashed passwords, server-side payment verification and
   server-side certificate verification.
   ========================================================================== */

const DSL_KEYS = {
  USERS: 'dsl_users',
  CURRENT_USER: 'dsl_current_user',
  REGISTRATIONS: 'dsl_registrations',
  ADMIN_SESSION: 'dsl_admin_session',
  CERTIFICATES: 'dsl_certificates'
};

/* Prototype-only admin credentials. See section 24 of the brief: a real
   product must authenticate admins on a server, never in client JS. */
const DSL_ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

const WHATSAPP_NUMBER = '2349166393108';

/* ---------------------------------------------------------------------- */
/* Course catalog                                                         */
/* ---------------------------------------------------------------------- */

/* Module start times inside each course's YouTube video are NOT stored here.
   video.js reads the video's real duration from the YouTube Player API at
   runtime and divides it evenly across the module count — that's more
   accurate than hardcoding guessed timestamps, and it's why each module
   plays a different part of the video instead of always restarting at 0:00. */
function dslModuleSet(topic, titles) {
  return titles.map((t, i) => ({
    number: i + 1,
    title: `Module ${i + 1}: ${t}`,
    description: `Hands-on lesson covering ${t.toLowerCase()} in ${topic}.`
  }));
}

const COURSES = [
  {
    id: 'ms-word',
    name: 'Microsoft Word',
    icon: '📝',
    shortDesc: 'Learn how to create and format professional documents.',
    duration: '4 Weeks',
    price: 5000,
    videoId: '2MCmnr2L50o',
    finalProject: 'Create a professional formatted document (e.g. a CV or report) using styles, headers, tables and page layout.',
    modules: dslModuleSet('Microsoft Word', [
      'Getting to know Word', 'Typing and editing text', 'Formatting fonts and paragraphs',
      'Working with lists and tables', 'Page layout and margins', 'Headers, footers and page numbers',
      'Inserting images and shapes', 'Styles and templates', 'Mail merge basics',
      'Reviewing and proofing tools', 'Saving, exporting and printing'
    ])
  },
  {
    id: 'ms-excel',
    name: 'Microsoft Excel',
    icon: '📊',
    shortDesc: 'Learn to build spreadsheets, formulas and simple reports.',
    duration: '4 Weeks',
    price: 5000,
    videoId: 'Vl0H-qTclOg',
    finalProject: 'Create a practical spreadsheet project — for example a budget tracker or a small business record book — using formulas and charts.',
    modules: dslModuleSet('Microsoft Excel', [
      'Getting to know Excel', 'Entering and formatting data', 'Basic formulas',
      'Working with functions', 'Sorting and filtering data', 'Charts and graphs',
      'Conditional formatting', 'Pivot tables basics', 'Data validation',
      'Building a simple budget sheet', 'Saving, exporting and printing'
    ])
  },
  {
    id: 'ms-powerpoint',
    name: 'Microsoft PowerPoint',
    icon: '📽️',
    shortDesc: 'Learn to design clear, confident presentations.',
    duration: '3 Weeks',
    price: 5000,
    videoId: 'KqgyvGxISxk',
    finalProject: 'Create a professional presentation on a topic of your choice, including transitions, images and speaker notes.',
    modules: dslModuleSet('Microsoft PowerPoint', [
      'Getting to know PowerPoint', 'Building your first slide deck', 'Working with text and layout',
      'Images, icons and shapes', 'Themes and slide design', 'Transitions and animations',
      'Charts and data slides', 'Speaker notes and rehearsal', 'Presenting on screen',
      'Exporting and sharing', 'Presentation best practices'
    ])
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    icon: '🎨',
    shortDesc: 'Learn the basics of visual design for digital and print.',
    duration: '6 Weeks',
    price: 10000,
    videoId: 'iFU_vSjWEWA',
    finalProject: 'Create a complete graphic design project — for example a flyer, logo or social media kit — showing your design skills.',
    modules: dslModuleSet('Graphic Design', [
      'Design fundamentals', 'Colour theory', 'Typography basics',
      'Working with layout and grids', 'Intro to design software', 'Creating a logo',
      'Designing a flyer', 'Social media graphics', 'Branding basics',
      'Exporting for print and web', 'Building a mini portfolio'
    ])
  },
  {
    id: 'web-development',
    name: 'Web Development',
    icon: '💻',
    shortDesc: 'Learn to build responsive websites with HTML, CSS and JavaScript.',
    duration: '8 Weeks',
    price: 15000,
    videoId: 'BiA08jfr4RU',
    finalProject: 'Build a responsive website of your own using HTML, CSS and JavaScript.',
    modules: dslModuleSet('Web Development', [
      'How the web works', 'HTML fundamentals', 'CSS fundamentals',
      'Layout with Flexbox and Grid', 'Responsive design', 'Introduction to JavaScript',
      'JavaScript and the DOM', 'Forms and validation', 'Working with images and media',
      'Publishing a website', 'Project planning and structure'
    ])
  },
  {
    id: 'networking',
    name: 'Computer Networking',
    icon: '🌐',
    shortDesc: 'Learn the fundamentals of how computer networks work.',
    duration: '6 Weeks',
    price: 10000,
    videoId: 'fQbBPa0ADvs',
    finalProject: 'Create a basic network design/project describing the devices, addressing and layout for a small office network.',
    modules: dslModuleSet('Computer Networking', [
      'Introduction to networking', 'Network types and topologies', 'IP addressing basics',
      'Routers, switches and hubs', 'The OSI model', 'Wired and wireless networks',
      'Network security basics', 'Troubleshooting common issues', 'Cabling and connectors',
      'Setting up a home/office network', 'Networking best practices'
    ])
  },
  {
    id: 'ai-cartoons',
    name: 'Creating Cartoon Videos with AI',
    icon: '🎬',
    shortDesc: 'Learn to create animated cartoon videos using AI tools.',
    duration: '4 Weeks',
    price: 10000,
    videoId: 'X1dBjqdaiTo',
    finalProject: 'Create a short cartoon video using AI tools, from script to finished export.',
    modules: dslModuleSet('AI Cartoon Video Creation', [
      'Introduction to AI video tools', 'Writing a simple script', 'Character and scene ideas',
      'Generating AI visuals', 'Adding voice and sound', 'Basic animation principles',
      'Editing your video', 'Adding captions and effects', 'Exporting for social media',
      'Storytelling tips', 'Publishing your cartoon'
    ])
  },
  {
    id: 'ai-tools',
    name: 'AI Tools',
    icon: '🤖',
    shortDesc: 'Learn to use practical AI tools for everyday and work tasks.',
    duration: '4 Weeks',
    price: 7500,
    videoId: '_ZvnD73m40o',
    finalProject: 'Complete a practical AI-based project showing how AI tools can solve a real task or problem.',
    modules: dslModuleSet('AI Tools', [
      'Introduction to AI tools', 'Writing good prompts', 'AI for writing and editing',
      'AI for research and study', 'AI for images', 'AI for planning and productivity',
      'AI for presentations', 'AI for data and spreadsheets', 'Using AI responsibly',
      'Combining AI tools in a workflow', 'Building your AI toolkit'
    ])
  },
  {
    id: 'photo-editing',
    name: 'Photo Editing',
    icon: '🖼️',
    shortDesc: 'Learn to edit and enhance photos like a professional.',
    duration: '4 Weeks',
    price: 7500,
    videoId: 'vsBJ5JM0udg',
    finalProject: 'Create a complete photo editing project — a before/after set of edited photos showing your techniques.',
    modules: dslModuleSet('Photo Editing', [
      'Introduction to photo editing', 'Understanding exposure and light', 'Cropping and composition',
      'Colour correction basics', 'Working with layers', 'Retouching basics',
      'Filters and effects', 'Editing portraits', 'Editing for social media',
      'Batch editing basics', 'Exporting for print and web'
    ])
  }
];

function getCourseById(courseId) {
  return COURSES.find(c => c.id === courseId) || null;
}

/* ---------------------------------------------------------------------- */
/* Generic storage helpers                                                */
/* ---------------------------------------------------------------------- */

function dslRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('DSL storage read error for', key, e);
    return fallback;
  }
}

function dslWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('DSL storage write error for', key, e);
    return false;
  }
}

/* ---------------------------------------------------------------------- */
/* Users                                                                  */
/* ---------------------------------------------------------------------- */

function getUsers() {
  return dslRead(DSL_KEYS.USERS, []);
}

function saveUsers(users) {
  return dslWrite(DSL_KEYS.USERS, users);
}

function generateStudentID() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DSL-STU-${rand}`;
}

/* Very small non-cryptographic hash so we don't store raw passwords in
   localStorage. This is NOT secure — see the prototype disclaimer above. */
function dslSimpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'h' + Math.abs(hash).toString(36);
}

function createStudentUser({ fullName, email, phone, password }) {
  const users = getUsers();
  const emailLower = email.trim().toLowerCase();
  if (users.some(u => u.email.toLowerCase() === emailLower)) {
    return { success: false, message: 'An account with this email already exists. Please log in instead.' };
  }
  const user = {
    id: generateStudentID(),
    fullName: fullName.trim(),
    email: emailLower,
    phone: phone.trim(),
    passwordHash: dslSimpleHash(password),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  return { success: true, user };
}

function loginStudent(email, password) {
  const users = getUsers();
  const emailLower = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === emailLower);
  if (!user) return { success: false, message: 'No account found with that email address.' };
  if (user.passwordHash !== dslSimpleHash(password)) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }
  setCurrentUser(user);
  return { success: true, user };
}

function getCurrentUser() {
  return dslRead(DSL_KEYS.CURRENT_USER, null);
}

function setCurrentUser(user) {
  const safeUser = { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone };
  dslWrite(DSL_KEYS.CURRENT_USER, safeUser);
}

function updateUser(updatedFields) {
  const current = getCurrentUser();
  if (!current) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updatedFields };
  saveUsers(users);
  setCurrentUser(users[idx]);
}

function logoutStudent() {
  localStorage.removeItem(DSL_KEYS.CURRENT_USER);
  window.location.href = 'index.html';
}

function requireLogin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

/* ---------------------------------------------------------------------- */
/* Admin session                                                          */
/* ---------------------------------------------------------------------- */

function adminLogin(username, password) {
  if (username === DSL_ADMIN_CREDENTIALS.username && password === DSL_ADMIN_CREDENTIALS.password) {
    dslWrite(DSL_KEYS.ADMIN_SESSION, { loggedIn: true, at: new Date().toISOString() });
    return { success: true };
  }
  return { success: false, message: 'Invalid admin username or password.' };
}

function getAdminSession() {
  return dslRead(DSL_KEYS.ADMIN_SESSION, null);
}

function requireAdmin() {
  const session = getAdminSession();
  if (!session || !session.loggedIn) {
    window.location.href = 'admin.html';
    return false;
  }
  return true;
}

function logoutAdmin() {
  localStorage.removeItem(DSL_KEYS.ADMIN_SESSION);
  window.location.href = 'admin.html';
}

/* ---------------------------------------------------------------------- */
/* Course registrations                                                   */
/* ---------------------------------------------------------------------- */

function getRegistrations() {
  return dslRead(DSL_KEYS.REGISTRATIONS, []);
}

function saveRegistrations(regs) {
  return dslWrite(DSL_KEYS.REGISTRATIONS, regs);
}

function getRegistrationsForUser(userId) {
  return getRegistrations().filter(r => r.studentId === userId);
}

function getRegistrationById(id) {
  return getRegistrations().find(r => r.id === id) || null;
}

function findRegistration(userId, courseId) {
  return getRegistrations().find(r => r.studentId === userId && r.courseId === courseId) || null;
}

function registerCourse(user, course) {
  const existing = findRegistration(user.id, course.id);
  if (existing) return { success: true, registration: existing, alreadyRegistered: true };

  const registration = {
    id: 'REG-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase(),
    studentId: user.id,
    studentName: user.fullName,
    email: user.email,
    phone: user.phone,
    courseId: course.id,
    courseName: course.name,
    price: course.price,
    registrationDate: new Date().toISOString(),
    paymentStatus: 'NOT PAID',
    trainingStatus: 'NOT STARTED',
    progress: 0,
    completedModules: [],
    finalProjectRequested: false,
    finalProjectCompleted: false,
    certificateStatus: 'NOT AVAILABLE'
  };
  const regs = getRegistrations();
  regs.push(registration);
  saveRegistrations(regs);
  return { success: true, registration, alreadyRegistered: false };
}

function updateRegistration(id, changes) {
  const regs = getRegistrations();
  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) return null;
  regs[idx] = { ...regs[idx], ...changes };
  saveRegistrations(regs);
  return regs[idx];
}

function computeProgress(reg, totalModules) {
  const moduleShare = totalModules > 0 ? (reg.completedModules.length / totalModules) * 90 : 0;
  const projectShare = reg.finalProjectCompleted ? 10 : 0;
  return Math.round(moduleShare + projectShare);
}

/* ---------------------------------------------------------------------- */
/* Certificates                                                           */
/* ---------------------------------------------------------------------- */

function getCertificates() {
  return dslRead(DSL_KEYS.CERTIFICATES, []);
}

function saveCertificates(certs) {
  return dslWrite(DSL_KEYS.CERTIFICATES, certs);
}

function generateCertificateId() {
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `DSL-${rand}`;
}

function addCertificate(registration) {
  const certs = getCertificates();
  const already = certs.find(c => c.registrationId === registration.id);
  if (already) return already;
  const cert = {
    certificateId: generateCertificateId(),
    registrationId: registration.id,
    studentName: registration.studentName,
    courseName: registration.courseName,
    courseId: registration.courseId,
    completionDate: new Date().toISOString()
  };
  certs.push(cert);
  saveCertificates(certs);
  return cert;
}

function findCertificateById(certificateId) {
  const cleaned = certificateId.trim().toUpperCase();
  return getCertificates().find(c => c.certificateId.toUpperCase() === cleaned) || null;
}

/* ---------------------------------------------------------------------- */
/* UI helpers                                                             */
/* ---------------------------------------------------------------------- */

function formatCurrency(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info') {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3600);
}

function setFieldError(fieldEl, message) {
  fieldEl.classList.add('has-error');
  const errorEl = fieldEl.querySelector('.field-error');
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldEl) {
  fieldEl.classList.remove('has-error');
  const errorEl = fieldEl.querySelector('.field-error');
  if (errorEl) errorEl.textContent = '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+\s-]{7,15}$/.test(phone);
}

function setupPasswordToggle(toggleBtn, inputEl) {
  if (!toggleBtn || !inputEl) return;
  toggleBtn.addEventListener('click', () => {
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';
    toggleBtn.textContent = isPassword ? 'Hide' : 'Show';
  });
}

function whatsappLink(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------------------------------------------- */
/* Shared student navigation                                              */
/* ---------------------------------------------------------------------- */

function renderStudentNav(activePage) {
  const mount = document.getElementById('site-header');
  if (!mount) return;
  const user = getCurrentUser();

  const links = [
    { href: 'courses.html', label: 'Courses' },
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'video.html', label: 'My Learning' },
    { href: 'contact.html', label: 'Contact' }
  ];

  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="${activePage === l.href ? 'active' : ''}">${l.label}</a>`
  ).join('');

  mount.innerHTML = `
    <nav class="nav">
      <a href="${user ? 'courses.html' : 'index.html'}" class="brand">
        <span class="brand-mark">SAT</span>
        <span>Success Academy Tech Digital Skills Learning</span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><span></span></button>
      <ul class="nav-links" id="nav-links">
        ${user ? linksHtml : ''}
        ${user ? `<li class="nav-user">Hi, ${user.fullName.split(' ')[0]}</li>` : ''}
        ${user ? `<li><button class="nav-logout" id="nav-logout-btn" type="button">Logout</button></li>` : ''}
      </ul>
    </nav>
  `;

  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
  const logoutBtn = document.getElementById('nav-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutStudent);
}

function renderFooter() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  mount.innerHTML = `
    <div class="container">
      <p style="margin:0;">© ${new Date().getFullYear()} Success Academy Tech Digital Skills Learning. Practical digital skills for secondary school students and graduates.</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
});

/* ---------------------------------------------------------------------- */
/* PWA service worker registration                                        */
/* ---------------------------------------------------------------------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service_worker.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
