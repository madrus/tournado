import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { signout } from '~/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  // Ensure this is a POST request
  if (request.method.toLowerCase() !== 'post') {
    return redirect('/')
  }

  return signout(request)
}

export const loader = async (): Promise<Response> =>
  redirect('/', {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
