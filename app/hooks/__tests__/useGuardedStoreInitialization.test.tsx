import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useGuardedStoreInitialization } from '~/hooks/useGuardedStoreInitialization'

type TestPayload = {
  value: string
}

type TestProps = {
  value: string | null
  initializer: (payload: TestPayload) => void
  skip?: boolean
  enabled?: boolean
}

function TestComponent({ value, initializer, skip, enabled }: TestProps) {
  useGuardedStoreInitialization(
    () => (value ? { value } : null),
    initializer,
    [value, skip, enabled],
    {
      skipWhen: () => !!skip,
      enabled: () => enabled ?? true,
      serializer: payload => payload.value,
    },
  )

  return null
}

describe('useGuardedStoreInitialization', () => {
  it('initializes when payload is provided', () => {
    const initializer = vi.fn()
    render(<TestComponent value='first' initializer={initializer} />)

    expect(initializer).toHaveBeenCalledTimes(1)
  })

  it('does not reinitialize for the same payload', () => {
    const initializer = vi.fn()
    const { rerender } = render(
      <TestComponent value='first' initializer={initializer} />,
    )

    act(() => rerender(<TestComponent value='first' initializer={initializer} />))

    expect(initializer).toHaveBeenCalledTimes(1)
  })

  it('reinitializes when the payload changes', () => {
    const initializer = vi.fn()
    const { rerender } = render(
      <TestComponent value='first' initializer={initializer} />,
    )

    act(() => rerender(<TestComponent value='second' initializer={initializer} />))

    expect(initializer).toHaveBeenCalledTimes(2)
  })

  it('reinitializes after payload becomes null and then returns', () => {
    const initializer = vi.fn()
    const { rerender } = render(
      <TestComponent value='first' initializer={initializer} />,
    )

    expect(initializer).toHaveBeenCalledTimes(1)

    act(() => rerender(<TestComponent value={null} initializer={initializer} />))

    expect(initializer).toHaveBeenCalledTimes(1)

    act(() => rerender(<TestComponent value='first' initializer={initializer} />))

    expect(initializer).toHaveBeenCalledTimes(2)
  })

  it('skips initialization when skip guard is true', () => {
    const initializer = vi.fn()
    const { rerender } = render(
      <TestComponent value='first' initializer={initializer} skip />,
    )

    act(() => rerender(<TestComponent value='second' initializer={initializer} skip />))

    expect(initializer).not.toHaveBeenCalled()

    act(() =>
      rerender(<TestComponent value='third' initializer={initializer} skip={false} />),
    )

    expect(initializer).toHaveBeenCalledTimes(1)
  })

  it('initializes when enabled toggles from false to true', () => {
    const initializer = vi.fn()
    const { rerender } = render(
      <TestComponent value='alpha' initializer={initializer} enabled={false} />,
    )

    act(() =>
      rerender(
        <TestComponent value='alpha' initializer={initializer} enabled={true} />,
      ),
    )

    expect(initializer).toHaveBeenCalledTimes(1)
  })
})
