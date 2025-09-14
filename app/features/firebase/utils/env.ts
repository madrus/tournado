export const TEST_BYPASS_HEADER = 'x-test-bypass'
const MOCK_TOKEN_PREFIX = 'mock-jwt-header.payload.signature-'

export const isE2EClient = (): boolean =>
  typeof window !== 'undefined' && Boolean(window.playwrightTest)

export const isUnitTestRuntime = (): boolean =>
  typeof process !== 'undefined' && process.env.NODE_ENV === 'test'

export const isE2EServer = (request: Request): boolean =>
  request.headers.get(TEST_BYPASS_HEADER) === 'true'

export const isMockToken = (token: string): boolean =>
  token.startsWith(MOCK_TOKEN_PREFIX)

export function extractEmailFromMockToken(token: string): string {
  const prefix = MOCK_TOKEN_PREFIX
  if (token.startsWith(prefix)) return token.slice(prefix.length)
  const parts = token.split('-')
  return parts[parts.length - 1] || 'test@example.com'
}

export function debug(...values: unknown[]): void {
  if (isE2EClient()) {
    // eslint-disable-next-line no-console
    console.log(...values)
  }
}

export { MOCK_TOKEN_PREFIX }
