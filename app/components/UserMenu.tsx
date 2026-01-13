import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useNavigation } from 'react-router'

import { AnimatedHamburgerIcon } from '~/components/icons/AnimatedHamburgerIcon'
import { useRTLDropdown } from '~/hooks/useRTLDropdown'
import { type IconName, renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'
import {
	getLatinTextClass,
	getMenuItemLineHeight,
	getTypographyClass,
} from '~/utils/rtlUtils'

export type MenuItemType = {
	label: string
	icon?: IconName
	href?: string
	action?: JSX.Element
	customIcon?: string
	authenticated?: boolean
	divider?: boolean
	subMenu?: Array<{
		label: string
		customIcon: string
		onClick: () => void
		active: boolean
		className?: string
	}>
}

type UserMenuProps = {
	authenticated: boolean
	username?: string
	menuItems: Array<MenuItemType>
	isOpen?: boolean
	onOpenChange?: (open: boolean) => void
}

// Unified user menu dropdown component using Radix UI for both mobile and desktop
export function UserMenu({
	authenticated,
	username,
	menuItems,
	isOpen,
	onOpenChange,
}: Readonly<UserMenuProps>): JSX.Element {
	const { t } = useTranslation()
	const [languageMenuOpen, setLanguageMenuOpen] = useState<boolean>(false)
	const navigation = useNavigation()

	// Get RTL-aware positioning using the hook
	const { dropdownProps, menuClasses, isRTL } = useRTLDropdown()

	// Use translated guest name when user is not authenticated or username is empty
	const displayName = authenticated && username ? username : t('common.guest')

	const location = useLocation()
	const navigate = useNavigate()

	// Generate stable keys from item properties (label + href/icon) to prevent unnecessary remounts
	const menuItemKeys = useMemo(
		() =>
			menuItems.map((item) => ({
				key: item.href || item.label || item.icon || 'divider',
				subKeys: item.subMenu
					? item.subMenu.map((subItem) => subItem.label || subItem.customIcon)
					: [],
			})),
		[menuItems],
	)

	// Close menu when navigation starts (Fix #1) - but only for actual navigation
	useEffect(() => {
		const nextLocation = navigation.location
		const isNavigatingToDifferentRoute = Boolean(
			nextLocation &&
			(nextLocation.pathname !== location.pathname ||
				nextLocation.search !== location.search ||
				nextLocation.hash !== location.hash),
		)

		if (navigation.state === 'loading' && isNavigatingToDifferentRoute) {
			onOpenChange?.(false)
			setLanguageMenuOpen(false)
		}
	}, [
		navigation.state,
		navigation.location,
		location.pathname,
		location.search,
		location.hash,
		onOpenChange,
	])

	const handleMenuNavigation = useCallback(
		(event: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
			if (!href) return

			if (
				event.defaultPrevented ||
				event.button !== 0 ||
				event.metaKey ||
				event.altKey ||
				event.ctrlKey ||
				event.shiftKey
			) {
				return
			}

			event.preventDefault()
			onOpenChange?.(false)
			setLanguageMenuOpen(false)
			navigate(href)
		},
		[navigate, onOpenChange],
	)

	// Handler for clicking language menu toggle
	const handleLanguageToggle = (event: React.MouseEvent) => {
		event.stopPropagation()
		setLanguageMenuOpen(!languageMenuOpen)
	}

	// Unified Radix UI dropdown for both mobile and desktop
	return (
		<div className='relative inline-block text-left'>
			<DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange}>
				<DropdownMenu.Trigger asChild>
					<button
						type='button'
						className='relative inline-flex h-8 w-8 translate-y-0.25 cursor-pointer items-center justify-center text-primary-foreground focus:outline-none'
						aria-label={t('common.toggleMenu')}
					>
						<AnimatedHamburgerIcon
							isOpen={!!isOpen}
							isRTL={isRTL}
							className='h-8 w-8'
						/>
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					data-testid='user-menu-dropdown'
					className={cn(
						// basic container
						'z-40 w-max rounded-md bg-background p-1 shadow-lg focus:outline-none dark:bg-neutral',
						// border colors
						'border border-red-500 dark:border-emerald-500',
						// responsive sizing / spacing
						'mx-4 max-w-[calc(100vw-2rem)] sm:max-w-80',
						// RTL margin helpers
						menuClasses.spacing,
					)}
					align={dropdownProps.align}
					side={dropdownProps.side}
					sideOffset={dropdownProps.sideOffset}
					alignOffset={dropdownProps.alignOffset}
					avoidCollisions={dropdownProps.avoidCollisions}
				>
					<div className='px-4 py-3'>
						{authenticated ? (
							<div className={cn('text-foreground-darker', menuClasses.textContainer)}>
								<p className={cn('break-words', getTypographyClass())}>
									{t('common.signedInAs')}
								</p>
								<p
									className={cn('break-words font-medium', getLatinTextClass())}
									style={{ color: 'var(--color-usermenu-text)' }}
								>
									{displayName}
								</p>
							</div>
						) : (
							<p
								className={cn(
									'break-words text-foreground-darker',
									menuClasses.textContainer,
									getTypographyClass(),
								)}
							>
								{t('common.welcome')}{' '}
								<span
									className={cn(
										'font-medium text-foreground-darker',
										getLatinTextClass(),
									)}
								>
									{displayName}
								</span>
							</p>
						)}
					</div>
					<div className='h-px bg-red-500 dark:bg-emerald-500'></div>
					<div className='py-1'>
						{menuItems.map((item, index) => {
							if (item.divider) {
								return (
									<DropdownMenu.Separator
										key={menuItemKeys[index].key}
										className='my-1 h-px bg-red-500 dark:bg-emerald-500'
									/>
								)
							}

							if ((item.customIcon || item.icon) && item.subMenu) {
								// This is the language menu
								return (
									<div key={menuItemKeys[index].key} className='relative'>
										<button
											type='button'
											className={cn(
												'w-full items-center px-3 py-2 text-foreground-darker hover:bg-neutral focus:outline-none',
												getMenuItemLineHeight(),
												menuClasses.menuItem,
											)}
											onClick={handleLanguageToggle}
										>
											<span className={menuClasses.iconContainer}>
												{item.customIcon ? (
													<span className='text-lg'>{item.customIcon}</span>
												) : item.icon ? (
													renderIcon(item.icon, { className: 'w-5 h-5' })
												) : null}
											</span>
											<span
												className={cn(menuClasses.textContainer, getTypographyClass())}
											>
												{item.label}
											</span>
										</button>

										{languageMenuOpen ? (
											<div
												className={cn(
													'absolute z-30 mt-1 min-w-[8rem] rounded-md bg-background p-1 text-base shadow-lg ring-1 ring-border ring-opacity-5 dark:bg-neutral',
													// Position submenu to the left of the language menu icon (mirrored for Arabic)
													isRTL ? '-end-16' : '-start-16',
												)}
											>
												{item.subMenu.map((subItem, subIndex) => (
													<button
														type='button'
														key={menuItemKeys[index].subKeys[subIndex]}
														className={cn(
															'h-10 w-full items-center px-3 py-2 focus:outline-none',
															getMenuItemLineHeight(),
															subItem.active
																? 'bg-neutral text-foreground-darker'
																: 'text-foreground-darker hover:bg-neutral',
															menuClasses.menuItem,
														)}
														onClick={(event) => {
															event.stopPropagation()
															subItem.onClick()
															setLanguageMenuOpen(false)
														}}
													>
														<span
															className={cn(
																menuClasses.iconContainer,
																isRTL ? 'pt-2' : 'pt-0.5',
																'text-lg',
															)}
															style={{
																fontSize: '1.3rem',
																transform: 'scale(1.3)',
																display: 'inline-block',
															}}
														>
															{subItem.customIcon}
														</span>
														<span
															className={cn(
																menuClasses.textContainer,
																subItem.className || '',
															)}
														>
															{subItem.label}
														</span>
													</button>
												))}
											</div>
										) : null}
									</div>
								)
							}

							if (item.action) {
								return (
									<DropdownMenu.Item key={menuItemKeys[index].key} asChild>
										<div className='focus:outline-none'>{item.action}</div>
									</DropdownMenu.Item>
								)
							}

							return (
								<DropdownMenu.Item key={menuItemKeys[index].key} asChild>
									<Link
										to={item.href || '#'}
										onClick={(event) => handleMenuNavigation(event, item.href)}
										className={cn(
											'w-full items-center px-3 py-2 text-foreground-darker hover:bg-neutral focus:outline-none',
											getMenuItemLineHeight(),
											menuClasses.menuItem,
										)}
									>
										<span className={menuClasses.iconContainer}>
											{item.icon
												? renderIcon(item.icon, { className: 'w-5 h-5' })
												: null}
										</span>
										<span
											className={cn(menuClasses.textContainer, getTypographyClass())}
										>
											{item.label}
										</span>
									</Link>
								</DropdownMenu.Item>
							)
						})}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	)
}
