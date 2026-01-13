import type { User } from '@prisma/client'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserDetailCard } from '../UserDetailCard'

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			if (key.startsWith('roles.')) {
				const role = key.replace('roles.', '').toUpperCase()
				return `Role: ${role}`
			}
			return key
		},
	}),
}))

// Mock react-router Form component
vi.mock('react-router', () => ({
	Form: ({
		children,
		method,
		...props
	}: {
		children: React.ReactNode
		method?: string
		ref?: React.Ref<HTMLFormElement>
	}) => (
		<form method={method} {...props}>
			{children}
		</form>
	),
}))

// Mock useLanguageDirection hook
vi.mock('~/hooks/useLanguageDirection', () => ({
	useLanguageDirection: () => ({
		latinFontClass: 'font-latin',
	}),
}))

// Mock Panel component
vi.mock('~/components/Panel', () => ({
	Panel: ({ children }: { children: React.ReactNode }) => (
		<div data-testid='panel'>{children}</div>
	),
}))

// Mock Badge component
vi.mock('~/components/Badge', () => ({
	Badge: ({ children, color }: { children: React.ReactNode; color: string }) => (
		<span data-testid='badge' data-color={color}>
			{children}
		</span>
	),
}))

// Mock ActionButton
vi.mock('~/components/buttons/ActionButton', () => ({
	ActionButton: ({
		children,
		onClick,
		disabled,
		type,
	}: {
		children: React.ReactNode
		onClick?: () => void
		disabled?: boolean
		type?: 'button' | 'submit'
	}) => (
		<button
			onClick={onClick}
			disabled={disabled}
			type={type}
			data-testid='action-button'
		>
			{children}
		</button>
	),
}))

// Mock ConfirmDialog - controlled mode
vi.mock('~/components/ConfirmDialog', () => ({
	ConfirmDialog: ({
		open,
		onOpenChange,
		onConfirm,
	}: {
		open: boolean
		onOpenChange: (open: boolean) => void
		onConfirm: () => void
	}) =>
		open ? (
			<div data-testid='confirm-dialog'>
				<button
					type='button'
					onClick={() => {
						onConfirm()
						onOpenChange(false)
					}}
					data-testid='confirm-button'
				>
					Confirm
				</button>
			</div>
		) : null,
}))

// Mock TextInputField
vi.mock('~/components/inputs/TextInputField', () => ({
	TextInputField: ({
		name,
		value,
		onChange,
		onBlur,
		disabled,
	}: {
		name: string
		value: string
		onChange: (value: string) => void
		onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
		disabled?: boolean
	}) => (
		<input
			name={name}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			onBlur={onBlur}
			disabled={disabled}
			data-testid={`input-${name}`}
		/>
	),
}))

// Mock ComboField
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
			data-testid={`select-${name}`}
		>
			<option value='PUBLIC'>Role: PUBLIC</option>
			<option value='MANAGER'>Role: MANAGER</option>
			<option value='ADMIN'>Role: ADMIN</option>
		</select>
	),
}))

