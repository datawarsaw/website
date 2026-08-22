(() => {
  'use strict';

  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const backdrop = document.querySelector('[data-nav-backdrop]');
  const menuLabel = document.querySelector('[data-menu-label]');
  const navStatus = document.querySelector('[data-nav-status]');
  let lastFocusedBeforeMenu = null;

  if (toggle && nav && !toggle.dataset.enhancedMenu) {
    toggle.dataset.enhancedMenu = 'true';
    const navLinks = [...nav.querySelectorAll('a')];
    const setMenuState = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      if (backdrop) backdrop.hidden = !open;
      if (menuLabel) menuLabel.textContent = open ? 'Close' : 'Menu';
      if (navStatus) navStatus.textContent = open ? 'Menu open' : 'Menu closed';
      if (open) {
        lastFocusedBeforeMenu = document.activeElement;
        if (navLinks[0]) navLinks[0].focus({ preventScroll: true });
      } else if (lastFocusedBeforeMenu && typeof lastFocusedBeforeMenu.focus === 'function') {
        lastFocusedBeforeMenu.focus({ preventScroll: true });
      }
    };
    const closeMenu = () => setMenuState(false);
    toggle.addEventListener('click', (event) => {
      event.stopImmediatePropagation();
      setMenuState(toggle.getAttribute('aria-expanded') !== 'true');
    }, true);
    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus({ preventScroll: true });
        return;
      }
      if (event.key !== 'Tab' || toggle.getAttribute('aria-expanded') !== 'true') return;
      const focusables = [toggle, ...navLinks];
      const index = focusables.indexOf(document.activeElement);
      if (index === -1) return;
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && index === focusables.length - 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 901px)').matches) closeMenu();
    });
  }

  const benchmarkRoot = document.querySelector('[data-benchmark]');
  if (benchmarkRoot) {
    const models = [
      { id: 'luna', name: 'GPT-5.6 Luna', coding: 94, reasoning: 96, ux: 92, speed: 78 },
      { id: 'grok45', name: 'Grok 4.5', coding: 88, reasoning: 84, ux: 90, speed: 91 },
      { id: 'grok46', name: 'Grok 4.6', coding: 92, reasoning: 91, ux: 93, speed: 85 },
      { id: 'gemini', name: 'Gemini Flash', coding: 89, reasoning: 86, ux: 94, speed: 98 },
      { id: 'bonsai', name: 'Ternary-Bonsai-27B', coding: 76, reasoning: 74, ux: 78, speed: 83 }
    ];
    const metricSelect = benchmarkRoot.querySelector('[data-benchmark-metric]');
    const ranksEl = benchmarkRoot.querySelector('[data-benchmark-ranks]');
    const matrixEl = benchmarkRoot.querySelector('[data-benchmark-matrix]');
    const leaderEl = benchmarkRoot.querySelector('[data-benchmark-leader]');
    const viewButtons = [...benchmarkRoot.querySelectorAll('[data-view]')];
    const panels = [...benchmarkRoot.querySelectorAll('[data-panel]')];
    const metricLabels = { coding: 'Coding', reasoning: 'Reasoning', ux: 'UX', speed: 'Speed' };
    const sortedBy = (metric) => [...models].sort((a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name));
    const renderRanks = (metric) => {
      const ranked = sortedBy(metric);
      ranksEl.innerHTML = ranked.map((model, index) => {
        const leader = index === 0;
        return '<li class="' + (leader ? 'is-leader' : '') + '" data-model="' + model.id + '"><span class="rank-index">' + String(index + 1).padStart(2, '0') + '</span><div class="rank-meta"><strong>' + model.name + (leader ? ' - lead' : '') + '</strong><span class="rank-track" aria-hidden="true"><span class="rank-fill" style="width:' + model[metric] + '%"></span></span></div><span class="rank-score">' + model[metric] + '</span></li>';
      }).join('');
      const top = ranked[0];
      leaderEl.textContent = 'Leader: ' + top.name + ' on ' + metricLabels[metric] + ' (' + top[metric] + ')';
    };
    const renderMatrix = (metric) => {
      const topId = sortedBy(metric)[0].id;
      const head = '<div class="matrix-row is-head" role="row"><span role="columnheader">Model</span><span role="columnheader">Coding</span><span role="columnheader">Reasoning</span><span role="columnheader">UX</span><span role="columnheader">Speed</span></div>';
      const rows = models.map((model) => {
        const leader = model.id === topId;
        const cell = (key) => '<span role="cell" class="' + (key === metric ? 'is-metric' : '') + '">' + model[key] + '</span>';
        return '<div class="matrix-row' + (leader ? ' is-leader' : '') + '" role="row"><span role="rowheader">' + model.name + (leader ? ' - lead' : '') + '</span>' + cell('coding') + cell('reasoning') + cell('ux') + cell('speed') + '</div>';
      }).join('');
      matrixEl.innerHTML = head + rows;
    };
    const setView = (view) => {
      viewButtons.forEach((button) => {
        const active = button.dataset.view === view;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        const active = panel.dataset.panel === view;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    };
    const refresh = () => {
      const metric = metricSelect.value;
      renderRanks(metric);
      renderMatrix(metric);
    };
    viewButtons.forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = viewButtons.indexOf(button);
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % viewButtons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + viewButtons.length) % viewButtons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = viewButtons.length - 1;
        viewButtons[next].focus();
        setView(viewButtons[next].dataset.view);
      });
    });
    metricSelect.addEventListener('change', refresh);
    refresh();
    setView('rank');
  }

  const explorer = document.querySelector('[data-model-explorer]');
  if (explorer) {
    const recommendations = {
      coding: { model: 'GPT-5.6 Luna', why: 'Highest coding score with the strongest reasoning depth for multi-file implementation and repair loops.', tradeoffs: ['Choose Luna when correctness and long-horizon coding matter more than raw latency.', 'Grok 4.6 is close if you want a slightly faster alternative with still-high coding quality.', 'Gemini Flash is better when turnaround speed dominates over deep refactors.'] },
      data: { model: 'Grok 4.6', why: 'Balanced reasoning and UX scores make it strong for analytical exploration that still needs clear communication.', tradeoffs: ['Luna remains stronger for pure reasoning depth.', 'Gemini Flash wins if the analysis task is shallow and time-critical.', 'Local Bonsai is only preferable when the dataset cannot leave the machine.'] },
      research: { model: 'GPT-5.6 Luna', why: 'Best reasoning score for synthesis, contradiction-checking and structured research write-ups.', tradeoffs: ['Grok 4.6 is a credible runner-up when you want a bit more speed.', 'Gemini Flash is weaker for careful research despite excellent UX pace.', 'Bonsai should not be first choice for broad research unless privacy forces it.'] },
      fast: { model: 'Gemini Flash', why: 'Clear speed leader with strong UX judgment for everyday drafting and quick interface tweaks.', tradeoffs: ['Expect less depth than Luna on thorny coding or research tasks.', 'Grok 4.5 is nearly as fast and can feel more adversarial in reviews.', 'Use Bonsai only when offline constraints outweigh cloud speed.'] },
      private: { model: 'Ternary-Bonsai-27B', why: 'The only option positioned for fully local / private workloads where prompts should stay on-device.', tradeoffs: ['Accept lower coding and reasoning ceilings versus cloud models.', 'Cloud models remain stronger whenever privacy is not the binding constraint.', 'Best framed as a private workstation model, not a general quality leader.'] }
    };
    const compareMeta = [
      { name: 'GPT-5.6 Luna', blurb: 'Best overall depth for coding and research.' },
      { name: 'Grok 4.5', blurb: 'Fast reviewer with strong UX instincts.' },
      { name: 'Grok 4.6', blurb: 'Balanced all-rounder for analysis-heavy work.' },
      { name: 'Gemini Flash', blurb: 'Speed-first choice for everyday tasks.' },
      { name: 'Ternary-Bonsai-27B', blurb: 'Local-only lane for private workloads.' }
    ];
    const modelEl = explorer.querySelector('[data-explorer-model]');
    const whyEl = explorer.querySelector('[data-explorer-why]');
    const tradeoffEl = explorer.querySelector('[data-explorer-tradeoffs]');
    const compareBtn = explorer.querySelector('[data-explorer-compare]');
    const comparePanel = explorer.querySelector('[data-explorer-compare-panel]');
    const compareBoard = explorer.querySelector('[data-compare-board]');
    const radios = [...explorer.querySelectorAll('input[name="task-category"]')];
    const renderRecommendation = () => {
      const selected = (radios.find((radio) => radio.checked) || { value: 'coding' }).value;
      const rec = recommendations[selected];
      modelEl.textContent = rec.model;
      whyEl.textContent = rec.why;
      tradeoffEl.innerHTML = rec.tradeoffs.map((item) => '<li>' + item + '</li>').join('');
      compareBoard.innerHTML = compareMeta.map((item) => {
        const best = item.name === rec.model;
        return '<article class="compare-card' + (best ? ' is-best' : '') + '"><span>' + (best ? 'Recommended' : 'Alternative') + '</span><strong>' + item.name + '</strong><p>' + item.blurb + '</p></article>';
      }).join('');
    };
    radios.forEach((radio) => radio.addEventListener('change', renderRecommendation));
    compareBtn.addEventListener('click', () => {
      const open = comparePanel.hasAttribute('hidden');
      comparePanel.toggleAttribute('hidden', !open);
      compareBtn.textContent = open ? 'Hide comparison' : 'Compare all models';
      compareBtn.setAttribute('aria-expanded', String(open));
    });
    compareBtn.setAttribute('aria-expanded', 'false');
    renderRecommendation();
  }

  const lab = document.querySelector('[data-ai-lab]');
  if (lab) {
    const form = lab.querySelector('[data-lab-form]');
    const output = lab.querySelector('[data-lab-output]');
    const typeLabel = { refactor: 'UI refactor', private: 'private customer notes', research: 'research synthesis', offline: 'offline coding' };
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const type = data.get('prompt-type');
      let destination = data.get('destination');
      if (destination === 'auto') destination = (type === 'private' || type === 'offline') ? 'local' : 'cloud';
      output.textContent = destination === 'local'
        ? ('Route for ' + typeLabel[type] + ': Ternary-Bonsai-27B on this machine. No cloud call is made from this page; use your local runtime if you proceed.')
        : ('Route for ' + typeLabel[type] + ': cloud coding agent. Better for breadth and speed, but the prompt would leave the workstation if you continue outside this demo.');
    });
  }
})();
