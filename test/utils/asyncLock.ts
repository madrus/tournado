/**
 * Simple async mutex that serializes access to an asynchronous callback.
 * Ensures callbacks run sequentially in the current process without
 * introducing external dependencies.
 */
export function createMutex(): <R>(actionToRun: () => Promise<R>) => Promise<R> {
  let current: Promise<unknown> = Promise.resolve()

  return function runExclusive<R>(actionToRun: () => Promise<R>): Promise<R> {
    const run = (async (): Promise<R> => {
      await current
      return actionToRun()
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
