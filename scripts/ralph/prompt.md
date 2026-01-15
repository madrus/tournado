# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.
The default source branch to start with is "dev".

**CRITICAL: Start immediately.** Do NOT ask for confirmation to begin. When invoked, immediately start with step 1 below.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from the source branch.
4. Pick the **highest priority** use case where `passes: false`
5. Implement that single use case
6. Run quality checks (e.g., typecheck, lint, test - use whatever your project requires)
7. Update AGENTS.md files if you discover reusable patterns (see below)
8. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
9. Update the PRD to set `passes: true` for the completed story
10. Append your progress to `progress.txt`

## Progress Report Format

APPEND to progress.txt (never replace, always append):

```text
## [Date/Time] - [Story ID]
Thread: https://ampcode.com/threads/$AMP_CURRENT_THREAD_ID
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

Include the thread URL so future iterations can use the `read_thread` tool to reference previous work if needed.

The learnings section is critical - it helps future iterations avoid repeating mistakes and understand the codebase better.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```text
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update AGENTS.md Files

Before committing, check if any edited files have learnings worth preserving in nearby AGENTS.md files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing AGENTS.md** - Look for AGENTS.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good AGENTS.md additions:**

- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**

- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update AGENTS.md if you have **genuinely reusable knowledge** that would help future work in that directory.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Testing Rules

**PRD acceptance criteria override project-level testing rules.** When a use case acceptance criteria explicitly says:

- "Run unit tests" or "All unit tests pass" → **Run tests for changed files only** (e.g., `pnpm test:run app/models/__tests__/group.server.test.ts`)
- "Create unit tests" → **Write the tests AND run them** (run only the new test file)
- "Run all tests" or "Full test suite" → **Run entire test suite** (`pnpm test:run`)

**Default behavior:** When PRD says "run unit tests", run only tests related to files you changed, not the entire suite. This keeps iterations fast while ensuring your changes work.

This means: if the PRD says tests must pass, you run the relevant tests. The project rule "don't run unit tests unless explicitly requested" does NOT apply when the PRD explicitly requires tests.

## Ripple Effects (Schema Changes)

When you add or modify required fields in the database schema, you MUST also update:

1. **All test fixtures** that create models with the changed schema
2. **All seed data** that creates those models
3. **All factory functions** or mock data generators

This is NOT optional and NOT a decision point. If typecheck fails because test fixtures lack a new required field, fix them immediately without asking. Use the same approach as documented in the PRD (e.g., if PRD says backfill with a specific user ID, use that ID in test fixtures too).

## Development Database Workflow

This project is **pre-production**. For migrations that add required fields:

1. **Do NOT** add complex backfill logic to migration SQL
2. **Do** use `pnpm prisma migrate dev` which handles empty tables cleanly
3. **Seed data** (via `seed.js`) handles populating required fields for test data

If `prisma migrate dev` prompts to reset the database, that's acceptable in development. The workflow after migration is:

```bash
node prisma/seedSuperAdmins.js  # Creates admin users
node prisma/seed.js             # Creates test data with proper ownership
```

**Do NOT ask for confirmation** about database resets in development - just proceed.

## Decision Points

If you encounter ambiguity in the PRD that requires a decision (e.g., nullable vs required field, backfill strategy), check for a **"Decision:"** block in the use case description. The PRD should document all decisions upfront.

If a decision is NOT documented and you cannot proceed without it, do NOT guess. Instead:

1. Document the question clearly
2. Skip to the next use case (if possible)
3. Note the blocker in progress.txt

However, prefer to proceed if the PRD provides enough context to make a reasonable default choice.

**What IS a decision point:** Architecture choices, business logic interpretation, nullable vs required fields, backfill strategies.

**What is NOT a decision point:**

- **Asking for confirmation to start work** - Start immediately when invoked
- Fixing compilation errors, updating test fixtures, adding missing imports, fixing lint errors
- Implementation details that are **implied by PRD requirements** (e.g., if PRD says "returns deletion statistics", use explicit deletes with counting; if PRD says "in a transaction", wrap operations in a transaction)
- Choosing between implementation approaches when one clearly satisfies the PRD requirements better

**When PRD requirements imply implementation approach:** If the PRD specifies requirements like "returns statistics", "in a transaction", "handles rollback", etc., the implementation approach is implied. Don't ask which approach - implement what satisfies the requirements.

**PRD "Implementation Note" sections:** If a use case has an "Implementation Note" or "Implementation:" section, that is the explicit approach to follow. Do NOT ask for approval - just implement it as specified.

**Testing style:** When PRD says "unit tests", use mocked unit tests (consistent with existing test files). Only use integration tests if PRD explicitly says "integration tests" or "test against real database".

## Browser Testing (Required for Frontend Stories)

For any story that changes UI, you MUST verify it works in the browser:

1. Load the `dev-browser` skill
2. Navigate to the relevant page
3. Verify the UI changes work as expected
4. Take a screenshot if helpful for the progress log

A frontend story is NOT complete until browser verification passes.

## Stop Condition

After completing a use case, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
