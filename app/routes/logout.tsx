import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { logout } from '@/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> =>
  logout(request)

export const loader = async (): Promise<Response> => redirect('/')
