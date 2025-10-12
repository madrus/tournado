/* eslint-disable no-console */
/**
 * Safely parse JSON with error handling and fallback value
 * @param jsonString - The JSON string to parse
 * @param context - Context information for logging (e.g., function name, ID)
 * @param fallback - Fallback value to return on parse error
 * @returns Parsed value or fallback
 */
export function safeParseJSON<T>(
  jsonString: string | null | undefined,
  context: string,
  fallback: T
): T {
  // Handle null/undefined input
  if (jsonString == null) {
    console.warn(
      `[JSON Parse] Null/undefined value in ${context}, using fallback:`,
      fallback
    )
    return fallback
  }

  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error(`[JSON Parse] Error in ${context}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      value: String(jsonString).substring(0, 100), // Log first 100 chars
      fallback,
    })
    return fallback
  }
}
