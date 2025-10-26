/**
 * Resource Route: Teams API
 *
 * Pure data endpoint for team access across all user roles.
 * This route has no UI component - it only serves JSON data.
 *
 * Authorization: Permission-based (teams:read)
 * - PUBLIC, REFEREE, EDITOR, BILLING, MANAGER, ADMIN can access
 *
 * Use cases:
 * - PUBLIC: View teams in public tournament listings
 * - REFEREE: View teams in assigned matches
 * - EDITOR: Access team data for reporting and analytics
 * - BILLING: View team data for billing purposes
 */
import type { LoaderFunctionArgs } from 'react-router'

import { getAllTeams } from '~/models/team.server'
import { requireUserWithPermission } from '~/utils/rbacMiddleware.server'

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  // Permission-based authorization - allows all roles
  await requireUserWithPermission(request, 'teams:read')

  // Get all teams (future: add filtering support via query params)
  const teams = await getAllTeams()

  // Return JSON using native Response.json()
  return Response.json({ teams })
}

// No default export = Resource route (data-only, no UI)
