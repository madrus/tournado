/**
 * Safely parse JSON with error handling and fallback value
 * @param jsonString - The JSON string to parse
 * @param context - Context information for logging (e.g., function name, ID)
 * @param fallback - Fallback value to return on parse error
 * @returns Parsed value or fallback
 */
export function safeParseJSON<T>(
	jsonString: string | null | undefined,
	_context: string,
	fallback: T,
): T {
	// Handle null/undefined input
	if (jsonString == null) {
		return fallback
	}

	try {
		return JSON.parse(jsonString) as T
	} catch (_error) {
		return fallback
	}
}
