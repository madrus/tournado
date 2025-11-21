/// <reference types="vitest" />
/// <reference types="vite/client" />
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./test/setup-test-env.ts'],
		watch: process.env.npm_lifecycle_event !== 'validate',
		// Only include unit test files (not spec files - those are for Playwright)
		include: ['app/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}', '__tests__/**/*.test.{ts,tsx}'],
		exclude: [
			'node_modules/**',
			'playwright/**', // Exclude all Playwright files
			'build/**',
			'dist/**',
		],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
			exclude: [
				// Dependencies
				'node_modules/**',

				// Test files
				'**/__tests__/**',
				'**/*.test.{ts,tsx,js,jsx}',
				'**/*.spec.{ts,tsx,js,jsx}',
				'test/**',
				'tests/**',

				// Configuration files
				'*.config.{ts,js,mjs}',
				'**/*.config.{ts,js,mjs}',
				'eslint.config.mjs',

				// Build and development files
				'build/**',
				'dist/**',
				'coverage/**',
				'.react-router/**',
				'public/**',

				// Project specific
				'app/entry.{client,server}.tsx',
				'app/root.tsx',
				'test/mocks/**',
				'scripts/**',
				'docs/**',
				'prisma/**',
				'mcp-servers/**',

				// Type definitions and declarations
				'**/*.d.ts',
			],
			include: ['app/**/*.{ts,tsx}'],
			thresholds: {
				global: {
					branches: 70,
					functions: 70,
					lines: 70,
					statements: 70,
				},
			},
		},
	},
})
