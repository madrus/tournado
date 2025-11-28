import { type ClassValue, clsx } from 'clsx'
import { useEffect } from 'react'
import { type ErrorResponse, useFormAction, useNavigation } from 'react-router'
import { twMerge } from 'tailwind-merge'

/**
 * Does its best to get a string error message from an unknown error.
 */
export function getErrorMessage(error: unknown): string {
	if (typeof error === 'string') return error
	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof error.message === 'string'
	) {
		return error.message
	}

	return 'Unknown Error'
}

/**
 * A handy utility that makes constructing class names easier.
 * It also merges tailwind classes.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

/**
 * A simple assertion function that throws an error if the condition is false.
 * Inspired by tiny-invariant.
 *
 * @example
 * invariant(typeof value === 'string', `Expected string, got ${typeof value}`)
 *
 * @param condition The condition to check
 * @param message The message to throw if condition is false
 * @throws {Error} if condition is falsey
 */
export function invariant(
	condition: unknown,
	message: string | (() => string),
): asserts condition {
	if (!condition) {
		throw new Error(typeof message === 'function' ? message() : message)
	}
}

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 *
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
	condition: boolean,
	message?: string | (() => string),
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw new Response(
			typeof message === 'function'
				? message()
				: message || 'An invariant failed, please provide a message to explain why.',
			{ status: 400, ...responseInit },
		)
	}
}

/**
 * Returns true if the current navigation is submitting the current route's
 * form. Defaults to the current route's form action and method POST.
 */
export function useIsSubmitting({
	formAction,
	formMethod = 'POST',
}: {
	formAction?: string
	formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
} = {}): boolean {
	const contextualFormAction = useFormAction()
	const navigation = useNavigation()
	return (
		navigation.state === 'submitting' &&
		navigation.formAction === (formAction ?? contextualFormAction) &&
		navigation.formMethod === formMethod
	)
}

/**
 * A hook that focuses the first invalid element in a form.
 */
export function useFocusInvalid(
	formEl: HTMLFormElement | null,
	hasErrors: boolean,
): void {
	useEffect(() => {
		if (!formEl) return
		if (!hasErrors) return

		if (formEl.matches('[aria-invalid="true"]')) {
			formEl.focus()
		} else {
			const firstInvalid = formEl.querySelector('[aria-invalid="true"]')
			if (firstInvalid instanceof HTMLElement) {
				firstInvalid.focus()
			}
		}
	}, [formEl, hasErrors])
}

export const isRouteErrorResponse = (error: unknown): error is ErrorResponse =>
	!!error &&
	typeof error === 'object' &&
	'status' in error &&
	typeof error.status === 'number'
