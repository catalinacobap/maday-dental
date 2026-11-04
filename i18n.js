// Localized content is prerendered, not translated after paint.
const PAGE_DATA = JSON.parse(document.querySelector('#page-data').textContent);
const t = key => {
  if (!(key in PAGE_DATA.ui)) throw new Error(`Missing translation: ${key}`);
  return PAGE_DATA.ui[key];
};
document.querySelectorAll('[data-language]').forEach(link => {
  if (location.hash) link.hash = location.hash;
  link.addEventListener('click', () => {
    try { localStorage.setItem('clinic-language', link.dataset.language); } catch { /* Storage may be unavailable. */ }
  });
});
// Explicit localized URLs always win over saved preferences.
if (location.pathname === '/' || /^\/servicios\/?$/.test(location.pathname)) {
  try {
    if (localStorage.getItem('clinic-language') === 'en') {
      location.replace((PAGE_DATA.page === 'services' ? '/en/services/' : '/en/') + location.search + location.hash);
    }
  } catch { /* Default to Spanish without storage. */ }
}