describe('UserDetailCard', () => {
	const mockCurrentUserId = 'current-user-id'

	const mockActiveUser: User = {
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

	const mockInactiveUser: User = {
		...mockActiveUser,
		active: false,
	}

	describe('Rendering', () => {
		it('should render user information correctly', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			expect(screen.getByText('users.titles.userInformation')).toBeInTheDocument()
			expect(screen.getByText('test@example.com')).toBeInTheDocument()
			expect(screen.getByDisplayValue('Test User')).toBeInTheDocument()
		})

		it('should display deactivate button for active users', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			expect(screen.getByText('users.actions.deactivateUser')).toBeInTheDocument()
		})

		it('should display reactivate button for inactive users', () => {
			render(
				<UserDetailCard user={mockInactiveUser} currentUserId={mockCurrentUserId} />,
			)

			expect(screen.getByText('users.actions.reactivateUser')).toBeInTheDocument()
		})

		it('should show deactivated badge for inactive users', () => {
			render(
				<UserDetailCard user={mockInactiveUser} currentUserId={mockCurrentUserId} />,
			)

			const badge = screen.getByTestId('badge')
			expect(badge).toHaveTextContent('users.messages.deactivated')
			expect(badge).toHaveAttribute('data-color', 'error')
		})

		it('should not show deactivated badge for active users', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const badges = screen.queryAllByTestId('badge')
			expect(badges).toHaveLength(0)
		})

		it('should display created date', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			expect(screen.getByText('users.fields.createdAt')).toBeInTheDocument()
		})

		it('should render role combobox with current role', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const roleSelect = screen.getByTestId('select-role')
			expect(roleSelect).toHaveValue('PUBLIC')
		})
	})

	describe('Display name update', () => {
		it('should update display name state when typing', async () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const input = screen.getByTestId('input-displayName')

			await act(async () => {
				fireEvent.change(input, { target: { value: 'New Name' } })
			})

			expect(input).toHaveValue('New Name')
		})

		it('should initialize display name with user value', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('Test User')
		})

		it('should initialize display name with empty string when user has no display name', () => {
			const userWithoutName = { ...mockActiveUser, displayName: null }
			render(
				<UserDetailCard user={userWithoutName} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('')
		})

		it('should disable display name input when submitting', () => {
			render(
				<UserDetailCard
					user={mockActiveUser}
					currentUserId={mockCurrentUserId}
					isSubmitting
				/>,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toBeDisabled()
		})
	})

	describe('Role update', () => {
		it('should update role state when changed', async () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const roleSelect = screen.getByTestId('select-role')

			await act(async () => {
				fireEvent.change(roleSelect, { target: { value: 'ADMIN' } })
			})

			// Need to wait for the setTimeout to complete
			await waitFor(() => {
				expect(roleSelect).toHaveValue('ADMIN')
			})
		})

		it('should not change role state when selecting the same value', async () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const roleSelect = screen.getByTestId('select-role')

			await act(async () => {
				fireEvent.change(roleSelect, { target: { value: 'PUBLIC' } })
			})

			expect(roleSelect).toHaveValue('PUBLIC')
		})

		it('should disable role select when submitting', () => {
			render(
				<UserDetailCard
					user={mockActiveUser}
					currentUserId={mockCurrentUserId}
					isSubmitting
				/>,
			)

			const roleSelect = screen.getByTestId('select-role')
			expect(roleSelect).toBeDisabled()
		})
	})

	describe('Deactivate/Reactivate functionality', () => {
		it('should disable action button when submitting', () => {
			render(
				<UserDetailCard
					user={mockActiveUser}
					currentUserId={mockCurrentUserId}
					isSubmitting
				/>,
			)

			const button = screen.getByTestId('action-button')
			expect(button).toBeDisabled()
		})

		it('should enable action button when not submitting', () => {
			render(
				<UserDetailCard
					user={mockActiveUser}
					currentUserId={mockCurrentUserId}
					isSubmitting={false}
				/>,
			)

			const button = screen.getByTestId('action-button')
			expect(button).toBeEnabled()
		})

		it('should have correct intent for active user', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const intentInput = screen.getByDisplayValue('deactivate')
			expect(intentInput).toHaveAttribute('name', 'intent')
		})

		it('should have correct intent for inactive user', () => {
			render(
				<UserDetailCard user={mockInactiveUser} currentUserId={mockCurrentUserId} />,
			)

			const intentInput = screen.getByDisplayValue('reactivate')
			expect(intentInput).toHaveAttribute('name', 'intent')
		})
	})

	describe('Form submissions', () => {
		it('should have hidden input for updateDisplayName intent', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const intentInput = screen.getByDisplayValue('updateDisplayName')
			expect(intentInput).toHaveAttribute('name', 'intent')
		})

		it('should have hidden input for updateRole intent', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const intentInput = screen.getByDisplayValue('updateRole')
			expect(intentInput).toHaveAttribute('name', 'intent')
		})

		it('should have userId hidden input in display name form', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const displayNameForm = screen.getByTestId('user-detail-display-name-form')
			const userIdInput = within(displayNameForm).getByDisplayValue('user-1')
			expect(userIdInput).toHaveAttribute('name', 'userId')
		})

		it('should include userId hidden input in deactivate form', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const deactivateForm = screen.getByTestId('user-detail-deactivate-form')
			const userIdInput = within(deactivateForm).getByDisplayValue('user-1')
			expect(userIdInput).toHaveAttribute('name', 'userId')
		})

		it('should open confirm dialog when deactivate button clicked', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			expect(screen.queryByTestId('confirm-button')).not.toBeInTheDocument()

			const button = screen.getByTestId('action-button')
			fireEvent.click(button)

			expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('should use proper heading hierarchy', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const heading = screen.getByRole('heading', { level: 2 })
			expect(heading).toHaveTextContent('users.titles.userInformation')
		})

		it('should have proper form structure', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const intentInputs = screen.getAllByDisplayValue(
				/(updateDisplayName|updateRole|deactivate)/,
			)

			expect(intentInputs).toHaveLength(3)
		})
	})

	describe('Edge cases', () => {
		it('should handle user with null displayName', () => {
			const userWithNullName = { ...mockActiveUser, displayName: null }
			render(
				<UserDetailCard user={userWithNullName} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('')
		})

		it('should handle different role values', () => {
			const userWithAdminRole = { ...mockActiveUser, role: 'ADMIN' as const }
			render(
				<UserDetailCard user={userWithAdminRole} currentUserId={mockCurrentUserId} />,
			)

			const roleSelect = screen.getByTestId('select-role')
			expect(roleSelect).toHaveValue('ADMIN')
		})

		it('should handle very old creation dates', () => {
			const oldUser = {
				...mockActiveUser,
				createdAt: new Date('2020-01-01T00:00:00Z'),
			}
			render(<UserDetailCard user={oldUser} currentUserId={mockCurrentUserId} />)

			expect(screen.getByText('users.fields.createdAt')).toBeInTheDocument()
		})

		it('should handle users with empty string displayName', () => {
			const userWithEmptyName = { ...mockActiveUser, displayName: '' }
			render(
				<UserDetailCard user={userWithEmptyName} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('')
		})
	})

	describe('Default props', () => {
		it('should default isSubmitting to false', () => {
			render(<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />)

			const button = screen.getByTestId('action-button')
			expect(button).toBeEnabled()

			const input = screen.getByTestId('input-displayName')
			expect(input).toBeEnabled()

			const roleSelect = screen.getByTestId('select-role')
			expect(roleSelect).toBeEnabled()
		})
	})

	describe('User prop changes (useEffect synchronization)', () => {
		it('should update display name when user prop changes', () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('Test User')

			// Simulate navigating to a different user (e.g., browser back/forward)
			const differentUser: User = {
				...mockActiveUser,
				id: 'user-2',
				displayName: 'Different User',
			}

			rerender(
				<UserDetailCard user={differentUser} currentUserId={mockCurrentUserId} />,
			)

			expect(input).toHaveValue('Different User')
		})

		it('should update role when user prop changes', () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const roleSelect = screen.getByTestId('select-role')
			expect(roleSelect).toHaveValue('PUBLIC')

			// Simulate navigating to a user with a different role
			const adminUser: User = {
				...mockActiveUser,
				id: 'user-2',
				role: 'ADMIN',
			}

			rerender(<UserDetailCard user={adminUser} currentUserId={mockCurrentUserId} />)

			expect(roleSelect).toHaveValue('ADMIN')
		})

		it('should update both display name and role when switching users', () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			const roleSelect = screen.getByTestId('select-role')

			expect(input).toHaveValue('Test User')
			expect(roleSelect).toHaveValue('PUBLIC')

			// Simulate switching to a completely different user
			const newUser: User = {
				...mockActiveUser,
				id: 'user-3',
				displayName: 'Admin User',
				role: 'ADMIN',
			}

			rerender(<UserDetailCard user={newUser} currentUserId={mockCurrentUserId} />)

			expect(input).toHaveValue('Admin User')
			expect(roleSelect).toHaveValue('ADMIN')
		})

		it('should clear display name when new user has null displayName', () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('Test User')

			// Simulate switching to a user without a display name
			const userWithoutName: User = {
				...mockActiveUser,
				id: 'user-4',
				displayName: null,
			}

			rerender(
				<UserDetailCard user={userWithoutName} currentUserId={mockCurrentUserId} />,
			)

			expect(input).toHaveValue('')
		})

		it('should preserve unsaved changes when user properties do not change', async () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')

			// Make a local change
			await act(async () => {
				fireEvent.change(input, { target: { value: 'Unsaved Name' } })
			})

			expect(input).toHaveValue('Unsaved Name')

			// Re-render with same user (e.g., parent component re-renders)
			rerender(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			// Unsaved changes should be preserved
			expect(input).toHaveValue('Unsaved Name')
		})

		it('should discard unsaved changes when user ID changes', async () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')

			// Make a local unsaved change
			await act(async () => {
				fireEvent.change(input, { target: { value: 'Unsaved Name' } })
			})

			expect(input).toHaveValue('Unsaved Name')

			// Navigate to a different user
			const differentUser: User = {
				...mockActiveUser,
				id: 'user-5',
				displayName: 'New User',
			}

			rerender(
				<UserDetailCard user={differentUser} currentUserId={mockCurrentUserId} />,
			)

			// Unsaved changes should be discarded, showing new user's data
			expect(input).toHaveValue('New User')
		})

		it('should update when only displayName changes for same user', () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const input = screen.getByTestId('input-displayName')
			expect(input).toHaveValue('Test User')

			// Simulate the user's displayName being updated externally (e.g., by another admin)
			const updatedUser: User = {
				...mockActiveUser,
				displayName: 'Updated Display Name',
			}

			rerender(<UserDetailCard user={updatedUser} currentUserId={mockCurrentUserId} />)

			expect(input).toHaveValue('Updated Display Name')
		})

		it('should update when only role changes for same user', () => {
			const { rerender } = render(
				<UserDetailCard user={mockActiveUser} currentUserId={mockCurrentUserId} />,
			)

			const roleSelect = screen.getByTestId('select-role')
			expect(roleSelect).toHaveValue('PUBLIC')

			// Simulate the user's role being updated externally
			const updatedUser: User = {
				...mockActiveUser,
				role: 'MANAGER',
			}

			rerender(<UserDetailCard user={updatedUser} currentUserId={mockCurrentUserId} />)

			expect(roleSelect).toHaveValue('MANAGER')
		})
	})
})
