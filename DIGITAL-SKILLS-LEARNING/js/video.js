/* ---------------------------------------------------------------------- */
/* YouTube IFrame Player API loader                                       */
/* Each course has ONE long tutorial video. To stop every module from     */
/* showing the exact same opening minutes (the "it keeps repeating"       */
/* complaint), each module jumps to its own point in that video,          */
/* calculated from the video's real duration once the player reports it.  */
/* ---------------------------------------------------------------------- */

let ytApiPromise = null;
function loadYouTubeAPI() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') previousCallback();
      resolve();
    };
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
  return ytApiPromise;
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return;
  renderStudentNav('video.html');

  const content = document.getElementById('video-content');
  const params = new URLSearchParams(window.location.search);
  const requestedRegId = params.get('reg');

  const myRegs = getRegistrationsForUser(user.id);
  const verifiedRegs = myRegs.filter(r => r.paymentStatus === 'PAID' || r.paymentStatus === 'PAYMENT VERIFIED');

  let registration = null;
  if (requestedRegId) {
    registration = myRegs.find(r => r.id === requestedRegId) || null;
  }
  if (!registration && verifiedRegs.length === 1) {
    registration = verifiedRegs[0];
  }

  /* No registrations at all */
  if (!myRegs.length) {
    renderLocked('No course yet', 'You have not registered for any course. Browse our courses to get started.', 'courses.html', 'Browse Courses');
    return;
  }

  /* Student picked / has a specific course, but it isn't paid for */
  if (registration && !(registration.paymentStatus === 'PAID' || registration.paymentStatus === 'PAYMENT VERIFIED')) {
    renderLocked('Payment not verified yet', 'Your payment has not been verified yet. Please contact Admin through WhatsApp.', 'payment.html?reg=' + registration.id, 'Go to Payment');
    return;
  }

  /* No specific course chosen and student has more than one verified course: let them pick */
  if (!registration && verifiedRegs.length > 1) {
    renderCourseChooser(verifiedRegs);
    return;
  }

  /* No verified course available at all */
  if (!registration) {
    renderLocked('Payment not verified yet', 'Your payment has not been verified yet. Please contact Admin through WhatsApp.', 'payment.html', 'Go to Payment');
    return;
  }

  renderCourse(registration);

  function renderLocked(title, message, href, cta) {
    content.innerHTML = `
      <div class="card locked-box">
        <h2>${title}</h2>
        <p>${message}</p>
        <a href="${href}" class="btn btn-primary">${cta}</a>
      </div>
    `;
  }

  function renderCourseChooser(regs) {
    content.innerHTML = `
      <div class="page-hero">
        <h1>Which course do you want to continue?</h1>
        <p>You're registered for more than one verified course.</p>
      </div>
      <div class="stack" style="max-width:500px; padding-bottom:40px;">
        ${regs.map(r => `
          <a href="video.html?reg=${r.id}" class="card" style="padding:18px 20px; display:flex; justify-content:space-between; align-items:center;">
            <span><strong>${r.courseName}</strong></span>
            <span class="badge badge-progress">${r.progress}%</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  function renderCourse(reg) {
    const course = getCourseById(reg.courseId);
    let activeModuleNumber = reg.completedModules.length < course.modules.length
      ? reg.completedModules.length + 1
      : (reg.finalProjectCompleted ? course.modules.length : 'final');

    /* ---------------------------------------------------------------
       THE FIX for "the video keeps repeating itself":
       the old version rebuilt the whole panel's innerHTML — including a
       brand new <div> for the YouTube player — every single time a
       student clicked a module or pressed "Mark Module Complete". That
       destroyed the running player and created a fresh one each time,
       which is exactly what looks/feels like the video restarting.

       The player is now created ONCE per course and kept alive for the
       whole time the student is on this page. Switching modules only
       calls player.seekTo() on that same player — it jumps to the new
       section instantly with no reload, no flash, no restart.
       --------------------------------------------------------------- */
    let ytPlayer = null;
    let playerReady = false;
    let videoDuration = 0;

    drawSkeleton();

    function drawSkeleton() {
      content.innerHTML = `
        <div class="learn-header" id="learn-header"></div>

        <div class="course-body">
          <ul class="module-nav" id="module-nav"></ul>

          <div class="card module-panel">
            <h2 id="module-title-heading"></h2>
            <p class="muted" id="video-caption" style="margin-top:-6px;"></p>
            <div class="video-frame" id="video-frame-wrap">
              ${course.videoId
                ? `<div id="yt-player-slot"></div>`
                : `<div class="video-placeholder">
                    <p style="margin:0; color:#B9C6D6;">Video coming soon</p>
                    <p style="margin:4px 0 0; font-size:0.8rem; color:#7E8FA6;">Video source can be added later.</p>
                  </div>`
              }
            </div>
            <div id="module-text-panel"></div>
          </div>
        </div>

        <div class="wa-group-box">
          <h3>Need to join your course WhatsApp group?</h3>
          <p class="muted">Chat with us on WhatsApp to request your course group link.</p>
          <a class="btn btn-teal" id="wa-group-btn" target="_blank" rel="noopener">Join Course Group</a>
        </div>
      `;

      const waMsg = `Hello, I want to join the WhatsApp learning group.\n\nStudent Name: ${reg.studentName}\nCourse: ${reg.courseName}\nStudent ID: ${user.id}\n\nPlease send me the WhatsApp group link for my course.`;
      document.getElementById('wa-group-btn').href = whatsappLink(WHATSAPP_NUMBER, waMsg);

      renderHeader();
      renderNav();
      renderTextPanel();
      if (course.videoId) mountPlayerOnce(course.videoId);
    }

    /* Only touches the progress/status card — never the video. */
    function renderHeader() {
      const el = document.getElementById('learn-header');
      el.innerHTML = `
        <div class="learn-header-top">
          <div>
            <h1>${course.name}</h1>
            <p class="muted">Student: ${reg.studentName}</p>
          </div>
          <div class="learn-meta">
            <span class="badge badge-verified">✓ ${reg.paymentStatus}</span>
            <span class="badge ${reg.trainingStatus === 'COMPLETED' ? 'badge-completed' : 'badge-progress'}">${reg.trainingStatus}</span>
          </div>
        </div>
        <div class="learn-progress">
          <div class="progress-label"><span>Training Progress</span><span>${reg.progress}%</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${reg.progress}%;"></div></div>
        </div>
      `;
    }

    /* Only touches the module sidebar list — never the video. */
    function renderNav() {
      const isFinalActive = activeModuleNumber === 'final';
      const finalUnlocked = reg.completedModules.length >= course.modules.length;
      const el = document.getElementById('module-nav');
      el.innerHTML = `
        ${course.modules.map(m => {
          const done = reg.completedModules.includes(m.number);
          const isActive = activeModuleNumber === m.number;
          return `
            <li class="module-nav-item">
              <button data-module="${m.number}" class="${isActive ? 'active' : ''}">
                <span>Module ${m.number}</span>
                ${done ? '<span class="check">✓</span>' : ''}
              </button>
            </li>
          `;
        }).join('')}
        <li class="module-nav-item">
          <button data-module="final" class="${isFinalActive ? 'active' : ''}" ${!finalUnlocked ? 'disabled style="opacity:0.5;"' : ''}>
            <span>Final Project</span>
            ${reg.finalProjectCompleted ? '<span class="check">✓</span>' : ''}
          </button>
        </li>
      `;
      el.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          const val = btn.dataset.module;
          activeModuleNumber = val === 'final' ? 'final' : Number(val);
          renderNav();
          renderTextPanel();
          updateVideoForActiveModule();
        });
      });
    }

    /* Only touches the title + notes + button text below the video —
       the <div id="yt-player-slot"> is never part of this innerHTML, so
       the live player underneath is completely undisturbed. */
    function renderTextPanel() {
      const titleEl = document.getElementById('module-title-heading');
      const captionEl = document.getElementById('video-caption');
      const panel = document.getElementById('module-text-panel');

      if (activeModuleNumber === 'final') {
        titleEl.textContent = 'Final Project';
        captionEl.textContent = '';
        renderFinalProjectText(panel);
        return;
      }

      const module = course.modules.find(m => m.number === activeModuleNumber);
      const done = reg.completedModules.includes(module.number);

      titleEl.textContent = module.title;
      captionEl.textContent = course.videoId
        ? `Now playing: ${module.title} — this jumps to that part of the ${course.name} video automatically.`
        : '';

      panel.innerHTML = `
        <div class="module-notes">
          <h4>What you will learn</h4>
          <ul>
            <li>${module.description}</li>
            <li>Practical examples you can try yourself</li>
            <li>Tips used by working professionals</li>
          </ul>
        </div>
        ${done
          ? `<span class="badge badge-completed">✓ Module Completed</span>`
          : `<button class="btn btn-primary" id="complete-module-btn">Mark Module Complete</button>`
        }
      `;

      const btn = document.getElementById('complete-module-btn');
      if (btn) btn.addEventListener('click', () => completeModule(module.number));
    }

    function renderFinalProjectText(panel) {
      const waMsg = `Hello, I have completed all the modules for ${reg.courseName} and I'm ready for my final project.\n\nStudent Name: ${reg.studentName}\nStudent ID: ${user.id}\nCourse: ${reg.courseName}\n\nPlease send me my final project assignment.`;
      const waHref = whatsappLink(WHATSAPP_NUMBER, waMsg);

      let statusHtml;
      if (reg.finalProjectCompleted) {
        statusHtml = `<span class="badge badge-completed">✓ Final Project Completed</span>`;
      } else if (reg.finalProjectRequested) {
        statusHtml = `
          <span class="badge badge-pending">Final project requested</span>
          <p class="muted" style="margin-top:10px;">We've got your request. Admin will send your assignment and confirm here once it's marked done.</p>
          <a class="btn btn-outline" id="final-project-wa-btn" target="_blank" rel="noopener" href="${waHref}">Message Admin Again</a>
        `;
      } else {
        statusHtml = `<button class="btn btn-teal" id="request-project-btn">Request Final Project on WhatsApp</button>`;
      }

      panel.innerHTML = `
        <p>${course.finalProject}</p>
        <div class="module-notes">
          <h4>How this works</h4>
          <p class="muted" style="margin:0;">Tap the button below to message Admin on WhatsApp (${WHATSAPP_NUMBER.replace('234', '0')}). Admin will send your specific final project for ${course.name}. Once it's reviewed and confirmed, your certificate becomes available.</p>
        </div>
        ${statusHtml}
      `;

      const requestBtn = document.getElementById('request-project-btn');
      if (requestBtn) {
        requestBtn.addEventListener('click', () => requestFinalProject(waHref));
      }
    }

    /* Creates the YouTube player exactly once for this page view. Every
       later module switch reuses this same player via seekTo(). */
    function mountPlayerOnce(videoId) {
      if (ytPlayer) return;
      loadYouTubeAPI().then(() => {
        const slot = document.getElementById('yt-player-slot');
        if (!slot) return; /* student already navigated away before this loaded */

        ytPlayer = new YT.Player('yt-player-slot', {
          videoId: videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: (event) => {
              playerReady = true;
              videoDuration = event.target.getDuration() || 0;
              seekToActiveModule();
            }
          }
        });
      });
    }

    /* Jumps the ALREADY-LOADED player to this module's section — no
       reload, so nothing visibly "repeats" or restarts. */
    function seekToActiveModule() {
      if (!playerReady || !ytPlayer || activeModuleNumber === 'final') return;
      const total = course.modules.length;
      const startSeconds = videoDuration > 0
        ? Math.floor((videoDuration * (activeModuleNumber - 1)) / total)
        : 0;
      try { ytPlayer.seekTo(startSeconds, true); } catch (e) { /* player not ready yet, ignore */ }
    }

    function setVideoVisible(visible) {
      const wrap = document.getElementById('video-frame-wrap');
      if (wrap) wrap.style.display = visible ? '' : 'none';
    }

    function updateVideoForActiveModule() {
      if (activeModuleNumber === 'final') {
        setVideoVisible(false);
        return;
      }
      setVideoVisible(true);
      seekToActiveModule();
    }

    function completeModule(number) {
      /* Note: trainingStatus only ever moves to COMPLETED via Admin (see admin.js).
         A student finishing every module and the final project still shows
         IN PROGRESS until Admin reviews and confirms completion. */
      if (!reg.completedModules.includes(number)) {
        reg.completedModules = [...reg.completedModules, number].sort((a, b) => a - b);
      }
      const progress = computeProgress(reg, course.modules.length);
      const trainingStatus = reg.trainingStatus === 'NOT STARTED' ? 'IN PROGRESS' : reg.trainingStatus;
      const updated = updateRegistration(reg.id, {
        completedModules: reg.completedModules,
        progress,
        trainingStatus
      });
      Object.assign(reg, updated);
      showToast(`Module ${number} marked complete.`, 'success');
      activeModuleNumber = reg.completedModules.length < course.modules.length
        ? reg.completedModules.length + 1
        : 'final';
      /* Updates header, nav and text only — the video player is never
         touched, so it keeps running right where it was. */
      renderHeader();
      renderNav();
      renderTextPanel();
      updateVideoForActiveModule();
    }

    function requestFinalProject(waHref) {
      /* Marking this true is what makes the request show up on admin.html,
         in the Training Progress tab, so Admin knows to follow up on WhatsApp. */
      const updated = updateRegistration(reg.id, { finalProjectRequested: true });
      Object.assign(reg, updated);
      showToast('Opening WhatsApp — Admin can now see your request too.', 'success');
      window.open(waHref, '_blank', 'noopener');
      renderHeader();
      renderNav();
      renderTextPanel();
    }
  }
});
