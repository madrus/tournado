/* eslint-disable no-console */
import { type ActionFunctionArgs, redirect } from 'react-router'

import { signout } from '~/utils/session.server'

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  try {
    // Ensure this is a POST request
    if (request.method.toLowerCase() !== 'post') {
      console.error('Received non-POST request to /signout')
      return Response.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      )
    }

    // Get the referrer URL if available
    const referrer = request.headers.get('Referer') || '/'

    // Process the signout
    console.log('Processing signout request')
    const response = await signout(request, referrer)
    console.log(`Signout successful, redirecting to appropriate page`)
    return response
  } catch (error) {
    console.error('Error in signout action:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const loader = async (): Promise<Response> =>
  redirect('/', {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
