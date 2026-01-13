import type { SortingState } from '@tanstack/react-table'
import { type JSX, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { redirect, useLoaderData, useNavigate, useSubmit } from 'react-router'
import { DataTable } from '~/components/DataTable'
import { Panel } from '~/components/Panel'
import { TrophyIcon } from '~/components/icons'
import { TournamentMobileRow } from '~/features/tournaments/components/TournamentMobileRow'
import { createTournamentColumns } from '~/features/tournaments/components/TournamentTableColumns'
import type { TournamentListItem } from '~/features/tournaments/types'
import { useLanguageDirection } from '~/hooks/useLanguageDirection'
import { deleteTournamentById, getAllTournaments } from '~/models/tournament.server'
import { STATS_PANEL_MIN_WIDTH } from '~/styles/constants'
import { adminPath } from '~/utils/adminRoutes'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import type { Route } from './+types/tournaments._index'

// Local constants
const PANEL_COLOR = 'teal' as const

// Route metadata - requires tournaments read permission
export const handle: RouteMetadata = {
	isPublic: false,
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN', 'MANAGER'],
		redirectTo: '/unauthorized',
	},
}

export const meta: MetaFunction = () => [
	{ title: 'Tournament Management | Admin | Tournado' },
	{
		name: 'description',
		content:
			'Manage all tournaments in the system. View, edit, delete tournaments and oversee competition details.',
	},
	{ property: 'og:title', content: 'Tournament Management | Admin | Tournado' },
	{
		property: 'og:description',
		content:
			'Manage all tournaments in the system. View, edit, delete tournaments and oversee competition details.',
	},
	{ property: 'og:type', content: 'website' },
]

type LoaderData = {
	tournamentListItems: TournamentListItem[]
}

export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	// Require user with role-based authorization for UI route access
	await requireUserWithMetadata(request, handle)

	const tournamentListItemsRaw = await getAllTournaments()

	// Serialize dates to ISO strings for JSON transport
	const tournamentListItems = tournamentListItemsRaw.map((tournament) => ({
		...tournament,
		startDate: tournament.startDate.toISOString(),
		endDate: tournament.endDate?.toISOString() || null,
	}))

	return { tournamentListItems }
}

export async function action({ request }: Route.ActionArgs): Promise<Response> {
	// Require user with role-based authorization for delete action
	await requireUserWithMetadata(request, handle)

	const formData = await request.formData()
	const intent = formData.get('intent')
	const tournamentId = formData.get('tournamentId')

	if (intent === 'delete' && typeof tournamentId === 'string') {
		if (!tournamentId.trim()) {
			throw new Response('Tournament ID is required', { status: 400 })
		}
		await deleteTournamentById({ id: tournamentId })
		return redirect('.')
	}

	throw new Response('Bad Request', { status: 400 })
}

export default function AdminTournamentsIndexPage(): JSX.Element {
	const { t, i18n } = useTranslation()
	const { tournamentListItems } = useLoaderData<LoaderData>()
	const submit = useSubmit()
	const navigate = useNavigate()
	const { latinFontClass } = useLanguageDirection()

	// Table state
	const [sorting, setSorting] = useState<SortingState>([])

	const formatDate = useCallback(
		(date: Date | string): string => {
			const dateObj = typeof date === 'string' ? new Date(date) : date
			return dateObj.toLocaleDateString(i18n.language, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		},
		[i18n.language],
	)

	const handleTournamentClick = useCallback(
		(tournamentId: string) => {
			navigate(adminPath(`/tournaments/${tournamentId}`))
		},
		[navigate],
	)

	const handleTournamentDelete = useCallback(
		(tournamentId: string) => {
			if (confirm(t('admin.tournaments.confirmDelete'))) {
				const formData = new FormData()
				formData.append('intent', 'delete')
				formData.append('tournamentId', tournamentId)
				submit(formData, { method: 'post' })
			}
		},
		[t, submit],
	)

	// Create columns with proper context
	const columns = useMemo(
		() =>
			createTournamentColumns({
				t,
				formatDate,
				onDelete: handleTournamentDelete,
				latinFontClass,
			}),
		[t, formatDate, handleTournamentDelete, latinFontClass],
	)

	// Empty state component
	const emptyState = (
		<div className='py-12 text-center'>
			<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800'>
				<TrophyIcon className='text-slate-400' size={24} variant='outlined' />
			</div>
			<p className='mb-2 font-medium text-base text-foreground'>
				{t('tournaments.noTournaments')}
			</p>
			<p className='mb-6 text-foreground-light text-sm'>
				{t('tournaments.noTournamentsDescription')}
			</p>
		</div>
	)

	return (
		<div className='space-y-6' data-testid='admin-tournaments-page-content'>
			{/* Stats using optimized dashboard panels */}
			<div
				className={cn('grid w-full grid-cols-1 gap-5 lg:w-fit', STATS_PANEL_MIN_WIDTH)}
			>
				<Panel
					color={PANEL_COLOR}
					variant='dashboard-panel'
					icon={<TrophyIcon size={24} variant='outlined' />}
					iconColor='brand'
					title={t('admin.tournaments.totalTournaments')}
					showGlow
					data-testid='tournaments-total-stat'
				>
					<span className={latinFontClass}>{tournamentListItems.length}</span>
				</Panel>
			</div>

			{/* Tournaments List */}
			<div className={cn('mb-6 w-full lg:w-fit', STATS_PANEL_MIN_WIDTH)}>
				<Panel color={PANEL_COLOR} variant='content-panel'>
					<DataTable
						data={[...tournamentListItems]}
						columns={columns}
						sorting={sorting}
						onSortingChange={setSorting}
						onRowClick={(row) => handleTournamentClick(row.id)}
						renderMobileRow={(row) => (
							<TournamentMobileRow
								tournament={row}
								onDelete={handleTournamentDelete}
								onClick={handleTournamentClick}
								formatDate={formatDate}
							/>
						)}
						emptyState={tournamentListItems.length === 0 ? emptyState : undefined}
					/>

					{/* Pagination - future enhancement when implementing server-side pagination */}
					{tournamentListItems.length > 0 ? (
						<div className='px-3.5 pt-4 text-foreground text-sm'>
							{t('common.pagination.showing', {
								from: 1,
								to: tournamentListItems.length,
								total: tournamentListItems.length,
							})
								.split(/(\d+)/)
								.map((part, index) =>
									/^\d+$/.test(part) ? (
										<span key={`total-${index}-${part}`} className={latinFontClass}>
											{part}
										</span>
									) : (
										part
									),
								)}
						</div>
					) : null}
				</Panel>
			</div>
		</div>
	)
}
