import { ADMIN_SLUG } from '../lib/lib.constants'

export function getAdminBasePath(): string {
	if (!ADMIN_SLUG || !ADMIN_SLUG.trim()) return 'admin'
	return ADMIN_SLUG.trim()
}

export function adminPath(path = ''): string {
	const basePath = `/${getAdminBasePath()}`
	if (!path) return basePath
	if (path.startsWith('?') || path.startsWith('#')) {
		return `${basePath}${path}`
	}
	return path.startsWith('/') ? `${basePath}${path}` : `${basePath}/${path}`
}

function getPathname(path: string): string {
	try {
		return new URL(path, 'http://local').pathname
	} catch {
		return path
	}
}

export function isAdminPath(path: string): boolean {
	const basePath = `/${getAdminBasePath()}`
	const pathname = getPathname(path)
	return pathname === basePath || pathname.startsWith(`${basePath}/`)
}
