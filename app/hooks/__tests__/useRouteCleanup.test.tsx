import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { adminPath } from '~/utils/adminRoutes'
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
					currentPath: adminPath('/competition/groups/123'),
				},
			},
		)

		rerender({
			currentPath: adminPath('/competition/groups'),
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
					currentPath: adminPath('/competition/groups/123'),
				},
			},
		)

		rerender({
			currentPath: adminPath('/competition/groups/456'),
		})

		expect(onLeave).not.toHaveBeenCalled()
	})
})
