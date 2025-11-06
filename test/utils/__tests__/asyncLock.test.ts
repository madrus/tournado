import { describe, expect, test } from 'vitest'

import { createMutex } from '../asyncLock'

describe('createMutex', () => {
  test('executes actions sequentially in registration order', async () => {
    const mutex = createMutex()
    const calls: string[] = []

    await mutex(async () => {
      calls.push('first')
    })
    await mutex(async () => {
      calls.push('second')
    })
    await mutex(async () => {
      calls.push('third')
    })

    expect(calls).toEqual(['first', 'second', 'third'])
  })

  test('surfaces errors while keeping the queue alive', async () => {
    const mutex = createMutex()
    const calls: string[] = []

    await mutex(async () => {
      calls.push('before-error')
    })

    await expect(
      mutex(async () => {
        calls.push('error')
        throw new Error('boom')
      })
    ).rejects.toThrow('boom')

    await mutex(async () => {
      calls.push('after-error')
    })

    expect(calls).toEqual(['before-error', 'error', 'after-error'])
  })

  test('serializes concurrent calls', async () => {
    const mutex = createMutex()
    const calls: string[] = []

    const first = mutex(async () => {
      calls.push('start-first')
      await new Promise(resolve => setTimeout(resolve, 10))
      calls.push('end-first')
    })

    const second = mutex(async () => {
      calls.push('start-second')
      calls.push('end-second')
    })

    await Promise.allSettled([first, second])

    expect(calls).toEqual(['start-first', 'end-first', 'start-second', 'end-second'])
  })
})
