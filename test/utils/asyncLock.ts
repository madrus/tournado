/**
 * Simple async mutex that serializes access to an asynchronous callback.
 * Ensures callbacks run sequentially in the current process without
 * introducing external dependencies.
 */
export function createMutex() {
  let current = Promise.resolve()

  return function runExclusive(actionToRun: () => Promise<unknown>): Promise<void> {
    const run = (async (): Promise<void> => {
      await current
      return (await actionToRun()) as Promise<void>
    })()

    // Ensure the chain continues even if the callback rejects.
    current = (async () => {
      try {
        await run
      } catch {
        // Swallow to keep the queue alive for subsequent calls.
      }
    })()

    return run
  }
}
