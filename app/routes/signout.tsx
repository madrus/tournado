/* eslint-disable no-console */
import type { ActionFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'

import { signout } from '~/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  try {
    // Ensure this is a POST request
    if (request.method.toLowerCase() !== 'post') {
      console.error('Received non-POST request to /signout')
      return json({ success: false, error: 'Method not allowed' }, { status: 405 })
    }

    // Process the signout
    console.log('Processing signout request')
    const response = await signout(request)
    console.log('Signout successful, redirecting to /')
    return response
  } catch (error) {
    console.error('Error in signout action:', error)
    return json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export const loader = async (): Promise<Response> =>
  redirect('/', {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
