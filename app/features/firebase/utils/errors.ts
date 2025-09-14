export function buildFriendlyMessage(
  code: string | undefined,
  originalError: unknown,
  map: Record<string, string>,
  defaultMessage: string
): string {
  if (code && map[code]) return map[code]
  if (originalError instanceof Error) return originalError.message
  return defaultMessage
}
