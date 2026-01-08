import { useEffect, useRef } from 'react'

type UseRouteCleanupOptions = {
	currentPath: string
	isActiveRoute: (path: string) => boolean
	onLeave: () => void
}

export function useRouteCleanup({
	currentPath,
	isActiveRoute,
	onLeave,
}: UseRouteCleanupOptions): void {
	const previousPathRef = useRef(currentPath)

	useEffect(() => {
		const previousPath = previousPathRef.current

		if (
			previousPath !== currentPath &&
			isActiveRoute(previousPath) &&
			!isActiveRoute(currentPath)
		) {
			onLeave()
		}

		previousPathRef.current = currentPath
	}, [currentPath, isActiveRoute, onLeave])
}
