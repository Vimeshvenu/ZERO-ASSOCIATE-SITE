// assets/js/main.js — upgraded
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const mobileNav = document.getElementById('mobile-nav');

  // Respect system preference on first load
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && prefersDark)) {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.setAttribute('aria-pressed','true');
    if (themeToggle) themeToggle.innerHTML = '<i class="icon-sun" aria-hidden="true"></i>';
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const enabled = body.classList.toggle('dark-mode');
      localStorage.setItem('theme', enabled ? 'dark' : 'light');
      themeToggle.setAttribute('aria-pressed', String(enabled));
      themeToggle.innerHTML = enabled ? '<i class="icon-sun" aria-hidden="true"></i>' : '<i class="icon-moon" aria-hidden="true"></i>';
    });
  }

  // Build mobile nav (clone items, accessible)
  function buildMobileNav() {
    if (!mobileNav || !navMenu) return;
    mobileNav.innerHTML = '';
    const ul = navMenu.querySelector('ul')?.cloneNode(true);
    if (!ul) return;
    ul.classList.add('mobile-list');
    mobileNav.appendChild(ul);
  }
  buildMobileNav();

  // Mobile toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const opened = hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(opened));
      if (mobileNav) {
        if (opened) {
          mobileNav.removeAttribute('hidden');
          mobileNav.setAttribute('aria-hidden', 'false');
        } else {
          mobileNav.setAttribute('hidden','');
          mobileNav.setAttribute('aria-hidden','true');
        }
      }
    });
  }

  // Close mobile nav on link click
  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      hamburger?.classList.remove('active');
      hamburger?.setAttribute('aria-expanded','false');
      mobileNav?.setAttribute('hidden','');
      mobileNav?.setAttribute('aria-hidden','true');
    }
  });

  // Intersection animations
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add('visible');
        obs.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(el => io.observe(el));

  // Lightbox (delegated)
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-hidden','true');
    document.body.appendChild(lightbox);
  }
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('.gallery-item img, .gallery-grid img')) {
      const big = document.createElement('img');
      big.src = target.dataset.large || target.src;
      big.alt = target.alt || '';
      while (lightbox.firstChild) lightbox.removeChild(lightbox.firstChild);
      lightbox.appendChild(big);
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
    } else if (e.target === lightbox) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
  });

  // Contact form: progressive enhancement. If a form exists, intercept and POST via fetch.
  const contactForm = document.querySelector('form.needs-validation');
  if (contactForm) {
    contactForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const data = new FormData(contactForm);
      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending...';

      // Replace with your real Formspree endpoint or backend URL
      const ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          // show success message
          const msg = document.createElement('div');
          msg.className = 'success-message';
          msg.innerText = 'Thank you! Your message has been sent. We will contact you shortly.';
          contactForm.appendChild(msg);
          contactForm.reset();
        } else {
          const json = await res.json().catch(()=>null);
          throw new Error((json && (json.error || json.message)) || 'Submission failed');
        }
      } catch (err) {
        const errEl = document.createElement('div');
        errEl.className = 'error-message';
        errEl.innerText = 'Sorry — could not send the message. Please email info@zeroassociates.com';
        contactForm.appendChild(errEl);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Request';
      }
    });
  }

  // Fill current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
