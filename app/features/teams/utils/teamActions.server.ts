import { redirect } from 'react-router'

import { createTeamFromFormData } from './teamCreation.server'

/**
 * Shared team creation action handler
 * @param formData - Form data from the request
 * @param redirectPath - Path pattern for redirect (use {teamId} as placeholder)
 * @returns Response with errors or redirect
 */
export async function handleTeamCreation(
  formData: FormData,
  redirectPath: string
): Promise<Response> {
  const result = await createTeamFromFormData(formData)

  if (!result.success) {
    return Response.json({ errors: result.errors }, { status: 422 }) // Unprocessable Entity
  }

  // Ensure we have a valid team with an ID before redirecting
  if (!result?.team?.id) {
    return Response.json(
      { errors: { general: 'Team creation failed - invalid team data' } },
      { status: 500 }
    )
  }

  // Replace {teamId} placeholder with actual team ID and add success parameter
  const finalPath = redirectPath.replace('{teamId}', result.team.id)
  return redirect(`${finalPath}?success=created`)
}
