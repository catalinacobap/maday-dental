const CLINIC = PAGE_DATA.clinic;
const WHATSAPP_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.46 0 .1 5.36.1 11.95c0 2.1.55 4.16 1.59 5.97L0 24l6.23-1.63a11.9 11.9 0 0 0 5.81 1.48h.01C18.64 23.85 24 18.49 24 11.9c0-3.18-1.24-6.17-3.48-8.42ZM12.05 21.83h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.69.97.98-3.6-.24-.37a9.9 9.9 0 1 1 8.36 4.59Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.29-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48a9.02 9.02 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.59-.49-.51-.67-.52h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.09 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.41.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z"/></svg>';
const FAQS = PAGE_DATA.faqs;
const familyStatistic = document.querySelector('.stats > div:last-child small');
if (familyStatistic) familyStatistic.textContent = t('audience');
const mapPattern = document.querySelector('.map-pattern');
if (mapPattern) mapPattern.outerHTML = '<iframe class="clinic-map" title="Ubicación de Clínica Dental Dra. Maday Pallares González" src="https://maps.google.com/maps?q=10.3615575,-84.4977497&z=17&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
const reviewsButtonIcon = document.querySelector('.reviews .button [data-lucide="arrow-up-right"]');
if (reviewsButtonIcon) reviewsButtonIcon.remove();
// Verified public Google reviews provided by the clinic for publication: { name, date, rating, text, photo, url }.
const VERIFIED_REVIEWS = [
  { name: 'Gabriel Ruiz', date: 'Hace 8 meses', rating: 5, photo: '/assets/reviews/e-hombre-calvo.png',
    text: 'Súper recomendada la doctora. Te hace sentir muy cómodo en la consulta y trabaja con mucho amor para que el trabajo quede bien y bonito. No es solo por el dinero: ella busca que quede bien hecho.' },
  { name: 'Lida María Villalobos', date: 'Hace 7 meses', rating: 5, photo: '/assets/reviews/a-mujer-flores.png',
    text: 'La conozco hace 18 años; ella nos ha hecho los trabajos dentales a mi esposo, a mi hija y a mí. Es excelente en lo que hace, trabaja muy bien. La recomiendo al 100% y como persona es súper linda, amable y cariñosa.' },
  { name: 'Kendall López Herrera', date: 'Hace 11 meses', rating: 5, photo: '/assets/reviews/b-hombre-rubio.png',
    text: 'La doctora Maday es una profesional impecable. He tenido muchos tratamientos con ella y siempre me da el mejor resultado. Tiene toda mi confianza en mi salud bucal y estética. Recomendada 100%.' },
  { name: 'Wanda De León Echeverría', date: 'Hace 11 meses', rating: 5, photo: '/assets/reviews/c-exteriores-lentes.png',
    text: 'Basada en mi experiencia personal con la Dra. Maday Pallares, aseguro que es una profesional íntegra, con muy alta ética profesional y personal, muy conocedora de su profesión y siempre dispuesta a dar lo mejor de su experiencia y un excelente trato a favor del paciente. No para hasta dar con la raíz del problema y solucionarlo, además de dar seguimiento y acompañamiento para la total recuperación.' },
  { name: 'Judith Carvajal', date: 'Hace 10 meses', rating: 5, photo: '/assets/reviews/d-mujer-sonriente.png',
    text: 'La atención es excelente. En mi caso, con mi hija ha sido un proceso de mucha mejoría: ha superado sus temores porque la doctora es muy especial con los niños. Su trato es excelente, la recomiendo al 100%.' },
];
const reviewCard = document.querySelector('.review-summary');
if (reviewCard && VERIFIED_REVIEWS.length) {
  let currentReview = 0;
  const renderReview = () => {
    const review = VERIFIED_REVIEWS[currentReview];
    reviewCard.replaceChildren();
    const mark = document.createElement('div'); mark.className = 'review-mark'; mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.6 5.2C7.4 6.3 5 9.2 5 13v5.8h6.2V13H7.9c0-1.9 1-3.3 3.1-4.1l-.4-3.7Zm9 0C16.4 6.3 14 9.2 14 13v5.8h6.2V13h-3.3c0-1.9 1-3.3 3.1-4.1l-.4-3.7Z"/></svg>';
    const head = document.createElement('div'); head.className = 'review-head';
    const avatar = document.createElement('img'); avatar.className = 'review-avatar'; avatar.src = review.photo; avatar.alt = ''; avatar.width = 52; avatar.height = 52; avatar.loading = 'lazy';
    const identity = document.createElement('div');
    const author = document.createElement('strong'); author.className = 'review-name'; author.textContent = review.name;
    const date = document.createElement('span'); date.className = 'review-date'; date.textContent = review.date;
    identity.append(author, date); head.append(avatar, identity);
    const stars = document.createElement('div'); stars.className = 'review-stars'; stars.setAttribute('aria-label', `${review.rating} de 5`); stars.textContent = '★'.repeat(review.rating);
    const quote = document.createElement('p'); quote.className = 'review-text'; quote.textContent = `“${review.text}”`;
    const source = document.createElement('a'); source.className = 'review-source'; source.href = review.url || CLINIC.maps; source.target = '_blank'; source.rel = 'noreferrer'; source.setAttribute('aria-label', t('google'));
    const googleLogo = document.createElement('img'); googleLogo.className = 'review-google'; googleLogo.src = '/assets/reviews/google-reviews.png'; googleLogo.alt = 'Google Reviews'; googleLogo.loading = 'lazy'; source.append(googleLogo);
    reviewCard.append(mark, head, stars, quote, source);
    if (VERIFIED_REVIEWS.length > 1) {
      const controls = document.createElement('div'); controls.className = 'review-controls';
      const previous = document.createElement('button'); previous.type = 'button'; previous.setAttribute('aria-label', t('previousReview')); previous.textContent = '←'; previous.onclick = () => moveReview(-1);
      const next = document.createElement('button'); next.type = 'button'; next.setAttribute('aria-label', t('nextReview')); next.textContent = '→'; next.onclick = () => moveReview(1);
      const indicator = document.createElement('span'); indicator.textContent = `${currentReview + 1} / ${VERIFIED_REVIEWS.length}`;
      controls.append(previous, indicator, next); reviewCard.append(controls);
    }
  };
  const moveReview = direction => { currentReview = (currentReview + direction + VERIFIED_REVIEWS.length) % VERIFIED_REVIEWS.length; renderReview(); };
  let touchStart = 0;
  reviewCard.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  reviewCard.addEventListener('touchend', event => { const delta = event.changedTouches[0].clientX - touchStart; if (Math.abs(delta) > 40 && VERIFIED_REVIEWS.length > 1) moveReview(delta < 0 ? 1 : -1); }, { passive: true });
  renderReview();
}
const TOOTH_ICON = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 6c-3-2-8-2-10 2-2 4 0 8 1 11s1 8 4 8c2 0 2-7 5-7s3 7 5 7c3 0 3-5 4-8s3-7 1-11c-2-4-7-4-10-2Z"/></svg>';
// Each home service card keeps its own distinct icon (cleaning, restoration, prosthetics, aesthetics).
const accordion = document.querySelector('#accordion');
if (accordion) accordion.replaceChildren();
if (accordion) FAQS.forEach(([question, answer], index) => {
  const item = document.createElement('div');
  item.className = 'faq-item';
  item.innerHTML = `<button type="button" aria-expanded="false" aria-controls="answer-${index}"><span>${question}</span><i data-lucide="plus"></i></button><div class="faq-answer" id="answer-${index}" hidden><p>${answer}</p></div>`;
  const button = item.querySelector('button');
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') return;
    accordion.querySelectorAll('.faq-item').forEach(other => { other.classList.remove('open'); other.querySelector('button').setAttribute('aria-expanded', 'false'); other.querySelector('.faq-answer').hidden = true; });
    const open = true;
    button.setAttribute('aria-expanded', String(open));
    item.classList.toggle('open', open);
    item.querySelector('.faq-answer').hidden = !open;
  });
  accordion.append(item);
  if (index === 0) button.click();
});

