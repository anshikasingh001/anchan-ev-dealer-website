/* =========================================================
   ANCHAN EV — SCRIPT.JS
   Vanilla JS only, shared by every page. Sections:
   1. Navbar scroll state
   2. Mobile menu
   3. Active nav link (highlights the current page)
   4. Scroll reveal animations
   5. Stat counters
   6. Scroll-to-top button
   7. Enquiry form validation + submit handler
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initActiveNavLink();
  initScrollReveal();
  initCounters();
  initScrollTopButton();
  initEnquiryForm();
});

/* ---------------------------------------------------------
   1. Navbar scroll state — adds a compact class after
      scrolling past a small threshold.
   --------------------------------------------------------- */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 40;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------------------------------------------------
   2. Mobile menu — hamburger toggle + auto-close on link
      click / outside click / escape.
   --------------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  const closeMenu = () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  };

  hamburger.addEventListener('click', toggleMenu);

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (e) => {
    const clickedInsideNav = navLinks.contains(e.target) || hamburger.contains(e.target);
    if (!clickedInsideNav && navLinks.classList.contains('open')) closeMenu();
  });
}

/* ---------------------------------------------------------
   3. Active nav link — compares each link's page name
      against the current file name and marks it active.
      Works across index.html, dealership.html, etc.
   --------------------------------------------------------- */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll('#navLinks a[data-page]');
  if (!navLinks.length) return;

  let currentPage = window.location.pathname.split('/').pop();
  if (currentPage === '' ) currentPage = 'index.html';

  navLinks.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });
}

/* ---------------------------------------------------------
   4. Scroll reveal — fades/slides sections and cards into
      view using IntersectionObserver.
   --------------------------------------------------------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.section-head, .service-card, .feature, .step, .split-copy, .split-visual, .about-copy, .about-point, .mission-card, .stat, .contact-grid > *'
  );

  targets.forEach((el) => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   5. Stat counters — animates numbers up when the stats
      section enters the viewport. Values come from the
      data-target attribute in the HTML (editable there).
   --------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   6. Scroll-to-top button
   --------------------------------------------------------- */
function initScrollTopButton() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      btn.hidden = window.scrollY < 500;
    },
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   7. Enquiry form — front-end validation and a submit
      handler that is structured so a real backend / API
      can be dropped in later (see submitEnquiry below).
      Only present on contact.html.
   --------------------------------------------------------- */
function initEnquiryForm() {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const successBox = document.getElementById('formSuccess');

  const fields = {
    fullName: { el: document.getElementById('fullName'), validate: validateName },
    phone: { el: document.getElementById('phone'), validate: validatePhone },
    email: { el: document.getElementById('email'), validate: validateEmail },
    city: { el: document.getElementById('city'), validate: validateRequired },
    interest: { el: document.getElementById('interest'), validate: validateRequired },
    message: { el: document.getElementById('message'), validate: validateMessage },
  };

  // Validate a single field and reflect state in the UI.
  const validateField = (key) => {
    const { el, validate } = fields[key];
    const errorEl = document.getElementById(`err-${key}`);
    const message = validate(el.value.trim());

    el.closest('.form-field').classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';

    return !message;
  };

  // Validate on blur for immediate feedback.
  Object.keys(fields).forEach((key) => {
    fields[key].el.addEventListener('blur', () => validateField(key));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const results = Object.keys(fields).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      const firstInvalid = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const payload = {
      fullName: fields.fullName.el.value.trim(),
      phone: fields.phone.el.value.trim(),
      email: fields.email.el.value.trim(),
      city: fields.city.el.value.trim(),
      interest: fields.interest.el.value,
      message: fields.message.el.value.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      await submitEnquiry(payload);
      form.reset();
      Object.keys(fields).forEach((key) => {
        fields[key].el.closest('.form-field').classList.remove('has-error');
        const errorEl = document.getElementById(`err-${key}`);
        if (errorEl) errorEl.textContent = '';
      });
      if (successBox) {
        successBox.hidden = false;
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      // Real error handling can be wired up here once a backend exists.
      console.error('Enquiry submission failed:', err);
      alert('Something went wrong sending your enquiry. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

/**
 * submitEnquiry(payload)
 * -----------------------
 * This is the single place to connect a real backend or API.
 * Currently it only logs the payload and resolves — no fake
 * network request is made. Replace the body with, e.g.:
 *
 *   const response = await fetch('/api/enquiries', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   });
 *   if (!response.ok) throw new Error('Request failed');
 *   return response.json();
 */
function submitEnquiry(payload) {
  console.log('Enquiry ready to submit:', payload);
  return Promise.resolve({ success: true });
}

/* ---------------------------------------------------------
   Field validators
   --------------------------------------------------------- */
function validateRequired(value) {
  return value ? '' : 'This field is required.';
}

function validateName(value) {
  if (!value) return 'Please enter your full name.';
  if (value.length < 2) return 'Name looks too short.';
  return '';
}

function validatePhone(value) {
  if (!value) return 'Please enter a phone number.';
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length < 10) return 'Enter a valid phone number.';
  return '';
}

function validateEmail(value) {
  if (!value) return 'Please enter an email address.';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value) ? '' : 'Enter a valid email address.';
}

function validateMessage(value) {
  if (!value) return 'Tell us a little about your enquiry.';
  if (value.length < 10) return 'Please add a few more details.';
  return '';
}


// form
document.getElementById('year').textContent = new Date().getFullYear();

const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');

if(burger){
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

if(navLinks){
  navLinks.querySelectorAll('a').forEach(a => 
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}


/* ================= DEALER APPLICATION FORM ================= */

/* ================= DEALER APPLICATION FORM ================= */

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbx8twpPhG_CcZZCpU6bY-0Z_anCNySqn23GZ99Bfg73F75iS2sIo3iVD8jFCRFIgw0/exec";

const form = document.getElementById("dealerForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

if (form && statusEl && submitBtn) {

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    // Clear old message
    statusEl.textContent = "";
    statusEl.className = "form-status";

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = "जमा हो रहा है...";

    const formData = new FormData(form);

    try {

      await fetch(GOOGLE_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(formData)
      });

      // Reset form
      form.reset();

      // SHOW SUCCESS MESSAGE
      statusEl.textContent =
        "आवेदन प्राप्त हुआ — हमारी टीम जल्द संपर्क करेगी।";

      statusEl.className = "form-status success";

      // Make sure message is visible
      statusEl.style.display = "inline-block";
      statusEl.style.visibility = "visible";
      statusEl.style.opacity = "1";

      // Hide button
      submitBtn.style.display = "none";

    } catch (error) {

      console.error("Form submission error:", error);

      statusEl.textContent =
        "कुछ गलत हो गया। कृपया पुनः प्रयास करें।";

      statusEl.className = "form-status error";

      statusEl.style.display = "inline-block";
      statusEl.style.visibility = "visible";
      statusEl.style.opacity = "1";

      submitBtn.disabled = false;
      submitBtn.textContent = "आवेदन जमा करें";
      submitBtn.style.display = "inline-block";
    }

  });

}