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
   8. Footer year + alternate burger
   9. Dealer application form (Google Sheet + emails)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initActiveNavLink();
  initScrollReveal();
  initCounters();
  initScrollTopButton();
  initEnquiryForm();
  initFooterYearAndBurger();
  initDealerForm();
});

/* ---------------------------------------------------------
   1. Navbar scroll state
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
   2. Mobile menu
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
   3. Active nav link
   --------------------------------------------------------- */
function initActiveNavLink() {
  const links = document.querySelectorAll('#navLinks a[data-page]');
  if (!links.length) return;

  let currentPage = window.location.pathname.split('/').pop();
  if (currentPage === '') currentPage = 'index.html';

  links.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add('active');
    }
  });
}

/* ---------------------------------------------------------
   4. Scroll reveal
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
   5. Stat counters
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
      const eased = 1 - Math.pow(1 - progress, 3);
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
   7. Enquiry form (contact.html)
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

  const validateField = (key) => {
    const { el, validate } = fields[key];
    const errorEl = document.getElementById(`err-${key}`);
    const message = validate(el.value.trim());

    el.closest('.form-field').classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';

    return !message;
  };

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
 * Single place to connect a real backend / API for the contact form.
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

/* ---------------------------------------------------------
   8. Footer year + alternate burger (#burgerBtn)
   --------------------------------------------------------- */
function initFooterYearAndBurger() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Only used if the page has #burgerBtn and NOT #hamburger
  const burgerBtnEl = document.getElementById('burgerBtn');
  const burgerMenuEl = document.getElementById('navLinks');
  if (burgerBtnEl && burgerMenuEl && !document.getElementById('hamburger')) {
    burgerBtnEl.addEventListener('click', () => burgerMenuEl.classList.toggle('open'));
    burgerMenuEl.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => burgerMenuEl.classList.remove('open'))
    );
  }
}

/* ---------------------------------------------------------
   9. Dealer application form -> Google Apps Script
   --------------------------------------------------------- */
function initDealerForm() {
  const dealerForm = document.getElementById('dealerForm');
  if (!dealerForm) return;

  const formStatus = document.getElementById('formStatus');
  const submitBtn =
    document.getElementById('submitBtn') || dealerForm.querySelector('button[type="submit"]');

  const GOOGLE_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycby5E4Uv8w0M4QC1Ka5g3zs0tVPHAGsKztzLB8cpXS5pnNux5XfqKJQXv8QTQnpn2FQK/exec';

  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  const showStatus = (msg, color) => {
    if (formStatus) {
      formStatus.textContent = msg;
      formStatus.style.color = color;
    } else if (msg) {
      alert(msg);
    }
  };

  dealerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('Dealer form submit hua');

    const email = val('femail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('✕ कृपया सही ईमेल पता दर्ज करें।', 'red');
      return;
    }

    const oldLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'जमा हो रहा है...';
    }
    showStatus('', '');

    const formData = {
      businessType: val('fbusiness'),
      businessarea: val('fbusinessarea'),
      fullName: val('fname'),
      phone: val('fphone'),
      email: email,
      address: val('faddress'),
      city: val('fcity'),
      tehsil: val('ftehsil'),
      district: val('fdistrict'),
      state: val('fstate'),
      pincode: val('fpincode'),
    };
    console.log('Sending:', formData);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData),
      });

      showStatus(
        '✓ आपका आवेदन सफलतापूर्वक जमा हो गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।',
        'green'
      );
      dealerForm.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      showStatus('✕ आवेदन जमा करने में समस्या हुई। कृपया कुछ देर बाद पुनः प्रयास करें।', 'red');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = oldLabel || 'आवेदन जमा करें';
      }
    }
  });
}
