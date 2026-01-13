import { describe, expect, test } from 'vitest'
import {
  defaultPrefetchConfig,
  getAdaptivePrefetchStrategy,
  getPrefetchStrategy,
  routePrefetchOverrides,
} from '../prefetchTypes'

describe('defaultPrefetchConfig in test environment', () => {
  test('disables all prefetching during tests', () => {
    // In test environment, all strategies should be 'none' to reduce network noise
    expect(defaultPrefetchConfig.primaryNavigation).toBe('none')
    expect(defaultPrefetchConfig.secondaryNavigation).toBe('none')
    expect(defaultPrefetchConfig.actionButtons).toBe('none')
    expect(defaultPrefetchConfig.listItems).toBe('none')
    expect(defaultPrefetchConfig.pagination).toBe('none')
    expect(defaultPrefetchConfig.errorPageLinks).toBe('none')
  })
})

describe('routePrefetchOverrides in test environment', () => {
  test('disables all route overrides during tests', () => {
    // In test environment, route overrides should be empty to reduce network load
    expect(Object.keys(routePrefetchOverrides)).toHaveLength(0)
  })
})

describe('getPrefetchStrategy in test environment', () => {
  test('always returns none during tests regardless of route or context', () => {
    expect(getPrefetchStrategy('/teams', 'listItems')).toBe('none')
    expect(getPrefetchStrategy('/profile', 'primaryNavigation')).toBe('none')
    expect(getPrefetchStrategy('/auth/signin', 'actionButtons')).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'primaryNavigation')).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'actionButtons')).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'listItems')).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'pagination')).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'errorPageLinks')).toBe('none')
  })

  test('returns none even with custom config during tests', () => {
    const customConfig = {
      primaryNavigation: 'render' as const,
      secondaryNavigation: 'viewport' as const,
      actionButtons: 'intent' as const,
      listItems: 'render' as const,
      pagination: 'render' as const,
      errorPageLinks: 'viewport' as const,
    }

    expect(
      getPrefetchStrategy('/unknown-route', 'primaryNavigation', customConfig),
    ).toBe('none')
    expect(getPrefetchStrategy('/unknown-route', 'actionButtons', customConfig)).toBe(
      'none',
    )
    expect(getPrefetchStrategy('/unknown-route', 'listItems', customConfig)).toBe(
      'none',
    )
  })
})

describe('getAdaptivePrefetchStrategy in test environment', () => {
  test('always returns none during tests regardless of context', () => {
    expect(getAdaptivePrefetchStrategy('render')).toBe('none')
    expect(getAdaptivePrefetchStrategy('intent')).toBe('none')
    expect(getAdaptivePrefetchStrategy('viewport')).toBe('none')
    expect(getAdaptivePrefetchStrategy('none')).toBe('none')
  })

  test('returns none even with network context during tests', () => {
    const context = { isSlowConnection: true }
    expect(getAdaptivePrefetchStrategy('render', context)).toBe('none')
    expect(getAdaptivePrefetchStrategy('intent', context)).toBe('none')
    expect(getAdaptivePrefetchStrategy('viewport', context)).toBe('none')

    const lowDataContext = { isLowDataMode: true }
    expect(getAdaptivePrefetchStrategy('render', lowDataContext)).toBe('none')
    expect(getAdaptivePrefetchStrategy('intent', lowDataContext)).toBe('none')

    const mobileContext = { isMobile: true }
    expect(getAdaptivePrefetchStrategy('render', mobileContext)).toBe('none')
    expect(getAdaptivePrefetchStrategy('intent', mobileContext)).toBe('none')
  })
})

// Note: The following behavior applies in production environment
// where isTestEnvironment() returns false:
//
// Production behavior (for documentation):
// - defaultPrefetchConfig.primaryNavigation: 'intent'
// - defaultPrefetchConfig.actionButtons: 'render'
// - routePrefetchOverrides['/teams']: 'render'
// - getPrefetchStrategy with route overrides works as expected
// - getAdaptivePrefetchStrategy respects network conditions
