import { type ActionFunctionArgs, redirect } from 'react-router'

import { signout } from '~/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  await signout(request)
  return redirect('/')
}

export const loader = async (): Promise<Response> =>
  redirect('/', {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
