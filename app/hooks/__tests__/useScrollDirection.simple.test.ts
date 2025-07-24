import { renderHook } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { useScrollDirection } from '../useScrollDirection'

describe('useScrollDirection - Simple Tests', () => {
  it('should initialize with showHeader true', () => {
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current.showHeader).toBe(true)
  })

  it('should accept custom threshold parameter', () => {
    const { result } = renderHook(() => useScrollDirection(50))
    expect(result.current.showHeader).toBe(true)
  })

  it('should return the expected interface', () => {
    const { result } = renderHook(() => useScrollDirection())
    expect(result.current).toHaveProperty('showHeader')
    expect(typeof result.current.showHeader).toBe('boolean')
  })
})
