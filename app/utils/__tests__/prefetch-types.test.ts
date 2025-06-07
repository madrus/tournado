import { describe, expect, test } from 'vitest'

import {
  defaultPrefetchConfig,
  getAdaptivePrefetchStrategy,
  getPrefetchStrategy,
  routePrefetchOverrides,
} from '../prefetch-types'

describe('defaultPrefetchConfig', () => {
  test('has all required properties with correct types', () => {
    expect(defaultPrefetchConfig.primaryNavigation).toBe('intent')
    expect(defaultPrefetchConfig.secondaryNavigation).toBe('intent')
    expect(defaultPrefetchConfig.actionButtons).toBe('render')
    expect(defaultPrefetchConfig.listItems).toBe('intent')
    expect(defaultPrefetchConfig.pagination).toBe('render')
    expect(defaultPrefetchConfig.errorPageLinks).toBe('render')
  })

  test('uses performance-optimized strategies', () => {
    // Critical actions should be eager
    expect(defaultPrefetchConfig.actionButtons).toBe('render')
    expect(defaultPrefetchConfig.errorPageLinks).toBe('render')

    // Navigation should be intent-based for good UX without overwhelming network
    expect(defaultPrefetchConfig.primaryNavigation).toBe('intent')
    expect(defaultPrefetchConfig.secondaryNavigation).toBe('intent')
    expect(defaultPrefetchConfig.listItems).toBe('intent')
  })
})

describe('routePrefetchOverrides', () => {
  test('has expected route overrides', () => {
    expect(routePrefetchOverrides['/teams']).toBe('render')
    expect(routePrefetchOverrides['/profile']).toBe('intent')
    expect(routePrefetchOverrides['/settings']).toBe('intent')
    expect(routePrefetchOverrides['/auth/signin']).toBe('intent')
    expect(routePrefetchOverrides['/auth/signup']).toBe('intent')
    expect(routePrefetchOverrides['/a7k9m2x5p8w1n4q6r3y8b5t1']).toBe('intent')
    expect(routePrefetchOverrides['/about']).toBe('intent')
  })

  test('prioritizes high-traffic routes appropriately', () => {
    // Teams route should be eager as it's the main CTA
    expect(routePrefetchOverrides['/teams']).toBe('render')

    // Auth routes should be intent-based
    expect(routePrefetchOverrides['/auth/signin']).toBe('intent')
    expect(routePrefetchOverrides['/auth/signup']).toBe('intent')
  })
})

describe('getPrefetchStrategy', () => {
  test('returns route-specific overrides when available', () => {
    expect(getPrefetchStrategy('/teams', 'listItems')).toBe('render')
    expect(getPrefetchStrategy('/profile', 'primaryNavigation')).toBe('intent')
    expect(getPrefetchStrategy('/auth/signin', 'actionButtons')).toBe('intent')
  })

  test('falls back to context-based strategy when no override exists', () => {
    expect(getPrefetchStrategy('/unknown-route', 'primaryNavigation')).toBe('intent')
    expect(getPrefetchStrategy('/unknown-route', 'actionButtons')).toBe('render')
    expect(getPrefetchStrategy('/unknown-route', 'listItems')).toBe('intent')
    expect(getPrefetchStrategy('/unknown-route', 'pagination')).toBe('render')
    expect(getPrefetchStrategy('/unknown-route', 'errorPageLinks')).toBe('render')
  })

  test('uses custom config when provided', () => {
    const customConfig = {
      primaryNavigation: 'none' as const,
      secondaryNavigation: 'viewport' as const,
      actionButtons: 'intent' as const,
      listItems: 'render' as const,
      pagination: 'none' as const,
      errorPageLinks: 'viewport' as const,
    }

    expect(
      getPrefetchStrategy('/unknown-route', 'primaryNavigation', customConfig)
    ).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'actionButtons', customConfig)).toBe(
      'intent'
    )
    expect(getPrefetchStrategy('/unknown-route', 'listItems', customConfig)).toBe(
      'render'
    )
  })

  test('route overrides take precedence over custom config', () => {
    const customConfig = {
      primaryNavigation: 'none' as const,
      secondaryNavigation: 'none' as const,
      actionButtons: 'none' as const,
      listItems: 'none' as const,
      pagination: 'none' as const,
      errorPageLinks: 'none' as const,
    }

    // Route override should still take precedence
    expect(getPrefetchStrategy('/teams', 'actionButtons', customConfig)).toBe('render')
    expect(getPrefetchStrategy('/profile', 'primaryNavigation', customConfig)).toBe(
      'intent'
    )
  })
})

describe('getAdaptivePrefetchStrategy', () => {
  test('returns base strategy when no context provided', () => {
    expect(getAdaptivePrefetchStrategy('render')).toBe('render')
    expect(getAdaptivePrefetchStrategy('intent')).toBe('intent')
    expect(getAdaptivePrefetchStrategy('viewport')).toBe('viewport')
    expect(getAdaptivePrefetchStrategy('none')).toBe('none')
  })

  test('reduces prefetching on slow connections', () => {
    const context = { isSlowConnection: true }

    expect(getAdaptivePrefetchStrategy('render', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('intent', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('viewport', context)).toBe('none')
    expect(getAdaptivePrefetchStrategy('none', context)).toBe('none')
  })

  test('reduces prefetching in low data mode', () => {
    const context = { isLowDataMode: true }

    expect(getAdaptivePrefetchStrategy('render', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('intent', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('viewport', context)).toBe('none')
    expect(getAdaptivePrefetchStrategy('none', context)).toBe('none')
  })

  test('reduces aggressive prefetching on mobile', () => {
    const context = { isMobile: true }

    expect(getAdaptivePrefetchStrategy('render', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('intent', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('viewport', context)).toBe('viewport')
    expect(getAdaptivePrefetchStrategy('none', context)).toBe('none')
  })

  test('combines multiple context constraints', () => {
    const context = { isSlowConnection: true, isMobile: true }

    // Slow connection takes precedence over mobile optimizations
    expect(getAdaptivePrefetchStrategy('render', context)).toBe('intent')
    expect(getAdaptivePrefetchStrategy('viewport', context)).toBe('none')
  })

  test('handles edge cases', () => {
    const context = { isSlowConnection: false, isLowDataMode: false, isMobile: false }

    expect(getAdaptivePrefetchStrategy('render', context)).toBe('render')
    expect(getAdaptivePrefetchStrategy('intent', context)).toBe('intent')
  })
})
