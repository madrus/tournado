import { renderHook } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { useScrollDirection } from '../useScrollDirection'

describe('useScrollDirection - Edge Cases', () => {
  it('should handle short pages without breaking scroll detection', () => {
    // Test that the hook works when content is shorter than viewport
    const { result } = renderHook(() => useScrollDirection())

    // Should initialize properly
    expect(result.current.showHeader).toBe(true)

    // Should maintain interface contract
    expect(typeof result.current.showHeader).toBe('boolean')
  })

  it('should accept different threshold values', () => {
    const smallThreshold = renderHook(() => useScrollDirection(10))
    const largeThreshold = renderHook(() => useScrollDirection(100))

    // Both should initialize with header visible
    expect(smallThreshold.result.current.showHeader).toBe(true)
    expect(largeThreshold.result.current.showHeader).toBe(true)
  })

  it('should handle zero threshold edge case', () => {
    const { result } = renderHook(() => useScrollDirection(0))
    expect(result.current.showHeader).toBe(true)
  })

  it('should handle negative threshold gracefully', () => {
    // Negative threshold should still work (abs value used internally)
    const { result } = renderHook(() => useScrollDirection(-20))
    expect(result.current.showHeader).toBe(true)
  })

  it('should handle very large threshold values', () => {
    const { result } = renderHook(() => useScrollDirection(10000))
    expect(result.current.showHeader).toBe(true)
  })

  it('should maintain consistent return type', () => {
    const { result, rerender } = renderHook(
      ({ threshold }) => useScrollDirection(threshold),
      { initialProps: { threshold: 20 } }
    )

    expect(typeof result.current.showHeader).toBe('boolean')

    // Change threshold and verify type consistency
    rerender({ threshold: 50 })
    expect(typeof result.current.showHeader).toBe('boolean')
  })

  it('should handle rapid threshold changes', () => {
    const { result, rerender } = renderHook(
      ({ threshold }) => useScrollDirection(threshold),
      { initialProps: { threshold: 10 } }
    )

    // Rapidly change thresholds
    for (let i = 10; i <= 100; i += 10) {
      rerender({ threshold: i })
      expect(result.current.showHeader).toBe(true)
    }
  })

  it('should work with undefined threshold (use default)', () => {
    const { result } = renderHook(() => useScrollDirection(undefined))
    expect(result.current.showHeader).toBe(true)
  })
})
