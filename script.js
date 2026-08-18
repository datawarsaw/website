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
    const elements = [...targets].filter(Boolean);
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
    const experienceTitle = experienceMap.querySelector('[data-experience-title]');
    const experienceSummary = experienceMap.querySelector('[data-experience-summary]');
    const experienceTools = experienceMap.querySelector('[data-experience-tools]');
    let selectedExperience = null;

    const showExperience = button => {
      if (!button) {
        experienceKicker.textContent = 'Conceptual map';
        experienceTitle.textContent = 'Analytical expertise';
        experienceSummary.textContent = 'Choose an axis to explore its business context.';
        experienceTools.textContent = 'Power BI · SQL · Python';
      } else {
        experienceKicker.textContent = button.dataset.kicker;
        experienceTitle.textContent = button.dataset.experience;
        experienceSummary.textContent = button.dataset.summary;
        experienceTools.textContent = button.dataset.tools;
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

  const workData = {
    sales: {
      index: '01 / Performance', title: 'Sales Performance',
      question: 'Where is growth coming from — and what is holding it back?',
      analysis: 'Revenue drivers, mix and variance', outcome: 'A clearer commercial priority',
      metricLabel: 'Signal', metric: '+18%', plot: 'plot-bars'
    },
    customer: {
      index: '02 / Behaviour', title: 'Customer Analytics',
      question: 'Which customer groups create value — and where is retention at risk?',
      analysis: 'Segments, cohorts and customer value', outcome: 'A focused retention opportunity',
      metricLabel: 'Retained', metric: '84%', plot: 'plot-scatter'
    },
    digital: {
      index: '03 / Conversion', title: 'Digital Performance',
      question: 'Which journeys and channels turn attention into commercial outcomes?',
      analysis: 'Journey, channel and conversion signals', outcome: 'A sharper growth experiment',
      metricLabel: 'Index', metric: '1.32', plot: 'plot-line'
    }
  };
  const workTabs = [...document.querySelectorAll('[data-work-tab]')];
  const workPanel = document.querySelector('.work-panel');
  if (workTabs.length && workPanel) {
    const workFields = {
      index: workPanel.querySelector('[data-work-index]'), title: workPanel.querySelector('[data-work-title]'),
      question: workPanel.querySelector('[data-work-question]'), analysis: workPanel.querySelector('[data-work-analysis]'),
      outcome: workPanel.querySelector('[data-work-outcome]'), metricLabel: workPanel.querySelector('[data-work-metric-label]'),
      metric: workPanel.querySelector('[data-work-metric]'), plot: workPanel.querySelector('[data-work-plot]')
    };
    let workTimer = 0;
    let workTimeline = null;
    const activateWork = (tab, moveFocus = false) => {
      const data = workData[tab.dataset.workTab];
      if (!data || tab.getAttribute('aria-selected') === 'true') return;
      workTabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      workPanel.setAttribute('aria-labelledby', tab.id);
      if (moveFocus) tab.focus();
      window.clearTimeout(workTimer);
      const updateWork = () => {
        workFields.index.textContent = data.index;
        workFields.title.textContent = data.title;
        workFields.question.textContent = data.question;
        workFields.analysis.textContent = data.analysis;
        workFields.outcome.textContent = data.outcome;
        workFields.metricLabel.textContent = data.metricLabel;
        workFields.metric.textContent = data.metric;
        workFields.plot.className = `work-plot ${data.plot}`;
        workPanel.classList.remove('is-updating');
      };

      if (motionAllowed()) {
        const outgoing = workPanel.querySelectorAll('.work-copy > *, .work-metric > *, .work-plot');
        workTimeline?.kill();
        workTimeline = window.gsap.timeline({ defaults: { ease: 'power2.out' } });
        workTimeline
          .to(outgoing, { autoAlpha: 0, y: -6, duration: .14, stagger: .018, overwrite: true })
          .add(updateWork)
          .fromTo(outgoing,
            { autoAlpha: 0, y: 9 },
            { autoAlpha: 1, y: 0, duration: .4, stagger: .04, clearProps: 'transform,opacity,visibility' }
          )
          .fromTo(workFields.plot.querySelectorAll('i'),
            { scaleY: .45, transformOrigin: 'bottom' },
            { scaleY: 1, duration: .42, stagger: .045, clearProps: 'transform' },
            '<.05'
          );
      } else {
        if (!motionReduced()) workPanel.classList.add('is-updating');
        workTimer = window.setTimeout(updateWork, motionReduced() ? 0 : 150);
      }
    };
    workTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateWork(tab));
      tab.addEventListener('keydown', event => {
        let nextIndex = null;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % workTabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + workTabs.length) % workTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = workTabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          activateWork(workTabs[nextIndex], true);
        }
      });
    });
  }

  const pulse = document.querySelector('[data-pulse]');
  if (pulse) {
    const METRICS = {
      temperature: { label: 'Temperature', unit: '°C', decimals: 1 },
      rain: { label: 'Rain chance', unit: '%', decimals: 0, floor: 0, ceiling: 100 },
      wind: { label: 'Wind at 10 m', unit: 'km/h', decimals: 0, floor: 0 },
      aqi: { label: 'European AQI', unit: 'AQI', decimals: 0, floor: 0, ceilingMin: 60 }
    };
    const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=52.2297&longitude=21.0122&hourly=temperature_2m,precipitation_probability,wind_speed_10m&timezone=Europe%2FWarsaw&forecast_hours=24';
    const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=52.2297&longitude=21.0122&hourly=european_aqi&timezone=Europe%2FWarsaw&forecast_hours=24';
    const svgNS = 'http://www.w3.org/2000/svg';
    const status = pulse.querySelector('[data-pulse-status]');
    const tabs = [...pulse.querySelectorAll('[data-pulse-metric]')];
    const chart = pulse.querySelector('[data-pulse-chart]');
    const svg = pulse.querySelector('[data-pulse-svg]');
    const grid = pulse.querySelector('[data-pulse-grid]');
    const area = pulse.querySelector('[data-pulse-area]');
    const line = pulse.querySelector('[data-pulse-line]');
    const pointsGroup = pulse.querySelector('[data-pulse-points]');
    const axis = pulse.querySelector('[data-pulse-axis]');
    const cursor = pulse.querySelector('[data-pulse-cursor]');
    const hitArea = pulse.querySelector('[data-pulse-hit]');
    const tooltip = pulse.querySelector('[data-pulse-tooltip]');
    const announcement = pulse.querySelector('[data-pulse-announcement]');
    const metricLabel = pulse.querySelector('[data-pulse-metric-label]');
    const liveValue = pulse.querySelector('[data-pulse-live-value]');
    const liveTime = pulse.querySelector('[data-pulse-live-time]');
    const chartTitle = pulse.querySelector('#pulse-chart-title');
    const chartDesc = pulse.querySelector('#pulse-chart-desc');
    const dataOutput = pulse.querySelector('[data-pulse-data]');
    const signalOutput = pulse.querySelector('[data-pulse-signal]');
    const decisionOutput = pulse.querySelector('[data-pulse-decision]');
    const decisionDetail = pulse.querySelector('[data-pulse-decision-detail]');
    const updatedOutput = pulse.querySelector('[data-pulse-updated]');
    let pulseData = null;
    let activeMetric = 'temperature';
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
      const range = `${String(startHour).padStart(2, '0')}:00–${String((startHour + 3) % 24).padStart(2, '0')}:00`;
      const clear = best.penalty === 0;
      const barrier = Object.entries(best.excess).sort((a, b) => b[1] - a[1])[0][0];
      const barrierCopy = {
        rain: 'Rain is the limiting signal, so keep an indoor fallback.',
        aqi: 'Air quality is the limiting signal; consider a shorter, easier plan.',
        wind: 'Wind is the limiting signal, so favour a sheltered route.'
      };
      return {
        index: best.index,
        data: `Rain ≤${Math.round(best.rain)}% · AQI ≤${Math.round(best.aqi)} · Wind ≤${Math.round(best.wind)} km/h`,
        signal: clear ? 'Clear window' : `${barrier === 'aqi' ? 'Air quality' : barrier} friction`,
        decision: clear ? `Head outside ${range}.` : `Use ${range}; keep a backup.`,
        detail: clear ? `The lowest-friction three-hour window that clears every stated threshold. Around ${best.temperature.toFixed(0)}°C.` : `${barrierCopy[barrier]} Around ${best.temperature.toFixed(0)}°C.`
      };
    };

    const metricDomain = values => {
      const config = METRICS[activeMetric];
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const span = Math.max(1, maxValue - minValue);
      const min = config.floor ?? Math.floor(minValue - span * .14);
      const max = config.ceiling ?? Math.max(config.ceilingMin ?? -Infinity, Math.ceil(maxValue + span * .14));
      return { min, max: max === min ? min + 1 : max };
    };

    const formatValue = (value, metric = activeMetric) => {
      const config = METRICS[metric];
      return `${value.toFixed(config.decimals)} ${config.unit}`;
    };

    const renderActivePoint = (index, announce = false) => {
      if (!pulseData) return;
      activeIndex = Math.max(0, Math.min(23, index));
      const value = pulseData[activeMetric][activeIndex];
      const point = pointsGroup.querySelector(`[data-pulse-index="${activeIndex}"]`);
      pulse.querySelectorAll('.pulse-points circle').forEach(item => item.classList.toggle('is-active', item === point));
      const x = 32 + activeIndex * (906 / 23);
      const y = point ? Number(point.getAttribute('cy')) : 24;
      cursor.setAttribute('x1', x);
      cursor.setAttribute('x2', x);
      cursor.classList.add('is-active');
      const timeText = dataTime(pulseData.times[activeIndex], true);
      liveValue.textContent = formatValue(value);
      liveTime.textContent = `${timeText} · Warsaw local time`;
      tooltip.querySelector('span').textContent = timeText;
      tooltip.querySelector('strong').textContent = formatValue(value);
      const tooltipLeft = svg.offsetLeft + x / 960 * svg.clientWidth;
      const tooltipTop = svg.offsetTop + y / 320 * svg.clientHeight;
      tooltip.style.left = `${Math.max(58, Math.min(chart.clientWidth - 58, tooltipLeft))}px`;
      tooltip.style.top = `${Math.max(58, tooltipTop)}px`;
      tooltip.classList.add('is-active');
      if (announce) announcement.textContent = `${METRICS[activeMetric].label}, ${timeText}, ${formatValue(value)}`;
    };

    const renderChart = (metric, animate = false) => {
      if (!pulseData) return;
      activeMetric = metric;
      const values = pulseData[metric];
      const config = METRICS[metric];
      const { min, max } = metricDomain(values);
      const xFor = index => 32 + index * (906 / 23);
      const yFor = value => 24 + (1 - (value - min) / (max - min)) * 254;
      const availableWidth = Math.min(window.innerWidth, chart.clientWidth || window.innerWidth);
      const tickCount = availableWidth < 360 ? 3 : availableWidth < 640 ? 4 : 5;
      const tickIndexes = [...new Set(Array.from({ length: tickCount }, (_, index) => Math.round(index * 23 / (tickCount - 1))))];
      const coordinates = values.map((value, index) => [xFor(index), yFor(value)]);
      const path = coordinates.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
      line.setAttribute('d', path);
      area.setAttribute('d', `${path} L938,278 L32,278 Z`);
      grid.replaceChildren();
      [24,87.5,151,214.5,278].forEach(y => grid.append(createSvgElement('line', { x1: 32, x2: 938, y1: y, y2: y })));
      tickIndexes.forEach(index => grid.append(createSvgElement('line', { x1: xFor(index), x2: xFor(index), y1: 24, y2: 278 })));
      pointsGroup.replaceChildren(...coordinates.map(([x, y], index) => createSvgElement('circle', { cx: x, cy: y, r: 4, 'data-pulse-index': index })));
      axis.replaceChildren(...tickIndexes.map(index => {
        const text = createSvgElement('text', { x: xFor(index), y: 307, 'text-anchor': index === 0 ? 'start' : index === 23 ? 'end' : 'middle' });
        text.textContent = dataTime(pulseData.times[index]);
        return text;
      }));
      metricLabel.textContent = config.label;
      chart.setAttribute('aria-labelledby', `pulse-tab-${metric}`);
      chartTitle.textContent = `${config.label} in Warsaw over the next 24 hours`;
      chartDesc.textContent = `Interactive hourly ${config.label.toLowerCase()} line chart. Use the arrow keys to explore each hour.`;
      renderActivePoint(activeIndex);
      if (animate && motionAllowed()) {
        const length = line.getTotalLength();
        window.gsap.killTweensOf([line, area, ...pointsGroup.children]);
        window.gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: .52, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' });
        window.gsap.fromTo(pointsGroup.children, { autoAlpha: 0, scale: .5, transformOrigin: 'center' }, { autoAlpha: 1, scale: 1, duration: .3, stagger: .012, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
        window.gsap.fromTo(area, { autoAlpha: 0 }, { autoAlpha: 1, duration: .42, clearProps: 'opacity' });
      }
    };

    const animatePulseEntrance = () => {
      if (!motionAllowed()) return;
      const gridLines = [...grid.querySelectorAll('line')];
      const points = [...pointsGroup.children];
      const stages = [...pulse.querySelectorAll('[data-pulse-stage]')];
      const length = line.getTotalLength();
      window.gsap.set(gridLines, { scaleX: 0, transformOrigin: 'left center' });
      window.gsap.set(points, { autoAlpha: 0, scale: 0, transformOrigin: 'center' });
      window.gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
      window.gsap.set(area, { autoAlpha: 0 });
      window.gsap.set(stages, { autoAlpha: 0, y: 12 });
      entranceTimeline = window.gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onStart: () => pulse.classList.add('is-animated') });
      entranceTimeline
        .to(gridLines, { scaleX: 1, duration: .5, stagger: .025, clearProps: 'transform' }, 0)
        .to(points, { autoAlpha: 1, scale: 1, duration: .32, stagger: .018, clearProps: 'transform,opacity,visibility' }, .2)
        .to(line, { strokeDashoffset: 0, duration: .95, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' }, .28)
        .to(area, { autoAlpha: 1, duration: .45, clearProps: 'opacity' }, .72)
        .to(stages, { autoAlpha: 1, y: 0, duration: .48, stagger: .12, clearProps: 'transform,opacity,visibility' }, .76)
        .fromTo(pulse.querySelector('.pulse-decision'), { boxShadow: 'inset 0 0 0 0 rgba(11,21,20,0)' }, { boxShadow: 'inset 0 0 0 6px rgba(11,21,20,.13)', duration: .36, yoyo: true, repeat: 1, clearProps: 'boxShadow' }, 1.15);
      window.ScrollTrigger.create({
        id: 'datawarsaw-pulse-narrative',
        trigger: pulse,
        start: 'top 72%',
        once: true,
        onEnter: () => entranceTimeline?.play()
      });
      window.ScrollTrigger.refresh();
    };

    const setActiveMetric = (tab, moveFocus = false) => {
      const metric = tab.dataset.pulseMetric;
      if (!METRICS[metric] || metric === activeMetric) return;
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      if (moveFocus) tab.focus();
      activeIndex = 0;
      renderChart(metric, pulse.classList.contains('is-animated'));
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setActiveMetric(tab));
      tab.addEventListener('keydown', event => {
        let nextIndex = null;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          setActiveMetric(tabs[nextIndex], true);
        }
      });
    });

    const pointFromPointer = event => {
      const rect = svg.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * 960;
      return Math.round(Math.max(0, Math.min(23, (x - 32) / 906 * 23)));
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
        const decision = computeDecision(pulseData);
        dataOutput.textContent = decision.data;
        signalOutput.textContent = decision.signal;
        decisionOutput.textContent = decision.decision;
        decisionDetail.textContent = decision.detail;
        updatedOutput.textContent = pulseData.degraded.length === 4
          ? 'Illustrative fallback · not live conditions'
          : `Updated ${warsawTime(new Date(), true)} · Warsaw local time`;
        status.classList.toggle('is-fallback', pulseData.degraded.length > 0);
        status.classList.toggle('is-ready', pulseData.degraded.length === 0);
        status.lastChild.textContent = pulseData.degraded.length
          ? ` Fallback used for ${pulseData.degraded.join(', ')}`
          : ' Live forecast · next 24 hours';
        activeIndex = decision.index;
        renderChart(activeMetric);
        animatePulseEntrance();
      } catch (error) {
        pulseData = assemblePulseData(null, null);
        const decision = computeDecision(pulseData);
        dataOutput.textContent = decision.data;
        signalOutput.textContent = decision.signal;
        decisionOutput.textContent = decision.decision;
        decisionDetail.textContent = decision.detail;
        status.classList.add('is-fallback');
        status.lastChild.textContent = ' Fallback dataset · live source unavailable';
        updatedOutput.textContent = 'Illustrative fallback · not live conditions';
        activeIndex = decision.index;
        renderChart(activeMetric);
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
        ...grid.querySelectorAll('line'), ...pointsGroup.children, line, area,
        ...pulse.querySelectorAll('[data-pulse-stage]')
      ], { autoAlpha: 1, scale: 1, y: 0, clearProps: 'transform,opacity,visibility,strokeDasharray,strokeDashoffset' });
    };
    reduceMotionQuery.addEventListener('change', handlePulseMotionPreference);
    window.addEventListener('resize', () => {
      if (pulseData) renderChart(activeMetric);
    }, { passive: true });
    window.addEventListener('pagehide', () => {
      entranceTimeline?.kill();
      window.ScrollTrigger?.getById('datawarsaw-pulse-narrative')?.kill();
      reduceMotionQuery.removeEventListener('change', handlePulseMotionPreference);
    }, { once: true });
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
