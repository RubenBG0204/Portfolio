// Referencias al botón del menú móvil y al contenedor de navegación.
const menuButton = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.main-nav');

// Abre o cierra el menú y mantiene sincronizados sus atributos de accesibilidad.
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
  navigation?.classList.toggle('open', !expanded);
});

// Cierra el menú móvil después de seleccionar cualquiera de sus enlaces.
navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Abrir menú');
  });
});

// Permite cerrar el menú con Escape y devuelve el foco al botón que lo abre.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
  navigation?.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  menuButton.focus();
});

// Obtiene los controles de filtro, las tarjetas de proyecto y el anuncio accesible.
const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');
const projectStatus = document.querySelector('#projects-status');

// Muestra solo los proyectos de la categoría elegida y anuncia el resultado.
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

// Actualiza automáticamente el año que aparece en el pie de página.
const year = document.querySelector('#current-year');
if (year) year.textContent = new Date().getFullYear();

// Muestra el acceso para volver arriba una vez que se ha desplazado la página.
const topButton = document.querySelector('.scroll-top');
const updateTopButton = () => topButton?.classList.toggle('visible', window.scrollY > 500);
window.addEventListener('scroll', updateTopButton, { passive: true });
updateTopButton();
topButton?.addEventListener('click', () => {
  // Respeta la preferencia del sistema para reducir las animaciones.
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.scrollTo({ top: 0, behavior });
});

// Elementos que aparecen con una transición al entrar en la zona visible.
const revealItems = document.querySelectorAll('.section-label, .about-body, .skill-card, .project-card, .timeline-item, .contact-grid');
// IntersectionObserver evita escuchar continuamente el desplazamiento; se omite si no está disponible
// o si el usuario ha solicitado movimiento reducido.
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

// Referencias a los elementos usados para copiar el correo y comunicar el resultado.
const copyButton = document.querySelector('[data-copy-email]');
const emailLink = document.querySelector('[data-email-link]');
const copyStatus = document.querySelector('#copy-status');
let copyTimer;

// Copia texto usando la API moderna y recurre a una alternativa para contextos no seguros.
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

// Copia la dirección de correo, informa del resultado y restaura el botón tras unos segundos.
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