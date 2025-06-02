import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useActionData,
  useLoaderData,
  useOutletContext,
} from 'react-router'

import { ListItemNavLink } from '~/components/PrefetchLink'
import { prisma } from '~/db.server'
import { createTeam, getTeamListItems } from '~/models/team.server'
import { getDefaultTeamLeader } from '~/models/teamLeader.server'
import type { RouteMetadata } from '~/utils/route-types'

export const meta: MetaFunction = () => [
  { title: 'New Team | Tournado' },
  {
    name: 'description',
    content:
      'Create a new team for your tournament. Add team details, assign classes, and get ready to compete.',
  },
  { property: 'og:title', content: 'New Team | Tournado' },
  {
    property: 'og:description',
    content:
      'Create a new team for your tournament. Add team details, assign classes, and get ready to compete.',
  },
  { property: 'og:type', content: 'website' },
]

// Route metadata
export const handle: RouteMetadata = {
  isPublic: true,
  title: 'common.titles.newTeam',
}

type ContextType = {
  type: 'sidebar' | 'main'
}

type TeamListItem = {
  id: string
  teamName: string
}

type ActionData = {
  errors?: {
    tournamentId?: string
    clubName?: string
    teamName?: string
    teamClass?: string
    teamLeaderName?: string
    teamLeaderPhone?: string
    teamLeaderEmail?: string
    privacyAgreement?: string
    teamLeader?: string
    tournament?: string
  }
}

type LoaderData = {
  teamListItems: TeamListItem[]
  tournaments: Array<{
    id: string
    name: string
    location: string
    startDate: string
    endDate: string | null
  }>
}

export const loader = async ({
  request: _,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  const teamLeader = await getDefaultTeamLeader()

  if (!teamLeader) {
    throw new Response('No TeamLeader found', { status: 404 })
  }

  const teamListItems = await getTeamListItems({ teamLeaderId: teamLeader.id })

  // Fetch available tournaments
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      startDate: true,
      endDate: true,
    },
    orderBy: { startDate: 'asc' },
  })

  return {
    teamListItems,
    tournaments: tournaments.map(t => ({
      ...t,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate?.toISOString() || null,
    })),
  }
}

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const formData = await request.formData()

  // Extract all form fields with proper typing
  const tournamentId = formData.get('tournamentId') as string | null
  const clubName = formData.get('clubName') as string | null
  const teamName = formData.get('teamName') as string | null
  const teamClass = formData.get('teamClass') as string | null
  const teamLeaderName = formData.get('teamLeaderName') as string | null
  const teamLeaderPhone = formData.get('teamLeaderPhone') as string | null
  const teamLeaderEmail = formData.get('teamLeaderEmail') as string | null
  const privacyAgreement = formData.get('privacyAgreement') as string | null

  const errors: ActionData['errors'] = {}

  // Validate required fields
  if (!tournamentId || tournamentId.length === 0) {
    errors.tournamentId = 'tournamentRequired'
  }

  if (!clubName || clubName.length === 0) {
    errors.clubName = 'clubNameRequired'
  }

  if (!teamName || teamName.length === 0) {
    errors.teamName = 'teamNameRequired'
  }

  if (!teamClass || teamClass.length === 0) {
    errors.teamClass = 'teamClassRequired'
  }

  if (!teamLeaderName || teamLeaderName.length === 0) {
    errors.teamLeaderName = 'teamLeaderNameRequired'
  }

  if (!teamLeaderPhone || teamLeaderPhone.length === 0) {
    errors.teamLeaderPhone = 'teamLeaderPhoneRequired'
  }

  if (!teamLeaderEmail || teamLeaderEmail.length === 0) {
    errors.teamLeaderEmail = 'teamLeaderEmailRequired'
  } else if (!teamLeaderEmail.includes('@')) {
    errors.teamLeaderEmail = 'teamLeaderEmailInvalid'
  }

  if (privacyAgreement !== 'on') {
    errors.privacyAgreement = 'privacyAgreementRequired'
  }

  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 })
  }

  // Find or create team leader
  let teamLeader = await prisma.teamLeader.findUnique({
    where: { email: teamLeaderEmail! },
  })

  if (!teamLeader) {
    const [firstName, ...lastNameParts] = teamLeaderName!.split(' ')
    const lastName = lastNameParts.join(' ') || ''

    teamLeader = await prisma.teamLeader.create({
      data: {
        firstName,
        lastName,
        email: teamLeaderEmail!,
        phone: teamLeaderPhone!,
      },
    })
  }

  // Verify tournament exists
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId! },
  })

  if (!tournament) {
    return Response.json(
      { errors: { tournament: 'tournamentNotFound' } },
      { status: 404 }
    )
  }

  const team = await createTeam({
    teamName: teamName!,
    teamClass: teamClass!,
    teamLeaderId: teamLeader.id,
    tournamentId: tournamentId!,
  })

  return redirect(`/teams/${team.id}`)
}

