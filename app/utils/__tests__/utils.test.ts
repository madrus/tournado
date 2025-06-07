import { describe, expect, test } from 'vitest'

import { capitalize, safeRedirect, validateEmail } from '../utils'

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
