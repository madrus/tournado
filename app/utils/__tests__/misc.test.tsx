import { describe, expect, test } from 'vitest'

import { cn, getErrorMessage, invariantResponse, isRouteErrorResponse } from '../misc'

describe('getErrorMessage', () => {
	test('returns string errors as-is', () => {
		expect(getErrorMessage('This is an error')).toBe('This is an error')
		expect(getErrorMessage('')).toBe('')
	})

	test('extracts message from error objects', () => {
		const errorWithMessage = { message: 'Something went wrong' }
		expect(getErrorMessage(errorWithMessage)).toBe('Something went wrong')

		const errorInstance = new Error('Test error')
		expect(getErrorMessage(errorInstance)).toBe('Test error')
	})

	test('returns "Unknown Error" for non-string non-object-with-message values', () => {
		expect(getErrorMessage(null)).toBe('Unknown Error')
		expect(getErrorMessage(undefined)).toBe('Unknown Error')
		expect(getErrorMessage(123)).toBe('Unknown Error')
		expect(getErrorMessage([])).toBe('Unknown Error')
		expect(getErrorMessage({})).toBe('Unknown Error')
		expect(getErrorMessage({ error: 'no message prop' })).toBe('Unknown Error')
	})

	test('handles objects with non-string message property', () => {
		expect(getErrorMessage({ message: 123 })).toBe('Unknown Error')
		expect(getErrorMessage({ message: null })).toBe('Unknown Error')
		expect(getErrorMessage({ message: {} })).toBe('Unknown Error')
	})
})

describe('cn', () => {
	test('merges class names correctly', () => {
		expect(cn('class1', 'class2')).toBe('class1 class2')
		expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
	})

	test('handles conditional classes', () => {
		expect(cn('base', true && 'conditional', false && 'excluded')).toBe('base conditional')
		expect(cn('base', { active: true, disabled: false })).toBe('base active')
	})

	test('handles empty values', () => {
		expect(cn()).toBe('')
		expect(cn('', null, undefined)).toBe('')
	})

	test('merges Tailwind classes correctly', () => {
		expect(cn('p-4 px-6')).toBe('p-4 px-6')
		expect(cn('bg-red-500', 'bg-green-500')).toBe('bg-green-500')
	})
})

describe('invariantResponse', () => {
	test('does not throw when condition is true', () => {
		expect(() => {
			invariantResponse(true, 'Should not throw if condition is true')
		}).not.toThrow()
	})

	test('throws Response when condition is false', () => {
		expect(() => {
			invariantResponse(false, 'Should throw if condition is false')
		}).toThrow(Response)
	})

	test('uses custom message when provided', () => {
		try {
			invariantResponse(false, 'Custom error message')
		} catch (error) {
			expect(error).toBeInstanceOf(Response)
			expect((error as Response).status).toBe(400)
		}
	})

	test('uses function message when provided', () => {
		try {
			invariantResponse(false, () => 'Dynamic error message')
		} catch (error) {
			expect(error).toBeInstanceOf(Response)
			expect((error as Response).status).toBe(400)
		}
	})

	test('uses default message when none provided', () => {
		try {
			invariantResponse(false)
		} catch (error) {
			expect(error).toBeInstanceOf(Response)
			expect((error as Response).status).toBe(400)
		}
	})

	test('respects custom responseInit', () => {
		try {
			invariantResponse(false, 'Test', { status: 422 })
		} catch (error) {
			expect(error).toBeInstanceOf(Response)
			expect((error as Response).status).toBe(422)
		}
	})
})

describe('isRouteErrorResponse', () => {
	test('returns true for route error responses', () => {
		const routeError = { status: 404, statusText: 'Not Found', data: null }
		expect(isRouteErrorResponse(routeError)).toBe(true)
	})

	test('returns true for objects with status property', () => {
		expect(isRouteErrorResponse({ status: 500 })).toBe(true)
		expect(isRouteErrorResponse({ status: 200, data: 'test' })).toBe(true)
	})

	test('returns false for non-objects', () => {
		expect(isRouteErrorResponse(null)).toBe(false)
		expect(isRouteErrorResponse(undefined)).toBe(false)
		expect(isRouteErrorResponse('string')).toBe(false)
		expect(isRouteErrorResponse(123)).toBe(false)
		expect(isRouteErrorResponse([])).toBe(false)
	})

	test('returns false for objects without status property', () => {
		expect(isRouteErrorResponse({})).toBe(false)
		expect(isRouteErrorResponse({ error: 'test' })).toBe(false)
		expect(isRouteErrorResponse({ data: 'test' })).toBe(false)
	})

	test('returns false for falsy values', () => {
		expect(isRouteErrorResponse(false)).toBe(false)
		expect(isRouteErrorResponse(0)).toBe(false)
		expect(isRouteErrorResponse('')).toBe(false)
	})
})
