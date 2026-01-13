/**
 * Resource Route: Matches API (PLACEHOLDER)
 *
 * Pure data endpoint for match access across all user roles.
 * This route has no UI component - it only serves JSON data.
 *
 * Authorization: Permission-based (matches:read)
 * - PUBLIC, REFEREE, EDITOR, BILLING, MANAGER, ADMIN can access
 *
 * Use cases:
 * - PUBLIC: View match schedules and results
 * - REFEREE: View assigned matches and scores
 * - EDITOR: Access match data for reporting and analytics
 * - BILLING: View match data for billing purposes
 *
 * TODO: This is a placeholder route. The match model needs to be implemented first.
 * When ready, implement:
 * - getAllMatches() function in app/models/match.server.ts
 * - Match schema in Prisma
 * - Date serialization for scheduledAt, startedAt, completedAt
 */
import type { LoaderFunctionArgs } from 'react-router'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  // Permission-based authorization - allows all roles
  await requireUserWithPermission(request, 'matches:read')

  // TODO: Implement when match model is ready
  // const matches = await getAllMatches()
  // return Response.json({ matches })

  // Placeholder response indicating feature is not yet implemented
  return Response.json(
    {
      error: 'Match API not yet implemented',
      message: 'The match model needs to be created before this endpoint can function',
      status: 'placeholder',
    },
    { status: 501 }, // 501 Not Implemented
  )
}

// No default export = Resource route (data-only, no UI)
