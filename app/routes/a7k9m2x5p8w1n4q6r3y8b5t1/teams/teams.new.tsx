import type { JSX } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	useActionData,
} from 'react-router'

import { TeamForm } from '~/features/teams/components/TeamForm'
import { useTeamFormActions } from '~/features/teams/stores/useTeamFormStore'
import type { TeamCreateActionData } from '~/features/teams/types'
import { handleTeamCreation } from '~/features/teams/utils/teamActions.server'
import type { User } from '~/models/user.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithMetadata } from '~/utils/routeUtils.server'

// Route metadata - authenticated users can access (team creation is also public via /teams/new)
export const handle: RouteMetadata = {
	isPublic: false,
	auth: {
		required: true,
		redirectTo: '/auth/signin',
		preserveRedirect: true,
	},
	// No authorization restrictions - all authenticated users can access team creation
}

export async function loader({ request }: LoaderFunctionArgs): Promise<{
	user: User
}> {
	const user = await requireUserWithMetadata(request, handle)
	return { user }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
	await requireUserWithMetadata(request, handle)

	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'create') {
		return handleTeamCreation(formData, '/a7k9m2x5p8w1n4q6r3y8b5t1/teams/{teamId}')
	}

	return Response.json({ errors: {} })
}

export default function AdminNewTeamPage(): JSX.Element {
	const { t } = useTranslation()
	const actionData = useActionData<TeamCreateActionData>()
	const { resetForm } = useTeamFormActions()

	// Reset the form on every mount to ensure a clean slate
	useEffect(() => {
		resetForm()
	}, [resetForm])

	return (
		<div className='space-y-8' data-testid='admin-new-team-container'>
			<div className='mb-8'>
				<h2 className='font-bold text-3xl'>{t('admin.teams.newTeam')}</h2>
				<p className='mt-2 text-foreground'>
					{t('admin.teams.createNewTeamDescription')}
				</p>
			</div>

			<TeamForm
				mode='create'
				variant='admin'
				intent='create'
				submitButtonText={t('common.actions.save')}
				errors={actionData?.errors || {}}
			/>
		</div>
	)
}
