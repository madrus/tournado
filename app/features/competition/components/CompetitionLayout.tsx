import { cva } from 'class-variance-authority'
import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { CompetitionLayoutHeader } from '~/components/layouts'
import { Panel } from '~/components/Panel'
import { COMPETITION_TABS } from '~/features/competition/constants'
import type { TournamentListItem } from '~/features/tournaments/types'
import { cn } from '~/utils/misc'

type CompetitionLayoutProps = {
	tournamentListItems: readonly TournamentListItem[]
	selectedTournamentId: string | undefined
}

const tabVariants = cva(
	[
		'relative flex items-center gap-2 rounded-tl-lg rounded-tr-lg px-6 py-4 font-medium text-sm transition-all duration-200',
		'-mb-px focus:outline-none',
	],
	{
		variants: {
			state: {
				active: [
					'bg-accent-fuchsia-50 text-accent-fuchsia-700 dark:bg-accent-fuchsia-950 dark:text-accent-fuchsia-300',
					'border-t border-e border-s',
					'!border-t-accent-fuchsia-300 !border-e-accent-fuchsia-300 !border-s-accent-fuchsia-300 border-b-transparent',
					'dark:border-accent-fuchsia-700 dark:border-b-accent-fuchsia-950',
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

export function CompetitionLayout({
	tournamentListItems,
	selectedTournamentId,
}: Readonly<CompetitionLayoutProps>): JSX.Element {
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
					{COMPETITION_TABS.map((tab) => (
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
							)}
						>
							{/* RTL element order: For 3+ elements, use explicit rtl:order-N classes
							    LTR: icon(0) → label(0) → badge(0) = visual order: icon, label, badge
							    RTL: icon(1) → label(2) → badge(3) = visual order: badge, label, icon */}
							<tab.icon
								className={cn(
									'h-6 w-6 rtl:order-1',
									activeTab === tab.href
										? 'text-accent-fuchsia-600 dark:text-accent-fuchsia-400'
										: '',
								)}
							/>
							<span className='rtl:order-2'>{t(tab.nameKey)}</span>
							{tab.disabled ? (
								<span className='latin-text rounded-full px-2 py-0.5 bg-foreground/10 text-foreground-light text-xs rtl:order-3'>
									{t('common.comingSoon')}
								</span>
							) : null}
						</button>
					))}
				</div>

				{/* Tab Content - Render nested routes */}
				<div className='relative'>
					<Panel
						color='accent-fuchsia'
						inheritChildrenText
						className='rounded-tl-none rtl:rounded-tl-xl rtl:rounded-tr-none border-t shadow-lg'
					>
						<Outlet />
					</Panel>
				</div>
			</div>
		</div>
	)
}
