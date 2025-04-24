/**
 * This is intended to be a basic starting point for linting in the Indie Stack.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y')
const typescriptPlugin = require('@typescript-eslint/eslint-plugin')
const importPlugin = require('eslint-plugin-import')
const markdownPlugin = require('eslint-plugin-markdown')
const jestPlugin = require('eslint-plugin-jest')
const jestDomPlugin = require('eslint-plugin-jest-dom')
const testingLibraryPlugin = require('eslint-plugin-testing-library')
const cypressPlugin = require('eslint-plugin-cypress')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Global ignores
  {
    ignores: ['node_modules/**', 'build/**', 'public/build/**', '.prisma/**'],
  },

  // Base config
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        browser: true,
        commonjs: true,
        es6: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    files: ['**/*.{js,cjs,mjs,jsx,ts,tsx}'],
    rules: {
      // Base eslint rules that would have come from eslint:recommended
    },
  },

  // React
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
      // Include rules from plugin:react/recommended, plugin:react/jsx-runtime, plugin:react-hooks/recommended, plugin:jsx-a11y/recommended
    },
  },

  // Typescript (non-Cypress)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['cypress/**/*'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      import: importPlugin,
    },
    settings: {
      'import/internal-regex': '^@/',
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      'import/order': 'off',
      // Include rules from plugin:@typescript-eslint/recommended, plugin:@typescript-eslint/stylistic, plugin:import/recommended, plugin:import/typescript
    },
  },

  // Cypress
  {
    files: ['cypress/**/*.ts'],
    ignores: ['cypress.config.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: null, // Don't use tsconfig for Cypress files
      },
    },
    plugins: {
      cypress: cypressPlugin,
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      // Include rules from plugin:cypress/recommended
    },
  },

  // Config files
  {
    files: ['*.config.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: null, // Disable project for config files
      },
    },
  },

  // Jest/Vitest
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        'jest/globals': true,
      },
    },
    plugins: {
      jest: jestPlugin,
      'jest-dom': jestDomPlugin,
      'testing-library': testingLibraryPlugin,
    },
    settings: {
      jest: {
        // We're using vitest which has a very similar API to jest
        // (so the linting plugins work nicely), but it means we
        // have to set the jest version explicitly.
        version: 28,
      },
    },
    rules: {
      // Include rules from plugin:jest/recommended, plugin:jest-dom/recommended, plugin:testing-library/react
    },
  },

  // Node
  {
    files: ['.eslintrc.js', 'mocks/**/*.js'],
    languageOptions: {
      globals: {
        node: true,
      },
    },
  },

  // Markdown (disable for now to avoid parsing errors)
  {
    files: ['**/*.md'],
    ignores: ['**/*.md'],
    plugins: {
      markdown: markdownPlugin,
    },
  },
]
