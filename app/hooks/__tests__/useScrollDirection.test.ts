import { renderHook } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { useScrollDirection } from '../useScrollDirection'

describe('useScrollDirection', () => {
  it('should initialize with showHeader true', () => {
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current.showHeader).toBe(true)
  })

  it('should return the expected interface', () => {
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current).toHaveProperty('showHeader')
    expect(typeof result.current.showHeader).toBe('boolean')
  })

  describe('threshold handling', () => {
    it('should accept different threshold values', () => {
      const smallThreshold = renderHook(() => useScrollDirection(10))
      const largeThreshold = renderHook(() => useScrollDirection(100))

      // Both should initialize with header visible
      expect(smallThreshold.result.current.showHeader).toBe(true)
      expect(largeThreshold.result.current.showHeader).toBe(true)
    })

    it('should handle zero threshold', () => {
      const { result } = renderHook(() => useScrollDirection(0))
      expect(result.current.showHeader).toBe(true)
    })

    it('should handle negative threshold gracefully', () => {
      const { result } = renderHook(() => useScrollDirection(-20))
      expect(result.current.showHeader).toBe(true)
    })

    it('should handle very large threshold values', () => {
      const { result } = renderHook(() => useScrollDirection(10000))
      expect(result.current.showHeader).toBe(true)
    })

    it('should work with undefined threshold (use default)', () => {
      const { result } = renderHook(() => useScrollDirection(undefined))
      expect(result.current.showHeader).toBe(true)
    })

    it('should maintain consistent return type with threshold changes', () => {
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
  })
})
