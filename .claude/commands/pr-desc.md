---
name: pr-desc
description: Generate a PR description by analyzing commits and changes between two branches
inputs:
  - name: arguments
    type: string
    description: "Branch names and optional flags: 'compare base [--verbose|-v]' (e.g., 'dev main' or 'dev main -v')"
    required: false
---

# Generate Pull Request Description

You will analyze the git changes between two branches and generate a PR description.

## Branch Selection and Flags

Arguments provided: $ARGUMENTS

Parse the arguments as follows:

- Check if `--verbose` or `-v` flag is present anywhere in the arguments (flags may appear before, between, or after branch names)
- Remove `--verbose` or `-v` from arguments before parsing branches
- If remaining arguments are empty: compare current branch to `dev`
- If one branch provided: compare that branch to `dev`
- If two branches provided: accept either order
  - GitHub style "base compare": normalize to compare=compare, base=base (second arg is head/compare)
  - Legacy style "compare base": use first arg as compare, second as base
  - Auto-detect by checking which branch is ahead using `git rev-list --count base..compare`

**Output Format:**

- **Default (concise)**: Brief summary with key changes only (default behavior)
- **Verbose mode (--verbose or -v flag)**: Detailed description with full sections
- Flags may appear before, between, or after branch names

## Steps to Execute

1. **Determine branches**:
   - Get current branch with `git branch --show-current`
   - Parse arguments to determine compare branch (head) and base branch
   - First run `git fetch --all --prune` to ensure up-to-date refs
   - Validate both branches exist using `git rev-parse --verify <branch>`
   - If local ref not found, try `refs/remotes/origin/<branch>`

2. **Validate branch relationship**:
   - Check if the branches have a common ancestor: `git merge-base compare base`
   - If no common ancestor found, inform the user: "❌ Error: Branches `compare` and `base` do not share a common history. Please verify the branch names."
   - Check if there are any commits to compare: `git log base..compare --oneline`
   - If no commits found, inform the user: "❌ Error: No commits found from `base` to `compare`. The branches may be the same or `compare` may be behind `base`."

3. **Ask for confirmation (interactive environments only)**:
   - Skip this step in non-interactive contexts or if environment variable `CI=true` is set
   - Display: "You are going to create a PR from **`compare`** to **`base`**. Continue? (y/n)"
   - Wait for user response
   - If user says yes/y or responds affirmatively: proceed
   - If user says no/n/cancel: ask "Please provide the correct branch names in the format: /pr-desc compare base" and stop
   - Only proceed after receiving confirmation

4. **Gather git information**:
   - Run `git log base..compare --first-parent --pretty=format:"%h - %s (%an, %ar)" --no-merges` for a readable commit history
   - Run `git diff base...compare --stat --find-renames` for accurate file change statistics
   - Run `git diff base...compare --find-renames` for the actual diff (use selectively if too large)

5. **Analyze the changes**:
   - Review commit messages to understand the intent
   - Analyze file stats to understand scope
   - Identify the type of changes (feature, fix, refactor, docs, etc.)
   - Note any breaking changes, database migrations, or deployment notes
   - **Heuristics for auto-detection**:
     - Look for changes under `prisma/migrations/`, `schema.prisma`, or `*/migrations/*.sql` to detect database migrations
     - Check for RBAC-related changes in files containing `roles`, `permissions`, `rbac`, or policy files
     - Identify config changes in `.env`, `*.config.*`, or deployment files
   - Determine the most appropriate conventional commit type prefix based on the dominant change type

6. **Generate PR title**:
   - Use conventional commit prefixes: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`
   - Format: `prefix: description starting with lowercase letter`
   - Example: `feat: add user management workflows and competition group system`
   - The prefix should reflect the most significant or dominant change in the PR
   - If multiple major features, use the most impactful one or use `feat` for feature additions

7. **Generate PR description**:

### Default Format (Concise)

Use this format by default (unless --verbose or -v flag is present):

```markdown
## Summary

[1-2 sentence overview of what this PR does]

## Key Changes

- [3-6 bullet points of main changes]
- [Focus on high-level features/fixes, not implementation details]

## Database Changes (if applicable)

[Brief note about migrations or schema changes]

**Migration commands:**

- Development: `pnpm prisma migrate dev`
- Production: `pnpm prisma migrate deploy`

**Note:** Diffs include `--find-renames` to surface file moves/renames.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Verbose Format (--verbose or -v flag)

Use this detailed format only when either --verbose or -v flag is present:

```markdown
## Summary

[1-2 sentence overview of what this PR does]

## Changes

- [Bullet point list of key changes]
- [Include both what changed and why if evident from commits]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Test coverage

## Testing

[Describe what testing was done or should be done]

## Additional Notes

[Any deployment notes, migration steps, or other important information]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

8. **Output the results**:
   - First display: "**PR Title:**" followed by a fenced code block containing only the title (for easy copying)
   - Then display: "**PR Description:**" followed by a fenced code block containing only the markdown body
   - If concise format was used, add a note: "💡 Use `--verbose` or `-v` flag for a detailed description"
   - Inform user they can copy both blocks directly to GitHub's PR creation page

## Important Notes

- **Default (concise)**: 3-6 key bullet points focusing on high-level changes only (default behavior when no flags provided)
- **Verbose**: Detailed breakdown with all sections including Type of Change checklist and Testing details
- **Flag placement**: Flags (`--verbose` or `-v`) may appear before, between, or after branch names
- Always highlight breaking changes or database migrations prominently
- For large diffs, focus on commit messages and file stats rather than analyzing every line of code
- Maintain a professional, clear tone suitable for team collaboration
