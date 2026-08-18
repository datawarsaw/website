---
name: simplify
description: Simplify verified DataWarsaw code without changing behavior. Use after the assigned change works and checks pass, especially when generated code is verbose, duplicated, over-commented, or structurally more complex than necessary.
---

# Simplify

## Preconditions
- The assigned change already satisfies its acceptance criteria.
- Relevant checks have passed.

## Rules
- Preserve behavior.
- Stay inside the current task scope.
- Prefer existing project patterns over new abstractions.
- Remove duplicated logic and derivable state when safe.
- Prefer clear, short names that match the repository vocabulary.
- Keep comments only when they explain a non-obvious constraint or side effect.
- Remove comments that narrate the coding session or merely restate obvious code.
- Do not add compatibility paths for code that has never shipped.
- Do not refactor unrelated areas.

## Verification
After simplifying, rerun the same checks that proved the original implementation worked and inspect the diff.

## Output
Return:
- CHANGES SIMPLIFIED
- BEHAVIOR PRESERVED: yes | no
- CHECKS RERUN
- LIMITATIONS: None or a concise note
