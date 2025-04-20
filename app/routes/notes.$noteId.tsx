import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'

import invariant from 'tiny-invariant'

import { deleteNote, getNote } from '@/models/note.server'
import { requireUserId } from '@/utils/session.server'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  invariant(params.noteId, 'noteId not found')

  const note = await getNote({ id: params.noteId, userId })
  if (!note) {
    throw new Response('Not Found', { status: 404 })
  }
  return json({ note })
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)
  invariant(params.noteId, 'noteId not found')

  await deleteNote({ id: params.noteId, userId })

  return redirect('/notes')
}

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <h3 className='text-2xl font-bold'>{data.note.title}</h3>
      <p className='py-6'>{data.note.body}</p>
      <hr className='my-4' />
      <Form method='post'>
        <button
          type='submit'
          className='rounded-full border border-red-300 bg-white px-6 py-2 text-sm text-red-500 hover:border-red-400 hover:text-red-600'
        >
          Delete
        </button>
      </Form>
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>
  }

  if (error.status === 404) {
    return <div>Note not found</div>
  }

  return <div>An unexpected error occurred: {error.statusText}</div>
}
