# Benchmark product/UI decisions - Grok 4.5

## Product framing
- Treat the three new sections as analytical instruments, not marketing tiles.
- Keep Ternary-Bonsai-27B honestly local: useful for privacy/offline, not equal in quality.
- Avoid fake live inference. The AI Lab only simulates routing decisions in-browser.

## Scenario design choices
1. AI Workstation Benchmark uses metric-ranked bars plus a score matrix so the leader changes with user priority.
2. Mobile navigation keeps desktop links intact and upgrades the drawer with backdrop, focus return, Escape, and basic focus trapping.
3. Model Comparison Explorer recommends one clear winner per workload and surfaces trade-offs instead of flattening every model.
4. Accessibility pass prioritizes menu semantics, tab/ARIA state, live leader text, and keyboardable controls over cosmetic redesign.
5. My AI Lab explains cloud vs local in plain language and uses a routing playground without implying a backend.

## Top accessibility / quality issues addressed
1. Mobile menu lacked clear state communication, backdrop dismissal, and focus management.
2. New interactive sections needed keyboardable controls and live updates for leaders/recommendations.
3. Risk of implying unavailable live AI backends - mitigated with explicit client-side simulation copy.
