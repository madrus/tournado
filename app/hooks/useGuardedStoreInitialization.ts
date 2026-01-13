import { useEffect, useRef } from 'react'

export type GuardedStoreInitializationOptions<T> = {
  serializer?: (payload: T) => string
  skipWhen?: () => boolean
  enabled?: () => boolean
}

export function useGuardedStoreInitialization<T>(
  getPayload: () => T | null | undefined,
  initialize: (payload: T) => void,
  dependencies: readonly unknown[] = [],
  options?: GuardedStoreInitializationOptions<T>,
): void {
  const { serializer = JSON.stringify, skipWhen, enabled } = options ?? {}
  const lastAppliedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (enabled?.() === false) {
      return
    }

    if (skipWhen?.()) {
      return
    }

    const payload = getPayload()
    if (!payload) {
      lastAppliedKeyRef.current = null
      return
    }

    const key = serializer(payload)
    if (lastAppliedKeyRef.current === key) {
      return
    }

    initialize(payload)
    lastAppliedKeyRef.current = key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPayload, initialize, serializer, skipWhen, enabled, ...dependencies])
}
