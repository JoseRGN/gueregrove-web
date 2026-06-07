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
  '.service-card, .blog-card, .process-step, .stat, .faq-item, .about-image-wrap, .about-content'
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

    if (!nombre || !email) {
      formStatus.textContent = 'Por favor completá los campos requeridos.';
      return;
    }

    btn.textContent = 'Enviando...';
    btn.disabled    = true;
    formStatus.textContent = '';

    fetch('/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(new FormData(form)).toString(),
    })
      .then(() => {
        btn.textContent        = 'Mensaje enviado ✓';
        formStatus.textContent = 'Gracias, te contactamos pronto.';
        form.reset();
      })
      .catch(() => {
        btn.textContent        = 'Enviar Mensaje';
        btn.disabled           = false;
        formStatus.textContent = 'Hubo un error. Intentá nuevamente o escribinos a hola@gueregrove.com';
      });
  });
}


// ---- AÑO en footer ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
