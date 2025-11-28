#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script
 *
 * This script validates that all required environment variables are properly configured.
 * It can be run in different contexts (CI, local, production) and provides clear error reporting.
 *
 * Usage:
 *   pnpm tsx scripts/validate-env.ts [context]
 *
 * Contexts:
 *   - ci: GitHub Actions CI environment
 *   - local: Local development environment
 *   - e2e: E2E testing environment
 *   - production: Production deployment
 */

type EnvContext = 'ci' | 'local' | 'e2e' | 'production'

interface EnvVar {
	name: string
	required: boolean
	contexts: EnvContext[]
	description: string
	example?: string
	sensitive?: boolean
}

// Define all environment variables with their requirements
const ENV_VARS: EnvVar[] = [
	// Core Application
	{
		name: 'DATABASE_URL',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description: 'Database connection string',
		example: 'file:./prisma/dev.db',
	},
	{
		name: 'SESSION_SECRET',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description: 'Secret key for session encryption',
		example: 'your-secret-key-here',
		sensitive: true,
	},

	// Admin Management
	{
		name: 'SUPER_ADMIN_EMAILS',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description:
			'Comma-separated list of super admin email addresses (can be empty in CI/E2E)',
		example: 'admin@example.com,other@example.com',
	},

	// Firebase Client (Browser) - NOT needed in CI/E2E (no browser)
	{
		name: 'VITE_FIREBASE_API_KEY',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase API key for client-side SDK',
		example: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
		sensitive: true,
	},
	{
		name: 'VITE_FIREBASE_AUTH_DOMAIN',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase auth domain',
		example: 'your-project.firebaseapp.com',
	},
	{
		name: 'VITE_FIREBASE_PROJECT_ID',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase project ID',
		example: 'your-project-id',
	},
	{
		name: 'VITE_FIREBASE_STORAGE_BUCKET',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase storage bucket',
		example: 'your-project.firebasestorage.app',
	},
	{
		name: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase messaging sender ID',
		example: '123456789012',
	},
	{
		name: 'VITE_FIREBASE_APP_ID',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase app ID',
		example: '1:123456789012:web:abcdef1234567890',
	},
	{
		name: 'VITE_FIREBASE_MEASUREMENT_ID',
		required: true,
		contexts: ['local', 'production'],
		description: 'Firebase analytics measurement ID',
		example: 'G-XXXXXXXXXX',
	},

	// Firebase Admin (Server) - Required everywhere
	{
		name: 'FIREBASE_ADMIN_PROJECT_ID',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description: 'Firebase Admin SDK project ID',
		example: 'your-project-id',
	},
	{
		name: 'FIREBASE_ADMIN_CLIENT_EMAIL',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description: 'Firebase Admin SDK service account email',
		example: 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com',
	},
	{
		name: 'FIREBASE_ADMIN_PRIVATE_KEY',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description: 'Firebase Admin SDK private key',
		example: '-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n',
		sensitive: true,
	},

	// Email Services - NOT needed in CI/E2E (emails are mocked)
	{
		name: 'RESEND_API_KEY',
		required: true,
		contexts: ['local', 'production'],
		description: 'Resend API key for sending emails',
		example: 're_xxxxxxxxxxxxxxxxxxxx',
		sensitive: true,
	},
	{
		name: 'EMAIL_FROM',
		required: true,
		contexts: ['ci', 'local', 'e2e', 'production'],
		description: 'Email sender address',
		example: 'Tournado <noreply@tournado.app>',
	},
	{
		name: 'BASE_URL',
		required: true,
		contexts: ['local', 'production'],
		description: 'Base URL of the application',
		example: 'http://localhost:5173',
	},
]

interface ValidationResult {
	valid: boolean
	missing: EnvVar[]
	empty: EnvVar[]
	configured: EnvVar[]
	warnings: string[]
}

function validateEnvironment(context: EnvContext): ValidationResult {
	const missing: EnvVar[] = []
	const empty: EnvVar[] = []
	const configured: EnvVar[] = []
	const warnings: string[] = []

	// Filter vars relevant to this context
	const relevantVars = ENV_VARS.filter((v) => v.contexts.includes(context))

	for (const envVar of relevantVars) {
		const value = process.env[envVar.name]

		if (value === undefined) {
			if (envVar.required) {
				missing.push(envVar)
			} else {
				warnings.push(
					`Optional variable ${envVar.name} is not set: ${envVar.description}`,
				)
			}
		} else if (value.trim() === '') {
			if (envVar.required) {
				empty.push(envVar)
			} else {
				warnings.push(
					`Optional variable ${envVar.name} is empty: ${envVar.description}`,
				)
			}
		} else {
			configured.push(envVar)
		}
	}

	return {
		valid: missing.length === 0 && empty.length === 0,
		missing,
		empty,
		configured,
		warnings,
	}
}

function _formatValue(envVar: EnvVar): string {
	const value = process.env[envVar.name]
	if (!value) return '(not set)'
	if (envVar.sensitive) {
		return value.length > 20 ? `${value.slice(0, 8)}...${value.slice(-4)}` : '***'
	}
	return value.length > 60 ? `${value.slice(0, 60)}...` : value
}

function printReport(_context: EnvContext, result: ValidationResult): void {
	// Configured variables
	if (result.configured.length > 0) {
		for (const _envVar of result.configured) {
		}
	}

	// Missing variables
	if (result.missing.length > 0) {
		for (const envVar of result.missing) {
			if (envVar.example) {
			}
		}
	}

	// Empty variables
	if (result.empty.length > 0) {
		for (const envVar of result.empty) {
			if (envVar.example) {
			}
		}
	}

	// Warnings
	if (result.warnings.length > 0) {
		for (const _warning of result.warnings) {
		}
	}
	if (result.valid) {
	} else {
	}
}

function main(): void {
	const args = process.argv.slice(2)
	const context = (args[0] as EnvContext) || 'local'

	const validContexts: EnvContext[] = ['ci', 'local', 'e2e', 'production']
	if (!validContexts.includes(context)) {
		process.exit(1)
	}

	const result = validateEnvironment(context)
	printReport(context, result)

	// Exit with error code if validation failed
	if (!result.valid) {
		process.exit(1)
	}
}

main()
