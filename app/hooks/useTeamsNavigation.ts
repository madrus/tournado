import { useEffect } from 'react'
import { useNavigate, useRevalidator } from 'react-router'
import { adminPath } from '~/utils/adminRoutes'

type UseTeamsNavigationProps = {
	context: 'public' | 'admin'
}

type UseTeamsNavigationReturn = {
	handleTeamClick: (teamId: string) => void
}

/**
 * Custom hook for handling teams navigation
 * Provides context-aware navigation and handles browser history
 */
export function useTeamsNavigation({
	context,
}: UseTeamsNavigationProps): UseTeamsNavigationReturn {
	const navigate = useNavigate()
	const revalidator = useRevalidator()

	// Handle browser back/forward navigation
	useEffect(() => {
		const handlePopState = () => {
			revalidator.revalidate()
		}

		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [revalidator])

	// Context-aware team navigation
	const handleTeamClick = (teamId: string) => {
		if (context === 'admin') {
			navigate(adminPath(`/teams/${teamId}`))
		} else {
			navigate(`/teams/${teamId}`)
		}
	}

	return {
		handleTeamClick,
	}
}
