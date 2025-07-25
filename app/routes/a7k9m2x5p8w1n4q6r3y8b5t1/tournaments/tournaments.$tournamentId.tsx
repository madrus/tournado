/* eslint-disable id-blacklist */
import { JSX, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MetaFunction } from 'react-router'
import { redirect, useActionData, useLoaderData } from 'react-router'

import { TournamentForm } from '~/components/TournamentForm'
import type { Tournament } from '~/models/tournament.server'
import {
  deleteTournamentById,
  getAllCategories,
  getAllDivisions,
  getTournamentById,
  updateTournament,
} from '~/models/tournament.server'
import type { RouteMetadata } from '~/utils/route-types'
import { requireUserWithMetadata } from '~/utils/route-utils.server'

import type { Route } from './+types/tournaments.$tournamentId'

// Route metadata - admin only
export const handle: RouteMetadata = {
  isPublic: false,
  auth: {
    required: true,
    redirectTo: '/auth/signin',
    preserveRedirect: true,
  },
  authorization: {
    requiredRoles: ['admin'],
    roleMatchMode: 'any',
    redirectTo: '/unauthorized',
  },
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const tournamentName = (data as LoaderData)?.tournament?.name || 'Tournament'
  return [
    { title: `${tournamentName} | Admin | Tournado` },
    {
      name: 'description',
      content: `Edit tournament: ${tournamentName} details and settings.`,
    },
    {
      property: 'og:title',
      content: `${tournamentName} | Admin | Tournado`,
    },
    {
      property: 'og:description',
      content: `Edit tournament: ${tournamentName} details and settings.`,
    },
    { property: 'og:type', content: 'website' },
  ]
}

type LoaderData = {
  tournament: Tournament | null
  divisions: string[]
  categories: string[]
  language: string // Add language to LoaderData
}

type ActionData = {
  errors?: {
    name?: string
    location?: string
    startDate?: string
    endDate?: string
    divisions?: string
    categories?: string
  }
  success?: boolean
  message?: string
}

export async function loader({
  request,
  params,
}: Route.LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)

  // Read 'lang' cookie from request
  const cookieHeader = request.headers.get('Cookie') || ''
  const langMatch = cookieHeader.match(/lang=([^;]+)/)
  const language = langMatch ? langMatch[1] : 'nl'

  const { tournamentId } = params
  if (!tournamentId) {
    throw new Response('Tournament ID is required', { status: 400 })
  }

  const tournament = await getTournamentById({ id: tournamentId })
  if (!tournament) {
    throw new Response('Tournament not found', { status: 404 })
  }

  const divisions = getAllDivisions()
  const categories = getAllCategories()

  return {
    tournament,
    divisions,
    categories,
    language, // Pass language to loader data
  }
}

export async function action({
  request,
  params,
}: Route.ActionArgs): Promise<Response | ActionData> {
  await requireUserWithMetadata(request, handle)

  const { tournamentId } = params
  if (!tournamentId) {
    throw new Response('Tournament ID is required', { status: 400 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent')

  // Handle delete
  if (intent === 'delete') {
    await deleteTournamentById({ id: tournamentId })
    return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments')
  }

  // Handle update
  const name = formData.get('name')
  const location = formData.get('location')
  const startDate = formData.get('startDate')
  const endDate = formData.get('endDate')
  const divisions = formData.getAll('divisions') as string[]
  const categories = formData.getAll('categories') as string[]

  const errors: ActionData['errors'] = {}

  // Validation
  if (typeof name !== 'string' || name.length === 0) {
    errors.name = 'Tournament name is required'
  }

  if (typeof location !== 'string' || location.length === 0) {
    errors.location = 'Location is required'
  }

  if (typeof startDate !== 'string' || startDate.length === 0) {
    errors.startDate = 'Start date is required'
  }

  if (divisions.length === 0) {
    errors.divisions = 'At least one division must be selected'
  }

  if (categories.length === 0) {
    errors.categories = 'At least one category must be selected'
  }

  // Validate date format and logic
  if (startDate && typeof startDate === 'string') {
    const start = new Date(startDate)
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date format'
    }

    if (endDate && typeof endDate === 'string') {
      const end = new Date(endDate)
      if (isNaN(end.getTime())) {
        errors.endDate = 'Invalid end date format'
      } else if (end < start) {
        errors.endDate = 'End date must be after start date'
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  try {
    await updateTournament({
      id: tournamentId,
      name: name as string,
      location: location as string,
      startDate: new Date(startDate as string),
      endDate: endDate && typeof endDate === 'string' ? new Date(endDate) : null,
      divisions,
      categories,
    })

    return {
      success: true,
      message: 'Tournament updated successfully',
    }
  } catch (_error) {
    return {
      errors: {
        name: 'Failed to update tournament. Please try again.',
      },
    }
  }
}

export default function EditTournamentPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const { tournament, divisions, categories, language } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()

  // Set i18n language if different
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  if (!tournament) {
    return (
      <div className='py-12 text-center'>
        <h2 className='text-foreground text-xl font-semibold'>Tournament not found</h2>
        <p className='text-foreground mt-2'>
          The tournament you're looking for doesn't exist.
        </p>
      </div>
    )
  }

  const handleReset = () => {
    window.history.back()
  }

  const handleDelete = () => {
    if (confirm(t('admin.tournaments.confirmDelete'))) {
      const form = document.createElement('form')
      form.method = 'post'
      form.style.display = 'none'

      const intentInput = document.createElement('input')
      intentInput.type = 'hidden'
      intentInput.name = 'intent'
      intentInput.value = 'delete'

      form.appendChild(intentInput)
      document.body.appendChild(form)
      form.submit()
    }
  }

  // Format dates for form inputs (YYYY-MM-DD format)
  const formatDateForInput = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString().split('T')[0]
  }

  // Parse JSON fields
  const parsedDivisions = tournament.divisions
    ? typeof tournament.divisions === 'string'
      ? JSON.parse(tournament.divisions)
      : tournament.divisions
    : []

  const parsedCategories = tournament.categories
    ? typeof tournament.categories === 'string'
      ? JSON.parse(tournament.categories)
      : tournament.categories
    : []

  const formData = {
    id: tournament.id,
    name: tournament.name,
    location: tournament.location,
    startDate: formatDateForInput(tournament.startDate),
    endDate: tournament.endDate ? formatDateForInput(tournament.endDate) : '',
    divisions: parsedDivisions,
    categories: parsedCategories,
  }

  return (
    <div className='space-y-8'>
      {actionData?.success ? (
        <div className='rounded-md bg-green-50 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-green-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-green-800'>{actionData.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      <TournamentForm
        mode='edit'
        variant='admin'
        formData={formData}
        divisions={divisions}
        categories={categories}
        errors={actionData?.errors || {}}
        isSuccess={actionData?.success || false}
        successMessage={actionData?.message}
        submitButtonText={t('common.actions.update')}
        onCancel={handleReset}
        showDeleteButton={true}
        onDelete={handleDelete}
        intent='update'
      />
    </div>
  )
}
