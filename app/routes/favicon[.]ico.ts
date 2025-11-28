import type { LoaderFunctionArgs } from 'react-router'

export const loader = async ({ request: _ }: LoaderFunctionArgs): Promise<Response> =>
	new Response(null, { status: 204 })
