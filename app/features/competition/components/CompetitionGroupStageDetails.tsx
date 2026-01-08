import { Component, type JSX, type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Panel } from '~/components/Panel'
import type { GroupStageWithDetails, UnassignedTeam } from '~/models/group.server'
import { adminPath } from '~/utils/adminRoutes'

import {
	createSnapshotFromLoader,
	type GroupAssignmentSnapshot,
} from '../utils/groupStageDnd'
import { GroupAssignmentBoard } from './GroupAssignmentBoard'

type CompetitionGroupStageDetailsProps = {
	groupStage: GroupStageWithDetails
	availableTeams: readonly UnassignedTeam[]
	tournamentId: string
	actionData?: {
		error?: string
	}
}

// Simple error boundary component
type ErrorBoundaryProps = {
	children: ReactNode
	fallback: (error: Error, reset: () => void) => ReactNode
}

type ErrorBoundaryState = {
	hasError: boolean
	error: Error | null
}

class SimpleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null })
		window.location.reload()
	}

	render(): ReactNode {
		if (this.state.hasError && this.state.error) {
			return this.props.fallback(this.state.error, this.handleReset)
		}
		return this.props.children
	}
}

function ErrorFallback({
	error,
	onReset,
}: {
	error: Error
	onReset: () => void
}): JSX.Element {
	const { t } = useTranslation()

	return (
		<Panel color='error' variant='content-panel' className='text-center'>
			<div className='space-y-4'>
				<h3 className='font-semibold text-lg'>{t('messages.panel.errorTitle')}</h3>
				<p className='text-foreground-light'>{t('messages.panel.errorBody')}</p>
				<p className='text-sm text-error-600 dark:text-error-400'>{error.message}</p>
				<button
					type='button'
					onClick={onReset}
					className='px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors'
				>
					{t('common.actions.retry')}
				</button>
			</div>
		</Panel>
	)
}

export function CompetitionGroupStageDetails({
	groupStage,
	availableTeams,
	tournamentId,
}: Readonly<CompetitionGroupStageDetailsProps>): JSX.Element {
	const { t } = useTranslation()

	// Create initial snapshot from loader data
	const initialSnapshot = useMemo(
		(): GroupAssignmentSnapshot => createSnapshotFromLoader(groupStage, availableTeams),
		[groupStage, availableTeams],
	)

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Link
						to={adminPath(`/competition/groups?tournament=${tournamentId}`)}
						className='text-sm text-brand hover:text-brand/80 transition-colors inline-flex items-center gap-1 mb-2'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 20 20'
							fill='currentColor'
							className='w-4 h-4 rtl:rotate-180'
							aria-hidden='true'
						>
							<path
								fillRule='evenodd'
								d='M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z'
								clipRule='evenodd'
							/>
						</svg>
						{t('competition.groupAssignment.backToGroups')}
					</Link>
				</div>
			</div>

			{/* Assignment board with error boundary */}
			<SimpleErrorBoundary
				fallback={(error, reset) => <ErrorFallback error={error} onReset={reset} />}
			>
				<GroupAssignmentBoard
					initialSnapshot={initialSnapshot}
					tournamentId={tournamentId}
				/>
			</SimpleErrorBoundary>
		</div>
	)
}
