(() => {
  'use strict';

  const PRIMARY_SOURCE = '/data/sanity-experiments.json';
  const FALLBACK_SOURCE = '/experiments/experiments.json';

  const grid = document.querySelector('[data-exp-grid]');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const countLabel = document.querySelector('[data-exp-count]');
  let cards = [];

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>\"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  }[char]));

  const formatMetrics = (metricsData) => {
    if (Array.isArray(metricsData)) {
      return metricsData.slice(0, 2)
        .filter((m) => m && m.label && m.value)
        .map((m) => `<span>${escapeHtml(m.label)}: <strong>${escapeHtml(m.value)}</strong></span>`)
        .join('');
    }
    if (metricsData && typeof metricsData === 'object') {
      return Object.entries(metricsData).slice(0, 2)
        .map(([key, value]) => `<span>${escapeHtml(key)}: <strong>${escapeHtml(value)}</strong></span>`)
        .join('');
    }
    return '';
  };

  const cardMarkup = (experiment) => {
    const featured = experiment.featured ? ' is-featured' : '';
    const action = experiment.url && experiment.url !== '#'
      ? `<a href="${escapeHtml(experiment.url)}" class="exp-card-cta"><span>${experiment.featured ? 'Read Full Case Study' : 'Open Experiment'}</span><span class="cta-arrow" aria-hidden="true">→</span></a>`
      : '<span class="exp-card-cta" style="color: var(--exp-muted);"><span>Coming in Next Milestone</span></span>';
    const metrics = formatMetrics(experiment.metrics);
    const tags = (experiment.tags || []).map((tag) => `<span class="exp-tag">${escapeHtml(tag)}</span>`).join('');
    return `<article class="exp-card${featured}" data-category="${escapeHtml(experiment.category)}">
      <div class="exp-card-header"><div class="exp-card-meta"><span class="exp-num">EXP / ${escapeHtml(experiment.number)}</span><span class="exp-status-badge status-${escapeHtml(experiment.statusType)}">● ${escapeHtml(experiment.status)}</span></div><span class="exp-card-metrics">${metrics}</span></div>
      <h2 class="exp-card-title">${escapeHtml(experiment.title)}</h2>
      <p class="exp-card-subtitle">${escapeHtml(experiment.subtitle)}</p>
      <p class="exp-card-desc">${escapeHtml(experiment.summary)}</p>
      <div class="exp-card-tags">${tags}</div>
      <div class="exp-card-foot">${action}<span class="exp-count-label">${escapeHtml(experiment.date)}</span></div>
    </article>`;
  };

  const applyFilter = (filter) => {
    let visibleCount = 0;
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.hidden = !match;
      if (match) visibleCount += 1;
    });
    if (countLabel) countLabel.textContent = `Showing ${visibleCount} experiment${visibleCount === 1 ? '' : 's'}`;
  };

  const renderExperiments = (experiments) => {
    if (!grid) return;
    if (experiments.length === 0) {
      grid.innerHTML = '<p class="exp-count-label" style="grid-column: 1 / -1; padding: 2rem 0; text-align: center;">No experiments are currently published.</p>';
      cards = [];
      if (countLabel) countLabel.textContent = 'Showing 0 experiments';
      return;
    }
    grid.innerHTML = experiments.map(cardMarkup).join('');
    cards = Array.from(grid.querySelectorAll('.exp-card'));
    const activeFilterBtn = document.querySelector('[data-filter].is-active');
    applyFilter(activeFilterBtn ? activeFilterBtn.dataset.filter : 'all');
  };

  const isValidExperiment = (exp) => {
    return Boolean(
      exp &&
      typeof exp === 'object' &&
      typeof exp.title === 'string' &&
      exp.title.trim().length > 0 &&
      typeof exp.number === 'string' &&
      typeof exp.category === 'string'
    );
  };

  const fetchAndValidate = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`Invalid data from ${url}: expected an array`);
    }
    if (!data.every(isValidExperiment)) {
      throw new Error(`Invalid record structure in ${url}`);
    }
    return data;
  };

  const loadExperiments = async () => {
    if (!grid) return;
    try {
      const primaryData = await fetchAndValidate(PRIMARY_SOURCE);
      renderExperiments(primaryData);
    } catch (primaryErr) {
      try {
        const fallbackData = await fetchAndValidate(FALLBACK_SOURCE);
        renderExperiments(fallbackData);
      } catch (fallbackErr) {
        grid.innerHTML = '<p class="exp-count-label" style="grid-column: 1 / -1; padding: 2rem 0; text-align: center;">The experiment registry is temporarily unavailable.</p>';
        if (countLabel) countLabel.textContent = 'Registry unavailable';
      }
    }
  };

  loadExperiments();

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      applyFilter(button.dataset.filter);
    });
  });
})();
