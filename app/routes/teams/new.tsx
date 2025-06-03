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

import { InputField } from '~/components/InputField'
import { ListItemNavLink } from '~/components/PrefetchLink'
import { prisma } from '~/db.server'
import { createTeam, getAllTeamListItems } from '~/models/team.server'
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
  title: 'common.titles.addTeam',
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
  const teamListItems = await getAllTeamListItems()

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
    <div className='min-h-full'>
      <Form method='post' className='pb-safe max-w-6xl space-y-6 pb-8'>
        {/* Responsive Panels Container */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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
                  className='h-12 w-full rounded-md border-2 border-emerald-700/30 bg-white px-3 text-lg leading-6'
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
            <InputField
              name='clubName'
              label={t('teams.form.clubName')}
              readOnly={false}
              required
              error={
                actionData?.errors?.clubName
                  ? t('teams.form.clubNameRequired')
                  : undefined
              }
              className='mb-4'
            />

            {/* Team Name */}
            <InputField
              ref={teamNameRef}
              name='teamName'
              label={t('teams.form.teamName')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamName
                  ? t('teams.form.teamNameRequired')
                  : undefined
              }
              className='mb-4'
            />

            {/* Team Class */}
            <InputField
              ref={teamClassRef}
              name='teamClass'
              label={t('teams.form.teamClass')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamClass
                  ? t('teams.form.teamClassRequired')
                  : undefined
              }
            />
          </div>

          {/* Team Leader Information Panel */}
          <div className='rounded-lg bg-gray-50 p-4'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900'>
              {t('teams.form.teamLeaderInfo')}
            </h3>

            {/* Team Leader Name */}
            <InputField
              name='teamLeaderName'
              label={t('teams.form.teamLeaderName')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamLeaderName
                  ? t('teams.form.teamLeaderNameRequired')
                  : undefined
              }
              className='mb-4'
            />

            {/* Team Leader Phone */}
            <InputField
              name='teamLeaderPhone'
              type='tel'
              label={t('teams.form.teamLeaderPhone')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamLeaderPhone
                  ? t('teams.form.teamLeaderPhoneRequired')
                  : undefined
              }
              className='mb-4'
            />

            {/* Team Leader Email */}
            <InputField
              name='teamLeaderEmail'
              type='email'
              label={t('teams.form.teamLeaderEmail')}
              readOnly={false}
              required
              error={
                actionData?.errors?.teamLeaderEmail
                  ? t(
                      actionData.errors.teamLeaderEmail === 'teamLeaderEmailInvalid'
                        ? 'teams.form.teamLeaderEmailInvalid'
                        : 'teams.form.teamLeaderEmailRequired'
                    )
                  : undefined
              }
            />
          </div>
        </div>

        {/* Privacy Agreement */}
        <div className='pl-4'>
          <label className='flex items-start gap-3'>
            <input
              name='privacyAgreement'
              type='checkbox'
              className='mt-1 h-4 w-4 rounded border-emerald-700/30 bg-white'
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

        {/* Submit Button with Mobile-Friendly Layout */}
        <div className='pb-8 pl-4'>
          <button
            type='submit'
            className='w-full rounded-lg bg-amber-500 px-6 py-3 font-medium text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:outline-none md:w-auto'
          >
            {t('teams.save')}
          </button>
        </div>
      </Form>
    </div>
  )
}
