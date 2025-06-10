import { JSX, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
  useLoaderData,
} from 'react-router'

import { InputField } from '~/components/InputField'
import { prisma } from '~/db.server'
import { createTeam } from '~/models/team.server'
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

type ActionData = {
  success?: boolean
  team?: {
    id: string
    teamName: string
    teamClass: string
  }
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
      // eslint-disable-next-line id-blacklist
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
    clubName: clubName!,
    teamName: teamName!,
    teamClass: teamClass!,
    teamLeaderId: teamLeader.id,
    tournamentId: tournamentId!,
  })

  return Response.json(
    {
      success: true,
      team: {
        id: team.id,
        teamName: team.teamName,
        teamClass: team.teamClass,
      },
    },
    { status: 200 }
  )
}

export default function NewTeamPage(): JSX.Element {
  const { t } = useTranslation()
  const actionData = useActionData<ActionData>()
  const { tournaments } = useLoaderData<typeof loader>()
  const teamNameRef = useRef<HTMLInputElement>(null)
  const teamClassRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (actionData?.errors?.teamName) {
      teamNameRef.current?.focus()
    } else if (actionData?.errors?.teamClass) {
      teamClassRef.current?.focus()
    } else if (actionData?.success) {
      // Reset form on successful submission
      formRef.current?.reset()
    }
  }, [actionData])

  return (
    <div className='max-w-4xl'>
      {/* Success Message */}
      {actionData?.success ? (
        <div className='mb-6 rounded-lg border border-green-200 bg-green-50 p-4'>
          <div className='flex items-center'>
            <svg
              className='h-5 w-5 text-green-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>
                Team "{actionData.team?.teamName}" ({actionData.team?.teamClass})
                created successfully!
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Form ref={formRef} method='post' className='space-y-8'>
        {/* Responsive Panels Container */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
          {/* Team Information Panel */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
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
              className='mb-4'
            />
          </div>

          {/* Team Leader Information Panel */}
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-semibold text-gray-900'>
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
              label={t('teams.form.teamLeaderPhone')}
              type='tel'
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
              label={t('teams.form.teamLeaderEmail')}
              type='email'
              readOnly={false}
              required
              error={
                actionData?.errors?.teamLeaderEmail
                  ? actionData.errors.teamLeaderEmail === 'teamLeaderEmailInvalid'
                    ? t('teams.form.teamLeaderEmailInvalid')
                    : t('teams.form.teamLeaderEmailRequired')
                  : undefined
              }
              className='mb-4'
            />
          </div>
        </div>

        {/* Privacy Agreement */}
        <div className='rounded-lg bg-gray-50 p-6'>
          <div className='flex items-start gap-3'>
            <input
              type='checkbox'
              name='privacyAgreement'
              id='privacyAgreement'
              className='mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500'
              aria-invalid={actionData?.errors?.privacyAgreement ? true : undefined}
              aria-errormessage={
                actionData?.errors?.privacyAgreement ? 'privacy-error' : undefined
              }
            />
            <label htmlFor='privacyAgreement' className='text-sm text-gray-700'>
              {t('teams.form.privacyAgreement')}
            </label>
          </div>
          {actionData?.errors?.privacyAgreement ? (
            <div className='mt-2 text-red-700' id='privacy-error'>
              {t('teams.form.privacyAgreementRequired')}
            </div>
          ) : null}
        </div>

        {/* Submit Button */}
        <div className='flex justify-end'>
          <button
            type='submit'
            className='inline-flex items-center justify-center rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
          >
            {actionData?.success
              ? t('teams.form.createAnotherTeam')
              : t('teams.form.createTeam')}
          </button>
        </div>
      </Form>
    </div>
  )
}
