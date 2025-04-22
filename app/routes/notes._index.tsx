import { Link } from '@remix-run/react'

import { useTranslation } from 'react-i18next'

export default function NoteIndexPage() {
  const { t } = useTranslation()

  return (
    <p>
      {t('notes.noNoteSelected')}{' '}
      <Link
        to='new'
        className='text-blue-500 underline'
        aria-label='Text link to create a new note'
      >
        {t('notes.createNewNote')}
      </Link>
    </p>
  )
}
