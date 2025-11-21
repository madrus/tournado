import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useSettingsStore } from '~/stores/useSettingsStore'
import { renderIcon } from '~/utils/iconUtils'
import { cn } from '~/utils/misc'

export function ThemeToggle(): JSX.Element {
	const { t } = useTranslation()
	const { theme, toggleTheme } = useSettingsStore()

	return (
		<button
			type='button'
			onClick={toggleTheme}
			className='relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full pb-0.5 focus:outline-none'
			aria-label={t('common.toggleTheme')}
			title={theme === 'light' ? t('common.darkMode') : t('common.lightMode')}
		>
			{/* Dark mode icon - visible when light theme */}
			<div
				className={cn(
					'absolute transition-opacity duration-500',
					theme === 'light' ? 'opacity-100' : 'opacity-0',
				)}
			>
				{renderIcon('dark_mode', {
					className: 'h-8 w-8 text-primary-foreground',
				})}
			</div>
			{/* Light mode icon - visible when dark theme */}
			<div
				className={cn(
					'absolute transition-opacity duration-500',
					theme === 'dark' ? 'opacity-100' : 'opacity-0',
				)}
			>
				{renderIcon('light_mode', {
					className: 'w-8 h-8 text-primary-foreground',
				})}
			</div>
		</button>
	)
}
