/* eslint-disable no-console */
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

  // Theme classes
  const themeClasses = {
    emerald: {
      gradient: 'from-emerald-50 via-white to-white',
      border: 'border-emerald-500',
      button: 'border-emerald-500 text-emerald-500 hover:bg-emerald-50',
      fab: 'bg-emerald-500 hover:bg-emerald-600',
    },
    red: {
      gradient: 'from-red-50 via-white to-white',
      border: 'border-red-500',
      button: 'border-red-500 text-red-500 hover:bg-red-50',
      fab: 'bg-red-500 hover:bg-red-600',
    },
    blue: {
      gradient: 'from-blue-50 via-white to-white',
      border: 'border-blue-500',
      button: 'border-blue-500 text-blue-500 hover:bg-blue-50',
      fab: 'bg-blue-500 hover:bg-blue-600',
    },
  }

  const currentTheme = themeClasses[theme]
  const currentWidth = widthClasses[sidebarWidth]

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex min-h-screen'>
        <main
          className={`flex flex-1 overflow-hidden bg-gradient-to-b ${currentTheme.gradient} md:flex-row`}
        >
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen ? (
            <div
              className='fixed inset-0 z-20 bg-black/50 md:hidden'
              onClick={() => handleSidebarToggle(false)}
              aria-label='Close sidebar'
            />
          ) : null}

          {/* Sidebar */}
          <div
            className={`absolute top-0 z-30 h-full ${currentWidth} bg-gradient-to-b ${currentTheme.gradient} transition-transform duration-300 ease-in-out md:relative md:top-0 ${
              isSidebarOpen ? 'fixed start-0 shadow-lg' : '-start-full md:start-0'
            } border-e ${currentTheme.border}`}
          >
            <div className='relative flex h-full flex-col pt-14'>
              {/* Add Button */}
              <div className='p-4'>
                <Link
                  to={addButtonPath}
                  className={`flex w-full min-w-[120px] items-center justify-center rounded-full border bg-white px-6 py-2 text-center text-base font-semibold shadow-xs ${currentTheme.button}`}
                  aria-label={`Sidebar button to ${addButtonLabel.toLowerCase()}`}
                  onClick={() => handleSidebarItemClick('add-button')}
                >
                  {addButtonLabel}
                </Link>
              </div>

              <hr className='border-gray-300' />

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
              className={`safe-bottom fixed end-4 bottom-4 z-20 flex h-12 w-12 items-center justify-center rounded-full pt-3 text-white shadow-xl md:hidden ${currentTheme.fab}`}
              role='link'
              aria-label={addButtonLabel}
              onClick={() => handleSidebarItemClick('fab-button')}
            >
              <span className='text-3xl text-white'>+</span>
            </Link>
          ) : null}

          {/* Sidebar Toggle Button (for future sliding menu) */}
          <button
            onClick={() => handleSidebarToggle(!isSidebarOpen)}
            className={`fixed start-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-lg md:hidden ${currentTheme.fab}`}
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
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-left text-sm font-medium ${
            selectedItem === item
              ? 'bg-red-100 text-red-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className='h-2 w-2 rounded-full bg-gray-400' />
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

      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className={cn('mb-3 text-xl font-semibold', getLatinTitleClass('en'))}>
          Selected: {selectedItem || 'None'}
        </h2>
        <p className='mb-4 text-gray-600'>
          This demo shows the sidebar layout component with all its features:
        </p>
        <ul className='list-inside list-disc space-y-2 text-gray-600'>
          <li>Responsive sidebar with mobile overlay</li>
          <li>Floating action button on mobile</li>
          <li>Smooth animations and transitions</li>
          <li>Toggle button for sliding menu functionality</li>
          <li>Customizable theming (red, emerald, blue)</li>
          <li>Configurable widths (narrow, medium, wide)</li>
          <li>Event handlers for future customization</li>
        </ul>
      </div>

      <div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <h3
          className={cn('mb-2 font-semibold text-blue-900', getLatinTitleClass('en'))}
        >
          Usage Example:
        </h3>
        <pre className='overflow-x-auto text-sm text-blue-800'>
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
      onSidebarToggle={isOpen => console.log('Demo sidebar toggled:', isOpen)}
      onSidebarItemClick={itemId => console.log('Demo item clicked:', itemId)}
    />
  )
}
