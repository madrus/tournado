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

export function isAdminPath(path: string): boolean {
	const basePath = `/${getAdminBasePath()}`
	return path === basePath || path.startsWith(`${basePath}/`)
}
