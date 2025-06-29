import { type JSX, ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { cn } from '~/utils/misc'
import { getLatinTitleClass } from '~/utils/rtlUtils'

export type SidebarLayoutProps = {
  // Sidebar content
  sidebarContent: ReactNode

  // Main content
  mainContent: ReactNode

  // Configuration
  addButtonPath?: string
  addButtonLabel?: string
  closeSidebarOnPaths?: string[]

  // Optional handlers for future customization
  onSidebarToggle?: (isOpen: boolean) => void
  onSidebarItemClick?: (itemId?: string) => void

  // Styling customization
  sidebarWidth?: 'narrow' | 'medium' | 'wide'
  theme?: 'emerald' | 'red' | 'blue'
}

type ContextType = {
  type: 'sidebar' | 'main'
}

export { type ContextType as SidebarContextType }

/**
 * Reusable sidebar layout component that provides:
 * - Responsive sidebar with mobile overlay
 * - Floating action button on mobile
 * - Smooth animations and transitions
 * - Customizable content and styling
 * - Perfect for future sliding menu implementations
 */
export function SidebarLayout({
  sidebarContent,
  mainContent,
  addButtonPath = '#',
  addButtonLabel = 'Add Item',
  closeSidebarOnPaths = [],
  onSidebarToggle,
  onSidebarItemClick,
  sidebarWidth = 'medium',
  theme = 'red',
}: SidebarLayoutProps): JSX.Element {
  const { t: _t } = useTranslation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  // Check if current path should close sidebar
  const shouldCloseSidebar = closeSidebarOnPaths.some(path =>
    location.pathname.includes(path)
  )

  // Close sidebar on mobile when navigating to specified paths
  useEffect(() => {
    if (shouldCloseSidebar) {
      setIsSidebarOpen(false)
    }
  }, [shouldCloseSidebar])

  // Handle sidebar toggle with optional callback
  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen)
    onSidebarToggle?.(isOpen)
  }

  // Handle sidebar item clicks with optional callback
  const handleSidebarItemClick = (itemId?: string) => {
    // Close sidebar on mobile when item is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
    onSidebarItemClick?.(itemId)
  }

  // Width classes - full width on small screens, fixed width on md+
  const widthClasses = {
    narrow: 'w-full sm:w-64',
    medium: 'w-full sm:w-80',
    wide: 'w-full sm:w-96',
  }

  // Theme classes using semantic colors
  const themeClasses = {
    emerald: {
      gradient: 'from-accent via-background to-background',
      border: 'border-primary',
      button: 'border-primary text-primary hover:bg-accent',
      fab: 'bg-primary hover:bg-primary-hover',
    },
    red: {
      gradient: 'from-accent via-background to-background',
      border: 'border-brand',
      button: 'border-brand text-brand hover:bg-accent',
      fab: 'bg-brand hover:bg-brand-accent',
    },
    blue: {
      gradient: 'from-accent via-background to-background',
      border: 'border-primary',
      button: 'border-primary text-primary hover:bg-accent',
      fab: 'bg-primary hover:bg-primary-hover',
    },
  }

  const currentTheme = themeClasses[theme]
  const currentWidth = widthClasses[sidebarWidth]

  return (
    <div className='bg-background-hover min-h-screen'>
      <div className='flex min-h-screen'>
        <main
          className={cn(
            'flex flex-1 overflow-hidden bg-gradient-to-b md:flex-row',
            currentTheme.gradient
          )}
        >
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen ? (
            <div
              className='bg-foreground/50 fixed inset-0 z-20 md:hidden'
              onClick={() => handleSidebarToggle(false)}
              aria-label='Close sidebar'
            />
          ) : null}

          {/* Sidebar */}
          <div
            className={cn(
              'absolute top-0 z-30 h-full border-e bg-gradient-to-b transition-transform duration-300 ease-in-out md:relative md:top-0',
              currentWidth,
              currentTheme.gradient,
              currentTheme.border,
              isSidebarOpen ? 'fixed start-0 shadow-lg' : '-start-full md:start-0'
            )}
          >
            <div className='relative flex h-full flex-col pt-14'>
              {/* Add Button */}
              <div className='p-4'>
                <Link
                  to={addButtonPath}
                  className={cn(
                    'bg-background flex w-full min-w-[120px] items-center justify-center rounded-full border px-6 py-2 text-center text-base font-semibold shadow-xs',
                    currentTheme.button
                  )}
                  aria-label={`Sidebar button to ${addButtonLabel.toLowerCase()}`}
                  onClick={() => handleSidebarItemClick('add-button')}
                >
                  {addButtonLabel}
                </Link>
              </div>

              <hr className='border-foreground-lighter' />

              {/* Sidebar Content */}
              <div className='pb-safe flex-1 overflow-y-auto'>
                <div onClick={() => handleSidebarItemClick()}>{sidebarContent}</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='h-full flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6'>
            {mainContent}
          </div>

          {/* Mobile Floating Action Button */}
          {!shouldCloseSidebar ? (
            <Link
              to={addButtonPath}
              className={cn(
                'safe-bottom text-primary-foreground fixed end-4 bottom-4 z-20 flex h-12 w-12 items-center justify-center rounded-full pt-3 shadow-xl md:hidden',
                currentTheme.fab
              )}
              role='link'
              aria-label={addButtonLabel}
              onClick={() => handleSidebarItemClick('fab-button')}
            >
              <span className='text-primary-foreground text-3xl'>+</span>
            </Link>
          ) : null}

          {/* Sidebar Toggle Button (for future sliding menu) */}
          <button
            onClick={() => handleSidebarToggle(!isSidebarOpen)}
            className={cn(
              'text-primary-foreground fixed start-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg shadow-lg md:hidden',
              currentTheme.fab
            )}
            aria-label='Toggle sidebar'
          >
            <svg
              className='h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </main>
      </div>
    </div>
  )
}

