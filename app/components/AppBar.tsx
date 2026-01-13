import type { User } from '@prisma/client'
import {
  type JSX,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useFetcher, useLocation } from 'react-router'
import logo from '~/assets/logo-192x192.png'
import { navigationVariants } from '~/components/navigation/navigation.variants'
import { useLanguageSwitcher } from '~/hooks/useLanguageSwitcher'
import { useRTLDropdown } from '~/hooks/useRTLDropdown'
import { useScrollDirection } from '~/hooks/useScrollDirection'
import type { Language } from '~/i18n/config'
import { SUPPORTED_LANGUAGES } from '~/i18n/config'
import { CONTENT_PX } from '~/styles/constants'
import { adminPath } from '~/utils/adminRoutes'
import { breakpoints } from '~/utils/breakpoints'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { canAccess, hasAdminPanelAccess } from '~/utils/rbac'
import { usePageTitle } from '~/utils/routeUtils'
import {
  getArabicTextClass,
  getLatinTextClass,
  getLatinTitleClass,
  getTypographyClass,
} from '~/utils/rtlUtils'
import { PrimaryNavLink } from './PrefetchLink'
import { ThemeToggle } from './ThemeToggle'
import { type MenuItemType, UserMenu } from './UserMenu'

// Accepts user and optional title as props for future flexibility
export function AppBar({
  authenticated,
  username,
  user,
  language,
}: {
  authenticated: boolean
  title?: string
  username?: string
  user?: User | null
  language: Language
}): JSX.Element {
  const { t } = useTranslation()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const signoutFetcher = useFetcher()
  // Get the current page title
  const pageTitle = usePageTitle()

  // Get RTL classes for auth actions
  const { menuClasses } = useRTLDropdown()

  // Track optimistic authenticated state
  const isAuthenticated =
    signoutFetcher.formAction === '/auth/signout' ? false : authenticated

  // Check user permissions using RBAC utilities
  // Menu visibility: delete permission implies full admin access (create, read, update, delete)
  const canManageTournaments = canAccess(user || null, 'tournaments:delete')
  const canManageTeams = canAccess(user || null, 'teams:delete')
  const canManageGroups = canAccess(user || null, 'groups:manage')
  const userHasAdminPanelAccess = hasAdminPanelAccess(user || null)

  // Handle sign-in
  const handleSignIn = useCallback(() => {
    // Close menu
    setMenuOpen(false)
  }, [])

  // Handle sign-out
  const handleSignOut = useCallback(() => {
    setMenuOpen(false)
    // Submit signout form
    signoutFetcher.submit({}, { method: 'post', action: '/auth/signout' })
  }, [signoutFetcher])

  // Language switching logic
  const { switchLanguage, currentLanguage } = useLanguageSwitcher()

  const menuItems: Readonly<MenuItemType[]> = useMemo(
    () => [
      // Admin Panel - show for admin panel access (admin, manager, referee)
      ...(userHasAdminPanelAccess
        ? [
            {
              label: t('common.titles.adminPanel'),
              icon: 'admin_panel_settings' as IconName,
              href: adminPath(),
              authenticated: true,
            },
          ]
        : []),
      // Tournaments - only show for users who can manage tournaments (ADMIN, MANAGER)
      ...(canManageTournaments
        ? [
            {
              label: t('common.titles.tournaments'),
              icon: 'trophy' as IconName,
              href: adminPath('/tournaments'),
              authenticated: true,
            },
          ]
        : []),
      {
        label: t('common.titles.teams'),
        icon: 'apparel' as IconName,
        href: canManageTeams ? adminPath('/teams') : '/teams',
        authenticated: false,
      },
      // Competition - only show for users who can manage groups (ADMIN, MANAGER)
      ...(canManageGroups
        ? [
            {
              label: t('common.titles.competition'),
              icon: 'sports' as IconName,
              href: adminPath('/competition'),
              authenticated: true,
            },
          ]
        : []),
      // Users - only show for ADMIN users
      ...(canAccess(user || null, 'users:approve')
        ? [
            {
              label: t('common.titles.users'),
              icon: 'people' as IconName,
              href: adminPath('/users'),
              authenticated: true,
            },
          ]
        : []),
      // Divider after Users
      {
        label: '',
        icon: undefined,
        divider: true,
        authenticated: false,
      },
      {
        label: t('common.titles.about'),
        icon: 'info' as IconName,
        href: '/about',
        authenticated: false,
      },
      {
        label: t('common.titles.settings'),
        href: '/settings',
        icon: 'settings' as IconName,
        authenticated: true,
      },
      {
        label: t('common.titles.profile'),
        href: '/profile',
        icon: 'person' as IconName,
        authenticated: true,
      },
      {
        label: t('common.language'),
        icon: 'language' as IconName,
        subMenu: SUPPORTED_LANGUAGES.map(lang => ({
          label: lang.name,
          customIcon: lang.flag,
          onClick: () => switchLanguage(lang.code),
          // Use currentLanguage from hook for reactive updates on client,
          // fallback to language prop for server/initial render (avoids hydration mismatch)
          active:
            lang.code === (typeof window !== 'undefined' ? currentLanguage : language),
          className:
            lang.code === 'ar'
              ? getArabicTextClass({ respectDirection: false })
              : getLatinTextClass(),
        })),
        authenticated: false,
      },
      {
        label: isAuthenticated ? t('common.auth.signOut') : t('common.auth.signIn'),
        icon: (isAuthenticated ? 'logout' : 'login') as IconName,
        action: isAuthenticated ? (
          <button
            type='button'
            onClick={handleSignOut}
            className={`flex w-full content-start items-center px-3 py-2 text-foreground-darker leading-normal hover:bg-neutral focus:outline-none ${menuClasses.menuItem}`}
          >
            <span className={menuClasses.iconContainer}>
              {renderIcon('logout', { className: 'w-5 h-5' })}
            </span>
            <span className={menuClasses.textContainer}>
              {t('common.auth.signOut')}
            </span>
          </button>
        ) : (
          <PrimaryNavLink
            to={`/auth/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
            className={`flex w-full content-start items-center px-3 py-2 text-foreground-darker leading-normal hover:bg-neutral focus:outline-none ${menuClasses.menuItem}`}
            onClick={handleSignIn}
          >
            <span className={menuClasses.iconContainer}>
              {renderIcon('login', { className: 'w-5 h-5' })}
            </span>
            <span className={menuClasses.textContainer}>{t('common.auth.signIn')}</span>
          </PrimaryNavLink>
        ),
        authenticated: false,
      },
    ],
    [
      t,
      user,
      isAuthenticated,
      language,
      currentLanguage,
      switchLanguage,
      handleSignIn,
      handleSignOut,
      location.pathname,
      menuClasses,
      userHasAdminPanelAccess,
      canManageTournaments,
      canManageTeams,
      canManageGroups,
    ],
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState<number>(56)
  // Initialize isMobile to false to avoid SSR hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // Track mobile state - use same breakpoint logic as useScrollDirection for consistency
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    // Use same mobile detection as useScrollDirection hook to avoid breakpoint mismatch
    const checkMobile = () => {
      setIsMobile(breakpoints.isMobile())
    }

    // Initial setup
    checkMobile()

    // Add listener for window resize changes
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Measure header height once after mount
  useLayoutEffect(() => {
    if (containerRef.current) {
      const totalHeight = containerRef.current.offsetHeight
      setHeaderHeight(totalHeight)
      // Initialize padding to full height
      document.documentElement.style.setProperty('--header-padding', `${totalHeight}px`)
    }
  }, [])

  // Use direction-based show/hide logic
  const { showHeader } = useScrollDirection()

  // Adjust header visibility based on `isMobile`
  const effectiveShowHeader = isMobile ? showHeader : true

  // Update padding variable when visibility changes - client side only
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    document.documentElement.style.setProperty(
      '--header-padding',
      effectiveShowHeader ? `${headerHeight}px` : '0px',
    )
  }, [effectiveShowHeader, headerHeight])

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 right-0 left-0 z-30 ${navigationVariants({
        component: 'APP_BAR',
        viewport: isMobile ? 'mobile' : 'desktop',
        visible: effectiveShowHeader,
      })}`}
    >
      <header
        className={`safe-top relative h-14 w-full bg-primary text-primary-foreground ${CONTENT_PX}`}
      >
        {/* Logo and Brand for all screen sizes */}
        <div className='-translate-y-1/2 absolute start-4 top-1/2 flex items-center gap-2'>
          <PrimaryNavLink to='/' className='flex items-center gap-2'>
            <img
              src={logo}
              alt='Tournado Logo'
              className='app-bar-logo'
              width={40}
              height={40}
              loading={'eager'}
            />
            {/* Show Tournado text next to logo only on desktop */}
            <span
              className={`hidden font-bold text-primary-foreground text-xl lg:inline-block ${getLatinTitleClass(language)}`}
            >
              Tournado
            </span>
          </PrimaryNavLink>
        </div>

        {/*
            Page title in center - uses h1 as this IS the primary page heading
            Set via handle.pageTitle in each route. Page content uses h2/h3 for structure.
            This pattern is standard for SPAs with persistent navigation.
          */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <h1
            className={`text-center font-bold text-primary-foreground text-xl sm:text-2xl ${getTypographyClass(language)}`}
          >
            {pageTitle}
          </h1>
        </div>

        {/* Unified menu for both desktop and mobile */}
        <div className='-translate-y-1/2 absolute end-4 top-1/2 flex items-center gap-1'>
          <ThemeToggle />
          <UserMenu
            authenticated={isAuthenticated}
            username={username}
            menuItems={menuItems.filter(item => !item.authenticated || isAuthenticated)}
            isOpen={menuOpen}
            onOpenChange={setMenuOpen}
          />
        </div>
      </header>

      <div className='h-1.5 w-full bg-brand-accent' />
    </div>
  )
}
