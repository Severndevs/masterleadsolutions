/* Master Lead Solutions — main.js */

(function () {
  'use strict';

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', function () {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  /* Close menu when a nav link is clicked */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Contact form ── */
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnSpinner= submitBtn.querySelector('.btn-spinner');
  const formAlert = document.getElementById('formAlert');

  function showAlert(message, type) {
    formAlert.textContent = message;
    formAlert.className   = 'form-alert ' + type;
    formAlert.hidden      = false;
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearAlert() {
    formAlert.hidden = true;
    formAlert.textContent = '';
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.hidden     = loading;
    btnSpinner.hidden  = !loading;
  }

  function validateForm() {
    let valid = true;
    ['name', 'phone', 'email', 'service'].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const empty = el.value.trim() === '';
      el.classList.toggle('error', empty);
      if (empty) valid = false;
    });
    const emailEl = document.getElementById('email');
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      valid = false;
    }
    return valid;
  }

  /* Remove error state on input */
  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input', function () { el.classList.remove('error'); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAlert();

    if (!validateForm()) {
      showAlert('Please fill in all required fields correctly.', 'error');
      return;
    }

    setLoading(true);

    const data = new FormData(form);

    fetch('submit.php', {
      method: 'POST',
      body: data,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (json.success) {
          showAlert('Thank you! We\'ve received your message and will be in touch shortly.', 'success');
          form.reset();
        } else {
          showAlert(json.message || 'Something went wrong. Please try again or call us directly.', 'error');
        }
      })
      .catch(function () {
        showAlert('Unable to send your message right now. Please call (845) 760-9555 or email shimon@masterleadsolutions.com.', 'error');
      })
      .finally(function () {
        setLoading(false);
      });
  });

})();
