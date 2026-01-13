import { render, screen } from '@testing-library/react'
import React from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'

import { describe, expect, it, vi } from 'vitest'

import { FormActionFooter } from '~/components/shared/FormActionFooter'

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			language: 'en',
			changeLanguage: vi.fn(),
			options: { fallbackLng: 'en' },
		},
	}),
}))

type FormActionFooterProps = Parameters<typeof FormActionFooter>[0]

const baseProps: FormActionFooterProps = {
	isDirty: false,
	primaryLabel: 'save',
	secondaryLabel: 'cancel',
	onPrimary: vi.fn(),
	onSecondary: vi.fn(),
}

const renderFooter = (props: Partial<FormActionFooterProps> = {}) => {
	const router = createMemoryRouter(
		[
			{
				path: '/',
				element: <FormActionFooter {...{ ...baseProps, ...props }} />,
			},
		],
		{
			initialEntries: ['/'],
			initialIndex: 0,
		},
	)

	return render(<RouterProvider router={router} />)
}

describe('FormActionFooter', () => {
	it('renders warning text when dirty and uses custom test id when provided', () => {
		renderFooter({
			isDirty: true,
			warningText: 'custom.warning',
			warningTestId: 'custom-warning',
		})

		const warningElement = screen.getByTestId('custom-warning')
		expect(warningElement).toBeInTheDocument()
		expect(warningElement).toHaveTextContent('custom.warning')
	})

	it('renders action buttons passed via props', () => {
		renderFooter({ isDirty: false })

		expect(screen.getByTestId('form-action-secondary')).toBeInTheDocument()
		expect(screen.getByTestId('form-action-primary')).toBeInTheDocument()
	})
})
