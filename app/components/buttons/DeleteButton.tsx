import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { isRTL } from '~/utils/rtlUtils'

type DeleteButtonProps = {
  onClick: () => void
  label: string
}

export function DeleteButton({
  onClick,
  label,
}: Readonly<DeleteButtonProps>): JSX.Element {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)
  return (
    <button
      type='button'
      onClick={onClick}
      className={`inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none ${rtl ? 'flex-row-reverse gap-3' : ''}`}
    >
      {rtl ? (
        <>
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
            />
          </svg>
          <span>{label}</span>
        </>
      ) : (
        <>
          <svg
            className='mr-2 -ml-1 h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
            />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
