import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import { getChipClasses, isRTL } from '~/utils/rtlUtils'

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
  const chipClasses = getChipClasses(i18n.language)

  const deleteIcon = renderIcon('delete', {
    className: 'h-4 w-4',
  })

  const labelText = <span>{label}</span>

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        chipClasses.container,
        'inline-flex items-center justify-between rounded-md border border-red-300 bg-white py-2 text-sm font-medium',
        'text-red-700 hover:bg-red-50/30 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none',
        'ps-4 pe-4',
        // 3D button effects
        'transform shadow-lg transition-all duration-150 ease-in-out',
        'hover:-translate-y-0.5 hover:border-red-400 hover:shadow-lg',
        'active:translate-y-0 active:scale-95 active:shadow-md',
        'shadow-red-300/50 hover:shadow-red-400/60 focus:ring-4'
      )}
    >
      {rtl ? (
        <>
          {labelText}
          {deleteIcon}
        </>
      ) : (
        <>
          {deleteIcon}
          {labelText}
        </>
      )}
    </button>
  )
}
