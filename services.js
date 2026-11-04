(() => {
  const section = document.querySelector('#servicios');
  if (!section) return;
  const data = JSON.parse(document.querySelector('#page-data').textContent);
  const cards = Array.from(section.querySelectorAll('.listing-card'));
  const chips = Array.from(section.querySelectorAll('.filter-chips button'));
  const count = section.querySelector('.results-count');
  const more = section.querySelector('#load-more-services');
  const pageSize = 6;
  let selected = 0;
  let limit = pageSize;

  const render = () => {
    let matches = 0;
    let visible = 0;
    cards.forEach((card, index) => {
      const matchesCategory = selected === 0 || data.services[index][2] === data.categories[selected];
      if (matchesCategory) matches++;
      card.hidden = !matchesCategory || matches > limit;
      if (!card.hidden) visible++;
    });
    chips.forEach((chip, index) => chip.setAttribute('aria-pressed', String(index === selected)));
    count.textContent = data.ui.servicesShown.replace('{visible}', visible).replace('{total}', matches);
    more.hidden = visible >= matches;
  };
  chips.forEach((chip, index) => chip.addEventListener('click', () => {
    selected = index;
    limit = pageSize;
    render();
  }));
  more.addEventListener('click', () => {
    const previouslyVisible = new Set(cards.filter(card => !card.hidden));
    limit += pageSize;
    render();
    // Keep keyboard focus at the newly revealed content when the control disappears.
    cards.find(card => !card.hidden && !previouslyVisible.has(card))?.focus({ preventScroll: true });
  });
  render();
})();
