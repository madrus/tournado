import type { LoaderFunctionArgs } from '@remix-run/node'

export const loader = async ({ request: _ }: LoaderFunctionArgs): Promise<Response> =>
  new Response(null, { status: 204 })
