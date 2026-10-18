const menuButton = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
  navigation?.classList.toggle('open', !expanded);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
  navigation?.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  menuButton.focus();
});

const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
const projectStatus = document.querySelector('#projects-status');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
    const visibleCount = [...projectCards].filter((card) => !card.hidden).length;
    if (projectStatus) {
      projectStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'proyecto mostrado' : 'proyectos mostrados'}.`;
    }
  });
});

const year = document.querySelector('#current-year');
if (year) year.textContent = new Date().getFullYear();

const topButton = document.querySelector('.scroll-top');
const updateTopButton = () => topButton?.classList.toggle('visible', window.scrollY > 500);
window.addEventListener('scroll', updateTopButton, { passive: true });
updateTopButton();
topButton?.addEventListener('click', () => {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
});

const revealItems = document.querySelectorAll('.section-label, .about-body, .skill-card, .project-card, .timeline-item, .contact-grid');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => {
      item.classList.add('reveal');
      observer.observe(item);
    });
  } catch {
    revealItems.forEach((item) => item.classList.remove('reveal'));
  }
}

const copyButton = document.querySelector('[data-copy-email]');
const emailLink = document.querySelector('[data-email-link]');
const copyStatus = document.querySelector('#copy-status');
let copyTimer;

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand('copy');
  field.remove();
  if (!ok) throw new Error('copy failed');
};

copyButton?.addEventListener('click', async () => {
  const email = emailLink?.getAttribute('href')?.replace(/^mailto:/i, '');
  if (!email) return;
  clearTimeout(copyTimer);
  try {
    await copyText(email);
    copyButton.textContent = 'Copiado';
    copyButton.classList.add('is-copied');
    if (copyStatus) copyStatus.textContent = 'Correo copiado al portapapeles.';
  } catch {
    copyButton.textContent = 'No se pudo copiar';
    if (copyStatus) copyStatus.textContent = 'No se pudo copiar el correo. Cópialo manualmente.';
  }
  copyTimer = setTimeout(() => {
    copyButton.textContent = 'Copiar';
    copyButton.classList.remove('is-copied');
    if (copyStatus) copyStatus.textContent = '';
  }, 2200);
});