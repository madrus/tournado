# Ralph Workflow

Ralph is an autonomous coding agent that implements features from a PRD JSON file. This guide covers the complete workflow from PRD creation to completion.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Choosing Your AI Engine](#choosing-your-ai-engine)
- [First Time Running Ralph?](#first-time-running-ralph)
- [Workflow Steps](#workflow-steps)
- [Database Workflow (Development)](#database-workflow-development)
- [What Prevents Ralph from Stopping](#what-prevents-ralph-from-stopping)
- [Troubleshooting](#troubleshooting)
- [Git Workflow & Review](#git-workflow--review)
- [Tips & Best Practices](#tips--best-practices)
- [What Makes This Workflow Robust](#what-makes-this-workflow-robust)

## Prerequisites

1. **Project setup complete**:
   - Node.js 22+ and pnpm 10+ installed
   - Project dependencies installed: `pnpm install`
   - Database initialized: `pnpm run setup`
   - Dev server can run: `pnpm dev` (verify once, then stop)
2. **AI CLI tool installed**: Ralph currently uses **Codex CLI** by default
   - Install from [codex.ai](https://codex.ai) or your preferred documentation
   - **Alternative engines**: AmpCode, Claude CLI, or Gemini CLI (see "Choosing Your AI Engine" section below)
3. **Chrome installed**: Required for browser verification of UI changes
4. **jq installed**: Required for JSON parsing in ralph.sh
   - Install: `brew install jq` (macOS) or `sudo apt install jq` (Linux)
5. **Git working directory clean**: Commit or stash any pending changes
   - Ralph makes commits automatically - start with a clean slate
   - Check: `git status` should show "nothing to commit, working tree clean"

**Note**: All required skills (prd, ralph, dev-browser) are already included locally in `.agents/skills/`. You don't need to install external skill collections.

## Choosing Your AI Engine

Ralph can run with different AI CLI tools. The engine is configured in `scripts/ralph/ralph.sh` at line 92.

**Current default**: Codex CLI

```bash
COMMAND=(codex exec --dangerously-bypass-approvals-and-sandbox -)
```

**Alternative engines** (uncomment in ralph.sh to switch):

| Engine              | Command                                                   | Install                            |
| ------------------- | --------------------------------------------------------- | ---------------------------------- |
| **Codex** (default) | `codex exec --dangerously-bypass-approvals-and-sandbox -` | [codex.ai](https://codex.ai)       |
| **AmpCode**         | `amp --dangerously-allow-all`                             | [ampcode.com](https://ampcode.com) |
| **Claude CLI**      | `claude --permission-mode acceptEdits`                    | Claude CLI installation            |
| **Gemini CLI**      | `gemini --yolo`                                           | Gemini CLI installation            |

**To switch engines**:

1. Edit `scripts/ralph/ralph.sh`
2. Comment out the current `COMMAND=` line (line 92)
3. Uncomment your preferred engine's line (lines 86-91)
4. Ensure the CLI tool is installed and authenticated

**Flags explained**:

- `--dangerously-bypass-approvals-and-sandbox`: Auto-approves all tool calls (required for autonomous operation)
- `--dangerously-allow-all`: Similar auto-approval for AmpCode
- `--permission-mode acceptEdits`: Auto-accepts file edits for Claude CLI
- `--yolo`: Auto-approval mode for Gemini CLI

**Security note**: These flags disable safety prompts to enable autonomous execution. Ralph runs in your local development environment, so this is safe for dev work. Never use these flags with untrusted code or in production.

## First Time Running Ralph?

If this is your first time using Ralph:

1. **Verify prerequisites** - check all items in Prerequisites section above
2. **Test the setup**:

   ```sh
   # Test AI CLI works
   codex exec - <<< "echo 'Hello from Codex'"

   # Test jq works
   echo '{"test": true}' | jq '.'

   # Test dev server
   pnpm dev  # Open localhost:5173 in browser, then Ctrl+C
   ```

3. **Start small** - create a simple PRD for a minor feature first
4. **Watch the first iteration** - observe how Ralph works before walking away
5. **Review commits carefully** - understand Ralph's code changes

## Workflow Steps

### 1. Create the PRD Markdown File

**Use the improved PRD skill** at `.agents/skills/prd/SKILL.md`:

```sh
# In your AI assistant (Cursor, Claude Code, Amp, etc.)
Load the prd skill and create a PRD for [description]
```

**Best model**: `claude-4.5-opus-high-thinking` for complete and accurate documents.

**Important PRD elements** (the skill now includes):

- **Decision blocks**: Document important upfront choices (e.g., "Decision: Backfill Strategy")
- **Implementation Notes**: Explicit implementation approaches to prevent Ralph from asking for clarification
- **Explicit test scope**: "Run unit tests for changed files" vs "Run all tests"
- **Test fixture requirements**: Reminder to update fixtures when schema changes
- **Migration workflow**: Clear development database workflow (drop/recreate/seed)

**Answer clarifying questions** until the skill saves `tasks/prd-<feature>.md`

### 2. Review the Generated PRD

**Critical step**: Read the entire PRD and verify it matches your understanding 100%.

**Check for**:

- All Decision blocks are correct
- Implementation Notes provide enough guidance
- Test scope is appropriate (changed files vs full suite)
- Migration strategy is clear for schema changes
- UI stories include browser verification requirements

### 3. Convert PRD to Ralph JSON

Use the `ralph` skill at `.agents/skills/ralph/SKILL.md`:

```sh
# In your AI assistant
Using the ralph skill, convert the PRD to prd.json
```

The skill writes `scripts/ralph/prd.json` directly.

**Verify**:

```sh
# Check the file exists and is valid JSON
cat scripts/ralph/prd.json | jq '.'
# Should show the JSON structure without errors
```

### 4. Prepare Browser Verification (for UI features)

**If your feature includes UI changes**, set up browser automation:

**Terminal 1: Dev Server**

```sh
pnpm dev
# ✓ Wait for: "ready in X ms" at http://localhost:5173
# ✓ Verify: Open http://localhost:5173 in a browser - app should load
# Keep this terminal open
```

**Terminal 2: dev-browser Server** (launches its own Chrome)

```sh
pnpm dev:browser
# First run only: Installs dependencies with pnpm (won't reinstall on subsequent runs)
# First run only: May install Playwright Chromium (takes a minute)
# ✓ Should see: "Using persistent browser profile: ..."
# ✓ Should see: "Browser launched with persistent profile..."
# ✓ Should see: "CDP WebSocket endpoint: ws://127.0.0.1:9223/..."
# ✓ Wait for: "Ready" message
# ✓ Should see: "HTTP API server running on port 9222"
# ✓ A Chrome window will open automatically (this is normal!)
# Keep this terminal open
```

**Note**: The dev-browser skill launches and manages its own Chrome instance. You do **not** need to run `dev:bridge` separately.

**Verification checklist**:

- [ ] Dev server shows "ready" and localhost:5173 loads in browser
- [ ] dev-browser server shows "Ready" message
- [ ] Chrome window opened automatically by dev-browser

**Why this matters**: Ralph MUST verify UI changes in a real browser. Without this setup, Ralph will stop and ask for manual verification, breaking autonomous execution.

**If you only have backend/model changes**: Skip this step - browser verification not needed.

### 5. Run Ralph

**Terminal 3: Ralph Agent** (or Terminal 1 if no browser verification needed)

```sh
# First time? Make executable:
chmod +x scripts/ralph/ralph.sh

# Run Ralph (default: 10 iterations)
./scripts/ralph/ralph.sh

# Or specify max iterations:
./scripts/ralph/ralph.sh 20
```

**What Ralph does each iteration**:

1. Reads `scripts/ralph/prd.json`
2. Reads `scripts/ralph/progress.txt` for codebase context
3. Picks highest priority story with `passes: false`
4. Implements the story (reads code, makes changes, writes tests)
5. Runs `pnpm typecheck && pnpm lint`
6. Runs unit tests for changed files
7. Commits with conventional commit message (e.g., `feat: UC-001 - Add priority field`)
8. Updates `prd.json` (`passes: true`) and appends to `progress.txt`
9. Repeats for next story

**Watch for**:

- `═══════════ Ralph Iteration X of Y ═══════════` - iteration markers
- `<promise>COMPLETE</promise>` - **all stories done successfully**
- `Ralph completed all tasks!` - success message
- `Ralph reached max iterations` - ran out of iterations (stories may remain)
- Ralph proceeds autonomously - it should NOT ask questions if PRD is complete
- Build/test failures - **interrupt with Ctrl+C** and fix before continuing

**Interrupting Ralph**:

- **Ctrl+C is safe** - stops current iteration
- Ralph commits after each story, so progress is saved
- Check `git log` to see what was completed
- Fix any issues, then re-run `ralph.sh` to continue

### 6. Post-Iteration Review

After Ralph completes or you interrupt:

**Review changes**:

```sh
git status
git diff
# Review all touched files, especially React components and Tailwind classes
```

**Update documentation**:

- Copy learnings from `scripts/ralph/progress.txt` to feature-specific `AGENTS.md` files
- Update this workflow doc if you discovered process improvements

**Prepare for next run** (if not complete):

- Review and update `scripts/ralph/prd.json` if priorities changed
- Review `scripts/ralph/progress.txt` for accuracy
- Check remaining stories (`passes: false`)

## Database Workflow (Development)

**⚠️ DEVELOPMENT ONLY**: This workflow applies to local development. Never use for staging/production.

For features requiring schema changes, Ralph follows this workflow:

1. **Drop/recreate database** (tables empty)
   ```sh
   # Manual command (if needed):
   pnpm db:reset:local
   ```
2. **Run migrations** (no backfill needed - tables are empty)
   ```sh
   pnpm prisma migrate dev --name <migration_name>
   ```
3. **Run seed scripts** (creates data with proper fields)
   - `prisma/seedSuperAdmins.js` - creates admin users
   - `prisma/seed.js` - creates test data with `createdBy`, etc.

**Why this works**:

- Development database can be destroyed and recreated freely
- Seed scripts handle all data population and required field assignment
- No need for complex backfill SQL in migrations
- Faster iteration - just reset and re-seed

**Ralph won't ask about**:

- Whether to drop the database (it's development, always safe)
- How to backfill required fields (seeds handle it automatically)
- Whether to use complex migration SQL (not needed - tables are empty)

**For staging/production**: Migration strategy would be different (preserve data, backfill in SQL, etc.). Document separately when needed.

## What Prevents Ralph from Stopping

Ralph is designed to execute autonomously. It will NOT stop to ask questions if:

1. **PRD has Decision blocks** for important choices
2. **PRD has Implementation Notes** for implied implementation approaches
3. **Test scope is explicit** ("changed files only" vs "all tests")
4. **Test fixtures reminder** is included for schema changes
5. **Migration workflow** is documented (drop/recreate/seed for dev)
6. **Browser verification setup** is complete (dev server + Chrome bridge + dev-browser)

Ralph WILL stop if:

- PRD requirements are ambiguous or contradictory
- Multiple valid approaches exist without guidance
- Critical errors occur (build failures, test failures)
- Browser verification is required but not set up

## Troubleshooting

### ralph.sh fails with "command not found"

**Fix**: The AI CLI tool isn't installed or isn't in your PATH. Check which engine is configured in `ralph.sh` line 92 and install/authenticate it. See "Choosing Your AI Engine" section above.

### Ralph keeps asking about implementation details

**Fix**: Update the PRD with an "Implementation Note" section that explicitly describes the approach.

### Ralph keeps asking about testing

**Fix**: Make test scope explicit in acceptance criteria: "Run unit tests for changed files: `pnpm test:run path/to/test.ts`"

### Ralph can't verify UI changes

**Fix**: Ensure both terminals are running:

1. Dev server (localhost:5173): `pnpm dev`
2. dev-browser server: `pnpm dev:browser` (launches its own Chrome)

### dev:browser fails with "ERR_MODULE_NOT_FOUND"

**Fix**: dev-browser's node_modules are corrupted or workspace-linked. Reinstall with isolation:

```sh
cd .agents/skills/dev-browser
rm -rf node_modules
pnpm install --ignore-workspace
cd ../../..
pnpm dev:browser  # Should work now
```

### Ralph keeps saying "completed all tasks" when stories remain

**Fix**: This should not happen anymore. If it does, Ralph's stop condition logic is broken - check `scripts/ralph/prompt.md` for the count verification steps.

### Ralph asks about migration strategy

**Fix**: Update PRD with "Migration Workflow" section documenting the development workflow (drop/recreate/seed).

### Test fixtures break after schema changes

**Fix**: Ensure PRD acceptance criteria include: "Update ALL test fixtures that create [Model] objects to include [newField] field"

### Ralph hangs or times out

**Fix**:

- Check network connectivity to AI service
- Check if AI CLI tool needs re-authentication
- Interrupt with Ctrl+C and restart
- Check `scripts/ralph/progress.txt` for what was completed

### Git conflicts during Ralph's commits

**Fix**:

- Interrupt Ralph (Ctrl+C)
- Resolve conflicts manually: `git status`, fix files, `git add .`, `git commit`
- Update `prd.json` manually to mark completed story as `passes: true`
- Restart Ralph - it will pick up from next story

### Ralph crashes mid-story

**Fix**:

- Check `git log` to see if story was committed (if yes, it's complete)
- Check `prd.json` - if story still shows `passes: false`, restart Ralph
- Ralph will re-attempt the same story from scratch
- If same crash repeats, the PRD may need clarification for that story

### Want to pause and resume later

**Fix**:

- Interrupt Ralph anytime (Ctrl+C)
- Completed stories are committed and marked in `prd.json`
- To resume: Just run `./scripts/ralph/ralph.sh` again
- Ralph picks up from first incomplete story

## Git Workflow & Review

Ralph makes commits automatically, but **you should review them**:

```sh
# After Ralph completes or you interrupt:

# 1. Review all commits since you started
git log --oneline -10

# 2. Review changes in detail
git diff HEAD~5  # adjust number to see all Ralph commits

# 3. If everything looks good, push to your branch
git push origin <branch-name>

# 4. If something is wrong, you can:
#    - Revert specific commits: git revert <commit-hash>
#    - Squash commits: git rebase -i HEAD~5
#    - Reset and start over: git reset --hard <commit-before-ralph>
```

**Best practice**:

- Review Ralph's work before pushing to remote
- Each UC commit is separate - easy to revert individual stories
- Keep `progress.txt` - it documents what Ralph did and why

## Tips & Best Practices

**Before starting**:

- **Clean git state** - commit or stash pending changes
- **Fresh terminal session** - avoid environment variable conflicts
- **Read this guide** - keep it visible for reference

**During PRD creation**:

- **Use claude-4.5-opus-high-thinking** for PRD generation - most thorough
- **Be explicit** - add Decision blocks and Implementation Notes
- **Specify test scope** - "changed files only" vs "all tests"
- **Include verification** - "Verify in browser" for UI changes

**While Ralph runs**:

- **Watch first iteration** - ensure Ralph proceeds autonomously
- **Don't interrupt unnecessarily** - Ralph commits after each story
- **Monitor for patterns** - if Ralph stops repeatedly, PRD needs clarity
- **Check progress.txt** - Ralph documents learnings there

**After completion**:

- **Review all commits** - `git log --oneline` to see what Ralph did
- **Test the feature** - Ralph writes tests, but manual QA is valuable
- **Update documentation** - copy learnings from progress.txt to AGENTS.md
- **Push with confidence** - commits are atomic per story, easy to revert if needed

## Files Ralph Uses

- `scripts/ralph/prd.json` - Machine-readable PRD (generated by ralph skill)
- `scripts/ralph/prompt.md` - Ralph's instructions (don't edit during a run)
- `scripts/ralph/progress.txt` - Iteration log and codebase patterns
- `scripts/ralph/ralph.sh` - Ralph launcher script

## Related Documentation

- `.agents/skills/prd/SKILL.md` - PRD creation skill (with Decision/Implementation Note support)
- `.agents/skills/ralph/SKILL.md` - PRD to JSON conversion skill
- `.agents/skills/dev-browser/SKILL.md` - Browser automation skill
- `scripts/ralph/prompt.md` - Complete Ralph instructions (autonomous execution rules)
- `scripts/ralph/progress.txt` - Iteration log and codebase patterns (valuable context)

## What Makes This Workflow Robust

This Ralph workflow has been battle-tested and refined to enable **true autonomous execution**:

**✅ Prevents Ralph from stopping**:

- **Decision blocks** document important choices upfront
- **Implementation Notes** provide explicit guidance for implied approaches
- **Test scope** is always explicit (changed files vs full suite)
- **Migration workflow** is documented (drop/recreate/seed for dev)
- **Browser verification** is fully automated (3-terminal setup)

**✅ Handles edge cases**:

- **Test fixture updates** reminded in acceptance criteria for schema changes
- **Database workflow** optimized for development (reset-friendly)
- **Interruption-safe** - commits after each story, easy to resume
- **Multi-engine support** - works with Codex, AmpCode, Claude, Gemini

**✅ Maintains quality**:

- **Atomic commits** per story - easy to review and revert
- **Progress logging** - Ralph documents learnings for future iterations
- **Conventional commits** - standardized commit messages
- **Autonomous verification** - typecheck, lint, tests, browser UI checks

**✅ Developer-friendly**:

- **Clear prerequisites** - know what you need before starting
- **Step-by-step setup** - verification checkpoints at each step
- **Comprehensive troubleshooting** - covers all common issues
- **Recovery procedures** - handle crashes, conflicts, interruptions

The key insight: **Time invested in PRD quality pays off exponentially in autonomous execution**. A well-written PRD with Decision blocks and Implementation Notes allows Ralph to implement entire features without human intervention.
