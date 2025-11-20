import type { Division } from '@prisma/client'
import { type JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TeamChip } from '~/features/teams/components/TeamChip'
import { getDivisionLabel } from '~/lib/lib.helpers'
import { cn } from '~/utils/misc'
import { getLatinTextClass, getLatinTitleClass } from '~/utils/rtlUtils'

import { SidebarLayout } from '../SidebarLayout'

type Team = {
	id: string
	name: string
	clubName: string
	division: Division
}

type SidebarTeamsExampleProps = {
	teams?: Team[]
}

/**
 * Example implementation showing how to use SidebarLayout for teams functionality
 * This demonstrates the pattern that was used in the original teams sidebar
 * Perfect reference for future sliding menu implementations
 */
export function SidebarTeamsExample({ teams = [] }: SidebarTeamsExampleProps): JSX.Element {
	const { t, i18n } = useTranslation()
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams.length > 0 ? teams[0] : null)

	// Example team data (would come from loader in real implementation)
	const exampleTeams: Team[] =
		teams.length > 0
			? teams
			: [
					{
						id: '1',
						name: 'Heren 1',
						clubName: 'sv DIO',
						division: 'PREMIER_DIVISION',
					},
					{
						id: '2',
						name: 'Dames 1',
						clubName: 'sv DIO',
						division: 'FIRST_DIVISION',
					},
					{
						id: '3',
						name: 'Heren 2',
						clubName: 'sv DIO',
						division: 'SECOND_DIVISION',
					},
					{
						id: '4',
						name: 'Dames 2',
						clubName: 'sv DIO',
						division: 'THIRD_DIVISION',
					},
					{
						id: '5',
						name: 'Mix 1',
						clubName: 'sv DIO',
						division: 'FOURTH_DIVISION',
					},
				]

	// Sidebar content - team list
	const sidebarContent = (
		<div className='flex flex-col gap-2 p-4'>
			{exampleTeams.length === 0 ? (
				<p className='py-8 text-center text-foreground-lighter'>{t('teams.noTeams')}</p>
			) : (
				exampleTeams.map((team) => (
					<button
						key={team.id}
						onClick={() => setSelectedTeam(team)}
						className={cn(
							'flex items-center gap-2 rounded-lg px-4 py-2 text-left font-medium text-sm transition-colors',
							selectedTeam?.id === team.id
								? 'bg-accent text-primary'
								: 'text-foreground hover:bg-background-hover',
						)}
					>
						<div className='h-2 w-2 rounded-full bg-foreground-lighter' />
						<div className='flex flex-col'>
							<span className={cn('font-medium', getLatinTextClass())}>
								{`${team.clubName} ${team.name}`}
							</span>
							<span className='text-foreground-lighter text-xs'>
								{getDivisionLabel(team.division, i18n.language)}
							</span>
						</div>
					</button>
				))
			)}
		</div>
	)

	// Main content - team details or empty state
	const mainContent = selectedTeam ? (
		<div className='max-w-2xl'>
			<h1 className={cn('mb-6 font-bold text-3xl', getLatinTitleClass())}>
				{`${selectedTeam.clubName} ${selectedTeam.name}`}
			</h1>

			<div className='space-y-6'>
				{/* Team Info Card */}
				<div className='rounded-lg border border-foreground-lighter bg-background p-6 shadow-sm'>
					<h2 className={cn('mb-4 font-semibold text-xl', getLatinTitleClass())}>
						Team Information
					</h2>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
						<div>
							<dt className='font-medium text-foreground-lighter text-sm'>Club</dt>
							<dd className={cn('mt-1 text-sm', getLatinTextClass())}>{selectedTeam.clubName}</dd>
						</div>
						<div>
							<dt className='font-medium text-foreground-lighter text-sm'>Team</dt>
							<dd className={cn('mt-1 text-sm', getLatinTextClass())}>{selectedTeam.name}</dd>
						</div>
						<div>
							<dt className='font-medium text-foreground-lighter text-sm'>Class</dt>
							<dd className='mt-1 text-sm'>
								{getDivisionLabel(selectedTeam.division, i18n.language)}
							</dd>
						</div>
						<div>
							<dt className='font-medium text-foreground-lighter text-sm'>Status</dt>
							<dd className='mt-1'>
								<span className='inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 font-medium text-primary text-xs'>
									Active
								</span>
							</dd>
						</div>
					</div>
				</div>

				{/* Team Chip Preview */}
				<div className='rounded-lg border border-foreground-lighter bg-background p-6 shadow-sm'>
					<h3 className={cn('mb-4 font-semibold text-lg', getLatinTitleClass())}>
						Team Chip Preview
					</h3>
					<p className='mb-4 text-foreground'>
						This is how this team appears in the new chip-based layout:
					</p>
					<TeamChip
						team={selectedTeam}
						onClick={() => {
							/* Team chip clicked */
						}}
					/>
				</div>

				{/* Actions */}
				<div className='rounded-lg border border-foreground-lighter bg-background p-6 shadow-sm'>
					<h3 className={cn('mb-4 font-semibold text-lg', getLatinTitleClass())}>
						Available Actions
					</h3>
					<div className='flex flex-wrap gap-3'>
						<button className='inline-flex items-center rounded-md border border-foreground-lighter bg-background px-3 py-2 font-medium text-foreground text-sm hover:bg-background-hover'>
							Edit Team
						</button>
						<button className='inline-flex items-center rounded-md border border-transparent bg-brand px-3 py-2 font-medium text-primary-foreground text-sm hover:bg-brand-accent'>
							View Matches
						</button>
						<button className='inline-flex items-center rounded-md border border-brand bg-background px-3 py-2 font-medium text-brand text-sm hover:bg-accent'>
							Delete Team
						</button>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div className='flex h-64 items-center justify-center'>
			<div className='text-center'>
				<div className='mx-auto h-12 w-12 text-foreground-lighter'>
					<svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={1}
							d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
						/>
					</svg>
				</div>
				<h3 className={cn('mt-2 font-medium text-sm', getLatinTitleClass())}>No team selected</h3>
				<p className='mt-1 text-foreground-lighter text-sm'>
					Select a team from the sidebar to view details, or create a new team.
				</p>
			</div>
		</div>
	)

	return (
		<SidebarLayout
			sidebarContent={sidebarContent}
			mainContent={mainContent}
			addButtonPath='/teams/new'
			addButtonLabel={t('teams.addTeam')}
			closeSidebarOnPaths={['/new', '/edit']}
			theme='red'
			sidebarWidth='medium'
			onSidebarToggle={(_isOpen) => {
				// Future: Could save sidebar state to localStorage
				// localStorage.setItem('teamsSidebarOpen', String(isOpen))
			}}
			onSidebarItemClick={(_itemId) => {
				// Future: Could track analytics or handle special actions
				// if (itemId === 'add-button' || itemId === 'fab-button') {
				//   // Add team button clicked
				// }
			}}
		/>
	)
}

