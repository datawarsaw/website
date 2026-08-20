import fs from 'node:fs';

class HTMLElement {
  constructor(tag) {
    this.tagName = tag;
    this.innerHTML = '';
    this.textContent = '';
    this.hidden = false;
    this.dataset = {};
    this.classList = {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    };
    this.children = [];
    this._listeners = {};
  }
  addEventListener(event, fn) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(fn);
  }
  click() {
    (this._listeners['click'] || []).forEach(fn => fn());
  }
  querySelectorAll(selector) {
    if (selector === '.exp-card') {
      const matches = [];
      const regex = /<article class="exp-card([^"]*)" data-category="([^"]*)">([\s\S]*?)<\/article>/g;
      let m;
      while ((m = regex.exec(this.innerHTML)) !== null) {
        const el = new HTMLElement('article');
        el.className = 'exp-card' + m[1];
        el.dataset.category = m[2];
        matches.push(el);
      }
      return matches;
    }
    return [];
  }
}

async function runScenario(scenarioName, mockFetch) {
  const grid = new HTMLElement('div');
  const countLabel = new HTMLElement('span');
  const filterButtons = [
    Object.assign(new HTMLElement('button'), { dataset: { filter: 'all' }, classList: { _classes: new Set(['is-active']), add(c){this._classes.add(c)}, remove(c){this._classes.delete(c)}, contains(c){return this._classes.has(c)} } }),
    Object.assign(new HTMLElement('button'), { dataset: { filter: 'Edge Agent' }, classList: { _classes: new Set(), add(c){this._classes.add(c)}, remove(c){this._classes.delete(c)}, contains(c){return this._classes.has(c)} } }),
    Object.assign(new HTMLElement('button'), { dataset: { filter: 'Orchestration' }, classList: { _classes: new Set(), add(c){this._classes.add(c)}, remove(c){this._classes.delete(c)}, contains(c){return this._classes.has(c)} } })
  ];

  const documentMock = {
    querySelector(sel) {
      if (sel === '[data-exp-grid]') return grid;
      if (sel === '[data-exp-count]') return countLabel;
      if (sel === '[data-filter].is-active') return filterButtons.find(b => b.classList.contains('is-active'));
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '[data-filter]') return filterButtons;
      return [];
    }
  };

  const scriptCode = fs.readFileSync('site/experiments/script.js', 'utf-8');
  const testFn = new Function('document', 'fetch', scriptCode);
  testFn(documentMock, mockFetch);

  for (let i = 0; i < 50; i++) {
    if (grid.innerHTML.length > 0) break;
    await new Promise(r => setTimeout(r, 10));
  }
  return { grid, countLabel, filterButtons };
}

