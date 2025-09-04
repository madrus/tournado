/**
 * Documentation Agent Configuration
 * 
 * This file contains the mapping rules and configuration for the automated
 * documentation update agent. Modify these rules to customize how the agent
 * maps code changes to documentation updates.
 */

export const DOCS_AGENT_CONFIG = {
  // Directories to monitor
  directories: {
    docs: 'docs',
    templates: 'templates',
    rules: '.cursor/rules',
    app: 'app',
    prisma: 'prisma',
    tests: 'test',
    playwright: 'playwright'
  },

  // File patterns that trigger documentation updates
  patterns: {
    // Database changes
    database: [
      'prisma/schema.prisma',
      'prisma/migrations/**',
      'prisma/seed.ts',
      'prisma/seed.js'
    ],
    
    // API and routing changes
    api: [
      'app/routes/**',
      'app/loaders/**',
      'app/actions/**',
      'app/resourceRoutes/**'
    ],
    
    // UI components and styling
    components: [
      'app/components/**',
      'app/styles/**',
      'app/hooks/**'
    ],
    
    // Utility functions and libraries
    utils: [
      'app/utils/**',
      'app/lib/**',
      'app/stores/**'
    ],
    
    // Configuration files
    config: [
      'package.json',
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'eslint.config.mjs',
      'prettier.config.mjs',
      'tsconfig.json',
      'fly.toml',
      'Dockerfile'
    ],
    
    // Testing files
    tests: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'playwright/**',
      'test/**'
    ],
    
    // Internationalization
    i18n: [
      'app/i18n/**',
      'app/locales/**'
    ],
    
    // Documentation files (to skip)
    docs: [
      'docs/**',
      'templates/**',
      '.cursor/rules/**',
      'README.md',
      'CHANGELOG.md'
    ]
  },

  // Direct file-to-documentation mapping
  directMapping: {
    // Database schema changes
    'prisma/schema.prisma': [
      'docs/development/database.md',
      'docs/development/database-schema-changes.md',
      '.cursor/rules/02-database-schema.mdc'
    ],
    
    // Package.json changes
    'package.json': [
      'docs/getting-started.md',
      'README.md',
      'docs/development/overview.md'
    ],
    
    // Configuration files
    'vite.config.ts': [
      'docs/development/overview.md',
      'docs/getting-started.md'
    ],
    'vitest.config.ts': [
      'docs/testing/testing-guide.md',
      'docs/testing/vitest-mcp.md',
      'docs/testing/overview.md'
    ],
    'playwright.config.ts': [
      'docs/testing/playwright-guide.md',
      'docs/testing/testing-guide.md',
      'docs/testing/overview.md'
    ],
    'eslint.config.mjs': [
      'docs/development/overview.md',
      '.cursor/rules/01-coding-standards.mdc'
    ],
    'prettier.config.mjs': [
      'docs/development/overview.md',
      '.cursor/rules/01-coding-standards.mdc'
    ],
    
    // Docker and deployment
    'Dockerfile': [
      'docs/deployment/cicd-pipeline.md',
      'docs/getting-started.md'
    ],
    'fly.toml': [
      'docs/deployment/cicd-pipeline.md'
    ]
  },

  // Category-based documentation mapping
  categoryMapping: {
    database: [
      'docs/development/database.md',
      'docs/development/database-schema-changes.md',
      '.cursor/rules/02-database-schema.mdc',
      '.cursor/rules/03-database-migrations.mdc'
    ],
    
    api: [
      'docs/development/routing.md',
      'docs/development/overview.md',
      'docs/development/architecture-analysis.md'
    ],
    
    components: [
      'docs/development/ui-components.md',
      'docs/development/design-system.md',
      'docs/development/css-architecture-strategy.md',
      'docs/development/dark-mode-guidelines.md',
      '.cursor/rules/07-design-system.mdc'
    ],
    
    utils: [
      'docs/development/overview.md',
      'docs/development/state-management.md',
      'docs/development/type-system.md'
    ],
    
    config: [
      'docs/getting-started.md',
      'README.md',
      'docs/development/overview.md'
    ],
    
    tests: [
      'docs/testing/testing-guide.md',
      'docs/testing/overview.md',
      'docs/testing/vitest-mcp.md',
      'docs/testing/playwright-guide.md',
      'docs/testing/troubleshooting.md'
    ],
    
    i18n: [
      'docs/development/multi-language-support.md',
      'docs/development/overview.md'
    ]
  },

  // Special handling for specific file types
  specialHandling: {
    // Schema changes require immediate documentation updates
    'prisma/schema.prisma': {
      priority: 'high',
      requiresChangelog: true,
      updateRules: true
    },
    
    // Package.json changes affect getting started docs
    'package.json': {
      priority: 'high',
      requiresChangelog: true,
      updateReadme: true
    },
    
    // Test configuration changes
    'vitest.config.ts': {
      priority: 'medium',
      updateTestingDocs: true
    },
    
    'playwright.config.ts': {
      priority: 'medium',
      updateTestingDocs: true
    },
    
    // Component changes
    'app/components/**': {
      priority: 'medium',
      updateDesignSystem: true
    },
    
    // Style changes
    'app/styles/**': {
      priority: 'medium',
      updateDesignSystem: true,
      updateCSSDocs: true
    }
  },

  // Documentation update templates
  updateTemplates: {
    changeNote: '<!-- Last updated: {date} - {changeType} changes in {sourceFile} (PR #{prNumber}) -->',
    
    changelogEntry: `## [Unreleased]

### Changed
- Documentation updated based on PR #{prNumber} changes
- {changeType} changes in {sourceFile}

`,
    
    prComment: `## 📚 Documentation Updated

This PR has triggered automatic documentation updates. The following documentation has been updated to reflect your changes:

### 📋 Files Modified:
{filesList}

---
*This comment was automatically generated by the Documentation Agent.*`
  },

  // Files to always update when any significant change occurs
  alwaysUpdate: [
    'docs/development/overview.md'
  ],

  // Files to never update automatically
  neverUpdate: [
    'docs/wip/**',
    'docs/README.md',
    'templates/**'
  ],

  // Minimum change threshold (number of files changed)
  minChangeThreshold: 1,

  // Maximum documentation files to update per PR
  maxDocUpdates: 10
}

export default DOCS_AGENT_CONFIG