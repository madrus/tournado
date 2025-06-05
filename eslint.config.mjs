/**
 * ESLint configuration for Tournado project
 * Extends base configuration from @madrus/configs
 */
/** @type {import('eslint').Linter.Config[]} */
import eslintConfig from '@madrus/configs/eslint.config.mjs'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

import cypressPlugin from 'eslint-plugin-cypress'
import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import jestDomPlugin from 'eslint-plugin-jest-dom'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import markdownPlugin from 'eslint-plugin-markdown'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import testingLibraryPlugin from 'eslint-plugin-testing-library'

export default [
  // Base config from @madrus/configs
  ...eslintConfig,

  // Global ignores
  {
    ignores: [
      '.github/**',
      '.prisma/**',
      '.react-router/**',
      '**/*.config.*',
      'build/**',
      'cypress/**',
      'docs/**',
      'mcp-servers/**/dist/**',
      'mocks/**',
      'node_modules/**',
      'public/**',
      'scripts/**',
    ],
  },

  // Project-specific overrides
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'jsx-a11y': jsxA11yPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
    },
    rules: {
      'react/jsx-no-leaked-render': ['warn', { validStrategies: ['ternary'] }],
    },
  },

  // TypeScript specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['cypress/**/*'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      import: importPlugin,
    },
    settings: {
      'import/internal-regex': '^~/',
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Debug rule to help us understand what's happening
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Cypress specific configuration
  {
    files: ['cypress/**/*.ts'],
    ignores: ['cypress.config.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: null,
      },
    },
    plugins: {
      cypress: cypressPlugin,
      '@typescript-eslint': typescriptPlugin,
    },
  },

  // Config files
  {
    files: ['*.config.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: null,
      },
    },
  },

  // Testing configuration
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    plugins: {
      jest: jestPlugin,
      'jest-dom': jestDomPlugin,
      'testing-library': testingLibraryPlugin,
    },
    settings: {
      jest: {
        version: 28,
      },
    },
  },

  // Node specific configuration
  {
    files: ['.eslintrc.js', 'mocks/**/*.js'],
    languageOptions: {
      globals: {
        node: true,
      },
    },
  },

  // Markdown configuration
  {
    files: ['**/*.md'],
    ignores: ['**/*.md'],
    plugins: {
      markdown: markdownPlugin,
    },
  },
]
