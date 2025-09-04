# Documentation Agent

An automated system that analyzes code changes in pull requests and updates relevant documentation to keep it in sync with the codebase.

## Overview

The Documentation Agent runs automatically on every pull request to:

1. **Analyze Changes**: Detects what files have been modified
2. **Map to Documentation**: Determines which documentation files need updates
3. **Update Documentation**: Automatically updates relevant docs with change notes
4. **Commit Changes**: Commits documentation updates back to the PR branch
5. **Notify Team**: Comments on the PR with a summary of documentation changes

## How It Works

### 1. Trigger
- Runs on every pull request (opened, synchronized, reopened)
- Only runs on non-draft PRs
- Requires write permissions to commit back to the PR branch

### 2. Analysis
The agent analyzes changed files and maps them to documentation using:

- **Direct Mapping**: Specific files → specific documentation
- **Pattern Matching**: File patterns → category-based documentation
- **Category Mapping**: File categories → relevant documentation sets

### 3. Updates
For each relevant documentation file, the agent:

- Adds a change note with timestamp and PR reference
- Updates content if needed (based on change type)
- Maintains existing documentation structure
- Preserves all existing content

### 4. Commit
- Commits all documentation changes back to the PR branch
- Uses conventional commit format
- Includes PR reference in commit message

## Configuration

### File Mapping Rules

The agent uses configuration in `scripts/docs-agent.config.js` to determine which documentation to update:

```javascript
// Direct file-to-documentation mapping
directMapping: {
  'prisma/schema.prisma': [
    'docs/development/database.md',
    'docs/development/database-schema-changes.md'
  ],
  'package.json': [
    'docs/getting-started.md',
    'README.md'
  ]
}

// Category-based mapping
categoryMapping: {
  database: ['docs/development/database.md'],
  api: ['docs/development/routing.md'],
  components: ['docs/development/ui-components.md']
}
```

### Change Types

The agent recognizes these change types:

- `database-schema`: Prisma schema changes
- `api-endpoint`: Route/API changes
- `ui-component`: Component changes
- `utility-function`: Utility/library changes
- `styling`: CSS/style changes
- `dependency`: Package.json changes
- `configuration`: Config file changes
- `test`: Test file changes

## Files Created/Modified

### Core Files
- `.github/workflows/docs-agent.yml` - GitHub Actions workflow
- `scripts/docs-agent.js` - Main documentation agent script
- `scripts/docs-agent.config.js` - Configuration and mapping rules
- `scripts/test-docs-agent.js` - Test script for the agent

### Generated Files (Temporary)
- `docs-update-summary.md` - Summary of changes made (deleted after use)

## Usage

### Automatic Usage
The agent runs automatically on every pull request. No manual intervention required.

### Manual Testing
Test the agent locally with sample changes:

```bash
# Run the test suite
pnpm docs:agent:test

# Test with specific changes
pnpm docs:agent --base-sha=main --head-sha=feature-branch --pr-number=123 --pr-title="Test PR" --pr-body="Testing documentation agent"
```

### Configuration Updates
To modify which files trigger documentation updates:

1. Edit `scripts/docs-agent.config.js`
2. Update the mapping rules as needed
3. Test with `pnpm docs:agent:test`
4. Commit the configuration changes

## Examples

### Database Schema Change
When `prisma/schema.prisma` is modified:
- Updates `docs/development/database.md`
- Updates `docs/development/database-schema-changes.md`
- Updates `.cursor/rules/02-database-schema.mdc`
- Adds entry to `CHANGELOG.md`

### Component Change
When `app/components/TeamForm.tsx` is modified:
- Updates `docs/development/ui-components.md`
- Updates `docs/development/design-system.md`
- Adds change note to affected files

### Package.json Change
When `package.json` is modified:
- Updates `docs/getting-started.md`
- Updates `README.md`
- Updates `docs/development/overview.md`
- Adds entry to `CHANGELOG.md`

## Benefits

1. **Always Up-to-Date**: Documentation stays synchronized with code changes
2. **Consistent Updates**: Standardized format for all documentation updates
3. **Reduced Manual Work**: Eliminates need to manually update docs
4. **Better PR Reviews**: Reviewers can see documentation impact
5. **Audit Trail**: All documentation changes are tracked and referenced

## Limitations

1. **Content Analysis**: Currently only adds change notes, doesn't analyze content
2. **Complex Changes**: May not handle complex refactoring scenarios
3. **Custom Logic**: Requires configuration for new file types or patterns
4. **Merge Conflicts**: May conflict if multiple PRs update same docs

## Troubleshooting

### Agent Not Running
- Check if PR is in draft mode (agent skips drafts)
- Verify workflow file is in `.github/workflows/`
- Check GitHub Actions permissions

### Documentation Not Updated
- Verify file mapping rules in config
- Check if documentation files exist
- Review agent logs in GitHub Actions

### Merge Conflicts
- Resolve conflicts manually in the PR
- Agent will retry on next push
- Consider updating mapping rules to reduce conflicts

## Future Enhancements

1. **Content Analysis**: Analyze actual code changes to update content
2. **Smart Merging**: Better handling of concurrent documentation updates
3. **Template System**: More sophisticated documentation templates
4. **Validation**: Verify documentation accuracy against code
5. **Notifications**: Slack/email notifications for documentation updates

## Contributing

To improve the documentation agent:

1. Update configuration in `scripts/docs-agent.config.js`
2. Modify logic in `scripts/docs-agent.js`
3. Add tests in `scripts/test-docs-agent.js`
4. Test thoroughly before deploying
5. Update this documentation with any changes