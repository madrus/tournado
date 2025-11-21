import type { Page } from '@playwright/test'
import type { Role } from '@prisma/client'

/**
 * Login as a specific role by creating a test session and setting the session cookie
 * @param page - Playwright Page object
 * @param role - Role to login as (PUBLIC, REFEREE, EDITOR, BILLING, MANAGER, ADMIN)
 */
export async function loginAsRole(page: Page, role: Role): Promise<void> {
	const { createTestSession } = await import('./test-auth')
	const { cookie } = await createTestSession(role)

	const cookieMatch = cookie.match(/__session=([^;]+)/)
	if (!cookieMatch) {
		throw new Error(`Failed to parse session cookie: ${cookie}`)
	}

	await page.context().addCookies([
		{
			name: '__session',
			value: cookieMatch[1],
			domain: 'localhost',
			path: '/',
			httpOnly: true,
			secure: false,
			sameSite: 'Lax',
		},
	])
}
