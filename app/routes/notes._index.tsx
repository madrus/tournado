import { Link } from '@remix-run/react'

export default function NoteIndexPage() {
  return (
    <p>
      No note selected. Select a note on the left, or{' '}
      <Link
        to='new'
        className='text-blue-500 underline'
        aria-label='Text link to create a new note'
      >
        create a new note.
      </Link>
    </p>
  )
}
