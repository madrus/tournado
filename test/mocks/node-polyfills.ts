/**
 * Node.js polyfills for browser APIs required by MSW
 *
 * MSW 2.x uses localStorage internally for cookie persistence.
 * This provides a minimal in-memory implementation for Node.js environments.
 *
 * Note: Node.js 25+ has experimental localStorage that's incomplete/broken.
 * We forcefully override it to ensure MSW compatibility.
 *
 * @see https://github.com/mswjs/msw/issues/2624
 */

const store = new Map<string, string>()

globalThis.localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() {
    return store.size
  },
  key: (index: number) => Array.from(store.keys())[index] ?? null,
} as Storage
