# White Gull Closeout Contract

This repository follows the White Gull AI Lab closeout rules.

## Scope freeze

Once a task becomes active, keep the agreed scope fixed. A newly discovered improvement does not extend the current task unless it is required to satisfy the acceptance criteria or fixes a regression introduced by the current work. Otherwise, capture it in the White Gull AI Lab Notion backlog or RADAR and continue closing the current task.

## Definition of Done

A task is complete only when all applicable items are true:

1. The agreed outcome is implemented for the frozen scope.
2. The result is verified with the appropriate tests/checks. Production-facing work is verified in production when feasible; localhost-only evidence is not enough to claim a production outcome.
3. Git status/diff is inspected and unrelated pre-existing changes are preserved and excluded.
4. Task-specific work is persisted in Git (commit/push/PR/merge as appropriate for the repository workflow).
5. Durable technical knowledge is updated when the task changes architecture, runtime/deployment, integrations, important configuration, security boundaries, data model, verified capabilities, known limitations, or a significant milestone.
6. Project-management state is updated in White Gull AI Lab Notion when access is available. Notion is the backlog/status source of truth; the repository is the technical source of truth.
7. Any required manual action is explicit.
8. A concise closeout/handover is produced and `CAN_ARCHIVE` is decided.

Do not update durable state files for routine commits, small visual fixes, typo changes, or transient debugging details.

## Durable state

Use the repository's existing project-state/architecture/decision documentation. If `state/project-state.md` exists, update it only for meaningful project-state changes. Do not turn it into a task backlog; backlog and priority belong in Notion.

## Completion states

- `COMPLETE` — outcome implemented, verified and persisted; no required manual action remains.
- `RESEARCH_COMPLETE` — the research question is answered and a bounded decision/output is recorded; implementation is not required for this task.
- `WAITING_FOR_USER` — agent work is complete but a required manual/user action remains.
- `BLOCKED` — a technical/environmental blocker prevents completion.
- `PARKED` — work is intentionally stopped and a restart trigger is recorded.

Only `COMPLETE` and `RESEARCH_COMPLETE` normally imply `CAN_ARCHIVE: YES`.

## Required closeout report

End meaningful tasks with:

```text
STATUS: COMPLETE | RESEARCH_COMPLETE | WAITING_FOR_USER | BLOCKED | PARKED

TASK
<one sentence>

RESULT
<what was actually achieved>

GIT
Branch: <...>
Commit: <... or NONE>
Pushed: YES/NO/N/A
PR/Merge: <... or N/A>

VALIDATION
- <concrete checks>

PROJECT_STATE_UPDATED
YES/NO
Files: <paths or NONE>

NOTION_UPDATED
YES/NO/NO_ACCESS
Item/status: <...>

MANUAL_ACTION_REQUIRED
NONE
or
- <action>

CAN_ARCHIVE
YES/NO

NEXT
<one next task or NONE>
```

## Milestones

A long-lived project can remain active while individual milestones close. Do not keep a completed milestone open merely because more improvements are possible. Improvements become new backlog items/tasks.
