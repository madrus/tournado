import { renderHook } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { useMediaQuery } from '../useMediaQuery'

describe('useMediaQuery', () => {
  it('should return false initially in test environment', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'))
    expect(result.current).toBe(false)
  })

  it('should handle different media query strings', () => {
    const mobile = renderHook(() => useMediaQuery('(max-width: 767px)'))
    const desktop = renderHook(() => useMediaQuery('(min-width: 768px)'))
    const portrait = renderHook(() => useMediaQuery('(orientation: portrait)'))

    expect(typeof mobile.result.current).toBe('boolean')
    expect(typeof desktop.result.current).toBe('boolean')
    expect(typeof portrait.result.current).toBe('boolean')
  })

  it('should maintain consistent return type', () => {
    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(max-width: 500px)' },
    })

    expect(typeof result.current).toBe('boolean')

    // Change query
    rerender({ query: '(max-width: 1000px)' })
    expect(typeof result.current).toBe('boolean')
  })

  it('should handle empty query string gracefully', () => {
    const { result } = renderHook(() => useMediaQuery(''))
    expect(typeof result.current).toBe('boolean')
  })

  it('should work with complex media queries', () => {
    const { result } = renderHook(() =>
      useMediaQuery('(max-width: 767px) and (orientation: portrait)')
    )
    expect(typeof result.current).toBe('boolean')
  })
})
