/* ===================================================
   GÜEREGROVE — main.js
   =================================================== */

// ---- HEADER: scroll behavior ----
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });


// ---- NAV: mobile toggle ----
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Cierra el menú al hacer clic en un enlace
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Cierra con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    navToggle.focus();
  }
});


// ---- FADE-UP: IntersectionObserver ----
const fadeEls = document.querySelectorAll(
  '.service-card, .blog-card, .testimonial-card, .stat, .faq-item, .about-image-wrap, .about-content'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach((el, i) => {
  el.classList.add('fade-up');
  // Escalonado leve dentro de cada grupo de 4
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  observer.observe(el);
});


// ---- FAQ: accordion ----
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    const answer     = btn.closest('.faq-item').querySelector('.faq-answer');

    // Cierra todos los demás
    document.querySelectorAll('.faq-btn').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
      }
    });

    btn.setAttribute('aria-expanded', String(!isExpanded));
    answer.classList.toggle('open', !isExpanded);
  });
});


// ---- FORMULARIO: Netlify Forms ----
const form       = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn    = form.querySelector('button[type="submit"]');
    const nombre = form.querySelector('#nombre').value.trim();
    const email  = form.querySelector('#email').value.trim();

    const msgRequired = form.dataset.msgRequired || 'Por favor completá los campos requeridos.';
    const msgThanks   = form.dataset.msgThanks   || 'Gracias, te contactamos pronto.';
    const msgError    = form.dataset.msgError    || 'Hubo un error. Intentá nuevamente o escribinos a hola@gueregrove.com';
    const txtSending  = btn.dataset.sending      || 'Enviando...';
    const txtSent     = btn.dataset.sent         || 'Mensaje enviado ✓';
    const txtDefault  = btn.textContent;

    if (!nombre || !email) {
      formStatus.textContent = msgRequired;
      return;
    }

    btn.textContent = txtSending;
    btn.disabled    = true;
    formStatus.textContent = '';

    fetch('/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(new FormData(form)).toString(),
    })
      .then(() => {
        btn.textContent        = txtSent;
        formStatus.textContent = msgThanks;
        form.reset();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'form_submit', form_name: form.getAttribute('name') || 'contact' });
      })
      .catch(() => {
        btn.textContent        = txtDefault;
        btn.disabled           = false;
        formStatus.textContent = msgError;
      });
  });
}


// ---- AÑO en footer ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ---- THEME TOGGLE ----
const THEME_KEY    = 'gg-theme';
const themeToggle  = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-label',
      theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    themeToggle.setAttribute('title',
      theme === 'light' ? 'Modo oscuro' : 'Modo claro');
  }
}

applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  });
}
