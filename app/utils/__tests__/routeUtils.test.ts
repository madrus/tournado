/* eslint-disable id-blacklist */
import { renderHook } from '@testing-library/react'

import {
  capitalize,
  normalizePathname,
  safeRedirect,
  usePageTitle,
  validateEmail,
} from '../routeUtils'

// Mock react-router hooks
vi.mock('react-router', () => ({
  useMatches: vi.fn(),
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}))

const mockUseMatches = vi.mocked(await import('react-router')).useMatches
const mockUseTranslation = vi.mocked(await import('react-i18next')).useTranslation

// Simplified mock types using unknown casting

describe('route-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePageTitle', () => {
    const mockT = vi.fn()

    beforeEach(() => {
      mockUseTranslation.mockReturnValue({
        t: mockT,
        i18n: {
          language: 'en',
          changeLanguage: vi.fn(),
        },
        ready: true,
      } as unknown as ReturnType<typeof mockUseTranslation>)
    })

    it('should return empty string when no matches', () => {
      mockUseMatches.mockReturnValue([])

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('')
      expect(mockT).not.toHaveBeenCalled()
    })

    it('should return empty string when matches have no titles', () => {
      mockUseMatches.mockReturnValue([
        { id: '1', pathname: '/', params: {}, data: null, handle: null },
        {
          id: '2',
          pathname: '/teams',
          params: {},
          data: null,
          handle: { isPublic: true },
        },
        {
          id: '3',
          pathname: '/teams/123',
          params: {},
          data: null,
          handle: { isPublic: false },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('')
      expect(mockT).not.toHaveBeenCalled()
    })

    it('should return translated title from most specific route', () => {
      mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'pages.team.title': 'Team Details',
          'pages.teams.title': 'Teams Overview',
          'pages.home.title': 'Home',
        }
        return translations[key] || key
      })

      mockUseMatches.mockReturnValue([
        {
          id: '1',
          pathname: '/',
          params: {},
          data: null,
          handle: { title: 'pages.home.title', isPublic: true },
        },
        {
          id: '2',
          pathname: '/teams',
          params: {},
          data: null,
          handle: { title: 'pages.teams.title', isPublic: true },
        },
        {
          id: '3',
          pathname: '/teams/123',
          params: {},
          data: null,
          handle: { title: 'pages.team.title', isPublic: false },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('Team Details')
      expect(mockT).toHaveBeenCalledWith('pages.team.title')
    })

    it('should fallback to less specific route when most specific has no title', () => {
      mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'pages.teams.title': 'Teams Overview',
          'pages.home.title': 'Home',
        }
        return translations[key] || key
      })

      mockUseMatches.mockReturnValue([
        {
          id: '1',
          pathname: '/',
          params: {},
          data: null,
          handle: { title: 'pages.home.title', isPublic: true },
        },
        {
          id: '2',
          pathname: '/teams',
          params: {},
          data: null,
          handle: { title: 'pages.teams.title', isPublic: true },
        },
        {
          id: '3',
          pathname: '/teams/123',
          params: {},
          data: null,
          handle: { isPublic: false }, // No title in most specific route
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('Teams Overview')
      expect(mockT).toHaveBeenCalledWith('pages.teams.title')
    })

    it('should handle routes with handle but no title property', () => {
      mockUseMatches.mockReturnValue([
        {
          id: '1',
          pathname: '/',
          params: {},
          data: null,
          handle: { isPublic: true }, // Has handle but no title
        },
        {
          id: '2',
          pathname: '/teams',
          params: {},
          data: null,
          handle: null,
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('')
      expect(mockT).not.toHaveBeenCalled()
    })

    it('should handle single route with title', () => {
      mockT.mockReturnValue('Dashboard')

      mockUseMatches.mockReturnValue([
        {
          id: '1',
          pathname: '/dashboard',
          params: {},
          data: null,
          handle: { title: 'pages.dashboard.title', isPublic: false },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('Dashboard')
      expect(mockT).toHaveBeenCalledWith('pages.dashboard.title')
    })

    it('should memoize results and only recompute when dependencies change', () => {
      mockT.mockReturnValue('Teams')

      const initialMatches = [
        {
          id: '1',
          pathname: '/teams',
          params: {},
          data: null,
          handle: { title: 'pages.teams.title', isPublic: true },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>

      mockUseMatches.mockReturnValue(initialMatches)

      const { result, rerender } = renderHook(() => usePageTitle())

      expect(result.current).toBe('Teams')
      expect(mockT).toHaveBeenCalledTimes(1)

      // Rerender with same data - should not call t again due to memoization
      rerender()
      expect(mockT).toHaveBeenCalledTimes(1)

      // Change matches - should recompute
      const newMatches = [
        {
          id: '1',
          pathname: '/about',
          params: {},
          data: null,
          handle: { title: 'pages.about.title', isPublic: true },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>
      mockUseMatches.mockReturnValue(newMatches)
      mockT.mockReturnValue('About')

      rerender()
      expect(mockT).toHaveBeenCalledTimes(2)
      expect(mockT).toHaveBeenLastCalledWith('pages.about.title')
      expect(result.current).toBe('About')
    })

    it('should handle translation function changes', () => {
      const initialT = vi.fn().mockReturnValue('Initial Title')
      const newT = vi.fn().mockReturnValue('Updated Title')

      mockUseMatches.mockReturnValue([
        {
          id: '1',
          pathname: '/test',
          params: {},
          data: null,
          handle: { title: 'pages.test.title', isPublic: true },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      // Initial render
      mockUseTranslation.mockReturnValue({
        t: initialT,
        i18n: { language: 'en', changeLanguage: vi.fn() },
        ready: true,
      } as unknown as ReturnType<typeof mockUseTranslation>)

      const { result, rerender } = renderHook(() => usePageTitle())

      expect(result.current).toBe('Initial Title')
      expect(initialT).toHaveBeenCalledWith('pages.test.title')

      // Change translation function
      mockUseTranslation.mockReturnValue({
        t: newT,
        i18n: { language: 'en', changeLanguage: vi.fn() },
        ready: true,
      } as unknown as ReturnType<typeof mockUseTranslation>)

      rerender()

      expect(result.current).toBe('Updated Title')
      expect(newT).toHaveBeenCalledWith('pages.test.title')
    })

    it('should handle complex nested route structures', () => {
      mockT.mockImplementation((key: string) => {
        const translations: Record<string, string> = {
          'pages.admin.users.edit.title': 'Edit User',
          'pages.admin.users.title': 'Manage Users',
          'pages.admin.title': 'Admin Panel',
          'pages.home.title': 'Home',
        }
        return translations[key] || key
      })

      mockUseMatches.mockReturnValue([
        {
          id: 'root',
          pathname: '/',
          params: {},
          data: null,
          handle: { title: 'pages.home.title', isPublic: true },
        },
        {
          id: 'admin',
          pathname: '/admin',
          params: {},
          data: null,
          handle: { title: 'pages.admin.title', isPublic: false },
        },
        {
          id: 'admin.users',
          pathname: '/admin/users',
          params: {},
          data: null,
          handle: { title: 'pages.admin.users.title', isPublic: false },
        },
        {
          id: 'admin.users.edit',
          pathname: '/admin/users/123/edit',
          params: { userId: '123' },
          data: null,
          handle: { title: 'pages.admin.users.edit.title', isPublic: false },
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('Edit User')
      expect(mockT).toHaveBeenCalledWith('pages.admin.users.edit.title')
    })

    it('should handle malformed route metadata gracefully', () => {
      mockUseMatches.mockReturnValue([
        {
          id: '1',
          pathname: '/test',
          params: {},
          data: null,
          handle: { title: null, isPublic: true }, // null title
        },
        {
          id: '2',
          pathname: '/test/sub',
          params: {},
          data: null,
          handle: { title: undefined, isPublic: true }, // undefined title
        },
        {
          id: '3',
          pathname: '/test/sub/deep',
          params: {},
          data: null,
          handle: { title: '', isPublic: true }, // empty string title
        },
      ] as unknown as ReturnType<typeof mockUseMatches>)

      const { result } = renderHook(() => usePageTitle())

      expect(result.current).toBe('')
      expect(mockT).not.toHaveBeenCalled()
    })
  })

  describe('normalizePathname', () => {
    it('should remove trailing slashes from paths', () => {
      expect(normalizePathname('/about/')).toBe('/about')
      expect(normalizePathname('/teams/')).toBe('/teams')
      expect(normalizePathname('/users/profile/')).toBe('/users/profile')
    })

    it('should preserve paths without trailing slashes', () => {
      expect(normalizePathname('/about')).toBe('/about')
      expect(normalizePathname('/teams')).toBe('/teams')
      expect(normalizePathname('/users/profile')).toBe('/users/profile')
    })

    it('should preserve root path', () => {
      expect(normalizePathname('/')).toBe('/')
    })

    it('should handle empty strings and whitespace', () => {
      expect(normalizePathname('')).toBe('/')
      expect(normalizePathname('   ')).toBe('/')
      expect(normalizePathname('\t')).toBe('/')
      expect(normalizePathname('\n')).toBe('/')
    })

    it('should handle multiple trailing slashes', () => {
      expect(normalizePathname('/about//')).toBe('/about/')
      expect(normalizePathname('/teams///')).toBe('/teams//')
      // Note: Only removes ONE trailing slash as per implementation
    })

    it('should handle complex paths', () => {
      expect(normalizePathname('/api/v1/users/123/')).toBe('/api/v1/users/123')
      expect(normalizePathname('/dashboard/settings/profile/')).toBe(
        '/dashboard/settings/profile'
      )
    })

    it('should handle paths with query-like strings (though not actual query params)', () => {
      // Note: This function only handles pathnames, not full URLs
      expect(normalizePathname('/search?q=test/')).toBe('/search?q=test')
      expect(normalizePathname('/results#section/')).toBe('/results#section')
    })

    it('should handle edge cases', () => {
      expect(normalizePathname('//')).toBe('/')
      expect(normalizePathname('///')).toBe('//')
      expect(normalizePathname('/a/')).toBe('/a')
      expect(normalizePathname('/1/')).toBe('/1')
    })

    describe('route matching use cases', () => {
      it('should normalize paths consistently for route matching', () => {
        // Simulate common route matching scenarios
        const testCases = [
          { path1: '/teams', path2: '/teams/', shouldMatch: true },
          { path1: '/teams/', path2: '/teams', shouldMatch: true },
          { path1: '/teams/', path2: '/teams/', shouldMatch: true },
          { path1: '/', path2: '/', shouldMatch: true },
          { path1: '/about', path2: '/teams', shouldMatch: false },
          { path1: '/about/', path2: '/teams/', shouldMatch: false },
        ]

        testCases.forEach(({ path1, path2, shouldMatch }) => {
          const normalized1 = normalizePathname(path1)
          const normalized2 = normalizePathname(path2)

          if (shouldMatch) {
            expect(normalized1).toBe(normalized2)
          } else {
            expect(normalized1).not.toBe(normalized2)
          }
        })
      })

      it('should handle NavigationItem component use cases', () => {
        // Test cases specifically for NavigationItem component
        const navigationPaths = ['/', '/teams', '/tournaments', '/settings', '/about']

        // Test that paths with and without trailing slashes normalize to the same value
        navigationPaths.forEach(path => {
          const withSlash = normalizePathname(path + '/')
          const withoutSlash = normalizePathname(path)

          if (path === '/') {
            // Root path special case
            expect(withSlash).toBe('/')
            expect(withoutSlash).toBe('/')
          } else {
            // All other paths should be equal after normalization
            expect(withSlash).toBe(withoutSlash)
            expect(withSlash).toBe(path) // Should equal the original path without slash
          }
        })
      })
    })

    describe('performance and type safety', () => {
      it('should handle various string types', () => {
        // Test with different string constructions
        const dynamicPath = ['', 'teams', ''].join('/')
        expect(normalizePathname(dynamicPath)).toBe('/teams')

        const templatePath = `/users/${'123'}/`
        expect(normalizePathname(templatePath)).toBe('/users/123')
      })

      it('should be deterministic', () => {
        const testPaths = ['/about/', '/', '/teams', '', '   ']

        // Run multiple times to ensure consistent results
        testPaths.forEach(path => {
          const result1 = normalizePathname(path)
          const result2 = normalizePathname(path)
          const result3 = normalizePathname(path)

          expect(result1).toBe(result2)
          expect(result2).toBe(result3)
        })
      })
    })
  })

  describe('validateEmail', () => {
    test('returns false for non-emails', () => {
      expect(validateEmail(undefined)).toBe(false)
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('not-an-email')).toBe(false)
      expect(validateEmail('n@')).toBe(false)
    })

    test('returns true for emails', () => {
      expect(validateEmail('kody@example.com')).toBe(true)
    })

    test('returns false for short strings', () => {
      expect(validateEmail('a@')).toBe(false)
      expect(validateEmail('ab')).toBe(false)
      expect(validateEmail('a@b')).toBe(false)
    })

    test('returns true for valid email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('name+tag@example.org')).toBe(true)
    })
  })

  describe('safeRedirect', () => {
    test('returns default redirect for null/undefined values', () => {
      expect(safeRedirect(null)).toBe('/')
      expect(safeRedirect(undefined)).toBe('/')
      expect(safeRedirect('')).toBe('/')
      expect(safeRedirect('   ')).toBe('/')
    })

    test('returns custom default redirect when provided', () => {
      expect(safeRedirect(null, '/home')).toBe('/home')
      expect(safeRedirect(undefined, '/dashboard')).toBe('/dashboard')
      expect(safeRedirect('', '/login')).toBe('/login')
    })

    test('returns default redirect for non-string values', () => {
      expect(safeRedirect(123 as unknown as string)).toBe('/')
      expect(safeRedirect([] as unknown as string)).toBe('/')
      expect(safeRedirect({} as unknown as string)).toBe('/')
    })

    test('returns default redirect for unsafe redirects', () => {
      expect(safeRedirect('//example.com')).toBe('/')
      expect(safeRedirect('//evil.com/hack')).toBe('/')
      expect(safeRedirect('https://example.com')).toBe('/')
      expect(safeRedirect('http://example.com')).toBe('/')
      expect(safeRedirect('javascript:alert(1)')).toBe('/')
    })

    test('returns safe relative paths', () => {
      expect(safeRedirect('/home')).toBe('/home')
      expect(safeRedirect('/users/123')).toBe('/users/123')
      expect(safeRedirect('/teams/new')).toBe('/teams/new')
      expect(safeRedirect('/path/with/nested/segments')).toBe(
        '/path/with/nested/segments'
      )
    })

    test('returns safe paths with query parameters', () => {
      expect(safeRedirect('/home?param=value')).toBe('/home?param=value')
      expect(safeRedirect('/search?q=test&page=1')).toBe('/search?q=test&page=1')
    })

    test('returns safe paths with hash fragments', () => {
      expect(safeRedirect('/page#section')).toBe('/page#section')
      expect(safeRedirect('/docs#introduction')).toBe('/docs#introduction')
    })
  })

  describe('capitalize', () => {
    test('capitalizes first letter and lowercases rest', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
      expect(capitalize('tEST')).toBe('Test')
      expect(capitalize('javaScript')).toBe('Javascript')
    })

    test('handles empty strings', () => {
      expect(capitalize('')).toBe('')
    })

    test('handles single character strings', () => {
      expect(capitalize('a')).toBe('A')
      expect(capitalize('Z')).toBe('Z')
    })

    test('handles strings with numbers and special characters', () => {
      expect(capitalize('123test')).toBe('123test')
      expect(capitalize('test123')).toBe('Test123')
      expect(capitalize('hello-world')).toBe('Hello-world')
      expect(capitalize('test_case')).toBe('Test_case')
    })

    test('handles non-English characters', () => {
      expect(capitalize('josé')).toBe('José')
      expect(capitalize('münchen')).toBe('München')
    })
  })
})
