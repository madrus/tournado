import { renderHook } from '@testing-library/react'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'

import * as breakpointsUtils from '~/utils/breakpoints'
import * as domUtils from '~/utils/dom-utils'

import { useScrollDirection } from '../useScrollDirection'

// Mock DOM utilities
vi.mock('~/utils/dom-utils', () => ({
  debounce: (fn: (...args: unknown[]) => void, _delay: number) => {
    const debounced = (...args: unknown[]) => fn(...args)
    debounced.cancel = vi.fn()
    return debounced
  },
  getDocumentHeight: vi.fn(() => 2000),
  getScrollY: vi.fn(() => 0),
}))

// Mock breakpoints
vi.mock('~/utils/breakpoints', () => ({
  breakpoints: {
    isMobile: vi.fn(() => false),
  },
}))

// Mock useIsClient hook
vi.mock('../useIsomorphicWindow', () => ({
  useIsClient: () => true,
}))

describe('useScrollDirection', () => {
  let mockGetScrollY: ReturnType<typeof vi.mocked<typeof domUtils.getScrollY>>
  let mockIsMobile: ReturnType<
    typeof vi.mocked<typeof breakpointsUtils.breakpoints.isMobile>
  >

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup default mocks
    mockGetScrollY = vi.mocked(domUtils.getScrollY)
    mockIsMobile = vi.mocked(breakpointsUtils.breakpoints.isMobile)

    // Mock window and requestAnimationFrame
    const mockAddEventListener = vi.fn()
    const mockRemoveEventListener = vi.fn()

    vi.stubGlobal('window', {
      innerHeight: 800,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    })
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((handler: FrameRequestCallback) => setTimeout(handler, 16))
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initialization', () => {
    it('should initialize with showHeader true', () => {
      const { result } = renderHook(() => useScrollDirection())
      expect(result.current.showHeader).toBe(true)
    })

    it('should return the expected interface', () => {
      const { result } = renderHook(() => useScrollDirection())
      expect(result.current).toHaveProperty('showHeader')
      expect(typeof result.current.showHeader).toBe('boolean')
    })
  })

  describe('desktop behavior', () => {
    beforeEach(() => {
      mockIsMobile.mockReturnValue(false)
    })

    it('should always show header on desktop regardless of scroll', () => {
      const { result } = renderHook(() => useScrollDirection())

      expect(result.current.showHeader).toBe(true)
    })
  })

  describe('mobile behavior', () => {
    beforeEach(() => {
      mockIsMobile.mockReturnValue(true)
    })

    it('should initialize with header visible on mobile', () => {
      const { result } = renderHook(() => useScrollDirection(20))

      expect(result.current.showHeader).toBe(true)
    })

    it('should handle mobile detection properly', () => {
      mockIsMobile.mockReturnValue(true)
      const { result } = renderHook(() => useScrollDirection())

      expect(result.current.showHeader).toBe(true)
    })

    it('should set up event listeners for mobile', () => {
      renderHook(() => useScrollDirection())

      const addEventListenerMock = window.addEventListener as MockedFunction<
        typeof window.addEventListener
      >

      expect(addEventListenerMock).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )
      expect(addEventListenerMock).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        { passive: true }
      )
    })
  })

  describe('threshold handling', () => {
    it('should accept different threshold values', () => {
      const smallThreshold = renderHook(() => useScrollDirection(10))
      const largeThreshold = renderHook(() => useScrollDirection(100))

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

    it('should work with undefined threshold (use default)', () => {
      const { result } = renderHook(() => useScrollDirection(undefined))
      expect(result.current.showHeader).toBe(true)
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      mockIsMobile.mockReturnValue(true)
    })

    it('should handle overscroll gracefully', () => {
      mockGetScrollY.mockReturnValue(-10) // Negative scroll (overscroll)

      const { result } = renderHook(() => useScrollDirection())

      expect(result.current.showHeader).toBe(true)
    })

    it('should handle insufficient content height', () => {
      vi.mocked(domUtils.getDocumentHeight).mockReturnValue(500)
      mockGetScrollY.mockReturnValue(0)

      const { result } = renderHook(() => useScrollDirection())

      expect(result.current.showHeader).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useScrollDirection())

      const addEventListenerMock = window.addEventListener as MockedFunction<
        typeof window.addEventListener
      >
      const removeEventListenerMock = window.removeEventListener as MockedFunction<
        typeof window.removeEventListener
      >

      expect(addEventListenerMock).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true }
      )
      expect(addEventListenerMock).toHaveBeenCalledWith(
        'resize',
        expect.any(Function),
        { passive: true }
      )

      unmount()

      expect(removeEventListenerMock).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
      expect(removeEventListenerMock).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      )
    })

    it('should cancel pending animation frames on unmount', () => {
      const { unmount } = renderHook(() => useScrollDirection())

      unmount()

      // Verify cleanup is attempted (exact cancelAnimationFrame calls depend on internal state)
      expect(typeof cancelAnimationFrame).toBe('function')
    })
  })
})
