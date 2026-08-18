---
name: test-datawarsaw-web
description: Verify DataWarsaw frontend changes in the real running site. Use after HTML, CSS, JavaScript, interaction, responsive, motion, or visualization changes. Treat browser evidence and deterministic checks as the completion signal.
---

# Test DataWarsaw Web

## References
Use the repository checklists as the source of truth:
- `evals/responsive-checklist.md`
- `evals/visual-regression-checklist.md`

## Start
Serve the project from the repository root with a local static server. Prefer:

```bash
python -m http.server 8081
```

Open `http://localhost:8081/#top`.

## Required Viewports
Verify the affected area at:
- 375x667
- 390x844
- 430x932
- 1440x900

## Required Evidence
For affected frontend work, check at minimum:
1. No unintended horizontal overflow: `document.documentElement.scrollWidth === window.innerWidth`.
2. Zero runtime JavaScript errors, unhandled rejections, and unintended resource failures.
3. No clipped text, collisions, or broken interaction in the changed area.
4. Desktop behavior remains stable when the task is mobile-specific.
5. The relevant component checks in `evals/responsive-checklist.md` pass.
6. The relevant visual, motion, accessibility, and fallback checks in `evals/visual-regression-checklist.md` pass.

Capture screenshots when visual comparison materially helps verification.

## Failure Loop
If evidence fails:
- report the exact failing viewport and observation,
- return concise actionable feedback,
- do not claim completion,
- let the Worker retry within the Coordinator's retry budget.

## Stop
Stop the local server when verification is complete if this run started it.

## Output
Return:
- STATUS: pass | fail | blocked
- VIEWPORT RESULTS
- CONSOLE / RUNTIME RESULT
- REGRESSION RESULT
- EVIDENCE
- ACTIONABLE FAILURES: None or a concise list
