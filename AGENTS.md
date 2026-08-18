# Data Warsaw - Project-Specific Agent Instructions

This document contains project-specific guidelines and constraints for the **Data Warsaw** repository. It complements the global routing, specialist model hierarchy, and safety policies defined in the global AGENTS.md.

---

## 1. Visual Identity & Aesthetic Principles

Preserve the existing Data Warsaw visual identity across all features and edits:
- **Color Palette:** Dark graphite background (`#0b0c0e` / `#111215`), crisp acid-lime accent (`#c8ff3d` / `#d5ff70`), muted paper text tones.
- **Typography:** Editorial typography with clear hierarchy, high-contrast headline serif/sans interplay, and monospace technical annotations.
- **Aesthetic:** Analytical, refined, data-driven, restrained elegance.
- **Structure & Spacing:** Strong deliberate whitespace, subtle fine gridlines, technical precision accents, and disciplined layout rhythm.
- **Motion:** Restrained, functional, non-distracting animation that reinforces data narratives.

### Explicit Anti-Patterns (Do NOT Introduce)
- Generic SaaS/dashboard styling or cookie-cutter templates.
- Glassmorphism, blurred heavy backdrop panels, or frosted glass tropes.
- Excessive multi-color gradients or rainbow accents.
- Neon glow, bloom filters, or flashy shader effects.
- Unnecessary card wrappers, heavy borders, or redundant container nesting.
- Gratuitous floating decorative elements or bouncy animations.
- Unsolicited section redesigns or aesthetic drift.

---

## 2. Responsive Design & Layout Standards

### Mandatory Validation Viewports
Always validate responsive behavior across:
- **Mobile (Compact):** 375px width (iPhone SE / compact mobile)
- **Mobile (Standard):** 390px width (iPhone standard)
- **Mobile (Large):** 430px width (iPhone Max / Plus)
- **Desktop:** 1440x900

### Responsive Rules
- **Never treat mobile as simply a scaled-down desktop layout.** Structure layout and information density intentionally per breakpoint.
- **No horizontal overflow:** Ensure document.documentElement.scrollWidth === window.innerWidth across all viewports.
- **Labels & Typography:** No clipped labels, no unreadable microscopic text, and no awkward word breaks.
- **Content Flow:** No overlapping elements, z-index fighting, or accidental collisions.
- **Spacing Stability:** Consistent vertical rhythm without erratic jumps or collapsed padding.
- **Desktop Preservation:** Never compromise or shift the desktop layout unless explicitly requested.

---

## 3. Section-Specific Implementation Rules

### Hero Graph
- Preserve the existing visual identity, composition, lime trajectory curve, scatter points, and central decision node.
- Prefer the existing native Canvas 2D + CSS/GSAP architecture.
- **Do not add Three.js, WebGL, or heavy 3D dependencies** unless there is a clear, proven technical requirement that cannot be met otherwise.
- Keep motion restrained, analytical, and stable (subtle pointer parallax, smooth return-to-neutral on exit).
- Respect prefers-reduced-motion: reduce by rendering a complete, legible static state and disabling loops.

### Experience Map (Radar / Orbit)
- On mobile viewports, keep the radar circle visually centered in the container.
- Ensure center content and active metric displays remain legible and unobstructed.
- Avoid excessive dead vertical space or large layout gaps on narrow screens.
- Preserve precise graph-to-label alignment.
- Prevent text clipping, badge truncation, and bounding-box overflow.

### Point of View & Process
- Maintain the canonical four-step narrative sequence:
  1. 01 Understand
  2. 02 Explore
  3. 03 Explain
  4. 04 Decide
- On mobile, ensure step markers remain visually connected to their corresponding content blocks.
- Maintain a tight, coherent vertical rhythm.
- Prevent desktop multi-column or horizontal timeline spacing patterns from leaking into mobile layouts.

