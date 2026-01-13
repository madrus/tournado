import type { User } from '@prisma/client'
import { fireEvent, render, screen } from '@testing-library/react'
import type { FetcherWithComponents } from 'react-router'
import type { Mock } from 'vitest'
import { describe, expect, it, vi } from 'vitest'
import { UserMobileRow } from '../UserMobileRow'

const mockT = vi.fn<(key: string, options?: Record<string, unknown>) => string>()

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: mockT,
	}),
}))

// Mock useLanguageDirection hook
vi.mock('~/hooks/useLanguageDirection', () => ({
	useLanguageDirection: () => ({
		latinFontClass: 'font-latin',
	}),
}))

// Mock ComboField component
vi.mock('~/components/inputs/ComboField', () => ({
	ComboField: ({
		name,
		value,
		onChange,
		disabled,
	}: {
		name: string
		value: string
		onChange: (value: string) => void
		disabled?: boolean
	}) => (
		<select
			name={name}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			disabled={disabled}
			data-testid={`combobox-${name}`}
		>
			<option value='PUBLIC'>roles.public</option>
			<option value='MANAGER'>roles.manager</option>
			<option value='ADMIN'>roles.admin</option>
		</select>
	),
}))

// Mock Radix UI Text component
vi.mock('@radix-ui/themes', () => ({
	Text: ({
		children,
		className,
	}: {
		children: React.ReactNode
		className?: string
	}) => <span className={className}>{children}</span>,
}))

// Mock cn utility
vi.mock('~/utils/misc', () => ({
	cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}))

// Mock datatable variants
vi.mock('~/components/DataTable/dataTable.variants', () => ({
	datatableCellTextVariants: ({ variant }: { variant: string }) => `text-${variant}`,
}))

describe('UserMobileRow', () => {
	beforeEach(() => {
		mockT.mockReset()
		mockT.mockImplementation((key: string) => key)
	})

	const mockCurrentUserId = 'current-user-id'

	const mockUser: User = {
		id: 'user-1',
		firstName: 'Test',
		lastName: 'User',
		email: 'test@example.com',
		firebaseUid: 'firebase-user-1',
		displayName: 'Test User',
		role: 'PUBLIC',
		active: true,
		createdAt: new Date('2024-01-15T10:30:00Z'),
		updatedAt: new Date('2024-01-15T10:30:00Z'),
	}

	const createMockFetcher = () =>
		({
			submit: vi.fn(),
			load: vi.fn(),
			Form: vi.fn(),
			unstable_reset: vi.fn(),
			state: 'idle' as const,
			formData: undefined,
			json: undefined,
			text: undefined,
			formMethod: undefined,
			formAction: undefined,
			formEncType: undefined,
		}) as unknown as FetcherWithComponents<unknown>

	describe('Rendering', () => {
		it('should render user display name when available', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			expect(screen.getByText('Test User')).toBeInTheDocument()
		})

		it('should render user email', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			expect(screen.getByText('test@example.com')).toBeInTheDocument()
		})

		it('should render only email when display name is not available', () => {
			const userWithoutDisplayName = { ...mockUser, displayName: null }
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={userWithoutDisplayName}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const emailElements = screen.getAllByText('test@example.com')
			// Should only appear once (as primary text, not as secondary)
			expect(emailElements).toHaveLength(1)
		})

		it('should render role combobox with current role', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const combobox = screen.getByRole('combobox')
			expect(combobox).toHaveValue('PUBLIC')
		})

		it('should have proper accessibility attributes', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const button = screen.getByRole('button', { name: 'users.actions.viewDetails' })
			expect(button).toBeInTheDocument()
			expect(button).toHaveAttribute('aria-label', 'users.actions.viewDetails')
			expect(mockT).toHaveBeenCalledWith(
				'users.actions.viewDetails',
				expect.objectContaining({ name: 'Test User' }),
			)
		})
	})

	describe('Click interactions', () => {
		it('should call onClick when row is clicked', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const button = screen.getByRole('button')
			fireEvent.click(button)

			expect(mockOnClick).toHaveBeenCalledTimes(1)
		})

		it('should not call onClick when combobox is clicked', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const combobox = screen.getByRole('combobox')
			fireEvent.click(combobox)

			expect(mockOnClick).not.toHaveBeenCalled()
		})
	})

	describe('Role change functionality', () => {
		it('should submit form data when role is changed', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()
			const mockSubmit = mockFetcher.submit as Mock

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const combobox = screen.getByRole('combobox')
			fireEvent.change(combobox, { target: { value: 'ADMIN' } })

			expect(mockSubmit).toHaveBeenCalledTimes(1)
			const [formData, options] = mockSubmit.mock.calls[0]
			expect(formData.get('intent')).toBe('updateRole')
			expect(formData.get('userId')).toBe('user-1')
			expect(formData.get('role')).toBe('ADMIN')
			expect(options).toEqual({ method: 'post' })
		})

		it('should not submit when role is changed to the same value', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()
			const mockSubmit = mockFetcher.submit as Mock

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const combobox = screen.getByRole('combobox')
			fireEvent.change(combobox, { target: { value: 'PUBLIC' } })

			expect(mockSubmit).not.toHaveBeenCalled()
		})

		it('should disable combobox when user is inactive', () => {
			const inactiveUser = { ...mockUser, active: false }
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={inactiveUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const combobox = screen.getByRole('combobox')
			expect(combobox).toBeDisabled()
		})

		it('should enable combobox when user is active', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const combobox = screen.getByRole('combobox')
			expect(combobox).toBeEnabled()
		})
	})

	describe('Styling', () => {
		it('should apply latin font class to display name', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const displayName = screen.getByText('Test User')
			expect(displayName).toHaveClass('font-latin')
		})

		it('should apply primary text variant to display name', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const displayName = screen.getByText('Test User')
			expect(displayName).toHaveClass('text-primary')
		})

		it('should apply secondary text variant to email when display name exists', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const email = screen.getByText('test@example.com')
			expect(email).toHaveClass('text-secondary')
		})
	})

	describe('Edge cases', () => {
		it('should handle user with empty string display name', () => {
			const userWithEmptyName = { ...mockUser, displayName: '' }
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={userWithEmptyName}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			// Should show email as primary when displayName is empty string
			const emailElements = screen.getAllByText('test@example.com')
			expect(emailElements).toHaveLength(1)
		})

		it('should use display name in aria-label when available', () => {
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={mockUser}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'users.actions.viewDetails')
			expect(mockT).toHaveBeenCalledWith(
				'users.actions.viewDetails',
				expect.objectContaining({ name: 'Test User' }),
			)
		})

		it('should use email in aria-label when display name is not available', () => {
			const userWithoutDisplayName = { ...mockUser, displayName: null }
			const mockOnClick = vi.fn()
			const mockFetcher = createMockFetcher()

			render(
				<UserMobileRow
					user={userWithoutDisplayName}
					currentUserId={mockCurrentUserId}
					onClick={mockOnClick}
					fetcher={mockFetcher}
				/>,
			)

			const button = screen.getByRole('button')
			expect(button).toHaveAttribute('aria-label', 'users.actions.viewDetails')
			expect(mockT).toHaveBeenCalledWith(
				'users.actions.viewDetails',
				expect.objectContaining({ name: 'test@example.com' }),
			)
		})
	})
})
