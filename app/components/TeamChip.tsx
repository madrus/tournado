import { JSX } from 'react'

interface TeamChipProps {
  team: {
    id: string
    clubName: string
    teamName: string
  }
  onClick?: () => void
  showActions?: boolean // for admin context
  onDelete?: () => void // admin only
  className?: string
}

export function TeamChip({
  team,
  onClick,
  showActions = false,
  onDelete,
  className = '',
}: TeamChipProps): JSX.Element {
  const baseClasses = `
    inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2
    text-sm font-medium text-gray-700 shadow-sm transition-all duration-200
    hover:border-gray-300 hover:shadow-md
    ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
    ${className}
  `.trim()

  const chipContent = (
    <>
      <span className='text-gray-900'>{`${team.clubName} ${team.teamName}`}</span>
      {showActions && onDelete ? (
        <button
          onClick={event => {
            event.stopPropagation()
            onDelete()
          }}
          className='ml-1 rounded-full p-1 text-red-500 hover:bg-red-50 hover:text-red-700'
          aria-label={`Delete team ${team.clubName} ${team.teamName}`}
          title='Delete team'
        >
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
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      ) : null}
    </>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClasses} type='button'>
        {chipContent}
      </button>
    )
  }

  return <div className={baseClasses}>{chipContent}</div>
}