### Warsaw Conditions / Weather (Data Pulse)
- Preserve the Open-Meteo API integration logic and resilient fallback behavior.
- Adapt X-axis timeline tick density dynamically to the available screen width (fewer ticks on narrow mobile).
- Derive all timeline timestamps directly from actual forecast data series.
- Prevent axis label clipping, graph overlap, or unreadable metric overlays.
- Prioritize mobile readability and touch ergonomics.
- **Do not introduce heavy external charting libraries** (e.g. Chart.js, D3) unless technically essential.

---

## 4. Engineering & Change Discipline

- **Inspect Before Editing:** Read and analyze existing code, canvas setups, and CSS rules before modifying.
- **Smallest Robust Solution:** Prefer targeted, clean, minimal interventions over broad rewrites.
- **Root-Cause Focus:** Fix underlying layout/rendering flaws rather than stacking arbitrary one-off CSS overrides or !important hacks.
- **Inspect Diffs:** Check recent diffs and git status when troubleshooting or iterating.
- **Scope Isolation:** Never modify unrelated sections or rewrite shared styles without necessity.

### Mandatory Repository Preflight

Before any agent edits files, it must establish the real repository state instead of assuming the local checkout is current.

1. Inspect the current branch and working tree.
2. Fetch remote refs from `origin`.
3. Confirm the intended branch exists locally or on `origin`.
4. Switch to the intended branch; if it exists only remotely, create a local tracking branch from that remote branch.
5. Verify the local branch is tracking the expected remote branch and inspect recent commits.
6. Verify the working tree is clean, or explicitly preserve and report any pre-existing dirty state before proceeding.
7. Never create a same-named branch from stale local `main` when `origin/<branch>` already exists.
8. Never modify `main` unless the task explicitly requires it and the user has approved that scope.

Recommended baseline sequence when remote access is available:

```bash
git status --short --branch
git fetch origin
git branch -a
git log --oneline --decorate --all -15
```

Then switch to the intended existing branch and verify:

```bash
git status --short --branch
git log --oneline --decorate -10
```

If the remote cannot be reached, stop and report that repository freshness could not be verified rather than silently assuming local state is authoritative.

---

## 5. Testing & Verification Checklist

Before finalizing any task, verify:
1. **Viewports:** Validated at 375px, 390px, 430px, and 1440x900.
2. **Console Errors:** Zero runtime JS errors, unhandled rejections, or network failures.
3. **Horizontal Overflow:** Zero unintended horizontal scrollbars on all screen sizes.
4. **Layout Shifts:** No erratic jumps, flashing elements, or layout reflows during load or interaction.
5. **Loading & Fallbacks:** Graceful degradation and fallback states render properly.
6. **Scope Integrity:** All untouched sections remain visually and functionally intact.

---

## 6. Worker / Subagent Completion Report Format

When completing tasks, return a concise structured summary containing:
- **ROOT CAUSE / GOAL:** Concise statement of the problem or task.
- **FILES CHANGED:** List of modified file paths.
- **IMPLEMENTATION APPROACH:** Key technical decisions and changes made.
- **TESTS PERFORMED:** Concrete validation steps and viewports tested.
- **REMAINING LIMITATIONS:** Any known caveats or follow-up items (or "None").

---

## Durable Project Memory

After completing work that creates durable project knowledge, update the relevant documentation file only when necessary.

Use:

- architectural decision -> docs/decisions.md
- confirmed failure or root cause -> docs/failures-and-lessons.md
- architecture change -> docs/architecture.md
- responsive/design rule -> docs/responsive-guidelines.md or docs/design-system.md
- data-source change -> docs/data-sources.md
- completed or planned milestone -> docs/roadmap.md

- Do not update documentation for trivial edits.
- Do not save conversation transcripts, temporary debugging chatter, speculative guesses, credentials, passwords, API keys, tokens.
- Keep documentation concise.
- The repository should act as durable project memory for future agents and sessions.
