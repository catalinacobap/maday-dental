const SERVICES = PAGE_DATA.services;
const CATEGORIES = PAGE_DATA.categories;
const search = document.querySelector('#service-search');
search.type = 'text';
search.setAttribute('role', 'combobox');
search.setAttribute('aria-autocomplete', 'list');
search.setAttribute('aria-expanded', 'false');
search.setAttribute('aria-controls', 'service-suggestions');
const searchWrap = document.createElement('div');
searchWrap.className = 'search-wrap';
search.before(searchWrap);
searchWrap.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>';
searchWrap.append(search);
const resetSearch = document.createElement('button');
resetSearch.type = 'button'; resetSearch.className = 'search-reset'; resetSearch.setAttribute('aria-label', t('clearSearch'));
resetSearch.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
searchWrap.append(resetSearch);
resetSearch.addEventListener('click', clearSearch);
const chips = document.querySelector('.filter-chips');
const grid = document.querySelector('.services-list');
const empty = document.querySelector('.empty-results');
let selected = CATEGORIES[0];
let chosenService = '';
let suggestions = [];
let activeSuggestion = -1;
const suggestionList = document.createElement('div');
suggestionList.id = 'service-suggestions';
suggestionList.className = 'search-suggestions';
suggestionList.setAttribute('role', 'listbox');
suggestionList.setAttribute('aria-label', t('suggestions'));
suggestionList.hidden = true;
searchWrap.append(suggestionList);
const normalize = value => value.toLocaleLowerCase(PAGE_DATA.locale).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
function closeSuggestions() {
  suggestionList.hidden = true;
  activeSuggestion = -1;
  search.setAttribute('aria-expanded', 'false');
  search.removeAttribute('aria-activedescendant');
}
function clearSearch() {
  search.value = ''; chosenService = ''; closeSuggestions(); renderServices(); search.focus();
}
function chooseSuggestion(index) {
  const service = suggestions[index];
  if (!service) return;
  chosenService = service[0]; search.value = chosenService;
  closeSuggestions(); renderServices(); search.focus();
}
function updateSuggestions() {
  const query = normalize(search.value.trim());
  closeSuggestions();
  if (!query) return;
  suggestions = SERVICES.filter(service => (selected === CATEGORIES[0] || selected === service[2]) && normalize(service[0] + ' ' + service[3]).includes(query)).slice(0, 5);
  suggestionList.replaceChildren();
  suggestions.forEach((service, index) => {
    const option = document.createElement('div');
    option.id = `service-option-${index}`; option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false');
    option.innerHTML = TOOTH_ICON;
    const label = document.createElement('span');
    const start = normalize(service[0]).indexOf(query);
    if (start >= 0) {
      label.append(document.createTextNode(service[0].slice(0, start)));
      const mark = document.createElement('mark'); mark.textContent = service[0].slice(start, start + query.length); label.append(mark, document.createTextNode(service[0].slice(start + query.length)));
    } else label.textContent = service[0];
    option.append(label);
    option.addEventListener('mousedown', event => event.preventDefault());
    option.addEventListener('click', () => chooseSuggestion(index));
    suggestionList.append(option);
  });
  suggestionList.hidden = suggestions.length === 0;
  search.setAttribute('aria-expanded', String(suggestions.length > 0));
}
search.addEventListener('keydown', event => {
  if (event.key === 'Escape' || event.key === 'Tab') { closeSuggestions(); return; }
  if (event.key === 'Enter' && activeSuggestion >= 0 && !suggestionList.hidden) { event.preventDefault(); chooseSuggestion(activeSuggestion); return; }
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  if (suggestionList.hidden) updateSuggestions();
  if (!suggestions.length || suggestionList.hidden) return;
  event.preventDefault();
  activeSuggestion = activeSuggestion < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1) : (activeSuggestion + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length;
  Array.from(suggestionList.children).forEach((option, index) => option.setAttribute('aria-selected', String(index === activeSuggestion)));
  search.setAttribute('aria-activedescendant', `service-option-${activeSuggestion}`);
});
document.addEventListener('pointerdown', event => { if (!searchWrap.contains(event.target)) closeSuggestions(); });
search.addEventListener('blur', closeSuggestions);
function renderServices() {
  resetSearch.hidden = !search.value;
  const query = normalize(search.value.trim());
  const filtered = SERVICES.filter(service => (selected === CATEGORIES[0] || service[2] === selected) && (chosenService ? service[0] === chosenService : normalize(service.join(' ')).includes(query)));
  grid.innerHTML = filtered.map(([title, description, category]) => `<article class="listing-card"><span class="listing-icon" aria-hidden="true">✧</span><span class="listing-category">${category}</span><h2>${title}</h2><p>${description}</p><a href="${title === SERVICES[17][0] ? CLINIC.whatsapp : CLINIC.booking}">${title === SERVICES[17][0] ? t('whatsapp') : t('booking')}</a></article>`).join('');
  document.querySelector('.results-count').textContent = `${filtered.length} ${filtered.length === 1 ? t('treatment') : t('treatments')}`;
  empty.hidden = filtered.length !== 0;
  grid.querySelectorAll('article > a').forEach(link => {
    link.className = 'button button-outline-dark service-cta';
    link.insertAdjacentHTML('afterbegin', link.href === CLINIC.whatsapp ? WHATSAPP_ICON : calendarIcon);
  });
  // Make the whole card clickable, not only its call-to-action button.
  grid.querySelectorAll('.listing-card').forEach(card => {
    const cta = card.querySelector('a');
    if (!cta) return;
    card.classList.add('is-clickable');
    card.addEventListener('click', event => { if (!event.target.closest('a')) cta.click(); });
  });
  if (chosenService) grid.querySelector('.listing-card')?.classList.add('search-match');
  grid.querySelectorAll('.listing-icon').forEach((icon, index) => { icon.innerHTML = TOOTH_ICON.replace('</svg>', index % 3 === 0 ? '<path d="M13 11h6m-3-3v6"/></svg>' : index % 3 === 1 ? '<path d="m11 11 3 2 6-2"/></svg>' : '</svg>'); });
  chips.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.textContent === selected)));
}
CATEGORIES.forEach(category => { const button = document.createElement('button'); button.type = 'button'; button.textContent = category; button.addEventListener('click', () => { selected = category; chosenService = ''; closeSuggestions(); renderServices(); }); chips.append(button); });
search.addEventListener('input', () => { chosenService = ''; renderServices(); updateSuggestions(); });
document.querySelector('#clear-search').addEventListener('click', clearSearch);
renderServices();
