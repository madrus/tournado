/**
 * Vite dependency optimization configuration
 *
 * Pre-bundles commonly used dependencies to prevent on-demand optimization
 * during development and E2E tests, which causes page reloads.
 *
 * Add dependencies here if you see "✨ new dependencies optimized" messages
 * during E2E test runs.
 */
export const optimizeDepsInclude = [
  // Core dependencies
  'react-i18next',
  'i18next',
  'zustand',
  'zustand/middleware',
  'zod',
  'clsx',
  'tailwind-merge',
  'tiny-invariant',
  'class-variance-authority',

  // Radix UI
  '@radix-ui/themes',
  '@radix-ui/react-dialog',
  '@radix-ui/react-popover',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-select',

  // Firebase
  'firebase/auth',
  'firebase/app',
  'firebase-admin',
  'firebase-admin/app',
  'firebase-admin/auth',

  // Data & Tables
  '@prisma/client',
  '@tanstack/react-table',

  // UI Components
  'sonner',

  // Email
  '@react-email/render',
  '@react-email/components',
  'resend',

  // Testing (MSW)
  'msw/browser',
  'msw',
]
