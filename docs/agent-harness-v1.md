# DataWarsaw Agent Harness V1

## Goal
Build a small, observable AI development workflow before introducing a larger multi-agent graph.

V1 optimizes for reliability, context isolation, bounded retries, and evidence-based completion.

## Architecture

```text
User
  <-> Coordinator
          |
          +-> Scout   (optional, read-only, fresh context)
          |
          +-> Worker  (scoped implementation)
                   |
                   v
             Verification
                   |
             pass / fail
              |      |
             done  feedback -> Worker
```

## Agent Contracts

- `agents/coordinator.md` — owns routing, user approvals, retry budget, and final result.
- `agents/scout.md` — performs narrow read-only investigation and returns compact findings.
- `agents/worker.md` — implements one scoped change and must provide verification evidence.

Only the Coordinator may delegate in V1. Scout and Worker are leaf agents and must not spawn additional agents.

## Skills

- `skills/planning-grill/` — resolves meaningful ambiguity before implementation.
- `skills/test-datawarsaw-web/` — verifies the real site against project QA checklists and required viewports.
- `skills/simplify/` — reduces unnecessary complexity only after the implementation already works.

Skills are capabilities, not agents. Load them only when the current task needs them.

## State

V1 uses simple JSON artifacts instead of a database or vector store:

- `state/task.example.json` — task contract template.
- `state/progress.example.json` — resumable progress/checkpoint template.

For real work, create task-specific state outside the example files or in a future ignored runtime directory. Do not commit credentials, secrets, or transient conversation history.

## Verification Loop

Default implementation loop:

1. Coordinator defines the scoped task contract.
2. Scout runs only when focused discovery would reduce uncertainty.
3. Worker inspects and implements the smallest robust change.
4. `test-datawarsaw-web` gathers deterministic/browser evidence.
5. On failure, return concise actionable evidence to the Worker.
6. Retry within the task retry budget; default maximum is two implementation retries.
7. On pass, optionally run `simplify`, then rerun the same verification.
8. Coordinator returns the final result to the user.

Success is proven by evidence, not by a model declaring that work is complete.

## Concurrency

Keep V1 conservative:
- Prefer one leaf agent at a time.
- Maximum two concurrent leaf agents only when assignments are independent.
- Do not duplicate investigations.

## Not in V1

Deliberately deferred until real task traces justify them:
- full graph orchestration,
- recursive delegation,
- seven permanent specialist agents,
- automatic cross-provider model routing,
- large memory/RAG systems,
- broad parallel agent teams,
- plugin packaging.

## Next Validation

The next milestone is not another synthetic role benchmark. Run V1 on several real DataWarsaw tasks and record:
- task success,
- retry count,
- elapsed time,
- verification failures,
- context/delegation mistakes,
- resume behavior after interruption.

Only add architecture where these traces show a real need.