async function runAllTests() {
  const snapshotData = JSON.parse(fs.readFileSync('site/data/sanity-experiments.json', 'utf-8'));
  const fallbackData = JSON.parse(fs.readFileSync('site/experiments/experiments.json', 'utf-8'));

  console.log('=== Running Experiments Runtime Test Suite ===');

  // Test 1: Normal Primary Load (Sanity Snapshot with 1 experiment)
  {
    const fetchCalls = [];
    const mockFetch = async (url) => {
      fetchCalls.push(url);
      if (url === '/data/sanity-experiments.json') {
        return { ok: true, json: async () => snapshotData };
      }
      throw new Error('Fallback should not be called');
    };
    const { grid, countLabel, filterButtons } = await runScenario('Primary Load', mockFetch);
    if (!fetchCalls.includes('/data/sanity-experiments.json') || fetchCalls.length !== 1) {
      throw new Error('Test 1 Failed: primary fetch not called exactly once');
    }
    if (!grid.innerHTML.includes('Scout — Autonomous Intelligence for X Bookmarks')) {
      throw new Error('Test 1 Failed: Scout title not rendered');
    }
    if (!grid.innerHTML.includes('Antigravity Multi-Agent Orchestration &amp; Telemetry')) {
      throw new Error('Test 1 Failed: Antigravity title not rendered');
    }
    if (!grid.innerHTML.includes('Power BI + AI Semantic Analyst')) {
      throw new Error('Test 1 Failed: Semantic Assistant title not rendered');
    }
    if (!grid.innerHTML.includes('is-featured')) {
      throw new Error('Test 1 Failed: is-featured class missing');
    }
    if (!grid.innerHTML.includes('Trigger Frequency: <strong>Every 5 Minutes</strong>')) {
      throw new Error('Test 1 Failed: Formatted metrics not rendered');
    }
    if (countLabel.textContent !== 'Showing 3 experiments') {
      throw new Error('Test 1 Failed: countLabel was ' + countLabel.textContent);
    }
    console.log('  [PASS] Test 1: Primary Snapshot (/data/sanity-experiments.json) loaded all 3 experiments correctly');

    // Test 1b: Filter Test
    const edgeAgentBtn = filterButtons.find(b => b.dataset.filter === 'Edge Agent');
    edgeAgentBtn.click();
    if (countLabel.textContent !== 'Showing 1 experiment') {
      throw new Error('Test 1b Failed: Edge Agent filter count');
    }
    const orchBtn = filterButtons.find(b => b.dataset.filter === 'Orchestration');
    orchBtn.click();
    if (countLabel.textContent !== 'Showing 1 experiment') {
      throw new Error('Test 1b Failed: Orchestration filter count');
    }
    console.log('  [PASS] Test 1b: Category filters (Edge Agent, Orchestration) work as expected');
  }

  // Test 2: Authoritative Empty Snapshot []
  {
    const fetchCalls = [];
    const mockFetch = async (url) => {
      fetchCalls.push(url);
      if (url === '/data/sanity-experiments.json') {
        return { ok: true, json: async () => [] };
      }
      throw new Error('Fallback should not be called for valid []');
    };
    const { grid, countLabel } = await runScenario('Empty Snapshot', mockFetch);
    if (fetchCalls.length !== 1 || fetchCalls[0] !== '/data/sanity-experiments.json') {
      throw new Error('Test 2 Failed: fallback was called unexpectedly on []');
    }
    if (!grid.innerHTML.includes('No experiments are currently published')) {
      throw new Error('Test 2 Failed: Empty state message missing');
    }
    if (countLabel.textContent !== 'Showing 0 experiments') {
      throw new Error('Test 2 Failed: countLabel on empty was ' + countLabel.textContent);
    }
    console.log('  [PASS] Test 2: Valid empty array [] does NOT trigger fallback and renders clean empty state');
  }

  // Test 3: Missing Primary (404) -> Triggers Fallback
  {
    const fetchCalls = [];
    const mockFetch = async (url) => {
      fetchCalls.push(url);
      if (url === '/data/sanity-experiments.json') {
        return { ok: false, status: 404 };
      }
      if (url === '/experiments/experiments.json') {
        return { ok: true, json: async () => fallbackData };
      }
      throw new Error('Unknown url ' + url);
    };
    const { grid, countLabel } = await runScenario('404 Fallback', mockFetch);
    if (fetchCalls.length !== 2 || fetchCalls[1] !== '/experiments/experiments.json') {
      throw new Error('Test 3 Failed: fallback not invoked on 404');
    }
    if (!grid.innerHTML.includes('Antigravity Multi-Agent Orchestration &amp; Telemetry')) {
      throw new Error('Test 3 Failed: Fallback content not rendered');
    }
    if (countLabel.textContent !== 'Showing 3 experiments') {
      throw new Error('Test 3 Failed: countLabel was ' + countLabel.textContent);
    }
    console.log('  [PASS] Test 3: Missing primary snapshot (404) triggers fallback (/experiments/experiments.json)');
  }

  // Test 4: Invalid JSON in Primary -> Triggers Fallback
  {
    const fetchCalls = [];
    const mockFetch = async (url) => {
      fetchCalls.push(url);
      if (url === '/data/sanity-experiments.json') {
        return {
          ok: true,
          json: async () => { throw new Error('Unexpected token < in JSON at position 0'); }
        };
      }
      if (url === '/experiments/experiments.json') {
        return { ok: true, json: async () => fallbackData };
      }
      throw new Error('Unknown url ' + url);
    };
    const { grid } = await runScenario('Invalid JSON Fallback', mockFetch);
    if (!grid.innerHTML.includes('Antigravity Multi-Agent Orchestration &amp; Telemetry')) {
      throw new Error('Test 4 Failed: Fallback content not rendered on invalid JSON');
    }
    console.log('  [PASS] Test 4: Invalid JSON in primary triggers fallback');
  }

  // Test 5: Structurally Invalid Record in Primary -> Triggers Fallback
  {
    const fetchCalls = [];
    const mockFetch = async (url) => {
      fetchCalls.push(url);
      if (url === '/data/sanity-experiments.json') {
        return {
          ok: true,
          json: async () => [{ corrupted: true }]
        };
      }
      if (url === '/experiments/experiments.json') {
        return { ok: true, json: async () => fallbackData };
      }
      throw new Error('Unknown url ' + url);
    };
    const { grid } = await runScenario('Corrupted Record Fallback', mockFetch);
    if (!grid.innerHTML.includes('Antigravity Multi-Agent Orchestration &amp; Telemetry')) {
      throw new Error('Test 5 Failed: Fallback content not rendered on corrupted record');
    }
    console.log('  [PASS] Test 5: Structurally invalid records in primary trigger fallback');
  }

  // Test 6: Both Primary and Fallback Fail -> Clean Error State
  {
    const mockFetch = async () => ({ ok: false, status: 500 });
    const { grid, countLabel } = await runScenario('Total Failure', mockFetch);
    if (!grid.innerHTML.includes('The experiment registry is temporarily unavailable')) {
      throw new Error('Test 6 Failed: Error state message missing');
    }
    if (countLabel.textContent !== 'Registry unavailable') {
      throw new Error('Test 6 Failed: countLabel on total failure was ' + countLabel.textContent);
    }
    console.log('  [PASS] Test 6: Total failure renders clean unavailable message');
  }

  console.log('\nALL 6 RUNTIME SCENARIOS PASSED.');
}

runAllTests().catch(err => {
  console.error(err);
  process.exit(1);
});
