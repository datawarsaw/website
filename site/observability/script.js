/**
 * DataWarsaw · AI Workstation Live Observability Console (V2.0 - Cloudflare Native)
 * Vanilla JS client with Cloudflare API endpoint, static fallback, adaptive polling,
 * visibility change detection, state diffing, and dynamic elapsed timers.
 */

(function () {
  'use strict';

  const PRIMARY_DATA_URL = '/api/telemetry';
  const FALLBACK_DATA_URL = '../data/current-run.json';
  const ROOT_FALLBACK_DATA_URL = '/data/current-run.json';

  const POLL_INTERVAL_ACTIVE_MS = 2000;  // ~2s while running
  const POLL_INTERVAL_IDLE_MS = 10000;   // ~10s while idle / complete / failed

  // DOM Cache
  const globalStatusPill = document.querySelector('[data-global-status-pill]');
  const globalStatusText = document.querySelector('[data-global-status-text]');
  const runTaskEl = document.querySelector('[data-run-task]');
  const runStatusBadge = document.querySelector('[data-run-status-badge]');
  const runElapsedEl = document.querySelector('[data-run-elapsed]');
  const runHarnessInfo = document.querySelector('[data-run-harness-info]');
  const alertBox = document.querySelector('[data-obs-alert]');
  const flowContainer = document.querySelector('[data-flow-container]');

  const activityIndicator = document.querySelector('[data-activity-indicator]');
  const actRoleEl = document.querySelector('[data-act-role]');
  const actModelEl = document.querySelector('[data-act-model]');
  const actDescEl = document.querySelector('[data-act-desc]');
  const actStartedEl = document.querySelector('[data-act-started]');
  const actElapsedEl = document.querySelector('[data-act-elapsed]');

  const eventCountEl = document.querySelector('[data-event-count]');
  const eventListEl = document.querySelector('[data-event-list]');

  // Inspector Modal DOM
  const inspectorEl = document.querySelector('[data-node-inspector]');
  const insRoleEl = document.querySelector('[data-ins-role]');
  const insTitleEl = document.querySelector('[data-ins-title]');
  const insModelEl = document.querySelector('[data-ins-model]');
  const insStatusEl = document.querySelector('[data-ins-status]');
  const insDurationEl = document.querySelector('[data-ins-duration]');
  const insSummaryEl = document.querySelector('[data-ins-summary]');
  const inspectorCloses = document.querySelectorAll('[data-inspector-close]');

  let lastPayloadHash = '';
  let currentRunData = null;
  let activeStepStartedAt = null;
  let runStartedAt = null;
  let pollTimeoutId = null;

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function formatSeconds(totalSec) {
    if (isNaN(totalSec) || totalSec < 0) totalSec = 0;
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  }

  function formatTimestampTime(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoStr;
    }
  }

  function getStatusClass(status) {
    if (!status) return 'status-pending';
    const s = status.toLowerCase();
    if (s === 'running') return 'status-running';
    if (s === 'complete' || s === 'pass') return 'status-complete';
    if (s === 'blocked' || s === 'failed') return 'status-blocked';
    return 'status-pending';
  }

  function getNodeItemClass(status) {
    if (!status) return 'is-pending';
    const s = status.toLowerCase();
    if (s === 'running') return 'is-running';
    if (s === 'complete' || s === 'pass') return 'is-complete';
    if (s === 'blocked' || s === 'failed') return 'is-blocked';
    return 'is-pending';
  }

  // --------------------------------------------------------------------------
  // Inspector Modal
  // --------------------------------------------------------------------------
  function openInspector(step) {
    if (!inspectorEl || !step) return;
    if (insRoleEl) insRoleEl.textContent = step.role || 'AGENT';
    if (insTitleEl) insTitleEl.textContent = (step.role || 'Step') + ' Telemetry Details';
    if (insModelEl) insModelEl.textContent = step.model || 'Standard Harness Model';
    if (insStatusEl) insStatusEl.textContent = step.status || 'PENDING';
    if (insDurationEl) insDurationEl.textContent = step.duration || (step.status === 'RUNNING' ? 'Running now...' : '—');
    if (insSummaryEl) insSummaryEl.textContent = step.summary || step.activity || 'No detailed summary recorded for this step.';

    inspectorEl.classList.remove('is-hidden');
  }

  function closeInspector() {
    if (inspectorEl) inspectorEl.classList.add('is-hidden');
  }

  inspectorCloses.forEach(btn => btn.addEventListener('click', closeInspector));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeInspector();
  });

  // --------------------------------------------------------------------------
  // Flow Graph Node Builder
  // --------------------------------------------------------------------------
  function createNodeElement(step) {
    const btn = document.createElement('div');
    btn.className = 'flow-node-item ' + getNodeItemClass(step.status);
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', (step.role || 'Step') + ' - Status: ' + (step.status || 'PENDING'));

    const timingStr = step.duration ? step.duration : (step.status === 'RUNNING' ? 'Active' : '—');
    const summaryStr = step.activity || step.summary || (step.status === 'PENDING' ? 'Waiting in pipeline queue...' : 'Execution step');

    btn.innerHTML = `
      <div class="node-top-row">
        <span class="node-role-badge">${escapeHtml(step.role || 'Step')}</span>
        <span class="node-model-tag">${escapeHtml(step.model || 'Antigravity')}</span>
        <span class="node-status-badge ${getStatusClass(step.status)}">${escapeHtml(step.status || 'PENDING')}</span>
      </div>
      <p class="node-summary-text">${escapeHtml(summaryStr)}</p>
      <div class="node-bottom-row">
        <span class="node-id">id: ${escapeHtml(step.id || '')}</span>
        <span class="node-timing">Duration: <strong>${escapeHtml(timingStr)}</strong></span>
      </div>
    `;

    btn.addEventListener('click', () => openInspector(step));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openInspector(step);
      }
    });

    return btn;
  }

  function createConnector() {
    const div = document.createElement('div');
    div.className = 'flow-connector';
    div.innerHTML = `
      <span class="flow-connector-line"></span>
      <span class="flow-connector-arrow" aria-hidden="true">▼</span>
    `;
    return div;
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  function renderFlowSteps(steps) {
    if (!flowContainer) return;

    const groups = [];
    let index = 0;

    while (index < steps.length) {
      const step = steps[index];
      if ((step.id || '').startsWith('scout-')) {
        const scouts = [];
        while (index < steps.length && (steps[index].id || '').startsWith('scout-')) {
          scouts.push(steps[index]);
          index += 1;
        }
        groups.push({ type: 'scouts', steps: scouts });
      } else {
        groups.push({ type: 'single', steps: [step] });
        index += 1;
      }
    }

    groups.forEach((group, groupIndex) => {
      if (group.type === 'scouts' && group.steps.length > 1) {
        const parallelRow = document.createElement('div');
        parallelRow.className = 'flow-parallel-row';
        group.steps.forEach(step => parallelRow.appendChild(createNodeElement(step)));
        flowContainer.appendChild(parallelRow);
      } else {
        flowContainer.appendChild(createNodeElement(group.steps[0]));
      }

      if (groupIndex < groups.length - 1) {
        flowContainer.appendChild(createConnector());
      }
    });
  }

  // --------------------------------------------------------------------------
  // Render Full Dashboard State
  // --------------------------------------------------------------------------
  function renderDashboard(data) {
    currentRunData = data;
    const status = (data.status || 'IDLE').toUpperCase();
    const now = Date.now();
    const updatedTime = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
    const isStale = (status === 'RUNNING' && updatedTime > 0 && (now - updatedTime) > 300000);
    const displayStatus = isStale ? 'STALE' : status;

    // 1. Header status & task
    if (globalStatusPill) {
      globalStatusPill.className = 'obs-status-pill ' + (
        isStale ? 'is-stale' : (
          status === 'RUNNING' ? 'is-running' : (
            status === 'COMPLETE' ? 'is-complete' : (
              status === 'BLOCKED' || status === 'FAILED' ? 'is-blocked' : 'is-idle'
            )
          )
        )
      );
    }
    if (globalStatusText) globalStatusText.textContent = isStale ? 'STALE (NO HEARTBEAT)' : displayStatus;
    if (runTaskEl) runTaskEl.textContent = data.task || 'No active task';
    if (runStatusBadge) {
      runStatusBadge.textContent = isStale ? 'STALE' : status;
      runStatusBadge.className = 'obs-meta-status-badge ' + (isStale ? 'status-stale' : getStatusClass(status));
    }
    if (runHarnessInfo) {
      const flowLabel = data.flow ? ' · ' + data.flow : '';
      runHarnessInfo.textContent = (data.branch || 'agent-harness-v1') + ' · ' + (data.harness || 'Antigravity V1.1') + flowLabel;
    }

    runStartedAt = data.startedAt ? new Date(data.startedAt) : null;
    if (runElapsedEl && runStartedAt && data.endedAt && status !== 'RUNNING') {
      const end = new Date(data.endedAt);
      runElapsedEl.textContent = formatSeconds((end.getTime() - runStartedAt.getTime()) / 1000);
    }

    // 2. Flow Graph Rendering
    if (flowContainer) {
      flowContainer.innerHTML = '';
      const steps = data.steps || [];

      if (status === 'IDLE' && steps.length === 0) {
        flowContainer.innerHTML = `
          <div class="obs-idle-state">
            <span class="obs-status-dot"></span>
            <strong>AI Workstation Standby</strong>
            <p>No active tasks currently executing in the harness. Standing by for task dispatch.</p>
          </div>
        `;
      } else if (steps.length === 0) {
        flowContainer.innerHTML = `
          <div class="obs-idle-state">
            <strong>Run initialized</strong>
            <p>Waiting for the Coordinator to publish the first execution step.</p>
          </div>
        `;
      } else {
        renderFlowSteps(steps);
      }
    }

    // 3. Current Live Activity
    const act = data.currentActivity;
    if (act && status === 'RUNNING') {
      if (activityIndicator) {
        activityIndicator.textContent = 'ACTIVE';
        activityIndicator.style.display = 'inline-block';
      }
      if (actRoleEl) actRoleEl.textContent = act.role || 'Worker';
      if (actModelEl) actModelEl.textContent = act.model || 'Default Model';
      if (actDescEl) actDescEl.textContent = act.activity || 'Executing subagent task...';
      if (actStartedEl) actStartedEl.textContent = formatTimestampTime(act.startedAt);
      activeStepStartedAt = act.startedAt ? new Date(act.startedAt) : null;
    } else {
      if (activityIndicator) {
        activityIndicator.textContent = status;
      }
      if (actRoleEl) actRoleEl.textContent = status === 'COMPLETE' ? 'Verification' : 'Standby';
      if (actModelEl) actModelEl.textContent = 'Harness Idle';
      if (actDescEl) {
        if (status === 'COMPLETE') {
          actDescEl.textContent = 'Task completed successfully and all verification checks passed.';
        } else if (status === 'BLOCKED') {
          actDescEl.textContent = 'Task execution blocked. Awaiting coordinator review.';
        } else if (status === 'FAILED') {
          actDescEl.textContent = 'Task execution failed. Review the event stream for the failure point.';
        } else {
          actDescEl.textContent = 'Workstation is idle. No subagent actively running.';
        }
      }
      if (actStartedEl) actStartedEl.textContent = '—';
      if (actElapsedEl) actElapsedEl.textContent = '00:00:00';
      activeStepStartedAt = null;
    }

    // 4. Events Stream
    const events = data.events || [];
    if (eventCountEl) eventCountEl.textContent = events.length + ' events';
    if (eventListEl) {
      eventListEl.innerHTML = '';
      if (events.length === 0) {
        eventListEl.innerHTML = '<li class="event-empty">No events recorded.</li>';
      } else {
        events.slice().reverse().forEach(ev => {
          const li = document.createElement('li');
          li.className = 'obs-event-row';

          let typeClass = 'is-start';
          if (ev.type.includes('COMPLETED') || ev.type.includes('PASS') || ev.type.includes('COMPLETE')) typeClass = 'is-done';
          if (ev.type.includes('FAILED') || ev.type.includes('BLOCKED')) typeClass = 'is-fail';

          li.innerHTML = `
            <span class="event-time">${escapeHtml(ev.timestamp || '')}</span>
            <span class="event-type-badge ${typeClass}">${escapeHtml(ev.type || 'EVENT')}</span>
            <span class="event-label-text">${escapeHtml(ev.label || '')}</span>
          `;
          eventListEl.appendChild(li);
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // 1-Second Timer Loop (Client-side elapsed calculations)
  // --------------------------------------------------------------------------
  function tickTimer() {
    const now = new Date().getTime();

    if (runStartedAt && currentRunData && currentRunData.status === 'RUNNING') {
      const elapsedSec = (now - runStartedAt.getTime()) / 1000;
      if (runElapsedEl) runElapsedEl.textContent = formatSeconds(elapsedSec);
    }

    if (activeStepStartedAt && actElapsedEl && currentRunData && currentRunData.status === 'RUNNING') {
      const stepSec = (now - activeStepStartedAt.getTime()) / 1000;
      actElapsedEl.textContent = formatSeconds(stepSec);
    }
  }

  setInterval(tickTimer, 1000);

  // --------------------------------------------------------------------------
  // Adaptive Polling & Fallback Loop
  // --------------------------------------------------------------------------
  function scheduleNextPoll(delayMs) {
    if (pollTimeoutId) clearTimeout(pollTimeoutId);
    if (!document.hidden) {
      pollTimeoutId = setTimeout(fetchTelemetry, delayMs);
    }
  }

  async function fetchTelemetry(immediate) {
    if (document.hidden && !immediate) return;

    let nextInterval = POLL_INTERVAL_IDLE_MS;

    try {
      let data = null;
      let rawText = '';

      // 1. Try Primary Cloudflare API endpoint
      try {
        const res = await fetch(PRIMARY_DATA_URL, { cache: 'no-store' });
        if (res.ok) {
          rawText = await res.text();
          if (rawText && rawText.trim()) {
            const parsed = JSON.parse(rawText);
            if (parsed && typeof parsed === 'object' && parsed.taskId && !parsed.fallback) {
              data = parsed;
            }
          }
        }
      } catch {
        // API unreachable, fall through to static snapshot
      }

      // 2. If API has no data or failed, try static snapshot fallback
      if (!data) {
        try {
          let fbRes = await fetch(FALLBACK_DATA_URL, { cache: 'no-store' });
          if (!fbRes.ok) {
            fbRes = await fetch(ROOT_FALLBACK_DATA_URL, { cache: 'no-store' });
          }
          if (fbRes.ok) {
            rawText = await fbRes.text();
            if (rawText && rawText.trim()) {
              data = JSON.parse(rawText);
            }
          }
        } catch {
          // Static fallback failed as well
        }
      }

      // 3. Render or suppress based on payload hash
      if (data) {
        if (rawText !== lastPayloadHash) {
          lastPayloadHash = rawText;
          renderDashboard(data);
        }
        if (alertBox) alertBox.classList.add('is-hidden');

        // Adaptive interval: 2s while running, 10s when idle/complete/failed
        const status = (data.status || '').toUpperCase();
        nextInterval = (status === 'RUNNING') ? POLL_INTERVAL_ACTIVE_MS : POLL_INTERVAL_IDLE_MS;
      } else {
        if (alertBox) alertBox.classList.remove('is-hidden');
        if (globalStatusText && (!currentRunData || currentRunData.status === 'IDLE')) {
          globalStatusText.textContent = 'STANDBY';
        }
        nextInterval = POLL_INTERVAL_IDLE_MS;
      }
    } catch {
      if (alertBox) alertBox.classList.remove('is-hidden');
      nextInterval = POLL_INTERVAL_IDLE_MS;
    } finally {
      scheduleNextPoll(nextInterval);
    }
  }

  // Handle visibility changes to pause/resume polling
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (pollTimeoutId) clearTimeout(pollTimeoutId);
    } else {
      fetchTelemetry(true);
    }
  });

  // Start polling
  fetchTelemetry(true);
})();
