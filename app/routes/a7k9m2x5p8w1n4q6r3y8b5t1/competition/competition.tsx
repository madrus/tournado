import { cva } from 'class-variance-authority'
import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLoaderData } from 'react-router'

import { AuthErrorBoundary } from '~/components/AuthErrorBoundary'
import { SportsIcon, TrophyIcon } from '~/components/icons'
import { CompetitionLayoutHeader } from '~/components/layouts'
import { Panel } from '~/components/Panel'
import type { TournamentListItem } from '~/features/tournaments/types'
import { getAllTournaments, getTournamentById } from '~/models/tournament.server'
import { cn } from '~/utils/misc'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

import type { Route } from './+types/competition'

type LoaderData = {
	readonly tournament: {
		readonly id: string
		readonly name: string
		readonly location: string
	} | null
	readonly tournamentListItems: readonly TournamentListItem[]
	readonly selectedTournamentId: string | undefined
}

export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.competition',
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

export async function loader({
	request,
	params: _params,
}: Route.LoaderArgs): Promise<LoaderData> {
	await requireUserWithMetadata(request, handle)

	const url = new URL(request.url)
	const tournamentId = url.searchParams.get('tournament')

	const [tournamentListItemsRaw, tournament] = await Promise.all([
		getAllTournaments(),
		tournamentId ? getTournamentById({ id: tournamentId }) : Promise.resolve(null),
	])

	// Serialize dates to ISO strings for JSON transport
	const tournamentListItems = tournamentListItemsRaw.map((item) => ({
		...item,
		startDate: item.startDate.toISOString(),
		endDate: item.endDate?.toISOString() || null,
	}))

	return {
		tournament: tournament
			? {
					id: tournament.id,
					name: tournament.name,
					location: tournament.location,
				}
			: null,
		tournamentListItems,
		selectedTournamentId: tournamentId || undefined,
	}
}

type TabConfig = {
	nameKey: string
	href: 'groups' | 'playoffs'
	icon: typeof SportsIcon | typeof TrophyIcon
	disabled: boolean
}

const tabs: readonly TabConfig[] = [
	{
		nameKey: 'admin.competition.groups',
		href: 'groups',
		icon: SportsIcon,
		disabled: false,
	},
	{
		nameKey: 'admin.competition.playoffs',
		href: 'playoffs',
		icon: TrophyIcon,
		disabled: true, // Coming soon
	},
] as const

const tabVariants = cva(
	[
		'relative flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-200',
		'-mb-px focus:outline-none',
	],
	{
		variants: {
			state: {
				active: [
					'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
					'border-t border-e border-s',
					'!border-t-fuchsia-300 !border-e-fuchsia-300 !border-s-fuchsia-300 border-b-transparent',
					'dark:border-fuchsia-700 dark:border-b-fuchsia-950',
					'z-10 shadow-lg',
				],
				inactive: [
					'bg-background text-foreground-light',
					'border-t border-e border-s',
					'border-border border-b-0',
				],
				disabled: [
					'cursor-not-allowed bg-background text-foreground-lighter',
					'border-t border-e border-s',
					'border-border border-b-0',
				],
			},
		},
	},
)

export default function CompetitionLayout(): JSX.Element {
	const { tournamentListItems, selectedTournamentId } = useLoaderData<LoaderData>()
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups')

	return (
		<div className='w-full space-y-8'>
			{/* Page Header */}
			<CompetitionLayoutHeader
				variant='admin'
				tournamentListItems={tournamentListItems}
				selectedTournamentId={selectedTournamentId}
			/>

			{/* Tab Navigation & Content */}
			<div className='space-y-0'>
				{/* Tab Headers */}
				<div className='flex space-x-0 border-border'>
					{tabs.map((tab, index) => (
						<button
							type='button'
							key={tab.href}
							onClick={() => setActiveTab(tab.href)}
							disabled={tab.disabled}
							className={cn(
								tabVariants({
									state: tab.disabled
										? 'disabled'
										: activeTab === tab.href
											? 'active'
											: 'inactive',
								}),
								// First tab: rounded top-left in LTR, rounded top-right in RTL
								index === 0 && 'rounded-tl-lg rtl:rounded-tl-none rtl:rounded-tr-lg',
								// Last tab: rounded top-right in LTR, rounded top-left in RTL
								index === tabs.length - 1 &&
									'rounded-tr-lg rtl:rounded-tr-none rtl:rounded-tl-lg',
							)}
						>
							{/* RTL element order: For 3+ elements, use explicit rtl:order-N classes
							    LTR: icon(0) → label(0) → badge(0) = visual order: icon, label, badge
							    RTL: icon(1) → label(2) → badge(3) = visual order: badge, label, icon */}
							<tab.icon
								className={cn(
									'h-6 w-6 rtl:order-1',
									activeTab === tab.href
										? 'text-fuchsia-600 dark:text-fuchsia-400'
										: '',
								)}
							/>
							<span className='rtl:order-2'>{t(tab.nameKey)}</span>
							{tab.disabled ? (
								<span className='latin-text rounded-full bg-accent px-2 py-0.5 text-foreground-lighter text-xs rtl:order-3'>
									Soon
								</span>
							) : null}
						</button>
					))}
				</div>

				{/* Tab Content - Render nested routes */}
				<div className='relative'>
					<Panel
						color='fuchsia'
						className='rounded-tl-none rtl:rounded-tl-xl rtl:rounded-tr-none border-t shadow-lg'
					>
						<Outlet />
					</Panel>
				</div>
			</div>
		</div>
	)
}

export { AuthErrorBoundary as ErrorBoundary }
