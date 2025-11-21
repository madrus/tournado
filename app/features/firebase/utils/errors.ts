export function buildFriendlyMessage(
	code: string | undefined,
	originalError: unknown,
	map: Record<string, string>,
	defaultMessage: string,
): string {
	if (code && map[code]?.trim()) return map[code]
	if (originalError instanceof Error) return originalError.message
	return defaultMessage
}
