# Review Policy for Legacy Codebases

Use this policy to review changes in legacy systems without turning every PR into a refactor project.

## Principles

- **Risk first**: Block only issues that risk security, data loss, correctness, or user-visible regressions.
- **Ratchet rule**: Never make the code worse; improve only what you touch.
- **Scope discipline**: Large cleanups become separate, scoped tasks with explicit ROI.
- **Guardrails over heroics**: Prefer linters, codemods, and tests to prevent regression.
- **Debt is explicit**: Record and prioritize issues instead of re-arguing them each review.

## Severity Levels

- **Blocker**: Security issues, data corruption, broken auth, crashes, incorrect business logic.
- **High**: Performance cliffs, major accessibility violations, production-only failures.
- **Medium**: Maintainability risks, inconsistent patterns, missing validation in new logic.
- **Low**: Style nits, minor duplication, naming, formatting.

## Review Workflow

1. **Assess scope**: Confirm what is in-scope for this PR.
2. **Check blockers**: Identify only ship-stopping risks first.
3. **Apply the ratchet**: Improve adjacent code only if it reduces risk or complexity.
4. **Log debt**: Add non-blocking issues to the debt ledger.
5. **Agree on follow-ups**: Convert large fixes into separate tasks.

## Guardrails vs Refactors

- **Guardrails**: Lightweight rules that prevent new issues (lint rules, type guards, tests).
- **Refactors**: Structural changes that need a dedicated task and timebox.

If a fix requires a widespread migration, it is a refactor and should not block a feature PR unless it introduces new risk.

## Debt Ledger Template

Use a shared list to track recurring findings.

- **Issue**: Short description
- **Impact**: Why it matters
- **Scope**: Where it applies
- **Suggested fix**: One-liner
- **Owner**: Name or team
- **Target**: Date or milestone

## Review Checklist (General)

- **Security**: Auth, input validation, sensitive data handling
- **Correctness**: Logic errors, race conditions, edge cases
- **Performance**: N+1 queries, heavy renders, blocking async
- **State hygiene**: Clear boundaries, selectors, no hidden coupling
- **Duplication**: Extract obvious repeats or log as debt
- **Design tokens**: Prefer semantic tokens where available
- **Tests**: Add for new behavior; avoid retrofitting old code unless required

## Outcomes

- **Ship with guardrails**: Add minimal protection now, refactor later.
- **Ship with debt**: Record follow-ups with owners and targets.
- **Block**: Only when risk is clear and immediate.
