(() => {
  'use strict';
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasGSAP = Boolean(window.gsap && window.ScrollTrigger);
  const localTestMode = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? new URLSearchParams(window.location.search).get('pulse-test')
    : null;
  const motionReduced = () => reduceMotionQuery.matches || localTestMode === 'reduced';
  const motionAllowed = () => hasGSAP && !motionReduced();
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (toggle && nav) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  const reveals = [...document.querySelectorAll('.reveal')];
  let motionMedia = null;

  const revealWithoutGSAP = () => {
    if (motionReduced() || !('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(el => observer.observe(el));
  };

  const setupMotion = () => {
    if (!hasGSAP) {
      revealWithoutGSAP();
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('has-gsap');
    motionMedia = gsap.matchMedia();

    motionMedia.add({
      isDesktop: '(min-width: 901px)',
      isMobile: '(max-width: 900px)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    }, context => {
      const { isMobile, reduceMotion: shouldReduce } = context.conditions;
      const heroReveals = [...document.querySelectorAll('.hero .reveal')];
      const sectionReveals = reveals.filter(el => !el.closest('.hero'));
      const revealSections = [...document.querySelectorAll('main > section:not(.hero)')];

      if (shouldReduce || motionReduced()) {
        reveals.forEach(el => el.classList.add('is-visible'));
        gsap.set(reveals, { autoAlpha: 1, y: 0, scale: 1, clearProps: 'transform,opacity,visibility,willChange' });
        return;
      }

      heroReveals.forEach(el => el.classList.add('is-visible'));
      gsap.set(heroReveals, { autoAlpha: 0, y: isMobile ? 18 : 26, willChange: 'transform,opacity' });

      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTimeline
        .add(() => window.__heroGraphAnimation?.triggerEntrance?.(), 0)
        .to('.hero-copy', { autoAlpha: 1, y: 0, duration: .78 }, 0)
        .to('.signal-stage', { autoAlpha: 1, y: 0, duration: .9 }, .12)
        .to('.hero-foot', {
          autoAlpha: 1,
          y: 0,
          duration: .65,
          clearProps: 'transform,opacity,visibility,willChange'
        }, .34)
        .set('.hero-copy, .signal-stage', { clearProps: 'transform,opacity,visibility,willChange' });

      gsap.fromTo('.signal-canvas',
        { autoAlpha: 1, scale: 1 },
        {
          autoAlpha: .32,
          scale: .955,
          transformOrigin: 'center center',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            id: 'datawarsaw-hero-signal-exit',
            trigger: '.hero',
            start: '45% top',
            end: 'bottom top',
            scrub: .6
          }
        }
      );

      gsap.set(sectionReveals, {
        autoAlpha: 0,
        y: isMobile ? 18 : 28,
        willChange: 'transform,opacity'
      });

      revealSections.forEach((section, index) => {
        const sectionTargets = [...section.querySelectorAll('.reveal')];
        if (!sectionTargets.length) return;

        ScrollTrigger.create({
          id: `datawarsaw-section-reveal-${index + 1}`,
          trigger: section,
          start: 'top 84%',
          once: true,
          onEnter: () => {
            sectionTargets.forEach(el => el.classList.add('is-visible'));
            gsap.to(sectionTargets, {
            autoAlpha: 1,
            y: 0,
            duration: .68,
            stagger: sectionTargets.length > 3 ? .065 : .08,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility,willChange'
          });
          }
        });
      });

      if (document.fonts?.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
    });
  };

  setupMotion();

  const animateDataState = (targets, options = {}) => {
    if (!motionAllowed()) return;
    const elements = (targets instanceof Element ? [targets] : Array.isArray(targets) ? targets : targets ? Array.from(targets) : []).filter(Boolean);
    if (!elements.length) return;
    window.gsap.killTweensOf(elements);
    window.gsap.fromTo(elements,
      { autoAlpha: options.fromAlpha ?? .35, y: options.y ?? 7 },
      {
        autoAlpha: 1,
        y: 0,
        duration: options.duration ?? .4,
        stagger: options.stagger ?? .045,
        ease: 'power2.out',
        overwrite: 'auto',
        clearProps: 'transform,opacity,visibility'
      }
    );
  };

  const experienceMap = document.querySelector('[data-experience-map]');
  if (experienceMap) {
    const experienceButtons = [...experienceMap.querySelectorAll('[data-experience]')];
    const radarAxes = [...experienceMap.querySelectorAll('[data-radar-axis]')];
    const experienceKicker = experienceMap.querySelector('[data-experience-kicker]');
    const experienceScore = experienceMap.querySelector('[data-experience-score]');
    const experienceTitle = experienceMap.querySelector('[data-experience-title]');
    const experienceSummary = experienceMap.querySelector('[data-experience-summary]');
    const experienceTools = experienceMap.querySelector('[data-experience-tools]');
    const centerKicker = experienceMap.querySelector('.radar-center .center-kicker');
    const centerVal = experienceMap.querySelector('.radar-center .center-val');
    let selectedExperience = null;

    const showExperience = button => {
      if (!button) {
        if (experienceKicker) experienceKicker.textContent = 'Calibrated profile';
        if (experienceScore) experienceScore.textContent = 'Scale 1–10';
        if (experienceTitle) experienceTitle.textContent = 'Analytical expertise';
        if (experienceSummary) experienceSummary.textContent = 'Choose an axis to explore commercial context, calibrated proficiency, and core tools.';
        if (experienceTools) experienceTools.textContent = 'Power BI · SQL · Python';
        if (centerKicker) centerKicker.textContent = 'SCALE';
        if (centerVal) centerVal.textContent = '1–10';
      } else {
        if (experienceKicker) experienceKicker.textContent = button.dataset.kicker + ' · Axis 0' + (Number(button.dataset.axis) + 1);
        if (experienceScore) experienceScore.textContent = button.dataset.score + ' / 10';
        if (experienceTitle) experienceTitle.textContent = button.dataset.experience;
        if (experienceSummary) experienceSummary.textContent = button.dataset.summary;
        if (experienceTools) experienceTools.textContent = button.dataset.tools;
        if (centerKicker) centerKicker.textContent = 'SCORE';
        if (centerVal) centerVal.textContent = button.dataset.score;
      }
      const axis = button ? button.dataset.axis : null;
      experienceMap.classList.toggle('has-preview', Boolean(button));
      experienceButtons.forEach(item => item.closest('li').classList.toggle('is-preview', item === button));
      radarAxes.forEach(item => item.classList.toggle('is-active', item.dataset.radarAxis === axis));
      animateDataState(experienceMap.querySelectorAll('.experience-context > *'), { y: 5, stagger: .035, duration: .34 });
      const activeAxis = radarAxes.find(item => item.dataset.radarAxis === axis);
      if (activeAxis) animateDataState(activeAxis.querySelectorAll('line,circle'), { y: 0, fromAlpha: .28, stagger: .035, duration: .3 });
    };

    experienceButtons.forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('pointerenter', () => showExperience(button));
      button.addEventListener('pointerleave', () => showExperience(selectedExperience));
      button.addEventListener('focus', () => showExperience(button));
      button.addEventListener('blur', () => showExperience(selectedExperience));
      button.addEventListener('click', () => {
        const shouldClear = selectedExperience === button;
        selectedExperience = shouldClear ? null : button;
        experienceMap.classList.toggle('has-selection', Boolean(selectedExperience));
        experienceButtons.forEach(item => {
          const active = item === selectedExperience;
          item.setAttribute('aria-pressed', String(active));
          item.closest('li').classList.toggle('is-active', active);
        });
        showExperience(selectedExperience);
      });
    });
  }

  const processTrack = document.querySelector('[data-process-track]');
  const processQuestion = document.querySelector('[data-process-question]');
  const processIndex = document.querySelector('[data-process-index]');
  if (processTrack && processQuestion && processIndex) {
    const processSteps = [...processTrack.querySelectorAll('li[data-question]')];
    const processButtons = processSteps.map(step => step.querySelector('.process-step-button'));
    let selectedProcess = processButtons[0];
    let processTimeline = null;
    let processTimer = 0;

    const showProcess = (button, preview = true) => {
      const step = button.closest('li');
      processTrack.classList.toggle('has-preview', preview);
      processSteps.forEach(item => item.classList.toggle('is-preview', preview && item === step));
      const questionPanel = processQuestion.closest('.process-question');
      const updateQuestion = () => {
        processIndex.textContent = `Business question / ${step.dataset.questionIndex}`;
        processQuestion.textContent = step.dataset.question;
      };

      if (motionAllowed()) {
        processTimeline?.kill();
        processTimeline = window.gsap.timeline({ defaults: { ease: 'power2.out' } });
        processTimeline
          .to([processIndex, processQuestion], { autoAlpha: 0, y: -5, duration: .12, stagger: .025, overwrite: true })
          .add(updateQuestion)
          .fromTo([processIndex, processQuestion],
            { autoAlpha: 0, y: 7 },
            { autoAlpha: 1, y: 0, duration: .32, stagger: .045, clearProps: 'transform,opacity,visibility' }
          );
      } else {
        window.clearTimeout(processTimer);
        if (!motionReduced()) questionPanel.classList.add('is-changing');
        processTimer = window.setTimeout(() => {
          updateQuestion();
          questionPanel.classList.remove('is-changing');
        }, motionReduced() ? 0 : 90);
      }
    };

    processButtons.forEach(button => {
      button.addEventListener('pointerenter', () => showProcess(button));
      button.addEventListener('pointerleave', () => showProcess(selectedProcess, false));
      button.addEventListener('focus', () => showProcess(button));
      button.addEventListener('blur', () => showProcess(selectedProcess, false));
      button.addEventListener('click', () => {
        selectedProcess = button;
        processButtons.forEach(item => {
          const active = item === selectedProcess;
          item.setAttribute('aria-pressed', String(active));
          item.closest('li').classList.toggle('is-active', active);
        });
        showProcess(selectedProcess, false);
      });
    });
  }

  const practiceModule = document.querySelector('[data-practice-module]');
  if (practiceModule) {
    const ORG_REPOS_URL = 'https://api.github.com/users/datawarsaw/repos?per_page=100&sort=pushed';
    const CACHE_KEY_ACTIVITY = 'dw_github_org_activity_v2';
    const CACHE_TTL_MS = 10 * 60 * 1000;

    const statusEl = practiceModule.querySelector('[data-practice-status]');
    const statusTextEl = practiceModule.querySelector('[data-practice-status-text]');
    const scopeEl = practiceModule.querySelector('[data-practice-scope]');
    const reposEl = practiceModule.querySelector('[data-practice-repos]');
    const stackEl = practiceModule.querySelector('[data-practice-stack]');
    const pushedEl = practiceModule.querySelector('[data-practice-pushed]');
    const matrixContainer = practiceModule.querySelector('[data-practice-matrix]');
    const practiceLedger = practiceModule.querySelector('[data-practice-ledger]');
    const ledgerList = practiceModule.querySelector('[data-practice-ledger-list]');
    const fallbackNote = practiceModule.querySelector('[data-practice-fallback]');
    const inspectorDate = practiceModule.querySelector('[data-inspector-date]');
    const inspectorCount = practiceModule.querySelector('[data-inspector-count]');
    const inspectorMsg = practiceModule.querySelector('[data-inspector-msg]');

    let currentPayload = null;
    let lastRenderedWidth = 0;

    const svgNS = 'http://www.w3.org/2000/svg';

    const createSvg = (name, attrs = {}) => {
      const el = document.createElementNS(svgNS, name);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };

    const computeMatrixLayout = (containerWidth) => {
      const w = Math.max(260, containerWidth || (window.innerWidth ? window.innerWidth - 64 : 320));

      let numWeeks;
      let targetFill;
      let minCell;
      let maxCell;
      let leftPad;
      let topPad = 18;

      if (w < 460) {
        numWeeks = w < 330 ? 20 : (w < 380 ? 22 : 24);
        targetFill = 0.94;
        minCell = 8.5;
        maxCell = 10.5;
        leftPad = 20;
        topPad = 15;
      } else if (w < 850) {
        numWeeks = w < 600 ? 32 : (w < 720 ? 36 : 40);
        targetFill = 0.88;
        minCell = 9.5;
        maxCell = 13.0;
        leftPad = 24;
        topPad = 16;
      } else {
        numWeeks = 52;
        targetFill = w > 1300 ? 0.82 : 0.86;
        minCell = 10.5;
        maxCell = 16.0;
        leftPad = 26;
        topPad = 18;
      }

      const gridAvailable = Math.max(160, w * targetFill - leftPad);
      const colWidth = gridAvailable / numWeeks;
      const cellGap = Math.max(2.0, Math.min(4.5, Math.round(colWidth * 0.21 * 2) / 2));
      const rawCellSize = colWidth - cellGap;
      const cellSize = Math.max(minCell, Math.min(maxCell, Math.round(rawCellSize * 10) / 10));

      const svgWidth = Math.round(leftPad + numWeeks * (cellSize + cellGap));
      const svgHeight = Math.round(topPad + 7 * (cellSize + cellGap) + 4);

      return {
        numWeeks,
        cellSize,
        cellGap,
        leftPad,
        topPad,
        svgWidth,
        svgHeight
      };
    };

    const getWarsawDateParts = (date = new Date()) => {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Warsaw',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, p.value])
      );
      return parts;
    };

    const formatWarsawDateIso = date => {
      const p = getWarsawDateParts(date);
      return `${p.year}-${p.month}-${p.day}`;
    };

    const formatWarsawHumanDate = (date, includeYear = true) => {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: includeYear ? 'numeric' : undefined,
        timeZone: 'Europe/Warsaw'
      }).format(date);
    };

    const getCached = key => {
      try {
        const item = sessionStorage.getItem(key);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.ts < CACHE_TTL_MS) return parsed.data;
      } catch (e) {}
      return null;
    };

    const setCached = (key, data) => {
      try {
        sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
      } catch (e) {}
    };

    const fetchWithTimeout = async (url, timeoutMs = 7000) => {
      const controller = new AbortController();
      const id = window.setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/vnd.github.v3+json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data;
      } finally {
        window.clearTimeout(id);
      }
    };

    const renderInspector = cell => {
      if (!cell) {
        inspectorDate.textContent = 'Hover or focus a day cell';
        inspectorCount.textContent = '—';
        inspectorMsg.textContent = 'Select a cell in the activity matrix to inspect commit details.';
        return;
      }
      const count = parseInt(cell.dataset.count, 10) || 0;
      const dateStr = cell.dataset.dateHuman || cell.dataset.date;
      const repos = cell.dataset.repos || '';
      const repo = cell.dataset.repo || '';
      const msg = cell.dataset.msg || '';

      inspectorDate.textContent = dateStr;
      if (count === 0) {
        inspectorCount.textContent = '0 commits';
        inspectorMsg.textContent = 'No public commits recorded across DataWarsaw repositories on this day.';
      } else {
        const repoCount = repos ? repos.split(',').length : 1;
        inspectorCount.textContent = `${count} commit${count === 1 ? '' : 's'}${repoCount > 1 ? ` · ${repoCount} repos` : (repo ? ` · ${repo}` : '')}`;
        inspectorMsg.textContent = repo ? `[${repo}] ${msg}` : msg;
      }
    };

    const buildMatrix = (payload) => {
      const commits = payload?.commits || [];
      const repos = payload?.repos || [];

      if (!Array.isArray(commits) || commits.length === 0) {
        matrixContainer.innerHTML = `
          <div class="matrix-fallback-state">
            <p>Live organisation telemetry is currently unavailable from the GitHub API.</p>
            <span>Source code, models and commit logs remain public across <a href="https://github.com/datawarsaw" target="_blank" rel="noopener noreferrer">github.com/datawarsaw ↗</a></span>
          </div>
        `;
        if (practiceLedger) practiceLedger.hidden = true;
        renderInspector(null);
        return;
      }

      currentPayload = payload;

      const wrapperWidth = matrixContainer.parentElement ? matrixContainer.parentElement.clientWidth : matrixContainer.clientWidth;
      const layout = computeMatrixLayout(wrapperWidth);
      const { numWeeks, cellSize, cellGap, leftPad, topPad, svgWidth, svgHeight } = layout;
      lastRenderedWidth = wrapperWidth;

      const dailyMap = new Map();
      const recentList = [];

      commits.forEach(item => {
        const dateStr = item.date;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return;
        const iso = formatWarsawDateIso(d);

        if (!dailyMap.has(iso)) {
          dailyMap.set(iso, { count: 0, latestMsg: item.msg, latestRepo: item.repo, date: d, url: item.url, repos: new Set() });
        }
        const entry = dailyMap.get(iso);
        entry.count += 1;
        if (item.repo) entry.repos.add(item.repo);

        if (recentList.length < 5) {
          recentList.push(item);
        }
      });

      const nowParts = getWarsawDateParts(new Date());
      const tY = Number(nowParts.year);
      const tM = Number(nowParts.month);
      const tD = Number(nowParts.day);
      const todayUtc = new Date(Date.UTC(tY, tM - 1, tD));
      const dayIndex = (todayUtc.getUTCDay() + 6) % 7;

      const totalDays = numWeeks * 7;
      const startDate = new Date(Date.UTC(tY, tM - 1, tD - (totalDays - 1 - (6 - dayIndex))));

      const svg = createSvg('svg', {
        class: 'matrix-svg',
        viewBox: `0 0 ${svgWidth} ${svgHeight}`,
        width: String(svgWidth),
        role: 'grid',
        'aria-label': `Commit activity grid across DataWarsaw repositories for the last ${numWeeks} weeks`
      });

      const dayLabels = [{ text: 'Mon', row: 0 }, { text: 'Wed', row: 2 }, { text: 'Fri', row: 4 }];
      dayLabels.forEach(({ text, row }) => {
        const y = topPad + row * (cellSize + cellGap) + cellSize * 0.82;
        const textEl = createSvg('text', {
          x: leftPad - 5,
          y: y,
          class: 'matrix-day-label'
        });
        textEl.textContent = text;
        svg.appendChild(textEl);
      });

      const monthLabelDist = Math.max(30, (cellSize + cellGap) * 2.8);
      let lastMonth = -1;
      let lastMonthX = -100;
      let activeCell = null;

      for (let w = 0; w < numWeeks; w++) {
        for (let r = 0; r < 7; r++) {
          const current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + w * 7 + r));
          const iso = formatWarsawDateIso(current);
          const entry = dailyMap.get(iso);
          const count = entry ? entry.count : 0;
          const msg = entry ? entry.latestMsg : '';
          const repo = entry ? entry.latestRepo : '';
          const repoList = entry ? Array.from(entry.repos).join(', ') : '';
          const isFuture = current.getTime() > todayUtc.getTime();
          const colX = leftPad + w * (cellSize + cellGap);

          let lvl = 0;
          if (count === 1) lvl = 1;
          else if (count === 2) lvl = 2;
          else if (count >= 3) lvl = 3;

          if (r === 0) {
            const m = current.getUTCMonth();
            if (m !== lastMonth && (colX - lastMonthX >= monthLabelDist) && ((numWeeks - 1 - w) * (cellSize + cellGap) >= 22)) {
              lastMonth = m;
              lastMonthX = colX;
              const monthName = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Europe/Warsaw' }).format(current);
              const mText = createSvg('text', {
                x: colX,
                y: topPad - 5,
                class: 'matrix-month-label'
              });
              mText.textContent = monthName;
              svg.appendChild(mText);
            }
          }

          if (isFuture) continue;

          const x = leftPad + w * (cellSize + cellGap);
          const y = topPad + r * (cellSize + cellGap);
          const humanDate = formatWarsawHumanDate(current);

          const cell = createSvg('rect', {
            x,
            y,
            width: cellSize,
            height: cellSize,
            class: `matrix-cell lvl-${lvl}`,
            tabindex: '0',
            role: 'gridcell',
            'data-date': iso,
            'data-date-human': humanDate,
            'data-count': String(count),
            'data-repos': repoList,
            'data-repo': repo,
            'data-msg': msg,
            'aria-label': `${humanDate}: ${count} commit${count === 1 ? '' : 's'}${repo ? ` (${repo})` : ''}${msg ? ' - ' + msg : ''}`
          });

          cell.addEventListener('pointerenter', () => {
            if (activeCell) activeCell.classList.remove('is-active');
            cell.classList.add('is-active');
            activeCell = cell;
            renderInspector(cell);
          });
          cell.addEventListener('focus', () => {
            if (activeCell) activeCell.classList.remove('is-active');
            cell.classList.add('is-active');
            activeCell = cell;
            renderInspector(cell);
          });

          svg.appendChild(cell);
        }
      }

      matrixContainer.replaceChildren(svg);

      if (recentList.length > 0) {
        if (practiceLedger) practiceLedger.hidden = false;
        ledgerList.replaceChildren(...recentList.map(item => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'ledger-item';
          a.href = item.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';

          const repoSpan = document.createElement('span');
          repoSpan.className = 'ledger-repo';
          repoSpan.textContent = item.repo || 'repo';

          const shaSpan = document.createElement('span');
          shaSpan.className = 'ledger-sha';
          shaSpan.textContent = item.sha;

          const msgSpan = document.createElement('span');
          msgSpan.className = 'ledger-msg';
          msgSpan.textContent = item.msg;

          const dateSpan = document.createElement('span');
          dateSpan.className = 'ledger-date';
          dateSpan.textContent = formatWarsawHumanDate(new Date(item.date));

          a.append(repoSpan, shaSpan, msgSpan, dateSpan);
          li.appendChild(a);
          return li;
        }));
      } else {
        if (practiceLedger) practiceLedger.hidden = false;
        ledgerList.innerHTML = '<li class="ledger-empty">Public organisation with active development on GitHub.</li>';
      }
    };

    const loadPracticeData = async () => {
      let cachedPayload = getCached(CACHE_KEY_ACTIVITY);

      if (!cachedPayload) {
        try {
          const reposData = await fetchWithTimeout(ORG_REPOS_URL);
          if (Array.isArray(reposData) && reposData.length > 0) {
            const publicRepos = reposData.filter(r => !r.fork);
            const commitResults = await Promise.allSettled(
              publicRepos.map(repo =>
                fetchWithTimeout(`https://api.github.com/repos/datawarsaw/${repo.name}/commits?per_page=100`)
                  .then(commits => ({ repo, commits: Array.isArray(commits) ? commits : [] }))
                  .catch(() => ({ repo, commits: [] }))
              )
            );

            const allCommits = [];
            commitResults.forEach(res => {
              if (res.status === 'fulfilled' && res.value) {
                const { repo, commits } = res.value;
                commits.forEach(item => {
                  const dateStr = item.commit?.author?.date || item.commit?.committer?.date;
                  if (!dateStr) return;
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return;
                  const firstLine = (item.commit?.message || '').split('\n')[0].trim();
                  allCommits.push({
                    repo: repo.name,
                    repoUrl: repo.html_url,
                    sha: (item.sha || '').slice(0, 7),
                    msg: firstLine || 'Commit update',
                    date: d.toISOString(),
                    url: item.html_url || `${repo.html_url}/commit/${item.sha}`
                  });
                });
              }
            });

            allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const langs = [...new Set(publicRepos.map(r => r.language).filter(Boolean))];
            let latestPushIso = null;
            publicRepos.forEach(r => {
              if (r.pushed_at) {
                if (!latestPushIso || new Date(r.pushed_at).getTime() > new Date(latestPushIso).getTime()) {
                  latestPushIso = r.pushed_at;
                }
              }
            });

            cachedPayload = {
              repos: publicRepos.map(r => ({ name: r.name, url: r.html_url, language: r.language, pushed_at: r.pushed_at })),
              commits: allCommits,
              languages: langs,
              latestPush: latestPushIso || (allCommits[0] ? allCommits[0].date : null),
              repoCount: publicRepos.length
            };
            setCached(CACHE_KEY_ACTIVITY, cachedPayload);
          }
        } catch (e) {}
      }

      if (cachedPayload && Array.isArray(cachedPayload.commits) && cachedPayload.commits.length > 0) {
        statusEl.classList.remove('is-fallback');
        statusEl.classList.add('is-ready');
        statusTextEl.textContent = `Live GitHub activity · ${cachedPayload.repoCount || cachedPayload.repos?.length || '7'} public repos`;
        fallbackNote.hidden = true;
        if (practiceLedger) practiceLedger.hidden = false;

        if (scopeEl) scopeEl.textContent = 'All Public Repos';
        if (reposEl) reposEl.textContent = `${cachedPayload.repoCount || cachedPayload.repos?.length || '7'} repositories`;
        if (stackEl && cachedPayload.languages?.length) stackEl.textContent = cachedPayload.languages.slice(0, 3).join(' · ');
        if (pushedEl && cachedPayload.latestPush) {
          const pDate = new Date(cachedPayload.latestPush);
          pushedEl.textContent = !isNaN(pDate.getTime()) ? formatWarsawHumanDate(pDate) : 'Active organisation';
        }

        buildMatrix(cachedPayload);
      } else {
        statusEl.classList.remove('is-ready');
        statusEl.classList.add('is-fallback');
        statusTextEl.textContent = 'Live GitHub activity unavailable';
        fallbackNote.hidden = false;
        if (practiceLedger) practiceLedger.hidden = true;

        if (scopeEl) scopeEl.textContent = 'All Public Repos';
        if (reposEl) reposEl.textContent = '7 public repositories';
        if (stackEl) stackEl.textContent = 'JavaScript · Python';
        if (pushedEl) pushedEl.textContent = 'Public on GitHub';

        buildMatrix(null);
        renderInspector(null);
      }
    };

    let practiceResizeTimer = null;
    const handlePracticeResize = () => {
      if (!currentPayload) return;
      const wrapperWidth = matrixContainer.parentElement ? matrixContainer.parentElement.clientWidth : matrixContainer.clientWidth;
      if (Math.abs(wrapperWidth - lastRenderedWidth) >= 6) {
        buildMatrix(currentPayload);
      }
    };

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        if (practiceResizeTimer) cancelAnimationFrame(practiceResizeTimer);
        practiceResizeTimer = requestAnimationFrame(handlePracticeResize);
      });
      if (matrixContainer.parentElement) {
        ro.observe(matrixContainer.parentElement);
      } else {
        ro.observe(matrixContainer);
      }
    } else {
      window.addEventListener('resize', () => {
        if (practiceResizeTimer) window.clearTimeout(practiceResizeTimer);
        practiceResizeTimer = window.setTimeout(handlePracticeResize, 120);
      }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      const practiceObserver = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          practiceObserver.disconnect();
          loadPracticeData();
        }
      }, { rootMargin: '300px 0px' });
      practiceObserver.observe(practiceModule);
    } else {
      loadPracticeData();
    }
  }
  const pulse = document.querySelector('[data-pulse]');
  if (pulse) {
    const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&hourly=temperature_2m,precipitation_probability,wind_speed_10m&timezone=Europe%2FWarsaw&forecast_hours=24';
    const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.2297&longitude=21.0122&hourly=european_aqi&timezone=Europe%2FWarsaw&forecast_hours=24';
    const svgNS = 'http://www.w3.org/2000/svg';

    const status = pulse.querySelector('[data-pulse-status]');
    const statusText = pulse.querySelector('[data-pulse-status-text]');
    const chart = pulse.querySelector('[data-pulse-chart]');
    const svg = pulse.querySelector('[data-pulse-svg]');
    const grid = pulse.querySelector('[data-pulse-grid]');
    const yAxis = pulse.querySelector('[data-pulse-y-axis]');
    const tempArea = pulse.querySelector('[data-pulse-temp-area]');
    const tempLine = pulse.querySelector('[data-pulse-temp-line]');
    const pointsGroup = pulse.querySelector('[data-pulse-points]');
    const axis = pulse.querySelector('[data-pulse-axis]');
    const cursor = pulse.querySelector('[data-pulse-cursor]');
    const hitArea = pulse.querySelector('[data-pulse-hit]');
    const tooltip = pulse.querySelector('[data-pulse-tooltip]');
    const tooltipTime = pulse.querySelector('[data-tooltip-time]');
    const tooltipTemp = pulse.querySelector('[data-tooltip-temp]');
    const announcement = pulse.querySelector('[data-pulse-announcement]');
    const liveTime = pulse.querySelector('[data-pulse-live-time]');

    const selectedTime = pulse.querySelector('[data-pulse-selected-time]');
    const selectedTemp = pulse.querySelector('[data-pulse-selected-temp]');

    const dataOutput = pulse.querySelector('[data-pulse-data]');
    const signalOutput = pulse.querySelector('[data-pulse-signal]');
    const decisionOutput = pulse.querySelector('[data-pulse-decision]');
    const decisionDetail = pulse.querySelector('[data-pulse-decision-detail]');
    const updatedOutput = pulse.querySelector('[data-pulse-updated]');

    let pulseData = null;
    let decisionData = null;
    let activeIndex = 0;
    let entranceTimeline = null;
    let pulseLoaded = false;

    const createSvgElement = (name, attributes = {}) => {
      const element = document.createElementNS(svgNS, name);
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
      return element;
    };

    const warsawTime = (date, includeDate = false) => new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Warsaw',
      day: includeDate ? '2-digit' : undefined,
      month: includeDate ? 'short' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date).replace(',', ' ·');

    const dataTime = (date, includeDate = false) => new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      day: includeDate ? '2-digit' : undefined,
      month: includeDate ? 'short' : undefined,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date).replace(',', ' ·');

    const makeFallback = () => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
      const start = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour)));
      const times = Array.from({ length: 24 }, (_, index) => new Date(start.getTime() + index * 3600000));
      return {
        times,
        temperature: [17,17,16,16,15,15,16,18,20,22,23,24,25,25,24,23,22,21,20,19,19,18,18,17],
        rain: [18,16,14,12,10,9,8,8,10,12,14,18,24,31,38,42,36,28,22,18,16,14,12,10],
        wind: [10,9,8,8,7,8,10,12,14,16,18,19,21,22,21,20,18,16,14,13,12,11,10,9],
        aqi: [32,31,30,29,28,27,28,30,32,34,36,38,39,40,41,40,38,36,35,34,33,32,31,30]
      };
    };

    const parseApiTime = value => {
      const parsed = new Date(`${value}:00Z`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const validSeries = (hourly, key, fallbackValues) => {
      const values = Array.isArray(hourly?.[key]) ? hourly[key] : [];
      let validCount = 0;
      const normalized = fallbackValues.map((fallback, index) => {
        const rawValue = values[index];
        const value = typeof rawValue === 'number' ? rawValue : NaN;
        if (Number.isFinite(value)) {
          validCount += 1;
          return value;
        }
        return fallback;
      });
      return { values: normalized, degraded: validCount < 24 };
    };

    const assemblePulseData = (weather, air) => {
      const fallback = makeFallback();
      const apiTimes = Array.isArray(weather?.hourly?.time) && weather.hourly.time.length >= 24
        ? weather.hourly.time.slice(0, 24).map(parseApiTime)
        : [];
      const times = apiTimes.length === 24 && apiTimes.every(Boolean) ? apiTimes : fallback.times;
      const temperature = validSeries(weather?.hourly, 'temperature_2m', fallback.temperature);
      const rain = validSeries(weather?.hourly, 'precipitation_probability', fallback.rain);
      const wind = validSeries(weather?.hourly, 'wind_speed_10m', fallback.wind);
      const airTimes = Array.isArray(air?.hourly?.time) ? air.hourly.time : [];
      const airValues = Array.isArray(air?.hourly?.european_aqi) ? air.hourly.european_aqi : [];
      const airByHour = new Map(airTimes.map((time, index) => [time, airValues[index]]));
      let aqiValid = 0;
      const aqiValues = times.map((time, index) => {
        const key = `${time.getUTCFullYear()}-${String(time.getUTCMonth() + 1).padStart(2, '0')}-${String(time.getUTCDate()).padStart(2, '0')}T${String(time.getUTCHours()).padStart(2, '0')}:00`;
        const rawValue = airTimes.length ? airByHour.get(key) : airValues[index];
        const value = typeof rawValue === 'number' ? rawValue : NaN;
        if (Number.isFinite(value)) {
          aqiValid += 1;
          return value;
        }
        return fallback.aqi[index];
      });
      const degraded = [];
      if (temperature.degraded) degraded.push('temperature');
      if (rain.degraded) degraded.push('rain');
      if (wind.degraded) degraded.push('wind');
      if (aqiValid < 24) degraded.push('air quality');
      return {
        times,
        temperature: temperature.values,
        rain: rain.values,
        wind: wind.values,
        aqi: aqiValues,
        degraded
      };
    };

    const fetchJson = async (url, signal) => {
      const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
      const json = await response.json();
      if (!json || json.error) throw new Error(json?.reason || 'Invalid Open-Meteo response');
      return json;
    };

    const fetchPulseData = async () => {
      const testMode = localTestMode;
      if (testMode === 'slow') await new Promise(resolve => window.setTimeout(resolve, 2600));
      if (testMode === 'failure') return assemblePulseData(null, null);
      if (testMode === 'malformed') return assemblePulseData({ hourly: { time: ['invalid'], temperature_2m: [null] } }, { hourly: { time: [], european_aqi: ['bad'] } });
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 7000);
      try {
        const [weatherResult, airResult] = await Promise.allSettled([
          fetchJson(WEATHER_URL, controller.signal),
          fetchJson(AIR_URL, controller.signal)
        ]);
        return assemblePulseData(
          weatherResult.status === 'fulfilled' ? weatherResult.value : null,
          airResult.status === 'fulfilled' ? airResult.value : null
        );
      } finally {
        window.clearTimeout(timeout);
      }
    };

    const computeDecision = data => {
      const candidates = Array.from({ length: 22 }, (_, index) => {
        const rain = Math.max(...data.rain.slice(index, index + 3));
        const wind = Math.max(...data.wind.slice(index, index + 3));
        const aqi = Math.max(...data.aqi.slice(index, index + 3));
        const temperature = data.temperature.slice(index, index + 3).reduce((sum, value) => sum + value, 0) / 3;
        const excess = {
          rain: Math.max(0, rain - 35) / 65,
          aqi: Math.max(0, aqi - 60) / 60,
          wind: Math.max(0, wind - 30) / 40
        };
        return { index, rain, wind, aqi, temperature, excess, penalty: excess.rain + excess.aqi + excess.wind };
      });
      const daytimeWindows = candidates.filter(window => {
        const startHour = data.times[window.index].getUTCHours();
        return startHour >= 6 && startHour <= 19;
      });
      const windows = (daytimeWindows.length ? daytimeWindows : candidates)
        .sort((a, b) => a.penalty - b.penalty || a.rain - b.rain || a.aqi - b.aqi || a.wind - b.wind || a.index - b.index);
      const best = windows[0];
      const startHour = data.times[best.index].getUTCHours();
      const endHour = (startHour + 3) % 24;
      const range = `${String(startHour).padStart(2, '0')}:00–${String(endHour).padStart(2, '0')}:00`;
      const clear = best.penalty === 0;
      const barrier = Object.entries(best.excess).sort((a, b) => b[1] - a[1])[0][0];
      const barrierCopy = {
        rain: 'Rain is the limiting factor; maintain an indoor alternative.',
        aqi: 'Air quality is the limiting factor; prefer a shorter window.',
        wind: 'Wind is the limiting factor; select a sheltered route.'
      };
      return {
        index: best.index,
        startIndex: best.index,
        endIndex: best.index + 2,
        range,
        data: `Rain ≤${Math.round(best.rain)}% · AQI ≤${Math.round(best.aqi)} · Wind ≤${Math.round(best.wind)} km/h`,
        signal: clear ? 'Clear 3-Hour Signal' : `${barrier === 'aqi' ? 'Air Quality' : barrier.charAt(0).toUpperCase() + barrier.slice(1)} Friction`,
        decision: clear ? `Head outside ${range}.` : `Use ${range}; keep a backup.`,
        detail: clear ? `Lowest-friction three-hour window clearing all stated thresholds. Mean temperature ${best.temperature.toFixed(0)}°C.` : `${barrierCopy[barrier]} Mean temperature ${best.temperature.toFixed(0)}°C.`
      };
    };

    const getChartDimensions = () => {
      const width = Math.max(300, chart.clientWidth || 800);
      const isMobile = width < 600;
      const height = isMobile ? 230 : 260;
      const margin = {
        top: 24,
        right: isMobile ? 16 : 24,
        bottom: 32,
        left: isMobile ? 40 : 48
      };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      return { width, height, isMobile, margin, plotWidth, plotHeight };
    };

    const getTempDomain = temps => {
      const rawMin = Math.min(...temps);
      const rawMax = Math.max(...temps);
      const span = rawMax - rawMin;
      const paddedSpan = Math.max(7, span + 3);
      const mid = (rawMax + rawMin) / 2;
      let domainMin = Math.floor(mid - paddedSpan / 2);
      let domainMax = Math.ceil(mid + paddedSpan / 2);
      let domainDiff = domainMax - domainMin;
      while (domainDiff % 3 !== 0 || domainDiff < 6) {
        domainMax += 1;
        domainDiff = domainMax - domainMin;
      }
      const step = domainDiff / 3;
      const yTicks = [domainMin, domainMin + step, domainMin + 2 * step, domainMax];
      return { domainMin, domainMax, domainDiff, yTicks };
    };

    const renderActivePoint = (index, announce = false) => {
      if (!pulseData) return;
      activeIndex = Math.max(0, Math.min(23, index));
      const time = pulseData.times[activeIndex];
      const temp = pulseData.temperature[activeIndex];

      const { width, height, margin, plotWidth, plotHeight } = getChartDimensions();
      const { domainMin, domainDiff } = getTempDomain(pulseData.temperature);

      const x = margin.left + (activeIndex / 23) * plotWidth;
      const y = margin.top + (1 - (temp - domainMin) / domainDiff) * plotHeight;

      if (cursor) {
        cursor.setAttribute('x1', x);
        cursor.setAttribute('x2', x);
        cursor.setAttribute('y1', margin.top);
        cursor.setAttribute('y2', height - margin.bottom);
        cursor.classList.add('is-active');
      }

      pulse.querySelectorAll('.pulse-points circle').forEach((item, i) => {
        const isActive = i === activeIndex;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('r', isActive ? '5.5' : '3.5');
      });

      const timeText = dataTime(time, true);
      if (liveTime) liveTime.textContent = `${timeText} · Warsaw local time`;
      if (selectedTime) selectedTime.textContent = dataTime(time);
      if (selectedTemp) selectedTemp.textContent = `${temp.toFixed(1)}°C`;

      if (tooltipTime) tooltipTime.textContent = timeText;
      if (tooltipTemp) tooltipTemp.textContent = `${temp.toFixed(1)}°C`;

      if (tooltip) {
        const tooltipLeft = (x / width) * svg.clientWidth;
        const tooltipTop = (y / height) * svg.clientHeight;
        const halfTip = (tooltip.offsetWidth || 110) / 2;
        const clampedX = Math.max(halfTip + 8, Math.min(chart.clientWidth - halfTip - 8, tooltipLeft));
        tooltip.style.left = `${clampedX}px`;
        tooltip.style.top = `${Math.max(28, tooltipTop)}px`;
        tooltip.classList.add('is-active');
      }

      if (announce && announcement) {
        announcement.textContent = `${timeText}: Temperature ${temp.toFixed(1)}°C`;
      }
    };

    const renderTimeline = (animate = false) => {
      if (!pulseData) return;
      const times = pulseData.times;
      const temps = pulseData.temperature;

      const { width, height, isMobile, margin, plotWidth, plotHeight } = getChartDimensions();
      const { domainMin, domainDiff, yTicks } = getTempDomain(temps);

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.style.height = `${height}px`;

      const xFor = index => margin.left + (index / 23) * plotWidth;
      const yFor = temp => margin.top + (1 - (temp - domainMin) / domainDiff) * plotHeight;

      const tempCoords = temps.map((t, i) => [xFor(i), yFor(t)]);
      const tempPath = tempCoords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
      tempLine.setAttribute('d', tempPath);

      const bottomY = height - margin.bottom;
      const areaPath = `${tempPath} L${xFor(23).toFixed(2)},${bottomY.toFixed(2)} L${xFor(0).toFixed(2)},${bottomY.toFixed(2)} Z`;
      tempArea.setAttribute('d', areaPath);

      grid.replaceChildren();
      if (yAxis) yAxis.replaceChildren();
      yTicks.forEach(tVal => {
        const y = yFor(tVal);
        grid.append(createSvgElement('line', {
          x1: margin.left,
          x2: width - margin.right,
          y1: y,
          y2: y
        }));
        if (yAxis) {
          const yText = createSvgElement('text', {
            x: margin.left - 8,
            y: y,
            'text-anchor': 'end',
            'dominant-baseline': 'central',
            class: 'pulse-y-label'
          });
          yText.textContent = `${tVal}°C`;
          yAxis.append(yText);
        }
      });

      const tickIndexes = isMobile ? [0, 6, 12, 18, 23] : [0, 3, 6, 9, 12, 15, 18, 21, 23];
      axis.replaceChildren(...tickIndexes.map(index => {
        const x = xFor(index);
        const text = createSvgElement('text', {
          x,
          y: height - margin.bottom + 18,
          'text-anchor': index === 0 ? 'start' : index === 23 ? 'end' : 'middle'
        });
        text.textContent = dataTime(pulseData.times[index]);
        return text;
      }));

      pointsGroup.replaceChildren(...tempCoords.map(([x, y], index) => createSvgElement('circle', {
        cx: x,
        cy: y,
        r: index === activeIndex ? 5.5 : 3.5,
        class: index === activeIndex ? 'is-active' : '',
        'data-pulse-index': index
      })));

      hitArea.setAttribute('x', margin.left);
      hitArea.setAttribute('y', margin.top);
      hitArea.setAttribute('width', plotWidth);
      hitArea.setAttribute('height', plotHeight);

      renderActivePoint(activeIndex);

      if (animate && motionAllowed()) {
        const length = tempLine.getTotalLength();
        window.gsap.killTweensOf([tempLine, tempArea, ...pointsGroup.children]);
        window.gsap.fromTo(tempLine, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: .65, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' });
        window.gsap.fromTo(tempArea, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5, clearProps: 'opacity' });
        window.gsap.fromTo(pointsGroup.children, { autoAlpha: 0, scale: .4, transformOrigin: 'center' }, { autoAlpha: 1, scale: 1, duration: .3, stagger: .012, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
      }
    };

    const animatePulseEntrance = () => {
      if (!motionAllowed()) return;
      const gridLines = [...grid.querySelectorAll('line')];
      const yLabels = yAxis ? [...yAxis.querySelectorAll('text')] : [];
      const xLabels = [...axis.querySelectorAll('text')];
      const points = [...pointsGroup.children];
      const stages = [...pulse.querySelectorAll('[data-pulse-stage]')];
      const length = tempLine.getTotalLength();

      window.gsap.set(gridLines, { scaleX: 0, transformOrigin: 'left center' });
      window.gsap.set([...yLabels, ...xLabels], { autoAlpha: 0 });
      window.gsap.set(points, { autoAlpha: 0, scale: 0, transformOrigin: 'center' });
      window.gsap.set(tempLine, { strokeDasharray: length, strokeDashoffset: length });
      window.gsap.set(tempArea, { autoAlpha: 0 });
      window.gsap.set(stages, { autoAlpha: 0, y: 12 });

      entranceTimeline = window.gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onStart: () => pulse.classList.add('is-animated') });
      entranceTimeline
        .to(gridLines, { scaleX: 1, duration: .45, stagger: .02, clearProps: 'transform' }, 0)
        .to([...yLabels, ...xLabels], { autoAlpha: 1, duration: .35, stagger: .015, clearProps: 'opacity,visibility' }, .1)
        .to(tempLine, { strokeDashoffset: 0, duration: .85, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, .15)
        .to(tempArea, { autoAlpha: 1, duration: .45, clearProps: 'opacity' }, .5)
        .to(points, { autoAlpha: 1, scale: 1, duration: .3, stagger: .012, clearProps: 'transform,opacity,visibility' }, .55)
        .to(stages, { autoAlpha: 1, y: 0, duration: .45, stagger: .1, clearProps: 'transform,opacity,visibility' }, .6)
        .fromTo(pulse.querySelector('.pulse-decision'), { boxShadow: 'inset 0 0 0 0 rgba(11,21,20,0)' }, { boxShadow: 'inset 0 0 0 6px rgba(11,21,20,.13)', duration: .36, yoyo: true, repeat: 1, clearProps: 'boxShadow' }, 1.0);

      window.ScrollTrigger.create({
        id: 'datawarsaw-pulse-narrative',
        trigger: pulse,
        start: 'top 72%',
        once: true,
        onEnter: () => entranceTimeline?.play()
      });
      window.ScrollTrigger.refresh();
    };

    const pointFromPointer = event => {
      const rect = svg.getBoundingClientRect();
      const { width, margin, plotWidth } = getChartDimensions();
      const svgX = ((event.clientX - rect.left) / rect.width) * width;
      const ratio = (svgX - margin.left) / plotWidth;
      return Math.round(Math.max(0, Math.min(23, ratio * 23)));
    };

    hitArea.addEventListener('pointermove', event => renderActivePoint(pointFromPointer(event)));
    hitArea.addEventListener('pointerdown', event => renderActivePoint(pointFromPointer(event), true));

    chart.addEventListener('keydown', event => {
      let nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = activeIndex + 1;
      if (event.key === 'ArrowLeft') nextIndex = activeIndex - 1;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = 23;
      if (nextIndex !== null) {
        event.preventDefault();
        renderActivePoint(nextIndex, true);
      }
    });

    chart.addEventListener('blur', () => {
      tooltip.classList.remove('is-active');
      cursor.classList.remove('is-active');
    });

    const loadPulse = async () => {
      if (pulseLoaded) return;
      pulseLoaded = true;
      try {
        pulseData = await fetchPulseData();
        decisionData = computeDecision(pulseData);

        dataOutput.textContent = decisionData.data;
        signalOutput.textContent = decisionData.signal;
        decisionOutput.textContent = decisionData.decision;
        decisionDetail.textContent = decisionData.detail;
        updatedOutput.textContent = pulseData.degraded.length === 4
          ? 'Illustrative fallback · not live conditions'
          : `Updated ${warsawTime(new Date(), true)} · Warsaw local time`;

        status.classList.toggle('is-fallback', pulseData.degraded.length > 0);
        status.classList.toggle('is-ready', pulseData.degraded.length === 0);
        statusText.textContent = pulseData.degraded.length
          ? `Fallback used for ${pulseData.degraded.join(', ')}`
          : 'Live forecast · next 24 hours';

        activeIndex = decisionData.index;
        renderTimeline();
        animatePulseEntrance();
      } catch (error) {
        pulseData = assemblePulseData(null, null);
        decisionData = computeDecision(pulseData);

        dataOutput.textContent = decisionData.data;
        signalOutput.textContent = decisionData.signal;
        decisionOutput.textContent = decisionData.decision;
        decisionDetail.textContent = decisionData.detail;

        status.classList.add('is-fallback');
        statusText.textContent = 'Fallback dataset · live source unavailable';
        updatedOutput.textContent = 'Illustrative fallback · not live conditions';

        activeIndex = decisionData.index;
        renderTimeline();
        animatePulseEntrance();
      }
    };

    if ('IntersectionObserver' in window) {
      const pulseObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          pulseObserver.disconnect();
          loadPulse();
        }
      }, { rootMargin: '300px 0px' });
      pulseObserver.observe(pulse);
    } else {
      loadPulse();
    }

    const handlePulseMotionPreference = () => {
      if (!reduceMotionQuery.matches || !pulseData) return;
      window.ScrollTrigger?.getById('datawarsaw-pulse-narrative')?.kill();
      entranceTimeline?.kill();
      window.gsap?.set([
        ...grid.querySelectorAll('line'),
        ...(yAxis ? yAxis.querySelectorAll('text') : []),
        ...axis.querySelectorAll('text'),
        ...pointsGroup.children,
        tempLine,
        tempArea,
        ...pulse.querySelectorAll('[data-pulse-stage]')
      ], { autoAlpha: 1, scale: 1, y: 0, clearProps: 'transform,opacity,visibility,strokeDasharray,strokeDashoffset' });
    };

    reduceMotionQuery.addEventListener('change', handlePulseMotionPreference);
    window.addEventListener('resize', () => {
      if (pulseData) renderTimeline();
    }, { passive: true });
    window.addEventListener('pagehide', () => {
      entranceTimeline?.kill();
      window.ScrollTrigger?.getById('datawarsaw-pulse-narrative')?.kill();
      reduceMotionQuery.removeEventListener('change', handlePulseMotionPreference);
    }, { once: true });
  }

