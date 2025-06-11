/* eslint-disable no-console */
import { JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Division } from '@prisma/client'

import { getDivisionLabel } from '~/lib/lib.helpers'

import { SidebarLayout } from './SidebarLayout'
import { TeamChip } from './TeamChip'

type Team = {
  id: string
  clubName: string
  teamName: string
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
export function SidebarTeamsExample({
  teams = [],
}: SidebarTeamsExampleProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // Example team data (would come from loader in real implementation)
  const exampleTeams: Team[] =
    teams.length > 0
      ? teams
      : [
          {
            id: '1',
            clubName: 'sv DIO',
            teamName: 'Heren 1',
            division: 'PREMIER_DIVISION',
          },
          {
            id: '2',
            clubName: 'sv DIO',
            teamName: 'Dames 1',
            division: 'FIRST_DIVISION',
          },
          {
            id: '3',
            clubName: 'sv DIO',
            teamName: 'Heren 2',
            division: 'SECOND_DIVISION',
          },
          {
            id: '4',
            clubName: 'sv DIO',
            teamName: 'Dames 2',
            division: 'THIRD_DIVISION',
          },
          {
            id: '5',
            clubName: 'sv DIO',
            teamName: 'Mix 1',
            division: 'FOURTH_DIVISION',
          },
        ]

  // Sidebar content - team list
  const sidebarContent = (
    <div className='flex flex-col gap-2 p-4'>
      {exampleTeams.length === 0 ? (
        <p className='py-8 text-center text-gray-500'>{t('teams.noTeams')}</p>
      ) : (
        exampleTeams.map(team => (
          <button
            key={team.id}
            onClick={() => setSelectedTeam(team)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
              selectedTeam?.id === team.id
                ? 'bg-red-100 text-red-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className='h-2 w-2 rounded-full bg-gray-400' />
            <div className='flex flex-col'>
              <span className='font-medium'>{`${team.clubName} ${team.teamName}`}</span>
              <span className='text-xs text-gray-500'>
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
      <h1 className='mb-6 text-3xl font-bold text-gray-900'>
        {`${selectedTeam.clubName} ${selectedTeam.teamName}`}
      </h1>

      <div className='space-y-6'>
        {/* Team Info Card */}
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-xl font-semibold'>Team Information</h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Club</dt>
              <dd className='mt-1 text-sm text-gray-900'>{selectedTeam.clubName}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Team</dt>
              <dd className='mt-1 text-sm text-gray-900'>{selectedTeam.teamName}</dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Class</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {getDivisionLabel(selectedTeam.division, i18n.language)}
              </dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Status</dt>
              <dd className='mt-1'>
                <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                  Active
                </span>
              </dd>
            </div>
          </div>
        </div>

        {/* Team Chip Preview */}
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold'>Team Chip Preview</h3>
          <p className='mb-4 text-gray-600'>
            This is how this team appears in the new chip-based layout:
          </p>
          <TeamChip
            team={selectedTeam}
            onClick={() => console.log('Team chip clicked:', selectedTeam.id)}
          />
        </div>

        {/* Actions */}
        <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
          <h3 className='mb-4 text-lg font-semibold'>Available Actions</h3>
          <div className='flex flex-wrap gap-3'>
            <button className='inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
              Edit Team
            </button>
            <button className='inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700'>
              View Matches
            </button>
            <button className='inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50'>
              Delete Team
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className='flex h-64 items-center justify-center'>
      <div className='text-center'>
        <div className='mx-auto h-12 w-12 text-gray-400'>
          <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
            />
          </svg>
        </div>
        <h3 className='mt-2 text-sm font-medium text-gray-900'>No team selected</h3>
        <p className='mt-1 text-sm text-gray-500'>
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
      onSidebarToggle={isOpen => {
        console.log('Teams sidebar toggled:', isOpen)
        // Future: Could save sidebar state to localStorage
        // localStorage.setItem('teamsSidebarOpen', String(isOpen))
      }}
      onSidebarItemClick={itemId => {
        console.log('Teams sidebar item clicked:', itemId)
        // Future: Could track analytics or handle special actions
        if (itemId === 'add-button' || itemId === 'fab-button') {
          console.log('Add team button clicked')
        }
      }}
    />
  )
}

/**
 * Wrapper component that shows both the new chip-based layout and the sidebar layout
 * This demonstrates the evolution from sidebar to chip-based UI
 */
export function TeamsLayoutComparison(): JSX.Element {
  const { t: _t } = useTranslation()

  const exampleTeams: Team[] = [
    { id: '1', clubName: 'sv DIO', teamName: 'Heren 1', division: 'PREMIER_DIVISION' },
    { id: '2', clubName: 'sv DIO', teamName: 'Dames 1', division: 'FIRST_DIVISION' },
    { id: '3', clubName: 'sv DIO', teamName: 'Heren 2', division: 'SECOND_DIVISION' },
  ]

  return (
    <div className='space-y-8 p-6'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='mb-4 text-3xl font-bold text-gray-900'>
          Teams Layout Evolution
        </h1>
        <p className='mx-auto max-w-2xl text-gray-600'>
          Comparison between the original sidebar layout (preserved for future sliding
          menu) and the new chip-based layout for modern UX.
        </p>
      </div>

      {/* New Chip-Based Layout */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-xl font-semibold'>✨ New Chip-Based Layout</h2>
        <p className='mb-4 text-gray-600'>
          Modern, responsive grid layout with team chips:
        </p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {exampleTeams.map(team => (
            <TeamChip
              key={team.id}
              team={team}
              onClick={() => console.log('Chip clicked:', team.id)}
            />
          ))}
        </div>
      </div>

      {/* Original Sidebar Layout */}
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-xl font-semibold'>
          🗂️ Original Sidebar Layout (Preserved)
        </h2>
        <p className='mb-4 text-gray-600'>
          Classic sidebar layout with list view, perfect for future sliding menu
          implementations:
        </p>
        <div className='h-96 overflow-hidden rounded-lg border border-gray-200'>
          <SidebarTeamsExample teams={exampleTeams} />
        </div>
      </div>

      {/* Usage Notes */}
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-6'>
        <h3 className='mb-3 text-lg font-semibold text-blue-900'>
          📋 Implementation Notes
        </h3>
        <ul className='space-y-2 text-blue-800'>
          <li>
            • <strong>Current:</strong> Chip-based layout for public teams view
          </li>
          <li>
            • <strong>Preserved:</strong> Sidebar layout in reusable component
          </li>
          <li>
            • <strong>Future:</strong> Sidebar can be used for sliding menu
            functionality
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
