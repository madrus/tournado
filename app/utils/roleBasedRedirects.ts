/**
 * Role-Based Redirect Logic
 *
 * Provides smart redirect logic based on user roles and authentication state.
 * Used primarily for post-authentication redirects and access control.
 */
import type { User } from '@prisma/client'

import { getUserRole, isAdmin } from './rbac'

/**
 * Default landing pages for each role
 */
const ROLE_LANDING_PAGES = {
	ADMIN: '/a7k9m2x5p8w1n4q6r3y8b5t1',
	MANAGER: '/a7k9m2x5p8w1n4q6r3y8b5t1',
	EDITOR: '/a7k9m2x5p8w1n4q6r3y8b5t1', // Editors need admin panel for content management
	BILLING: '/a7k9m2x5p8w1n4q6r3y8b5t1', // Billing users need admin panel for billing management
	REFEREE: '/a7k9m2x5p8w1n4q6r3y8b5t1', // Referees need admin panel for match management
	PUBLIC: '/',
} as const

/**
 * Routes that should remain public regardless of authentication status
 */
const ALWAYS_PUBLIC_ROUTES = [
	'/',
	'/teams',
	'/about',
	'/auth/signin',
	'/auth/signup',
	'/auth/signout',
] as const

/**
 * Get the appropriate landing page after successful authentication
 */
export function getPostSignInRedirect(
	user: User | null,
	requestedPath?: string,
): string {
	// If no user, redirect to homepage (shouldn't happen in post-signin context)
	if (!user) {
		return '/'
	}

	// If user requested a specific path, validate if they can access it
	if (requestedPath && requestedPath !== '/auth/signin') {
		// Never redirect authenticated users to auth pages
		if (requestedPath.startsWith('/auth/')) {
			// Auth pages are not valid destinations for authenticated users
			// Fall through to role-based default
		} else if (canUserAccessPath(user, requestedPath)) {
			// For admin users, prioritize admin panel unless they specifically requested an admin route
			const role = getUserRole(user)
			const isAdminUser = ['ADMIN', 'MANAGER', 'EDITOR', 'BILLING', 'REFEREE'].includes(
				role,
			)
			const requestedAdminRoute = requestedPath.startsWith('/a7k9m2x5p8w1n4q6r3y8b5t1')

			// If admin user requested a non-admin route, redirect to admin panel instead
			if (isAdminUser && !requestedAdminRoute) {
				// Fall through to role-based default (admin panel)
			} else {
				return requestedPath
			}
		}
		// If they can't access the requested path, fall through to role-based default
	}

	// Get role-based landing page - default to homepage for any unknown roles
	const role = getUserRole(user)
	return ROLE_LANDING_PAGES[role] || '/'
}

/**
 * Check if a user can access a specific path based on their role
 */
export function canUserAccessPath(user: User | null, path: string): boolean {
	// Public routes are always accessible
	if (
		ALWAYS_PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
	) {
		return true
	}

	// Profile and settings require authentication but any role can access
	if (path.startsWith('/profile') || path.startsWith('/settings')) {
		return !!user
	}

	// Admin panel routes require admin role or referee role
	if (path.startsWith('/a7k9m2x5p8w1n4q6r3y8b5t1')) {
		if (!user) return false
		const role = getUserRole(user)
		return (
			role === 'ADMIN' ||
			role === 'MANAGER' ||
			role === 'EDITOR' ||
			role === 'BILLING' ||
			role === 'REFEREE'
		)
	}

	// Teams creation is public but might be rate-limited
	if (path === '/teams/new') {
		return true
	}

	// Default to requiring authentication for unknown paths
	return !!user
}

/**
 * Get appropriate redirect after sign out
 */
export function getPostSignOutRedirect(returnUrl?: string): string {
	// If return URL is provided and it's a public route, use it
	if (
		returnUrl &&
		ALWAYS_PUBLIC_ROUTES.some(
			(route) => returnUrl === route || returnUrl.startsWith(`${route}/`),
		)
	) {
		return returnUrl
	}

	// Default to home page
	return '/'
}

/**
 * Determine if a route should redirect authenticated users elsewhere
 * Used for auth pages that shouldn't be accessible when already logged in
 */
export function shouldRedirectAuthenticatedUser(
	user: User | null,
	currentPath: string,
): string | null {
	if (!user) {
		return null // Not authenticated, no redirect needed
	}

	// If user is on signin/signup pages, redirect to their appropriate landing page
	if (currentPath === '/auth/signin' || currentPath === '/auth/signup') {
		return getPostSignInRedirect(user)
	}

	return null // No redirect needed
}

/**
 * Get appropriate unauthorized redirect based on user role
 * Different roles might see different unauthorized pages
 */
export function getUnauthorizedRedirect(
	user: User | null,
	attemptedPath: string,
): string {
	if (!user) {
		// Not authenticated - redirect to signin with return path
		return `/auth/signin?redirectTo=${encodeURIComponent(attemptedPath)}`
	}

	// Authenticated but insufficient permissions
	const role = getUserRole(user)

	switch (role) {
		case 'PUBLIC':
			// Public users who try to access protected content
			return '/?error=insufficient-permissions'

		case 'REFEREE':
			// Referees who try to access content beyond their permissions
			return '/a7k9m2x5p8w1n4q6r3y8b5t1?error=insufficient-permissions'

		case 'MANAGER':
		case 'ADMIN':
			// Admin users hitting unauthorized (shouldn't happen often)
			return '/a7k9m2x5p8w1n4q6r3y8b5t1?error=access-denied'

		default:
			return '/?error=unauthorized'
	}
}

/**
 * Smart redirect helper for route loaders
 * Handles various redirect scenarios based on authentication and role
 */
export function getSmartRedirect(options: {
	user: User | null
	currentPath: string
	requestedPath?: string
	isProtectedRoute?: boolean
	requiredRole?: 'admin' | 'authenticated'
}): string | null {
	const { user, currentPath, isProtectedRoute, requiredRole } = options

	// Check if authenticated user should be redirected from auth pages
	const authRedirect = shouldRedirectAuthenticatedUser(user, currentPath)
	if (authRedirect) {
		return authRedirect
	}

	// If route is protected and user isn't authenticated
	if (isProtectedRoute && !user) {
		return `/auth/signin?redirectTo=${encodeURIComponent(currentPath)}`
	}

	// If route requires admin and user isn't admin
	if (requiredRole === 'admin' && (!user || !isAdmin(user))) {
		return getUnauthorizedRedirect(user, currentPath)
	}

	// If route requires authentication and user isn't authenticated
	if (requiredRole === 'authenticated' && !user) {
		return `/auth/signin?redirectTo=${encodeURIComponent(currentPath)}`
	}

	// No redirect needed
	return null
}