/* 06 AI Workstation - Agent Run Viewer */
  const agentViewer = document.querySelector('[data-agent-viewer]');
  if (agentViewer) {
    const runTabsContainer = agentViewer.querySelector('[data-run-tabs]');
    const runStatusPill = agentViewer.querySelector('[data-run-status-pill]');
    const runStatusText = agentViewer.querySelector('[data-run-status-text]');
    const metaTask = agentViewer.querySelector('[data-meta-task]');
    const metaPattern = agentViewer.querySelector('[data-meta-pattern]');
    const metaDuration = agentViewer.querySelector('[data-meta-duration]');
    const metaHarness = agentViewer.querySelector('[data-meta-harness]');
    const flowContainer = agentViewer.querySelector('[data-harness-flow]');

    const inspectorRole = agentViewer.querySelector('[data-inspector-role]');
    const inspectorModel = agentViewer.querySelector('[data-inspector-model]');
    const inspectorDuration = agentViewer.querySelector('[data-inspector-duration]');
    const inspectorStatus = agentViewer.querySelector('[data-inspector-status]');
    const inspectorTitle = agentViewer.querySelector('[data-inspector-title]');
    const inspectorSummary = agentViewer.querySelector('[data-inspector-summary]');
    const inspectorInput = agentViewer.querySelector('[data-inspector-input]');
    const inspectorOutput = agentViewer.querySelector('[data-inspector-output]');
    const inspectorArtifactsBlock = agentViewer.querySelector('[data-inspector-artifacts-block]');
    const inspectorArtifactsLabel = agentViewer.querySelector('[data-inspector-artifacts-label]');
    const inspectorArtifacts = agentViewer.querySelector('[data-inspector-artifacts]');

    let runsData = null;
    let currentRunIndex = 0;
    let selectedNodeElement = null;
    let allInteractiveNodes = [];

    const fallbackRuns = [
      {
        id: "RUN-20260819-01",
        taskId: "DW-042",
        title: "Build Agent Run Viewer Component",
        type: "diagnostic",
        typeName: "Diagnostic (2 Scouts → JOIN → Worker)",
        isSample: true,
        status: "COMPLETE",
        statusLabel: "Verified & Merged",
        harness: "Antigravity V1.1",
        startedAt: "2026-08-19T14:32:00Z",
        totalDuration: "3m 42s",
        branch: "agent-harness-v1",
        summary: "Observability component visualizing Antigravity multi-agent orchestration flows from task dispatch through parallel discovery, join synthesis, scoped worker implementation, and deterministic verification.",
        steps: [
          {
            id: "step-1",
            type: "coordinator",
            role: "Coordinator",
            model: "Antigravity Orchestrator",
            name: "Task Deconstruction & Dispatch",
            duration: "18s",
            status: "COMPLETE",
            summary: "Evaluated task complexity (Diagnostic), framed orthogonal discovery questions, and dispatched concurrent read-only Scouts.",
            input: "User goal: Agent Run Viewer for DataWarsaw website.\nConstraints: Vanilla HTML/CSS/JS, no heavy libraries, explicit DEMO badge, responsive 375px–1440px.",
            output: "Spawning Scout A (Runtime/Data) and Scout B (UX/Info Design) with bounded context contracts.",
            artifacts: ["agents/coordinator.md", "state/project-state.md"]
          },
          {
            id: "step-2",
            type: "parallel",
            name: "Parallel Discovery Swarm",
            agents: [
              {
                id: "scout-a",
                role: "Scout A",
                name: "Runtime & Telemetry Investigation",
                model: "gemini-3.7-flash-high",
                duration: "45s",
                status: "COMPLETE",
                summary: "Audited repository state and runtime artifacts. Determined persistent telemetry is not yet checked in; recommended minimal JSON schema with explicit DEMO label.",
                input: "Inspect state/, agents/, .agents/, docs/, evals/ for truthful runtime data.",
                output: "Proposed minimal extensible JSON schema. Mandated DEMO RUN flag to avoid fabricating historical telemetry.",
                artifacts: ["state/task.example.json", "state/progress.example.json", "docs/agent-harness-v1.md"]
              },
              {
                id: "scout-b",
                role: "Scout B",
                name: "Information Architecture & UX Design",
                model: "gemini-3.7-flash-high",
                duration: "41s",
                status: "COMPLETE",
                summary: "Designed visual hierarchy matching Warsaw Analytica dark graphite/acid-lime aesthetic. Recommended Section 06 placement with responsive horizontal-to-vertical branch flow.",
                input: "Inspect site/ structure, visual tokens, responsive rules, and layout constraints.",
                output: "Proposed execution trace hierarchy: Header → Coordinator → Parallel Branches → JOIN → Worker → Verification → Inspector.",
                artifacts: ["site/index.html", "site/styles.css", "docs/design-system.md"]
              }
            ]
          },
          {
            id: "step-3",
            type: "join",
            role: "Coordinator JOIN",
            model: "Antigravity Orchestrator",
            name: "Synthesis & Implementation Contract",
            duration: "22s",
            status: "COMPLETE",
            summary: "Joined Scout findings, confirmed zero contradictions, and formulated single consolidated implementation brief for Worker.",
            input: "Scout A schema recommendation + Scout B UX layout specifications.",
            output: "Consolidated implementation brief with file scope: site/data/agent-runs.json, site/index.html, site/styles.css, site/script.js.",
            artifacts: ["docs/agent-harness-v1.md (Join Policy)"]
          },
          {
            id: "step-4",
            type: "worker",
            role: "Worker",
            model: "claude-sonnet-4-6",
            name: "Component Implementation & Rendering",
            duration: "1m 48s",
            status: "COMPLETE",
            summary: "Constructed Agent Run Viewer component, dynamic run switcher, interactive node inspector, responsive SVG branch connectors, and keyboard controls.",
            input: "Joined implementation brief from Coordinator.",
            output: "Implemented component with zero external visualization frameworks; pure semantic HTML5, CSS Grid/Flexbox, and vanilla JavaScript.",
            filesChanged: [
              "site/data/agent-runs.json",
              "site/index.html",
              "site/styles.css",
              "site/script.js"
            ]
          },
          {
            id: "step-5",
            type: "verification",
            role: "Verification",
            model: "Deterministic Test Suite",
            name: "QA & Responsive Evaluation",
            duration: "28s",
            status: "PASS",
            summary: "Verified zero horizontal overflow across 375px, 390px, 430px, 768px, 1024px, 1440px; verified zero console errors, keyboard focus, and reduced-motion states.",
            input: "Test suite: test-datawarsaw-web & visual regression checklist.",
            output: "All 4 viewports passed (scrollWidth === innerWidth). Reduced-motion transitions validated. Contrast ratios compliant.",
            checks: [
              "Viewport 375x667: PASS (scrollWidth === 375)",
              "Viewport 390x844: PASS (scrollWidth === 390)",
              "Viewport 430x932: PASS (scrollWidth === 430)",
              "Viewport 1440x900: PASS (Desktop baseline)",
              "Console errors: 0",
              "prefers-reduced-motion: Verified"
            ]
          }
        ]
      },
      {
        id: "RUN-20260818-02",
        taskId: "DW-039",
        title: "Simplify Warsaw Weather Chart",
        type: "simple",
        typeName: "Simple (Coordinator → Worker Direct)",
        isSample: true,
        status: "COMPLETE",
        statusLabel: "Verified & Merged",
        harness: "Antigravity V1.0",
        startedAt: "2026-08-18T18:15:00Z",
        totalDuration: "1m 34s",
        branch: "agent-harness-v1",
        summary: "Streamlined 24-hour temperature chart by removing visual clutter while preserving comprehensive Open-Meteo multi-factor recommendation engine.",
        steps: [
          {
            id: "step-s1",
            type: "coordinator",
            role: "Coordinator",
            model: "Antigravity Orchestrator",
            name: "Direct Task Routing",
            duration: "12s",
            status: "COMPLETE",
            summary: "Classified task as Simple Refinement. Affected files and goal known; skipped Scout swarm to minimize overhead.",
            input: "User goal: Simplify weather chart to temperature-only visualization while retaining multi-signal decision logic.",
            output: "Direct delegation to Worker with strict scope isolation.",
            artifacts: ["state/project-state.md"]
          },
          {
            id: "step-s2",
            type: "worker",
            role: "Worker",
            model: "gemini-3.7-flash-high",
            name: "Chart Refactoring",
            duration: "58s",
            status: "COMPLETE",
            summary: "Refactored SVG rendering to clean single-axis temperature curve with smooth area fill and dynamic mobile tick density.",
            input: "Direct task contract from Coordinator.",
            output: "Cleaned up SVG layout, responsive dynamic ticks (3-4 mobile, 6 desktop).",
            filesChanged: [
              "site/script.js",
              "site/styles.css"
            ]
          },
          {
            id: "step-s3",
            type: "verification",
            role: "Verification",
            model: "Deterministic Test Suite",
            name: "Chart & Data Validation",
            duration: "24s",
            status: "PASS",
            summary: "Tested API fallback, keyboard navigation across timeline hours, and zero layout shift on mobile viewports.",
            input: "Test suite: test-datawarsaw-web & Open-Meteo mock responses.",
            output: "All checks passed cleanly.",
            checks: [
              "Mobile tick density: PASS (4 ticks at 375px)",
              "Keyboard left/right scrub: PASS",
              "Fallback data simulation: PASS"
            ]
          }
        ]
      },
      {
        id: "RUN-20260818-03",
        taskId: "DW-041",
        title: "Fix Polish Diacritics UTF-8 Encoding",
        type: "bounded-retry",
        typeName: "Diagnostic with Bounded Retry (Budget: 2)",
        isSample: true,
        status: "COMPLETE",
        statusLabel: "Resolved on Attempt 1",
        harness: "Antigravity V1.1",
        startedAt: "2026-08-18T21:40:00Z",
        totalDuration: "2m 15s",
        branch: "agent-harness-v1",
        summary: "Resolved corrupted UTF-8 string encoding in Warsaw weather outdoor recommendation strings across Polish diacritical characters.",
        steps: [
          {
            id: "step-r1",
            type: "coordinator",
            role: "Coordinator",
            model: "Antigravity Orchestrator",
            name: "Diagnosis Dispatch",
            duration: "14s",
            status: "COMPLETE",
            summary: "Identified garbled characters in dynamic weather output; dispatched Scout to isolate string literals and file encoding.",
            input: "Issue: Polish diacritics rendered as mojibake in recommendation banner.",
            output: "Scout contract: Inspect string declarations in site/script.js and verify BOM/UTF-8 encoding.",
            artifacts: ["site/script.js"]
          },
          {
            id: "step-r2",
            type: "worker",
            role: "Worker",
            model: "gemini-3.7-flash-high",
            name: "Encoding Correction & String Normalization",
            duration: "48s",
            status: "COMPLETE",
            summary: "Replaced corrupted character sequences with clean UTF-8 literals and validated file save encoding.",
            input: "Scout findings and string correction list.",
            output: "Clean UTF-8 Polish recommendation strings.",
            filesChanged: [
              "site/script.js"
            ]
          },
          {
            id: "step-r3",
            type: "verification",
            role: "Verification",
            model: "Deterministic Test Suite",
            name: "Character Set & Display QA",
            duration: "22s",
            status: "PASS",
            summary: "Simulated all 12 weather conditions and verified proper glyph rendering in browser DOM.",
            input: "Test script: string regex & DOM rendering checks.",
            output: "Zero mojibake detected across all conditions.",
            checks: [
              "Character validation: 100% valid UTF-8",
              "Screen reader announcement: PASS"
            ]
          }
        ]
      }
    ];

    const updateInspector = nodeData => {
      if (!nodeData) return;
      if (inspectorRole) inspectorRole.textContent = nodeData.role || 'AGENT';
      if (inspectorModel) inspectorModel.textContent = nodeData.model || 'Standard';
      if (inspectorDuration) inspectorDuration.textContent = nodeData.duration || '—';
      if (inspectorStatus) {
        inspectorStatus.textContent = nodeData.status || 'COMPLETE';
        inspectorStatus.className = 'inspector-status-pill ' + (nodeData.status === 'PASS' || nodeData.status === 'COMPLETE' ? 'is-pass' : '');
      }
      if (inspectorTitle) inspectorTitle.textContent = nodeData.name || 'Step Details';
      if (inspectorSummary) inspectorSummary.textContent = nodeData.summary || '';
      if (inspectorInput) inspectorInput.textContent = nodeData.input || '—';
      if (inspectorOutput) inspectorOutput.textContent = nodeData.output || '—';

      if (inspectorArtifacts && inspectorArtifactsBlock) {
        inspectorArtifacts.innerHTML = '';
        const items = nodeData.filesChanged || nodeData.artifacts || nodeData.checks || [];
        if (inspectorArtifactsLabel) {
          inspectorArtifactsLabel.textContent = nodeData.filesChanged
            ? 'Files Changed / Mutated'
            : nodeData.checks
              ? 'Verification Checks'
              : 'Artifacts & Context Contracts';
        }
        if (items.length === 0) {
          const emptyLi = document.createElement('li');
          emptyLi.className = 'artifact-empty';
          emptyLi.textContent = 'None';
          inspectorArtifacts.appendChild(emptyLi);
        } else {
          items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            inspectorArtifacts.appendChild(li);
          });
        }
      }

      animateDataState(agentViewer.querySelectorAll('.harness-inspector > *'), { y: 4, stagger: 0.025, duration: 0.28 });
    };

    const createNodeButton = (step, customClass = '') => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flow-node ' + customClass;
      btn.setAttribute('data-node-id', step.id || '');
      btn.setAttribute('aria-label', (step.role || 'Step') + ': ' + (step.name || ''));

      const head = document.createElement('div');
      head.className = 'node-head';
      head.innerHTML = '<span class="node-role">' + (step.role || '') + '</span><span class="node-duration">' + (step.duration || '') + '</span>';

      const title = document.createElement('h4');
      title.className = 'node-title';
      title.textContent = step.name || '';

      const meta = document.createElement('div');
      meta.className = 'node-meta';
      meta.innerHTML = '<span class="node-model">' + (step.model || '') + '</span><span class="node-status ' + (step.status === 'PASS' || step.status === 'COMPLETE' ? 'is-complete' : '') + '">' + (step.status || '') + '</span>';

      btn.appendChild(head);
      btn.appendChild(title);
      btn.appendChild(meta);

      btn._stepData = step;
      return btn;
    };

    const createConnector = () => {
      const conn = document.createElement('div');
      conn.className = 'flow-connector';
      conn.setAttribute('aria-hidden', 'true');
      return conn;
    };

    const renderRun = run => {
      if (!run) return;

      if (metaTask) metaTask.textContent = run.taskId || '—';
      if (metaPattern) metaPattern.textContent = run.typeName || run.type || '—';
      if (metaDuration) metaDuration.textContent = run.totalDuration || '—';
      if (metaHarness) metaHarness.textContent = run.harness || 'Antigravity V1';
      if (runStatusText) runStatusText.textContent = run.status || 'COMPLETE';

      flowContainer.innerHTML = '';
      allInteractiveNodes = [];

      run.steps.forEach((step, stepIndex) => {
        if (step.type === 'parallel') {
          if (stepIndex > 0) {
            flowContainer.appendChild(createConnector());
          }

          const parallelStage = document.createElement('div');
          parallelStage.className = 'flow-parallel-stage';

          const topSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          topSvg.setAttribute('class', 'branch-connector-svg');
          topSvg.setAttribute('viewBox', '0 0 560 28');
          topSvg.setAttribute('aria-hidden', 'true');
          topSvg.innerHTML = '<path d="M280,0 C280,14 135,14 135,24 M280,0 C280,14 425,14 425,24" /><polygon points="131,23 139,23 135,28" fill="rgba(247,246,241,.35)" /><polygon points="421,23 429,23 425,28" fill="rgba(247,246,241,.35)" />';
          parallelStage.appendChild(topSvg);

          const parallelRow = document.createElement('div');
          parallelRow.className = 'flow-parallel-row';

          step.agents.forEach(agent => {
            const agentBtn = createNodeButton(agent, 'is-scout');
            parallelRow.appendChild(agentBtn);
            allInteractiveNodes.push(agentBtn);
          });
          parallelStage.appendChild(parallelRow);

          const bottomSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          bottomSvg.setAttribute('class', 'branch-connector-svg');
          bottomSvg.setAttribute('viewBox', '0 0 560 28');
          bottomSvg.setAttribute('aria-hidden', 'true');
          bottomSvg.innerHTML = '<path d="M135,0 C135,14 280,14 280,24 M425,0 C425,14 280,14 280,24" /><polygon points="276,23 284,23 280,28" fill="rgba(247,246,241,.35)" />';
          parallelStage.appendChild(bottomSvg);

          flowContainer.appendChild(parallelStage);
        } else {
          if (stepIndex > 0) {
            flowContainer.appendChild(createConnector());
          }

          let customClass = '';
          if (step.type === 'coordinator') customClass = 'is-coordinator';
          else if (step.type === 'join') customClass = 'is-join';
          else if (step.type === 'worker') customClass = 'is-worker';
          else if (step.type === 'verification') customClass = 'is-verification';

          const nodeBtn = createNodeButton(step, customClass);
          flowContainer.appendChild(nodeBtn);
          allInteractiveNodes.push(nodeBtn);
        }
      });

      const selectNode = (btn, preview = false) => {
        if (!btn) return;
        if (!preview) {
          selectedNodeElement = btn;
          allInteractiveNodes.forEach(b => {
            const isSel = b === btn;
            b.classList.toggle('is-selected', isSel);
            b.setAttribute('aria-pressed', String(isSel));
          });
        }
        updateInspector(btn._stepData);
      };

      allInteractiveNodes.forEach((btn, index) => {
        btn.addEventListener('pointerenter', () => updateInspector(btn._stepData));
        btn.addEventListener('pointerleave', () => {
          if (selectedNodeElement) updateInspector(selectedNodeElement._stepData);
        });
        btn.addEventListener('focus', () => updateInspector(btn._stepData));
        btn.addEventListener('blur', () => {
          if (selectedNodeElement) updateInspector(selectedNodeElement._stepData);
        });
        btn.addEventListener('click', () => selectNode(btn, false));
        btn.addEventListener('keydown', e => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = allInteractiveNodes[(index + 1) % allInteractiveNodes.length];
            next.focus();
            selectNode(next, false);
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = allInteractiveNodes[(index - 1 + allInteractiveNodes.length) % allInteractiveNodes.length];
            prev.focus();
            selectNode(prev, false);
          }
        });
      });

      if (allInteractiveNodes.length > 0) {
        selectNode(allInteractiveNodes[0], false);
      }
    };

    const setupTabs = runs => {
      runTabsContainer.innerHTML = '';
      runs.forEach((run, idx) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.role = 'tab';
        tab.className = 'harness-tab' + (idx === currentRunIndex ? ' is-active' : '');
        tab.setAttribute('aria-selected', String(idx === currentRunIndex));
        tab.textContent = 'Trace #' + (idx + 1) + ' · ' + (run.taskId || 'Run') + ' (' + (run.type === 'diagnostic' ? 'Diagnostic' : run.type === 'simple' ? 'Simple' : 'Bounded Retry') + ')';
        tab.addEventListener('click', () => {
          if (currentRunIndex === idx) return;
          currentRunIndex = idx;
          runTabsContainer.querySelectorAll('.harness-tab').forEach((t, i) => {
            const active = i === currentRunIndex;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', String(active));
          });
          renderRun(runs[currentRunIndex]);
          animateDataState(agentViewer.querySelectorAll('.harness-graph-stage, .harness-inspector'), { y: 6, duration: 0.35 });
        });
        runTabsContainer.appendChild(tab);
      });
    };

    const initViewer = () => {
      fetch('data/agent-runs.json')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch agent-runs.json: ' + res.status);
          return res.json();
        })
        .then(data => {
          runsData = data.runs && data.runs.length ? data.runs : fallbackRuns;
          setupTabs(runsData);
          renderRun(runsData[currentRunIndex]);
        })
        .catch(() => {
          runsData = fallbackRuns;
          setupTabs(runsData);
          renderRun(runsData[currentRunIndex]);
        });
    };

    initViewer();
  }

