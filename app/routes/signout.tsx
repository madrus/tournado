import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { signout } from '~/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> =>
  signout(request)

export const loader = async (): Promise<Response> => redirect('/')
