import { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Table } from '@tanstack/react-table'

import { VisibilityIcon } from '~/components/icons'
import { cn } from '~/utils/misc'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
  className?: string
}

export function DataTableViewOptions<TData>({
  table,
  className,
}: DataTableViewOptionsProps<TData>): JSX.Element {
  const { t } = useTranslation()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type='button'
          className={cn(
            'border-border bg-background flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
            'hover:bg-accent transition-colors',
            'focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            className
          )}
        >
          <VisibilityIcon className='h-4 w-4' aria-hidden='true' />
          <span>{t('datatable.view', 'View')}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          className={cn(
            'border-border bg-background z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <DropdownMenu.Label className='text-foreground-light px-2 py-1.5 text-xs font-semibold'>
            {t('datatable.toggleColumns', 'Toggle columns')}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className='bg-border my-1 h-px' />
          {table
            .getAllColumns()
            .filter(column => column.getCanHide())
            .map(column => {
              const title =
                typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id

              return (
                <DropdownMenu.CheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                  className={cn(
                    'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
                    'focus:bg-accent focus:text-foreground transition-colors',
                    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                  )}
                >
                  <span className='flex-1'>{title}</span>
                </DropdownMenu.CheckboxItem>
              )
            })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
