/**
 * Cookie utilities for SSR-compatible state persistence
 */

/**
 * Sets a cookie with standard parameters for SSR
 * @param name - Cookie name
 * @param value - Cookie value
 */
export function setCookie(name: string, value: string): void {
	if (typeof document !== 'undefined') {
		document.cookie = `${name}=${value}; path=/; max-age=31536000`
	}
}