/* 06.2 AI Workstation - Model Benchmark Dashboard */
  const benchmarkModule = document.querySelector('[data-model-benchmark]');
  if (benchmarkModule) {
    const benchmarkTabsContainer = benchmarkModule.querySelector('[data-benchmark-tabs]');
    const statusPill = benchmarkModule.querySelector('[data-benchmark-status-pill]');
    const statusText = benchmarkModule.querySelector('[data-benchmark-status-text]');
    const truthBadge = benchmarkModule.querySelector('[data-benchmark-truth-badge]');
    const metaTitle = benchmarkModule.querySelector('[data-bmeta-title]');
    const metaRuns = benchmarkModule.querySelector('[data-bmeta-runs]');
    const metaValidation = benchmarkModule.querySelector('[data-bmeta-validation]');
    const metaBaseline = benchmarkModule.querySelector('[data-bmeta-baseline]');
    const matrixHeading = benchmarkModule.querySelector('[data-matrix-heading]');
    const matrixSubtitle = benchmarkModule.querySelector('[data-matrix-subtitle]');
    const tableWrap = benchmarkModule.querySelector('[data-benchmark-table-wrap]');
    const table = benchmarkModule.querySelector('[data-benchmark-table]');

    const binspectorTier = benchmarkModule.querySelector('[data-binspector-tier]');
    const binspectorProvider = benchmarkModule.querySelector('[data-binspector-provider]');
    const binspectorStatus = benchmarkModule.querySelector('[data-binspector-status]');
    const binspectorTitle = benchmarkModule.querySelector('[data-binspector-title]');
    const binspectorNotes = benchmarkModule.querySelector('[data-binspector-notes]');
    const binspectorStrengths = benchmarkModule.querySelector('[data-binspector-strengths]');
    const binspectorBottlenecks = benchmarkModule.querySelector('[data-binspector-bottlenecks]');
    const binspectorDiff = benchmarkModule.querySelector('[data-binspector-diff]');
    const binspectorArtifactsBlock = benchmarkModule.querySelector('[data-binspector-artifacts-block]');
    const binspectorArtifacts = benchmarkModule.querySelector('[data-binspector-artifacts]');

    let benchmarksData = null;
    let currentDatasetIndex = 0;
    let selectedModelId = null;
    let activeHighlightedCol = null;

    const fallbackBenchmarks = [
      {
        id: 'frontend-benchmark-v1',
        title: 'Frontend Workstation Benchmark V1',
        subtitle: '5 isolated comparative model runs from baseline 129b33f',
        status: 'PARTIAL',
        statusLabel: '3/5 Validated · 2/5 Blocked',
        isSample: false,
        date: '2026-08-18',
        baseline: '129b33f5b9845797c690c52a9e03609e812cc67d',
        targetRuns: 5,
        completedRuns: 3,
        blockedRuns: 2,
        metrics: [
          { id: 's1_matrix', name: 'Workstation Matrix', short: 'Matrix', description: 'Scenario 1: Metric-ranked horizontal performance bars, real-time sorting & comparative matrix' },
          { id: 's2_nav', name: 'Mobile Nav Drawer', short: 'Nav Drawer', description: 'Scenario 2: Focus-trapped 2-line hamburger drawer, ESC dismissal & scroll locking' },
          { id: 's3_explorer', name: 'Model Explorer', short: 'Explorer', description: 'Scenario 3: Workload recommendation decision engine & trade-off analyzer' },
          { id: 's4_a11y', name: 'A11y & Performance', short: 'A11y / Perf', description: 'Scenario 4: Keyboard nav, ARIA live alerts, 0 CLS & reduced-motion support' },
          { id: 's5_lab', name: 'AI Lab Sandbox', short: 'Lab Sandbox', description: 'Scenario 5: Interactive client-side telemetry simulation & hybrid routing' },
          { id: 'validation', name: 'Viewport QA', short: 'Viewport QA', description: 'Cross-viewport verification (375, 390, 430, 1440), 0 console errors, 0 overflow' }
        ],
        models: [
          {
            id: 'gpt-5-6-luna',
            name: 'GPT-5.6 Luna',
            provider: 'OpenAI',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'COMPLETE',
            statusLabel: 'Verified & Passed',
            badgeClass: 'is-complete',
            overallScore: 'Validated',
            diff: 'Node & diff checks clean',
            scores: {
              s1_matrix: { value: 'PASS', state: 'validated', label: 'Validated' },
              s2_nav: { value: 'PASS', state: 'validated', label: 'Validated' },
              s3_explorer: { value: 'PASS', state: 'validated', label: 'Validated' },
              s4_a11y: { value: 'PASS', state: 'validated', label: 'Validated' },
              s5_lab: { value: 'PASS', state: 'validated', label: 'Validated' },
              validation: { value: '4/4', state: 'validated', label: 'Pass (4/4)' }
            },
            strengths: 'Disciplined scope, robust responsive styling across mobile viewports, high layout containment.',
            bottlenecks: 'Cloud dependency; manual quality scoring pending common visual review.',
            notes: 'Verified across all required viewports (375, 390, 430, 1440) with zero console errors and zero horizontal overflow.',
            artifacts: [
              'benchmark-output/gpt-5.6-luna/gpt-5.6-luna-desktop.png',
              'benchmark-output/gpt-5.6-luna/gpt-5.6-luna-390.png'
            ]
          },
          {
            id: 'gemini-flash',
            name: 'Gemini 3.7 Flash',
            provider: 'Google',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'COMPLETE',
            statusLabel: 'Verified & Passed',
            badgeClass: 'is-complete',
            overallScore: 'Validated',
            diff: 'Clean multi-view implementation',
            scores: {
              s1_matrix: { value: 'PASS', state: 'validated', label: 'Validated' },
              s2_nav: { value: 'PASS', state: 'validated', label: 'Validated' },
              s3_explorer: { value: 'PASS', state: 'validated', label: 'Validated' },
              s4_a11y: { value: 'PASS', state: 'validated', label: 'Validated' },
              s5_lab: { value: 'PASS', state: 'validated', label: 'Validated' },
              validation: { value: '4/4', state: 'validated', label: 'Pass (4/4)' }
            },
            strengths: 'Multi-polygon SVG radar, ranked performance bars, client telemetry visualizer, 0 CLS containment.',
            bottlenecks: 'Complex multi-polygon DOM geometry; manual quality scoring pending common visual review.',
            notes: 'All 5 scenarios completed with ranked bars, SVG radar, head-to-head matrix, and focus-trapped mobile drawer. Verified 375, 390, 430, 1440.',
            artifacts: [
              'benchmark-output/gemini-flash/desktop.png',
              'benchmark-output/gemini-flash/mobile-390.png'
            ]
          },
          {
            id: 'grok-4-5',
            name: 'Grok 4.5',
            provider: 'xAI',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'COMPLETE',
            statusLabel: 'Verified & Passed',
            badgeClass: 'is-complete',
            overallScore: 'Validated',
            diff: '+282 / −22 lines',
            scores: {
              s1_matrix: { value: 'PASS', state: 'validated', label: 'Validated' },
              s2_nav: { value: 'PASS', state: 'validated', label: 'Validated' },
              s3_explorer: { value: 'PASS', state: 'validated', label: 'Validated' },
              s4_a11y: { value: 'PASS', state: 'validated', label: 'Validated' },
              s5_lab: { value: 'PASS', state: 'validated', label: 'Validated' },
              validation: { value: '4/4', state: 'validated', label: 'Pass (4/4)' }
            },
            strengths: 'Modular benchmark widgets, explicit cloud vs local lab routing, clean state management.',
            bottlenecks: 'Auxiliary widget script created; manual quality scoring pending common visual review.',
            notes: 'All five scenarios completed. Verified all required viewports with no console errors or horizontal overflow.',
            artifacts: [
              'benchmark-output/grok-4.5/desktop.png',
              'benchmark-output/grok-4.5/mobile-390.png'
            ]
          },
          {
            id: 'grok-4-6',
            name: 'Grok 4.6',
            provider: 'xAI',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'BLOCKED',
            statusLabel: 'Validation Incomplete',
            badgeClass: 'is-blocked',
            overallScore: 'Unverified',
            diff: 'Code implemented, tests omitted',
            scores: {
              s1_matrix: { value: 'CODE', state: 'unverified', label: 'Code Only' },
              s2_nav: { value: 'CODE', state: 'unverified', label: 'Code Only' },
              s3_explorer: { value: 'CODE', state: 'unverified', label: 'Code Only' },
              s4_a11y: { value: 'CODE', state: 'unverified', label: 'Code Only' },
              s5_lab: { value: 'CODE', state: 'unverified', label: 'Code Only' },
              validation: { value: 'BLOCKED', state: 'blocked', label: 'Incomplete' }
            },
            strengths: 'Scenarios 1–5 were implemented in code.',
            bottlenecks: 'Required viewport checks, console checks, overflow checks, and screenshots were not completed before run cutoff.',
            notes: 'Code changes were written to branch, but deterministic QA was not executed. Marked as blocked / unverified.',
            artifacts: []
          },
          {
            id: 'ternary-bonsai-27b',
            name: 'Ternary-Bonsai-27B (Local)',
            provider: 'Local Workstation',
            tier: 'Local',
            tierLabel: 'On-Device Air-Gapped',
            status: 'BLOCKED',
            statusLabel: 'Provider Load Failure',
            badgeClass: 'is-blocked',
            overallScore: 'Blocked',
            diff: '0 artifacts produced',
            scores: {
              s1_matrix: { value: 'FAIL', state: 'blocked', label: 'Blocked' },
              s2_nav: { value: 'FAIL', state: 'blocked', label: 'Blocked' },
              s3_explorer: { value: 'FAIL', state: 'blocked', label: 'Blocked' },
              s4_a11y: { value: 'FAIL', state: 'blocked', label: 'Blocked' },
              s5_lab: { value: 'FAIL', state: 'blocked', label: 'Blocked' },
              validation: { value: 'FAIL', state: 'blocked', label: 'Provider Fail' }
            },
            strengths: 'Architected for zero-egress on-device inference.',
            bottlenecks: "Local provider returned: 'Failed to load model.' Execution halted immediately.",
            notes: 'Recorded as an environment/provider runtime failure, not a quality score. Ground truth for local model limits.',
            artifacts: []
          }
        ]
      },
      {
        id: 'harness-role-matrix',
        title: 'AI Workstation Harness Role Matrix',
        subtitle: 'Operational routing contracts & observed model roles in Antigravity V1.1',
        status: 'OPERATIONAL',
        statusLabel: 'Operational Policy Grounded',
        isSample: false,
        date: '2026-08-19',
        baseline: 'agent-harness-v1',
        targetRuns: 6,
        completedRuns: 5,
        blockedRuns: 1,
        metrics: [
          { id: 'role_orch', name: 'Orchestration & Planning', short: 'Orchestrator', description: 'Goal decomposition, task routing, scout join synthesis, final decision authority' },
          { id: 'role_scout', name: 'Discovery Swarm', short: 'Scout Swarm', description: 'Parallel read-only repository inspection, AST analysis & context extraction' },
          { id: 'role_worker', name: 'Routine Execution', short: 'Routine Worker', description: 'Direct code implementation, HTML/CSS/JS refactoring & edit-test-fix loops' },
          { id: 'role_deep', name: 'Deep Code Reasoning', short: 'Deep Reasoning', description: 'High-complexity architecture, cross-system invariants & subtle edge-case design' },
          { id: 'role_review', name: 'Adversarial Review', short: 'Adversarial Rev', description: 'Second opinion, adversarial critique, edge-case audit & test failure diagnosis' },
          { id: 'role_local', name: 'Air-Gapped Local', short: 'Local Airgap', description: '100% on-device private inference without cloud network access (VRAM bound)' }
        ],
        models: [
          {
            id: 'gpt-5-6-sol',
            name: 'GPT-5.6 Sol',
            provider: 'OpenAI',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'OPERATIONAL',
            statusLabel: 'Primary Orchestrator',
            badgeClass: 'is-complete',
            overallScore: 'Orchestrator',
            diff: 'Primary coordinator contract',
            scores: {
              role_orch: { value: 'PRIMARY', state: 'validated', label: 'Primary (Sol)' },
              role_scout: { value: 'DELEGATE', state: 'delegated', label: 'Delegated' },
              role_worker: { value: 'ESCALATE', state: 'delegated', label: 'Escalate Only' },
              role_deep: { value: 'CO-PRIM', state: 'validated', label: 'Co-Primary' },
              role_review: { value: 'SUPERV', state: 'delegated', label: 'Supervisor' },
              role_local: { value: '—', state: 'unsupported', label: 'Unsupported' }
            },
            strengths: 'High-order task deconstruction, constraint enforcement, join synthesis across specialist findings.',
            bottlenecks: 'Costly for bulk file reads; AGENTS.md mandates delegation to Gemini before touching files.',
            notes: 'Designated primary orchestrator, integrator, and final decision authority across the AI workstation.',
            artifacts: ['AGENTS.md', 'agents/coordinator.md']
          },
          {
            id: 'gemini-3-7-flash',
            name: 'Gemini 3.7 Flash High',
            provider: 'Google',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'OPERATIONAL',
            statusLabel: 'Default Execution Worker',
            badgeClass: 'is-complete',
            overallScore: 'Execution Core',
            diff: 'Native Antigravity subagent',
            scores: {
              role_orch: { value: 'DELEGATE', state: 'delegated', label: 'Delegated' },
              role_scout: { value: 'PRIMARY', state: 'validated', label: 'Primary (Scout)' },
              role_worker: { value: 'PRIMARY', state: 'validated', label: 'Primary (Worker)' },
              role_deep: { value: 'SECOND', state: 'delegated', label: 'Secondary' },
              role_review: { value: 'PEER', state: 'delegated', label: 'Peer Worker' },
              role_local: { value: '—', state: 'unsupported', label: 'Unsupported' }
            },
            strengths: 'High throughput, 1M+ context window, rapid AST and file discovery, native Antigravity runtime integration.',
            bottlenecks: 'Requires deterministic verification for subtle multi-file state invariants.',
            notes: 'Default execution worker. Observed in 100% of real Antigravity subagent runs in the repository.',
            artifacts: ['docs/agent-harness-v1.md', '.agents/agents/scout/agent.md']
          },
          {
            id: 'claude-opus-4-6',
            name: 'Claude Opus 4.6 Thinking',
            provider: 'Anthropic',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'OPERATIONAL',
            statusLabel: 'Architecture Escalation',
            badgeClass: 'is-complete',
            overallScore: 'Escalation',
            diff: 'Deep architecture contract',
            scores: {
              role_orch: { value: 'ADVISORY', state: 'delegated', label: 'Advisory' },
              role_scout: { value: 'OPTIONAL', state: 'delegated', label: 'Deep Scout' },
              role_worker: { value: 'ESCALATE', state: 'delegated', label: 'Escalate Only' },
              role_deep: { value: 'PRIMARY', state: 'validated', label: 'Primary (Opus)' },
              role_review: { value: 'HIGH', state: 'validated', label: 'High Reasoning' },
              role_local: { value: '—', state: 'unsupported', label: 'Unsupported' }
            },
            strengths: 'Subtle long-horizon reasoning, deep algorithmic verification, complex architecture cross-coupling.',
            bottlenecks: 'Higher latency; reserved strictly for genuine escalations after lower-cost workers fail.',
            notes: 'Selective escalation specialist. Never used for routine file reads or ordinary implementation.',
            artifacts: ['AGENTS.md (Escalation Ladder)']
          },
          {
            id: 'grok-4-5-review',
            name: 'Grok 4.5 / 4.6',
            provider: 'xAI',
            tier: 'Cloud',
            tierLabel: 'Cloud Engine',
            status: 'OPERATIONAL',
            statusLabel: 'Adversarial Reviewer',
            badgeClass: 'is-complete',
            overallScore: 'Review & Debug',
            diff: 'Debugging & second opinion',
            scores: {
              role_orch: { value: '—', state: 'unsupported', label: 'Unsupported' },
              role_scout: { value: 'TARGETED', state: 'delegated', label: 'Targeted' },
              role_worker: { value: 'DEBUG', state: 'delegated', label: 'Debug Only' },
              role_deep: { value: 'SECOND', state: 'delegated', label: 'Secondary' },
              role_review: { value: 'PRIMARY', state: 'validated', label: 'Primary (Review)' },
              role_local: { value: '—', state: 'unsupported', label: 'Unsupported' }
            },
            strengths: 'Adversarial code critique, surfacing unhandled edge cases, diagnosing contradictory test failures.',
            bottlenecks: 'Not configured for primary orchestration in V1 harness.',
            notes: 'Invoked when test suites fail unexpectedly or when an independent second opinion adds value.',
            artifacts: ['AGENTS.md (Grok 4.5 Policy)']
          },
          {
            id: 'qwen-2-5-local',
            name: 'Qwen 2.5 / Local 27B',
            provider: 'Local Workstation',
            tier: 'Local',
            tierLabel: 'On-Device Air-Gapped',
            status: 'PLANNED',
            statusLabel: 'Active Backlog Item',
            badgeClass: 'is-blocked',
            overallScore: 'Backlog',
            diff: 'Planned research stream',
            scores: {
              role_orch: { value: '—', state: 'unsupported', label: 'Unsupported' },
              role_scout: { value: 'PLAN', state: 'planned', label: 'Planned' },
              role_worker: { value: 'PLAN', state: 'planned', label: 'Planned' },
              role_deep: { value: 'UNVERIF', state: 'unverified', label: 'Unverified' },
              role_review: { value: 'UNVERIF', state: 'unverified', label: 'Unverified' },
              role_local: { value: 'PRIMARY', state: 'validated', label: 'Primary (Local)' }
            },
            strengths: 'Zero cloud egress, 100% private code handling, air-gapped offline workstation operation.',
            bottlenecks: 'Hardware VRAM bound; provider stability in active research.',
            notes: 'Recorded in state/backlog.md for local worker experiments and on-device agent evaluation.',
            artifacts: ['state/backlog.md', 'state/project-state.md']
          }
        ]
      }
    ];

    const updateInspector = (model, specificMetric = null) => {
      if (!model) return;
      if (binspectorTier) binspectorTier.textContent = model.tierLabel || (model.tier === 'Local' ? 'LOCAL ON-DEVICE' : 'CLOUD ENGINE');
      if (binspectorProvider) binspectorProvider.textContent = model.provider || 'AI Workstation';
      if (binspectorStatus) {
        binspectorStatus.textContent = model.statusLabel || model.status;
        binspectorStatus.className = 'inspector-status-pill ' + (model.badgeClass || '');
      }
      if (binspectorTitle) {
        binspectorTitle.textContent = model.name + (specificMetric ? ' · ' + specificMetric.name : '');
      }
      if (binspectorNotes) {
        if (specificMetric && model.scores && model.scores[specificMetric.id]) {
          const sc = model.scores[specificMetric.id];
          binspectorNotes.textContent = specificMetric.name + ': ' + sc.label + ' (' + sc.value + '). ' + (model.notes || '');
        } else {
          binspectorNotes.textContent = model.notes || 'No detailed engineering notes available.';
        }
      }
      if (binspectorStrengths) binspectorStrengths.textContent = model.strengths || 'Grounded in repository evaluation criteria.';
      if (binspectorBottlenecks) binspectorBottlenecks.textContent = model.bottlenecks || 'None identified in recorded test run.';
      if (binspectorDiff) binspectorDiff.textContent = model.diff || '—';

      if (binspectorArtifactsBlock && binspectorArtifacts) {
        binspectorArtifacts.innerHTML = '';
        if (model.artifacts && model.artifacts.length) {
          binspectorArtifactsBlock.hidden = false;
          model.artifacts.forEach(art => {
            const li = document.createElement('li');
            li.textContent = art;
            binspectorArtifacts.appendChild(li);
          });
        } else {
          binspectorArtifactsBlock.hidden = true;
        }
      }
    };

    const renderDataset = (dataset) => {
      if (!dataset) return;

      if (statusText) statusText.textContent = dataset.statusLabel || dataset.status;
      if (truthBadge) {
        truthBadge.textContent = dataset.isSample ? 'SAMPLE DATASET' : 'REPO GROUNDED';
        truthBadge.title = dataset.isSample
          ? 'Illustrative dataset format for harness architecture evaluation'
          : 'Backed by empirical test runs and repository operational contracts';
      }
      if (metaTitle) metaTitle.textContent = dataset.title;
      if (metaRuns) metaRuns.textContent = dataset.completedRuns + ' / ' + dataset.targetRuns + ' Completed (' + dataset.blockedRuns + ' Blocked)';
      if (metaValidation) metaValidation.textContent = dataset.statusLabel;
      if (metaBaseline) metaBaseline.textContent = dataset.baseline;

      if (matrixHeading) matrixHeading.textContent = dataset.title;
      if (matrixSubtitle) matrixSubtitle.textContent = dataset.subtitle;

      if (!table) return;
      table.innerHTML = '';

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');

      const thModel = document.createElement('th');
      thModel.className = 'is-model-col';
      thModel.scope = 'col';
      thModel.textContent = 'Model / Engine';
      headerRow.appendChild(thModel);

      const thTier = document.createElement('th');
      thTier.scope = 'col';
      thTier.textContent = 'Tier';
      headerRow.appendChild(thTier);

      const thStatus = document.createElement('th');
      thStatus.scope = 'col';
      thStatus.textContent = 'Status';
      headerRow.appendChild(thStatus);

      dataset.metrics.forEach(metric => {
        const th = document.createElement('th');
        th.className = 'is-metric-col';
        th.scope = 'col';
        th.setAttribute('data-metric-id', metric.id);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Highlight column: ' + metric.name + ' (' + metric.description + ')');
        btn.innerHTML = '<span class="col-short">' + metric.short + '</span><span class="col-full">' + metric.name + '</span>';
        btn.addEventListener('click', () => {
          const isCurrent = activeHighlightedCol === metric.id;
          activeHighlightedCol = isCurrent ? null : metric.id;

          table.querySelectorAll('th.is-metric-col').forEach(thEl => {
            thEl.classList.toggle('is-highlighted', thEl.getAttribute('data-metric-id') === activeHighlightedCol);
          });
          table.querySelectorAll('td[data-metric-id]').forEach(tdEl => {
            tdEl.classList.toggle('is-col-highlighted', tdEl.getAttribute('data-metric-id') === activeHighlightedCol);
          });

          if (activeHighlightedCol) {
            if (binspectorTitle) binspectorTitle.textContent = 'Metric Column · ' + metric.name;
            if (binspectorNotes) binspectorNotes.textContent = metric.description;
            if (binspectorTier) binspectorTier.textContent = 'EVALUATION METRIC';
            if (binspectorProvider) binspectorProvider.textContent = 'Dimension #' + (dataset.metrics.indexOf(metric) + 1);
            if (binspectorStatus) {
              binspectorStatus.textContent = 'COLUMN FILTER';
              binspectorStatus.className = 'inspector-status-pill';
            }
            if (binspectorStrengths) binspectorStrengths.textContent = 'Evaluated across all ' + dataset.models.length + ' models in this benchmark dataset.';
            if (binspectorBottlenecks) binspectorBottlenecks.textContent = 'Click any individual model row or score cell to view specific implementation artifacts.';
            if (binspectorDiff) binspectorDiff.textContent = 'Target Dimension: ' + metric.id;
            if (binspectorArtifactsBlock) binspectorArtifactsBlock.hidden = true;
          } else if (selectedModelId) {
            const m = dataset.models.find(item => item.id === selectedModelId);
            if (m) updateInspector(m);
          }
        });
        th.appendChild(btn);
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      dataset.models.forEach((model, modelIdx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-model-id', model.id);
        tr.setAttribute('tabindex', '0');
        tr.setAttribute('role', 'row');
        tr.setAttribute('aria-label', model.name + ', ' + model.tierLabel + ', ' + model.statusLabel);

        if (modelIdx === 0 && !selectedModelId) {
          selectedModelId = model.id;
        }
        if (model.id === selectedModelId) {
          tr.classList.add('is-selected');
        }

        const tdModel = document.createElement('td');
        tdModel.className = 'is-model-cell';
        tdModel.innerHTML = '<span class="model-cell-name">' + model.name + '</span><span class="model-cell-prov">' + model.provider + '</span>';
        tr.appendChild(tdModel);

        const tdTier = document.createElement('td');
        tdTier.innerHTML = '<span class="tier-pill ' + (model.tier === 'Local' ? 'is-local' : '') + '">' + model.tier + '</span>';
        tr.appendChild(tdTier);

        const tdStatus = document.createElement('td');
        tdStatus.innerHTML = '<span class="status-tag ' + (model.badgeClass || '') + '">' + model.status + '</span>';
        tr.appendChild(tdStatus);

        dataset.metrics.forEach(metric => {
          const tdScore = document.createElement('td');
          tdScore.className = 'is-score-cell';
          tdScore.setAttribute('data-metric-id', metric.id);
          if (activeHighlightedCol === metric.id) {
            tdScore.classList.add('is-col-highlighted');
          }

          const score = (model.scores && model.scores[metric.id]) || { value: '—', state: 'unsupported', label: '—' };
          tdScore.classList.add('cell-state-' + score.state);

          const scoreBtn = document.createElement('button');
          scoreBtn.type = 'button';
          scoreBtn.className = 'score-cell-btn';
          scoreBtn.setAttribute('aria-label', model.name + ' ' + metric.name + ': ' + score.label + ' (' + score.value + ')');
          scoreBtn.innerHTML = '<span class="score-val">' + score.value + '</span><span class="score-label">' + score.label + '</span>';

          scoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedModelId = model.id;
            tbody.querySelectorAll('tr').forEach(r => r.classList.toggle('is-selected', r.getAttribute('data-model-id') === model.id));
            updateInspector(model, metric);
            animateDataState(benchmarkModule.querySelector('.benchmark-inspector'), { y: 4, duration: 0.25 });
          });

          tdScore.appendChild(scoreBtn);
          tr.appendChild(tdScore);
        });

        tr.addEventListener('click', () => {
          selectedModelId = model.id;
          tbody.querySelectorAll('tr').forEach(r => r.classList.toggle('is-selected', r.getAttribute('data-model-id') === model.id));
          updateInspector(model);
          animateDataState(benchmarkModule.querySelector('.benchmark-inspector'), { y: 4, duration: 0.25 });
        });

        tr.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tr.click();
          }
        });

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);

      const initialModel = dataset.models.find(m => m.id === selectedModelId) || dataset.models[0];
      if (initialModel) {
        updateInspector(initialModel);
      }
    };

    const setupTabs = (benchmarks) => {
      if (!benchmarkTabsContainer) return;
      benchmarkTabsContainer.innerHTML = '';
      benchmarks.forEach((bench, idx) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.setAttribute('role', 'tab');
        tab.className = 'benchmark-tab' + (idx === currentDatasetIndex ? ' is-active' : '');
        tab.setAttribute('aria-selected', String(idx === currentDatasetIndex));
        tab.textContent = bench.title + ' (' + bench.completedRuns + '/' + bench.targetRuns + ')';
        tab.addEventListener('click', () => {
          if (currentDatasetIndex === idx) return;
          currentDatasetIndex = idx;
          activeHighlightedCol = null;
          selectedModelId = null;
          benchmarkTabsContainer.querySelectorAll('.benchmark-tab').forEach((t, i) => {
            const active = i === currentDatasetIndex;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', String(active));
          });
          renderDataset(benchmarks[currentDatasetIndex]);
          animateDataState(benchmarkModule.querySelectorAll('.benchmark-matrix-stage, .benchmark-inspector'), { y: 6, duration: 0.35 });
        });
        benchmarkTabsContainer.appendChild(tab);
      });
    };

    const initBenchmarkDashboard = () => {
      fetch('data/model-benchmarks.json')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch model-benchmarks.json: ' + res.status);
          return res.json();
        })
        .then(data => {
          benchmarksData = data.benchmarks && data.benchmarks.length ? data.benchmarks : fallbackBenchmarks;
          setupTabs(benchmarksData);
          renderDataset(benchmarksData[currentDatasetIndex]);
        })
        .catch(() => {
          benchmarksData = fallbackBenchmarks;
          setupTabs(benchmarksData);
          renderDataset(benchmarksData[currentDatasetIndex]);
        });
    };

    initBenchmarkDashboard();
  }

  const canvas = document.querySelector('[data-signal-canvas]');
  if (!canvas) {
    window.__heroGraphAnimation = null;
    window.addEventListener('pagehide', () => motionMedia?.revert(), { once: true });
    return;
  }
  const ctx = canvas.getContext('2d');
  let points = [];
  let raf = 0;
  let resizeTimer = 0;
  let time = 0;
  let pointerX = -1000;
  let pointerY = -1000;
  let pointerInside = false;
  let targetNormX = 0;
  let targetNormY = 0;
  let currentNormX = 0;
  let currentNormY = 0;
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let isHeroInView = true;
  let decisionCycleTimer = null;
  let decisionTween = null;
  let entranceTimeline = null;
  let hasEntranceCompleted = false;

  const revealState = {
    points: motionAllowed() ? 0 : 1,
    lines: motionAllowed() ? 0 : 1,
    curveProgress: motionAllowed() ? 0 : 1,
    nodeScale: motionAllowed() ? 0 : 1
  };

  const decisionState = {
    active: 0,
    pulse: 0,
    convergence: 0,
    curveGlow: 0,
    nodeRing: 0,
    activeIndices: []
  };

  const resetDecisionState = () => {
    decisionState.active = 0;
    decisionState.pulse = 0;
    decisionState.convergence = 0;
    decisionState.curveGlow = 0;
    decisionState.nodeRing = 0;
    decisionState.activeIndices = [];
  };

  const curveNodes = [
    { uX: 0.08, uY: 0.78, z: -25, px: 0, py: 0 },
    { uX: 0.28, uY: 0.72, z: -6,  px: 0, py: 0 },
    { uX: 0.48, uY: 0.64, z: 22,  px: 0, py: 0 },
    { uX: 0.86, uY: 0.18, z: 32,  px: 0, py: 0 },
    { uX: 0.89, uY: 0.20, z: 18,  px: 0, py: 0 },
    { uX: 0.94, uY: 0.12, z: 5,   px: 0, py: 0 }
  ];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const seedRandom = seed => {
      let s = seed % 2147483647;
      if (s <= 0) s += 2147483646;
      return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
      };
    };
    const rand = seedRandom(42);
    points = Array.from({ length: 38 }, (_, index) => {
      const layer = index % 3;
      let baseZ;
      if (layer === 0) {
        baseZ = -32 - rand() * 24;
      } else if (layer === 1) {
        baseZ = -12 + rand() * 24;
      } else {
        baseZ = 28 + rand() * 24;
      }

      const isMajor = index % 9 === 0;
      const baseR = isMajor ? 3 : (layer === 0 ? 1.25 : (layer === 1 ? 1.5 : 1.75));

      return {
        baseX: rect.width * (.08 + rand() * .84),
        baseY: rect.height * (.08 + rand() * .84),
        baseZ: baseZ,
        layer: layer,
        r: baseR,
        isMajor: isMajor,
        phase: rand() * Math.PI * 2,
        projX: 0,
        projY: 0,
        scale: 1,
        finalZ: baseZ
      };
    });

    points.sort((a, b) => a.baseZ - b.baseZ);
  };

  const draw = () => {
    raf = 0;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    time += .008;
    const reduced = motionReduced();

    if (!reduced) {
      const damping = 0.055;
      currentNormX += (targetNormX - currentNormX) * damping;
      currentNormY += (targetNormY - currentNormY) * damping;
      if (!pointerInside && Math.abs(currentNormX) < 0.0002 && Math.abs(currentNormY) < 0.0002) {
        currentNormX = 0;
        currentNormY = 0;
      }
    } else {
      currentNormX = 0;
      currentNormY = 0;
    }

    const cx = width * 0.5;
    const cy = height * 0.5;
    const focal = Math.max(width, height) * 1.35;

    const angleY = currentNormX * 0.075;
    const angleX = -currentNormY * 0.062;
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const shiftX = currentNormX * 10;
    const shiftY = currentNormY * 8;

    const baseTargetX = width * .76;
    const baseTargetY = height * .32;
    const baseTargetZ = 45;

    const tDx = (baseTargetX - cx) - shiftX * (baseTargetZ / 50);
    const tDy = (baseTargetY - cy) - shiftY * (baseTargetZ / 50);
    const tRx = tDx * cosY + baseTargetZ * sinY;
    const tRz = -tDx * sinY + baseTargetZ * cosY;
    const tRy = tDy * cosX - tRz * sinX;
    const tFz = tDy * sinX + tRz * cosX;
    const targetScale = focal / (focal - tFz);
    const targetX = cx + tRx * targetScale;
    const targetY = cy + tRy * targetScale;

    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const isIdleDrifter = i % 4 === 0;
      const drift = reduced || !isIdleDrifter ? 0 : Math.sin(time * 1.45 + pt.phase) * (1.1 + pt.layer * 0.35);

      const rawX = pt.baseX + drift;
      const rawY = pt.baseY + drift * 0.65;
      const rawZ = pt.baseZ;

      const dx = (rawX - cx) - shiftX * (rawZ / 50);
      const dy = (rawY - cy) - shiftY * (rawZ / 50);
      const rx = dx * cosY + rawZ * sinY;
      const rz = -dx * sinY + rawZ * cosY;
      const ry = dy * cosX - rz * sinX;
      const fz = dy * sinX + rz * cosX;
      const scale = focal / (focal - fz);

      pt.projX = cx + rx * scale;
      pt.projY = cy + ry * scale;
      pt.scale = scale;
      pt.finalZ = fz;
    }

    for (let i = 0; i < curveNodes.length; i++) {
      const node = curveNodes[i];
      const rawX = width * node.uX;
      const rawY = height * node.uY;
      const rawZ = node.z;

      const dx = (rawX - cx) - shiftX * (rawZ / 50);
      const dy = (rawY - cy) - shiftY * (rawZ / 50);
      const rx = dx * cosY + rawZ * sinY;
      const rz = -dx * sinY + rawZ * cosY;
      const ry = dy * cosX - rz * sinX;
      const fz = dy * sinX + rz * cosX;
      const scale = focal / (focal - fz);

      node.px = cx + rx * scale;
      node.py = cy + ry * scale;
    }

    points.forEach((point, index) => {
      let pushX = 0;
      let pushY = 0;
      let pointerDistance = Infinity;
      if (pointerInside && !reduced) {
        pointerDistance = Math.hypot(pointerX - point.projX, pointerY - point.projY);
        if (pointerDistance < 85 && pointerDistance > 0) {
          const force = (1 - pointerDistance / 85) * (3.5 + point.layer * 1.8);
          pushX = ((point.projX - pointerX) / pointerDistance) * force;
          pushY = ((point.projY - pointerY) / pointerDistance) * force;
        }
      }

      const x = point.projX + pushX;
      const y = point.projY + pushY;
      const distance = Math.hypot(targetX - x, targetY - y);
      const isCycleActive = decisionState.activeIndices.includes(index);

      if (distance < width * .52 && index % 2 === 0 && revealState.lines > 0.01) {
        const boost = isCycleActive ? decisionState.active * 0.22 : 0;
        const baseAlpha = Math.max(0.02, .14 - distance / width * .17);
        const depthMultiplier = point.layer === 2 ? 1.25 : (point.layer === 1 ? 1.0 : 0.68);
        const lineAlpha = (baseAlpha * depthMultiplier + boost) * revealState.lines;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = isCycleActive
          ? `rgba(198,255,62,${Math.min(0.6, lineAlpha + 0.1)})`
          : `rgba(198,255,62,${lineAlpha})`;
        ctx.lineWidth = (isCycleActive ? 0.95 : (point.layer === 2 ? 0.85 : 0.65)) * point.scale;
        ctx.stroke();

        if (decisionState.active > 0.05 && isCycleActive && !reduced) {
          const pT = (decisionState.convergence + index * 0.17) % 1;
          const packetX = x + (targetX - x) * pT;
          const packetY = y + (targetY - y) * pT;
          const packetScale = point.scale + (targetScale - point.scale) * pT;
          const packetRadius = (1.4 + pT * 0.8) * packetScale;

          ctx.beginPath();
          ctx.arc(packetX, packetY, packetRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(198,255,62,${Math.min(0.95, (0.65 + pT * 0.3) * decisionState.active)})`;
          ctx.fill();
        }
      }

      const pointReveal = Math.max(0, Math.min(1,
        revealState.points * 1.45 - (index / Math.max(1, points.length - 1)) * .45
      ));
      if (pointReveal > 0.01) {
        let pointRadius = point.r * point.scale * pointReveal;

        if (isCycleActive && !reduced) {
          pointRadius += decisionState.pulse * 0.85 * point.scale;
        }
        if (pointerInside && !reduced) {
          if (pointerDistance < 60) {
            pointRadius += (1 - pointerDistance / 60) * 1.3 * point.scale;
          }
        }

        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, pointRadius), 0, Math.PI * 2);
        if (point.isMajor) {
          ctx.fillStyle = `rgba(198,255,62,${pointReveal})`;
          ctx.fill();
          if (pointReveal > 0.4) {
            ctx.beginPath();
            ctx.arc(x, y, pointRadius + 2.4 * point.scale, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(198,255,62,${0.25 * pointReveal})`;
            ctx.lineWidth = 0.75 * point.scale;
            ctx.stroke();
          }
        } else if (isCycleActive) {
          ctx.fillStyle = `rgba(215,255,120,${Math.min(pointReveal, 0.6 + decisionState.active * 0.38)})`;
          ctx.fill();
        } else {
          const depthAlpha = point.layer === 0 ? 0.38 : (point.layer === 1 ? 0.58 : 0.78);
          ctx.fillStyle = `rgba(247,246,241,${depthAlpha * pointReveal})`;
          ctx.fill();
        }
      }
    });

    if (revealState.nodeScale > 0.01) {
      const shadowDist = 7 * targetScale;
      ctx.beginPath();
      ctx.ellipse(
        targetX - angleY * 35,
        targetY + shadowDist - angleX * 30,
        13 * targetScale,
        4.5 * targetScale,
        angleY * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(0,0,0,${0.35 * revealState.nodeScale})`;
      ctx.fill();

      const outerRingR = (17 + (reduced ? 0 : Math.sin(time * 3) * 2) + (reduced ? 0 : decisionState.nodeRing * 8)) * revealState.nodeScale * targetScale;
      const haloR = outerRingR * 1.5;
      const haloGrad = ctx.createRadialGradient(targetX, targetY, 2, targetX, targetY, haloR);
      haloGrad.addColorStop(0, `rgba(198,255,62,${(0.14 + (reduced ? 0 : decisionState.curveGlow * 0.12)) * revealState.nodeScale})`);
      haloGrad.addColorStop(1, 'rgba(198,255,62,0)');
      ctx.beginPath();
      ctx.arc(targetX, targetY, haloR, 0, Math.PI * 2);
      ctx.fillStyle = haloGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(targetX, targetY, outerRingR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(198,255,62,${Math.max(0.08, 0.35 + (reduced ? 0 : decisionState.nodeRing * 0.35)) * revealState.nodeScale})`;
      ctx.lineWidth = 1 * targetScale;
      ctx.stroke();

      const innerRingR = (11.5 + (reduced ? 0 : Math.sin(time * 2.2 + 0.8) * 1.2)) * revealState.nodeScale * targetScale;
      ctx.beginPath();
      ctx.arc(targetX, targetY, innerRingR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(198,255,62,${(0.24 + (reduced ? 0 : decisionState.pulse * 0.3)) * revealState.nodeScale})`;
      ctx.lineWidth = 0.8 * targetScale;
      ctx.stroke();

      const nodeBaseR = (7 + (reduced ? 0 : Math.sin(time * 2.5) * 0.5)) * revealState.nodeScale * targetScale;
      const cyclePulseR = nodeBaseR + (reduced ? 0 : decisionState.pulse * 2.5 * targetScale);
      const coreGrad = ctx.createRadialGradient(
        targetX - cyclePulseR * 0.32,
        targetY - cyclePulseR * 0.32,
        cyclePulseR * 0.08,
        targetX,
        targetY,
        cyclePulseR
      );
      coreGrad.addColorStop(0, '#f5ffc8');
      coreGrad.addColorStop(0.48, '#c6ff3e');
      coreGrad.addColorStop(1, '#9cd416');

      ctx.beginPath();
      ctx.arc(targetX, targetY, cyclePulseR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
    }

    const prog = reduced ? 1 : Math.max(0, Math.min(1, revealState.curveProgress));
    if (prog > 0.01) {
      const p0 = curveNodes[0];
      const cp1 = curveNodes[1];
      const cp2 = curveNodes[2];
      const cp3 = curveNodes[3];
      const cp4 = curveNodes[4];
      const p2 = curveNodes[5];

      ctx.beginPath();
      if (prog >= 1) {
        ctx.moveTo(p0.px, p0.py);
        ctx.bezierCurveTo(cp1.px, cp1.py, cp2.px, cp2.py, targetX, targetY);
        ctx.bezierCurveTo(cp3.px, cp3.py, cp4.px, cp4.py, p2.px, p2.py);
      } else {
        const steps = Math.floor(60 * prog);
        ctx.moveTo(p0.px, p0.py);
        for (let i = 1; i <= steps; i++) {
          const t = (i / 60);
          let cxPt, cyPt;
          if (t <= 0.72) {
            const u = t / 0.72;
            const omt = 1 - u;
            cxPt = omt*omt*omt*p0.px + 3*omt*omt*u*cp1.px + 3*omt*u*u*cp2.px + u*u*u*targetX;
            cyPt = omt*omt*omt*p0.py + 3*omt*omt*u*cp1.py + 3*omt*u*u*cp2.py + u*u*u*targetY;
          } else {
            const u = (t - 0.72) / 0.28;
            const omt = 1 - u;
            cxPt = omt*omt*omt*targetX + 3*omt*omt*u*cp3.px + 3*omt*u*u*cp4.px + u*u*u*p2.px;
            cyPt = omt*omt*omt*targetY + 3*omt*omt*u*cp3.py + 3*omt*u*u*cp4.py + u*u*u*p2.py;
          }
          ctx.lineTo(cxPt, cyPt);
        }
      }
      ctx.strokeStyle = 'rgba(198,255,62,0.16)';
      ctx.lineWidth = 3.4 * targetScale;
      ctx.stroke();

      ctx.strokeStyle = '#c6ff3e';
      ctx.lineWidth = (1.6 + (reduced ? 0 : decisionState.curveGlow * 0.6)) * targetScale;
      ctx.stroke();
    }

    if (!reduced && !document.hidden && isHeroInView) {
      raf = requestAnimationFrame(draw);
    }
  };

  const triggerDecisionCycle = () => {
    if (motionReduced() || !window.gsap || !isHeroInView || document.hidden) return;

    const isMobile = window.innerWidth <= 900;
    const candidatePool = [0, 4, 8, 12, 16, 20, 24, 28];
    const count = isMobile ? 2 : 4;
    const startIndex = Math.floor(Math.random() * candidatePool.length);
    decisionState.activeIndices = Array.from({ length: count }, (_, index) =>
      candidatePool[(startIndex + index * 2) % candidatePool.length]
    );

    decisionTween?.kill();
    decisionTween = window.gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        resetDecisionState();
        scheduleNextCycle();
      }
    });

    decisionTween
      .to(decisionState, { active: 1, duration: 0.6, ease: 'sine.out' }, 0)
      .fromTo(decisionState, { convergence: 0 }, { convergence: 1, duration: 1.1, ease: 'power1.inOut' }, 0.1)
      .to(decisionState, { pulse: 1, nodeRing: 1, curveGlow: 1, duration: 0.45, ease: 'power2.out' }, 0.8)
      .to(decisionState, { pulse: 0, nodeRing: 0, curveGlow: 0, duration: 0.8, ease: 'power2.inOut' }, 1.25)
      .to(decisionState, { active: 0, duration: 0.7, ease: 'sine.inOut' }, 1.4);
  };

  const scheduleNextCycle = () => {
    if (decisionCycleTimer) clearTimeout(decisionCycleTimer);
    decisionCycleTimer = null;
    if (motionReduced() || !hasEntranceCompleted || !isHeroInView || document.hidden) return;
    const delay = 4200 + Math.random() * 2600;
    decisionCycleTimer = setTimeout(() => {
      triggerDecisionCycle();
    }, delay);
  };

  const triggerEntrance = () => {
    if (motionReduced() || !window.gsap) {
      revealState.points = 1;
      revealState.lines = 1;
      revealState.curveProgress = 1;
      revealState.nodeScale = 1;
      hasEntranceCompleted = true;
      draw();
      return;
    }

    entranceTimeline?.kill();
    decisionTween?.kill();
    if (decisionCycleTimer) clearTimeout(decisionCycleTimer);
    decisionCycleTimer = null;
    resetDecisionState();
    hasEntranceCompleted = false;
    revealState.points = 0;
    revealState.lines = 0;
    revealState.curveProgress = 0;
    revealState.nodeScale = 0;

    entranceTimeline = window.gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        hasEntranceCompleted = true;
        scheduleNextCycle();
      }
    });

    entranceTimeline
      .to(revealState, { points: 1, duration: 0.65, ease: 'power2.out' }, 0.05)
      .to(revealState, { lines: 1, duration: 0.6, ease: 'power2.out' }, 0.22)
      .to(revealState, { curveProgress: 1, duration: 0.95, ease: 'power2.inOut' }, 0.32)
      .to(revealState, { nodeScale: 1, duration: 0.55, ease: 'power3.out' }, 0.78);

    if (!raf && !document.hidden && isHeroInView) {
      raf = requestAnimationFrame(draw);
    }
  };

  const heroSection = document.querySelector('.hero');

  const handlePointerMove = e => {
    if (motionReduced() || window.innerWidth <= 900 || !finePointerQuery.matches) {
      pointerInside = false;
      targetNormX = 0;
      targetNormY = 0;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;

    const cx = rect.width * 0.5;
    const cy = rect.height * 0.5;
    targetNormX = Math.max(-1.15, Math.min(1.15, (pointerX - cx) / (rect.width * 0.55)));
    targetNormY = Math.max(-1.15, Math.min(1.15, (pointerY - cy) / (rect.height * 0.55)));

    pointerInside = (pointerX >= -40 && pointerX <= rect.width + 40 && pointerY >= -40 && pointerY <= rect.height + 40);
  };

  const handlePointerLeave = () => {
    pointerInside = false;
    targetNormX = 0;
    targetNormY = 0;
    pointerX = -1000;
    pointerY = -1000;
  };

  if (heroSection) {
    heroSection.addEventListener('pointermove', handlePointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  } else {
    canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  }

  let heroObserver = null;
  if (heroSection && 'IntersectionObserver' in window) {
    heroObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isHeroInView = entry.isIntersecting;
        if (isHeroInView) {
          if (!raf && !motionReduced() && !document.hidden) {
            raf = requestAnimationFrame(draw);
          }
          scheduleNextCycle();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
          if (decisionCycleTimer) clearTimeout(decisionCycleTimer);
          decisionCycleTimer = null;
          decisionTween?.kill();
          resetDecisionState();
        }
      });
    }, { threshold: 0.05 });
    heroObserver.observe(heroSection);
  }

  window.__heroGraphAnimation = {
    triggerEntrance,
    triggerDecisionCycle
  };

  const restartCanvas = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    resize();
    draw();
  };

  const handleResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(restartCanvas, 140);
  };

  const handleVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      if (decisionCycleTimer) clearTimeout(decisionCycleTimer);
      decisionCycleTimer = null;
      decisionTween?.kill();
      resetDecisionState();
    } else {
      if (!raf && isHeroInView && !motionReduced()) {
        raf = requestAnimationFrame(draw);
        scheduleNextCycle();
      }
    }
  };

  const handleMotionPreference = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (decisionCycleTimer) clearTimeout(decisionCycleTimer);
    decisionTween?.kill();
    entranceTimeline?.kill();
    revealState.points = 1;
    revealState.lines = 1;
    revealState.curveProgress = 1;
    revealState.nodeScale = 1;
    resetDecisionState();
    draw();
    if (!motionReduced()) {
      triggerEntrance();
    }
  };

  const cleanup = () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(resizeTimer);
    if (decisionCycleTimer) clearTimeout(decisionCycleTimer);
    decisionTween?.kill();
    entranceTimeline?.kill();
    heroObserver?.disconnect();
    if (heroSection) {
      heroSection.removeEventListener('pointermove', handlePointerMove);
      heroSection.removeEventListener('pointerleave', handlePointerLeave);
    }
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibility);
    reduceMotionQuery.removeEventListener('change', handleMotionPreference);
    window.__heroGraphAnimation = null;
    motionMedia?.revert();
  };

  resize();
  if (!motionAllowed()) draw();

  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);
  reduceMotionQuery.addEventListener('change', handleMotionPreference);
  window.addEventListener('pagehide', cleanup, { once: true });
})();