export default function NewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<ActionData>()
  const { teamListItems, tournaments } = useLoaderData<typeof loader>()
  const context = useOutletContext<ContextType>()
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus()
    } else if (actionData?.errors?.teamClass) {
      teamClassRef.current?.focus()
    }
  }, [actionData])

  // Render team list in sidebar
  if (context.type === 'sidebar') {
    if (teamListItems.length === 0) {
      return (
        <div className='flex flex-col gap-2 p-4'>
          <p className='text-center text-gray-500'>{t('teams.noTeams')}</p>
        </div>
      )
    }

    return (
      <div className='flex flex-col gap-2 p-4'>
        {teamListItems.map((teamItem: TeamListItem) => (
          <ListItemNavLink
            key={teamItem.id}
            to={`/teams/${teamItem.id}`}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {teamItem.teamName}
          </ListItemNavLink>
        ))}
      </div>
    )
  }

  // Render form in main content
  return (
    <Form method='post' className='max-w-2xl space-y-6'>
      {/* Team Information Panel */}
      <div className='rounded-lg bg-gray-50 p-4'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          {t('teams.form.teamInfo')}
        </h3>

        {/* Tournament Selection */}
        <div className='mb-4'>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.tournament')}</span>
            <select
              name='tournamentId'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.tournamentId ? true : undefined}
              aria-errormessage={
                actionData?.errors?.tournamentId ? 'tournamentId-error' : undefined
              }
            >
              <option value=''>{t('teams.form.selectTournament')}</option>
              {tournaments.map(tournament => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} - {tournament.location} (
                  {new Date(tournament.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </label>
          {actionData?.errors?.tournamentId ? (
            <div className='pt-1 text-red-700' id='tournamentId-error'>
              {t('teams.form.tournamentRequired')}
            </div>
          ) : null}
        </div>

        {/* Club Name */}
        <div className='mb-4'>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.clubName')}</span>
            <input
              name='clubName'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.clubName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.clubName ? 'clubName-error' : undefined
              }
            />
          </label>
          {actionData?.errors?.clubName ? (
            <div className='pt-1 text-red-700' id='clubName-error'>
              {t('teams.form.clubNameRequired')}
            </div>
          ) : null}
        </div>

        {/* Team Name */}
        <div className='mb-4'>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.teamName')}</span>
            <input
              ref={teamNameRef}
              name='teamName'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.teamName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamName ? 'teamName-error' : undefined
              }
            />
          </label>
          {actionData?.errors?.teamName ? (
            <div className='pt-1 text-red-700' id='teamName-error'>
              {t('teams.form.teamNameRequired')}
            </div>
          ) : null}
        </div>

        {/* Team Class */}
        <div>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.teamClass')}</span>
            <input
              ref={teamClassRef}
              name='teamClass'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.teamClass ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamClass ? 'teamClass-error' : undefined
              }
            />
          </label>
          {actionData?.errors?.teamClass ? (
            <div className='pt-1 text-red-700' id='teamClass-error'>
              {t('teams.form.teamClassRequired')}
            </div>
          ) : null}
        </div>
      </div>

      {/* Team Leader Information Panel */}
      <div className='rounded-lg bg-gray-50 p-4'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900'>
          {t('teams.form.teamLeaderInfo')}
        </h3>

        {/* Team Leader Name */}
        <div className='mb-4'>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.teamLeaderName')}</span>
            <input
              name='teamLeaderName'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.teamLeaderName ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamLeaderName ? 'teamLeaderName-error' : undefined
              }
            />
          </label>
          {actionData?.errors?.teamLeaderName ? (
            <div className='pt-1 text-red-700' id='teamLeaderName-error'>
              {t('teams.form.teamLeaderNameRequired')}
            </div>
          ) : null}
        </div>

        {/* Team Leader Phone */}
        <div className='mb-4'>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.teamLeaderPhone')}</span>
            <input
              name='teamLeaderPhone'
              type='tel'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.teamLeaderPhone ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamLeaderPhone
                  ? 'teamLeaderPhone-error'
                  : undefined
              }
            />
          </label>
          {actionData?.errors?.teamLeaderPhone ? (
            <div className='pt-1 text-red-700' id='teamLeaderPhone-error'>
              {t('teams.form.teamLeaderPhoneRequired')}
            </div>
          ) : null}
        </div>

        {/* Team Leader Email */}
        <div>
          <label className='flex w-full flex-col gap-1'>
            <span className='font-medium'>{t('teams.form.teamLeaderEmail')}</span>
            <input
              name='teamLeaderEmail'
              type='email'
              className='h-12 w-full rounded-md border-2 border-emerald-700/30 px-3 text-lg leading-6'
              aria-invalid={actionData?.errors?.teamLeaderEmail ? true : undefined}
              aria-errormessage={
                actionData?.errors?.teamLeaderEmail
                  ? 'teamLeaderEmail-error'
                  : undefined
              }
            />
          </label>
          {actionData?.errors?.teamLeaderEmail ? (
            <div className='pt-1 text-red-700' id='teamLeaderEmail-error'>
              {t(
                actionData.errors.teamLeaderEmail === 'teamLeaderEmailInvalid'
                  ? 'teams.form.teamLeaderEmailInvalid'
                  : 'teams.form.teamLeaderEmailRequired'
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Privacy Agreement */}
      <div>
        <label className='flex items-start gap-3'>
          <input
            name='privacyAgreement'
            type='checkbox'
            className='mt-1 h-4 w-4 rounded border-emerald-700/30'
            aria-invalid={actionData?.errors?.privacyAgreement ? true : undefined}
            aria-errormessage={
              actionData?.errors?.privacyAgreement
                ? 'privacyAgreement-error'
                : undefined
            }
          />
          <span className='text-sm'>{t('teams.form.privacyAgreement')}</span>
        </label>
        {actionData?.errors?.privacyAgreement ? (
          <div className='pt-1 text-red-700' id='privacyAgreement-error'>
            {t('teams.form.privacyAgreementRequired')}
          </div>
        ) : null}
      </div>

      <div className='flex justify-between'>
        <button
          type='submit'
          className='rounded-lg bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none'
        >
          {t('teams.save')}
        </button>
      </div>
    </Form>
  )
}
