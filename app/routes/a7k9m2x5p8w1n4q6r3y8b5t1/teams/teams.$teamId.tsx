import type { Category, Division } from '@prisma/client'
import { type JSX, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	useActionData,
	useLoaderData,
	useSearchParams,
	useSubmit,
} from 'react-router'

import { ActionButton } from '~/components/buttons/ActionButton'
import { SimpleConfirmDialog } from '~/components/ConfirmDialog'
import { Panel } from '~/components/Panel'
import { prisma } from '~/db.server'
import { TeamForm } from '~/features/teams/components/TeamForm'
import { useTeamFormActions } from '~/features/teams/stores/useTeamFormStore'
import type { TeamCreateActionData } from '~/features/teams/types'
import { getDivisionLabel, stringToCategory, stringToDivision } from '~/lib/lib.helpers'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'
import { toast } from '~/utils/toastUtils'

// Route metadata - admin only
export const handle: RouteMetadata = {
	isPublic: false,
	title: 'common.titles.team',
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	authorization: {
		requiredRoles: ['ADMIN'],
		roleMatchMode: 'any',
		redirectTo: '/unauthorized',
	},
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => [
	{
		title: loaderData?.team
			? `${loaderData.team.clubName} ${loaderData.team.name} | Admin | Tournado`
			: 'Team | Admin | Tournado',
	},
	{
		name: 'description',
		content: loaderData?.team
			? `View and edit ${loaderData.team.clubName} ${loaderData.team.name} team details.`
			: 'View and edit team details in the admin panel.',
	},
	{
		property: 'og:title',
		content: loaderData?.team
			? `${loaderData.team.clubName} ${loaderData.team.name} | Admin | Tournado`
			: 'Team | Admin | Tournado',
	},
	{
		property: 'og:description',
		content: loaderData?.team
			? `View and edit ${loaderData.team.clubName} ${loaderData.team.name} team details.`
			: 'View and edit team details in the admin panel.',
	},
	{ property: 'og:type', content: 'website' },
]

type LoaderData = {
	team: {
		id: string
		name: string
		clubName: string
		division: Division
		category: Category
		teamLeader: {
			firstName: string
			lastName: string
			email: string
			phone: string
		}
		tournament: {
			id: string
			name: string
			location: string
		}
	}
}

function parseTeamLeaderName(fullName: string): {
	firstName: string
	lastName: string
} {
	const trimmed = fullName.trim()
	if (trimmed.length === 0) {
		return { firstName: '', lastName: '' }
	}

	const parts = trimmed.split(/\s+/).filter(Boolean)
	if (parts.length === 1) {
		return { firstName: parts[0], lastName: '' }
	}

	return {
		firstName: parts[0],
		lastName: parts.slice(1).join(' '),
	}
}

export const loader = async ({
	request,
	params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
	await requireUserWithMetadata(request, handle)

	const { teamId } = params
	if (!teamId) {
		throw new Response('Team ID is required', { status: 400 })
	}

	const team = await prisma.team.findUnique({
		where: { id: teamId },
		include: {
			teamLeader: true,
			tournament: true,
		},
	})

	if (!team) {
		throw new Response('Team not found', { status: 404 })
	}

	return {
		team: {
			id: team.id,
			clubName: team.clubName,
			name: team.name,
			division: team.division,
			category: team.category,
			teamLeader: {
				firstName: team.teamLeader.firstName,
				lastName: team.teamLeader.lastName,
				email: team.teamLeader.email,
				phone: team.teamLeader.phone,
			},
			tournament: {
				id: team.tournament.id,
				name: team.tournament.name,
				location: team.tournament.location,
			},
		},
	}
}

export async function action({
	request,
	params,
}: ActionFunctionArgs): Promise<Response> {
	await requireUserWithMetadata(request, handle)

	const { teamId } = params
	if (!teamId) {
		throw new Response('Team ID is required', { status: 400 })
	}

	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'update') {
		// Extract all form fields with proper typing
		const clubName = formData.get('clubName') as string | null
		const name = formData.get('name') as string | null
		const division = formData.get('division') as string | null
		const category = formData.get('category') as string | null
		const teamLeaderName = formData.get('teamLeaderName') as string | null
		const teamLeaderPhone = formData.get('teamLeaderPhone') as string | null
		const teamLeaderEmail = formData.get('teamLeaderEmail') as string | null

		const errors: TeamCreateActionData['errors'] = {}

		// Validate required fields
		if (!clubName || clubName.length === 0) {
			errors.clubName = 'clubNameRequired'
		}

		if (!name || name.length === 0) {
			errors.name = 'nameRequired'
		}

		if (!division || division.length === 0) {
			errors.division = 'divisionRequired'
		}

		// Validate division is a valid enum value
		const validDivision = stringToDivision(division)
		if (division && !validDivision) {
			errors.division = 'invalidDivision'
		}

		// Validate category is a valid enum value
		const validCategory = stringToCategory(category)
		if (category && !validCategory) {
			errors.category = 'invalidCategory'
		}

		if (Object.keys(errors).length > 0) {
			return Response.json({ errors }, { status: 400 })
		}

		// Update the team
		await prisma.team.update({
			where: { id: teamId },
			data: {
				clubName: clubName as string,
				name: name as string,
				division: validDivision as Division,
				...(validCategory ? { category: validCategory as Category } : {}),
				// Update team leader nested (firstName/lastName split from teamLeaderName)
				...(teamLeaderName || teamLeaderEmail || teamLeaderPhone
					? {
							teamLeader: {
								update: {
									...(teamLeaderName
										? {
												...parseTeamLeaderName(teamLeaderName),
											}
										: {}),
									...(teamLeaderEmail ? { email: teamLeaderEmail } : {}),
									...(teamLeaderPhone ? { phone: teamLeaderPhone } : {}),
								},
							},
						}
					: {}),
			},
		})

		return redirect(`/a7k9m2x5p8w1n4q6r3y8b5t1/teams/${teamId}?success=updated`)
	}

	if (intent === 'delete') {
		await prisma.team.delete({
			where: { id: teamId },
		})

		return redirect('/a7k9m2x5p8w1n4q6r3y8b5t1/teams')
	}

	return Response.json({ errors: {} })
}

export default function AdminTeamPage(): JSX.Element {
	const { team } = useLoaderData<LoaderData>()
	const actionData = useActionData<TeamCreateActionData>()
	const { i18n, t } = useTranslation()
	const [searchParams, setSearchParams] = useSearchParams()
	const submit = useSubmit()
	const { setFormData } = useTeamFormActions()

	// Runtime guard for strict team name pattern: J|M|JM + 'O' + number-number
	const isValidTeamName = (
		value: string,
	): value is `${'J' | 'M' | 'JM'}O${number}-${number}` =>
		/^(?:J|M|JM)O\d+-\d+$/.test(value)

	// Check for success parameter and show toast
	// biome-ignore lint/correctness/useExhaustiveDependencies: isValidTeamName is a runtime guard and does not need to be a dependency
	useEffect(() => {
		const success = searchParams.get('success')
		if (success === 'created') {
			// Smooth scroll to top for better UX after successful create
			window.scrollTo({ top: 0, behavior: 'smooth' })
			toast.success(t('messages.team.registrationSuccess'), {
				description: t('messages.team.registrationSuccessDesc'),
			})

			// Remove the success parameter from URL
			searchParams.delete('success')
			setSearchParams(searchParams, { replace: true })
		} else if (success === 'updated') {
			// Smooth scroll to top for better UX after successful update
			window.scrollTo({ top: 0, behavior: 'smooth' })
			toast.success(t('messages.team.updateSuccess'), {
				description: t('messages.team.updateSuccessDesc'),
			})

			// Sync the store with the latest loader data so UI reflects persisted update
			setFormData({
				tournamentId: team.tournament.id,
				clubName: team.clubName,
				name: isValidTeamName(team.name) ? team.name : String(team.name),
				division: team.division,
				category: team.category,
				teamLeaderName: `${team.teamLeader.firstName} ${team.teamLeader.lastName}`,
				teamLeaderPhone: team.teamLeader.phone,
				teamLeaderEmail: team.teamLeader.email as `${string}@${string}.${string}`,
				privacyAgreement: true,
			})

			// Remove the success parameter from URL
			searchParams.delete('success')
			setSearchParams(searchParams, { replace: true })
		}
	}, [searchParams, setSearchParams, t, setFormData, team])

	// Prepare the initial team data for reset functionality - memoized to prevent infinite loops
	// biome-ignore lint/correctness/useExhaustiveDependencies: isValidTeamName is a runtime guard and does not need to be a dependency
	const initialTeamData = useMemo(
		() => ({
			tournamentId: team.tournament.id,
			clubName: team.clubName,
			name: isValidTeamName(team.name) ? team.name : String(team.name),
			division: team.division,
			category: team.category,
			teamLeaderName: `${team.teamLeader.firstName} ${team.teamLeader.lastName}`,
			teamLeaderPhone: team.teamLeader.phone,
			teamLeaderEmail: team.teamLeader.email as `${string}@${string}.${string}`,
			privacyAgreement: true, // Always true for existing teams
		}),
		[team],
	)

	const submitDelete = (): void => {
		const fd = new FormData()
		fd.set('intent', 'delete')
		submit(fd, { method: 'post' })
	}

	return (
		<div className='w-full'>
			{/* Admin Header with Delete Button */}
			<Panel color='sky' className='mb-8'>
				<div className='flex items-center justify-between gap-4'>
					<div className='flex-1'>
						<h2 className='font-bold text-2xl'>
							{team.clubName && team.name
								? `${team.clubName} ${team.name}`
								: t('teams.form.teamRegistration')}
						</h2>
						<p className='mt-2 text-foreground'>
							{team.division
								? getDivisionLabel(team.division, i18n.language)
								: t('teams.form.fillOutForm')}
						</p>
					</div>
					{/* Delete Button */}
					<div className='shrink-0'>
						<SimpleConfirmDialog
							intent='danger'
							trigger={
								<ActionButton icon='delete' variant='secondary'>
									{t('common.actions.delete')}
								</ActionButton>
							}
							title={t('teams.deleteTeam')}
							description={t('teams.deleteTeamAreYouSure')}
							confirmLabel={t('common.actions.confirmDelete')}
							cancelLabel={t('common.actions.cancel')}
							// Destructive: focus cancel first per request
							destructive
							onConfirm={submitDelete}
						/>
					</div>
				</div>
			</Panel>

			{/* Team Form */}
			<TeamForm
				mode='edit'
				variant='admin'
				formData={initialTeamData}
				errors={actionData?.errors || {}}
				intent='update'
			/>
		</div>
	)
}

export function ErrorBoundary(): JSX.Element {
	const { t } = useTranslation()

	return (
		<Panel color='red'>
			<h2 className='mb-4 font-bold text-2xl'>{t('errors.somethingWentWrong')}</h2>
			<p className='text-foreground'>
				{t(
					'errors.teamLoadFailed',
					'Unable to load team details. Please try again later.',
				)}
			</p>
		</Panel>
	)
}