/**
 * Wrapper component that shows both the new chip-based layout and the sidebar layout
 * This demonstrates the evolution from sidebar to chip-based UI
 */
export function TeamsLayoutComparison(): JSX.Element {
	const exampleTeams: Team[] = [
		{
			id: '1',
			clubName: 'sv DIO',
			name: 'Heren 1',
			division: 'PREMIER_DIVISION',
		},
		{
			id: '2',
			clubName: 'sv DIO',
			name: 'Dames 1',
			division: 'FIRST_DIVISION',
		},
		{
			id: '3',
			clubName: 'sv DIO',
			name: 'Heren 2',
			division: 'SECOND_DIVISION',
		},
	]

	return (
		<div className='space-y-8 p-6'>
			{/* Header */}
			<div className='text-center'>
				<h1 className={cn('mb-4 font-bold text-3xl', getLatinTitleClass())}>
					Teams Layout Evolution
				</h1>
				<p className='mx-auto max-w-2xl text-foreground'>
					Comparison between the original sidebar layout (preserved for future sliding menu) and the
					new chip-based layout for modern UX.
				</p>
			</div>

			{/* New Chip-Based Layout */}
			<div className='rounded-lg border border-foreground-lighter bg-background p-6 shadow-sm'>
				<h2 className={cn('mb-4 font-semibold text-xl', getLatinTitleClass())}>
					✨ New Chip-Based Layout
				</h2>
				<p className='mb-4 text-foreground'>Modern, responsive grid layout with team chips:</p>
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
					{exampleTeams.map((team) => (
						<TeamChip
							key={team.id}
							team={team}
							onClick={() => {
								/* Chip clicked */
							}}
						/>
					))}
				</div>
			</div>

			{/* Original Sidebar Layout */}
			<div className='rounded-lg border border-foreground-lighter bg-background p-6 shadow-sm'>
				<h2 className={cn('mb-4 font-semibold text-xl', getLatinTitleClass())}>
					🗂️ Original Sidebar Layout (Preserved)
				</h2>
				<p className='mb-4 text-foreground'>
					Classic sidebar layout with list view, perfect for future sliding menu implementations:
				</p>
				<div className='h-96 overflow-hidden rounded-lg border border-foreground-lighter'>
					<SidebarTeamsExample teams={exampleTeams} />
				</div>
			</div>

			{/* Usage Notes */}
			<div className='rounded-lg border border-primary bg-accent p-6'>
				<h3 className={cn('mb-3 font-semibold text-lg text-primary', getLatinTitleClass())}>
					📋 Implementation Notes
				</h3>
				<ul className='space-y-2 text-foreground-darker'>
					<li>
						• <strong>Current:</strong> Chip-based layout for public teams view
					</li>
					<li>
						• <strong>Preserved:</strong> Sidebar layout in reusable component
					</li>
					<li>
						• <strong>Future:</strong> Sidebar can be used for sliding menu functionality
					</li>
					<li>
						• <strong>Mobile:</strong> Both layouts are fully responsive
					</li>
					<li>
						• <strong>Admin:</strong> Full CRUD operations available in admin area
					</li>
				</ul>
			</div>
		</div>
	)
}