/**
 * Demo/Example component showing how to use SidebarLayout
 * This can be used as reference for future implementations
 */
export function SidebarLayoutDemo(): JSX.Element {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const demoSidebarContent = (
    <div className='flex flex-col gap-2 p-4'>
      {/* Demo list items */}
      {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map((item, _index) => (
        <button
          key={item}
          onClick={() => setSelectedItem(item)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-medium',
            selectedItem === item
              ? 'bg-accent text-primary'
              : 'text-foreground hover:bg-background-hover'
          )}
        >
          <div className='bg-foreground-lighter h-2 w-2 rounded-full' />
          {item}
        </button>
      ))}
    </div>
  )

  const demoMainContent = (
    <div className='max-w-2xl'>
      <h1 className={cn('mb-4 text-3xl font-bold', getLatinTitleClass('en'))}>
        Sidebar Layout Demo
      </h1>

      <div className='border-foreground-lighter bg-background rounded-lg border p-6 shadow-sm'>
        <h2 className={cn('mb-3 text-xl font-semibold', getLatinTitleClass('en'))}>
          Selected: {selectedItem || 'None'}
        </h2>
        <p className='text-foreground-light mb-4'>
          This demo shows the sidebar layout component with all its features:
        </p>
        <ul className='text-foreground-light list-inside list-disc space-y-2'>
          <li>Responsive sidebar with mobile overlay</li>
          <li>Floating action button on mobile</li>
          <li>Smooth animations and transitions</li>
          <li>Toggle button for sliding menu functionality</li>
          <li>Customizable theming (red, emerald, blue)</li>
          <li>Configurable widths (narrow, medium, wide)</li>
          <li>Event handlers for future customization</li>
        </ul>
      </div>

      <div className='border-primary bg-accent mt-6 rounded-lg border p-4'>
        <h3 className={cn('text-primary mb-2 font-semibold', getLatinTitleClass('en'))}>
          Usage Example:
        </h3>
        <pre className='text-foreground-darker overflow-x-auto text-sm'>
          {`<SidebarLayout
            sidebarContent={<MyTeamList />}
            mainContent={<MyTeamDetails />}
            addButtonPath="/teams/new"
            addButtonLabel="Add Team"
            closeSidebarOnPaths={['/new']}
            theme="red"
            sidebarWidth="medium"
            onSidebarToggle={(isOpen) => console.log('Sidebar:', isOpen)}
          />`}
        </pre>
      </div>
    </div>
  )

  return (
    <SidebarLayout
      sidebarContent={demoSidebarContent}
      mainContent={demoMainContent}
      addButtonPath='#demo'
      addButtonLabel='Add Demo Item'
      closeSidebarOnPaths={['/demo/new']}
      theme='red'
      sidebarWidth='medium'
      onSidebarToggle={_isOpen => {
        /* Demo sidebar toggled */
      }}
      onSidebarItemClick={_itemId => {
        /* Demo item clicked */
      }}
    />
  )
}
