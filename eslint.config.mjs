/**
 * ESLint configuration for Tournado project
 * Extends base configuration from @madrus/configs
 */
/** @type {import('eslint').Linter.Config[]} */
import eslintConfig from '@madrus/configs/eslint.config.mjs'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

import importPlugin from 'eslint-plugin-import'
import jestPlugin from 'eslint-plugin-jest'
import jestDomPlugin from 'eslint-plugin-jest-dom'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
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
      'coverage/**',
      'docs/**',
      'playwright-report/**',
      'playwright-results/**',
      'playwright/**',
      'test/mocks/**',
      'node_modules/**',
      'public/**',
      'scripts/**',
      '*.md*',
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
    ignores: [],
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
    rules: {
      // Enforce React Testing Library best practices
      'testing-library/prefer-screen-queries': 'error',
      'testing-library/no-node-access': 'error',
      'testing-library/prefer-find-by': 'error',
      'testing-library/await-async-queries': 'error',
      'testing-library/await-async-utils': 'error',

      // Jest DOM best practices
      'jest-dom/prefer-checked': 'error',
      'jest-dom/prefer-enabled-disabled': 'error',
      'jest-dom/prefer-required': 'error',
      'jest-dom/prefer-to-have-attribute': 'error',
      'jest-dom/prefer-to-have-class': 'error',
      'jest-dom/prefer-to-have-text-content': 'error',
      'jest-dom/prefer-to-have-value': 'error',
    },
  },

  // Node specific configuration
  {
    files: ['.eslintrc.js', 'test/mocks/**/*.js'],
    languageOptions: {
      globals: {
        node: true,
      },
    },
  },
]
