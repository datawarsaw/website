---
name: planning-grill
description: Clarify ambiguous or high-impact DataWarsaw work before implementation. Use when requirements, acceptance criteria, scope, or trade-offs are not settled. Do not use for small obvious fixes.
---

# Planning Grill

Use this skill only when implementation would otherwise require guessing.

## Goal
Turn an ambiguous request into a small, explicit implementation contract before code changes begin.

## Workflow
1. Inspect available project facts first. Do not ask the user for information that can be found in the repository.
2. Identify only decisions that materially affect scope, behavior, design, or acceptance criteria.
3. Ask the smallest useful batch of questions. Include a recommended default where helpful.
4. Keep unresolved decisions separate from facts already verified.
5. Stop when the implementation contract is clear enough that a Worker can execute without inventing requirements.

## Output Contract
Return:
- GOAL
- IN SCOPE
- OUT OF SCOPE
- ACCEPTANCE CRITERIA
- CONSTRAINTS
- OPEN DECISIONS: None or a short list

Do not implement while this skill is still resolving open decisions.
