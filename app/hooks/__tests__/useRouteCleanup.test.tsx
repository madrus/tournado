import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRouteCleanup } from '../useRouteCleanup'

describe('useRouteCleanup', () => {
	it('fires onLeave when navigating away from an active route', () => {
		const onLeave = vi.fn()
		const isActiveRoute = (path: string) => /\/competition\/groups\/[^/]+/.test(path)

		const { rerender } = renderHook(
			({ currentPath }) =>
				useRouteCleanup({
					currentPath,
					isActiveRoute,
					onLeave,
				}),
			{
				initialProps: {
					currentPath: '/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups/123',
				},
			},
		)

		rerender({
			currentPath: '/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups',
		})

		expect(onLeave).toHaveBeenCalledTimes(1)
	})

	it('does not fire onLeave when staying within the active route', () => {
		const onLeave = vi.fn()
		const isActiveRoute = (path: string) => /\/competition\/groups\/[^/]+/.test(path)

		const { rerender } = renderHook(
			({ currentPath }) =>
				useRouteCleanup({
					currentPath,
					isActiveRoute,
					onLeave,
				}),
			{
				initialProps: {
					currentPath: '/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups/123',
				},
			},
		)

		rerender({
			currentPath: '/a7k9m2x5p8w1n4q6r3y8b5t1/competition/groups/456',
		})

		expect(onLeave).not.toHaveBeenCalled()
	})
})
