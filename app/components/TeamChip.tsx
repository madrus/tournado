import { JSX } from 'react'

type TeamChipProps = {
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
    flex items-center rounded-lg border border-red-300 bg-white py-2
    text-sm font-medium text-red-700 shadow-sm transition-all duration-200
    hover:border-red-300 hover:shadow-md hover:bg-red-50
    ${onClick ? 'cursor-pointer' : ''}
    ${showActions && onDelete ? 'pl-3 pr-2 gap-2' : 'px-3'}
    ${className}
  `.trim()

  const chipContent = (
    <>
      <span className='truncate'>{`${team.clubName} ${team.teamName}`}</span>
      {showActions && onDelete ? (
        <button
          onClick={event => {
            event.stopPropagation()
            onDelete()
          }}
          className='flex-shrink-0 rounded-full p-1 text-red-500 hover:bg-red-50 hover:text-red-700'
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