document.querySelectorAll('[data-book]').forEach(link => { link.href = CLINIC.booking; link.querySelectorAll('[data-lucide="arrow-up-right"]').forEach(icon => icon.remove()); });
document.querySelectorAll('[data-whatsapp]').forEach(link => { link.href = CLINIC.whatsapp; const icon = link.querySelector('[data-lucide="message-circle"]'); if (icon) icon.outerHTML = WHATSAPP_ICON; else if (link.classList.contains('button')) link.insertAdjacentHTML('afterbegin', WHATSAPP_ICON); });
const menu = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');
if (menu && links) {
  menu.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.querySelector('.sr-only').textContent = t(open ? 'closeMenu' : 'openMenu');
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
}
const calendarIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/></svg>';
document.querySelectorAll('.button').forEach(button => {
  const label = button.textContent.trim();
  let icon = button.querySelector('svg, i');
  if (button.hasAttribute('data-book')) { button.querySelectorAll('svg,i').forEach(node => node.remove()); button.insertAdjacentHTML('afterbegin', calendarIcon); icon = button.querySelector('svg'); }
  if (icon) { const tile = document.createElement('span'); tile.className = 'button-icon'; tile.append(icon); button.prepend(tile); }
});
document.querySelectorAll('a[href*="maps.app.goo.gl"]').forEach(link => link.href = CLINIC.maps);
const headerCta = document.querySelector('.nav-links > .button');
if (headerCta) {
  headerCta.classList.add('header-cta');
  const actions = document.createElement('div');
  actions.className = 'header-actions';
  const switcher = document.querySelector('.language-switcher');
  if (switcher) actions.append(switcher);
  actions.append(headerCta);
  document.querySelector('.nav').append(actions);
}
if (PAGE_DATA.page === 'services') document.querySelector('.nav-links a').setAttribute('aria-current','page');
const badge = document.querySelector('.eyebrow');
if (badge) badge.innerHTML = TOOTH_ICON + t('specialty');
document.querySelectorAll('.footer-bottom span:first-child').forEach(node => node.textContent = `© ${new Date().getFullYear()} Clínica Dental Dra. Maday Pallares G.`);
if (window.lucide) lucide.createIcons();
