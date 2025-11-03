/**
 * Simple async mutex that serializes access to an asynchronous callback.
 * Ensures callbacks run sequentially in the current process without
 * introducing external dependencies.
 */
export function createMutex() {
  let current = Promise.resolve()

  return async function runExclusive(actionToRun) {
    const run = current.then(() => actionToRun())

    // Ensure the chain continues even if the callback rejects.
    current = run.catch(() => {})

    return run
  }
}
