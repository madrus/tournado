import { type Permission, canAccess } from '~/utils/rbac'
import { useUser } from '~/utils/routeUtils'

type UseActionButtonOptions = {
	permission?: Permission
	hideWhenDisabled?: boolean
	disabled?: boolean
}

type UseActionButtonReturn = {
	/**
	 * Whether the button should be completely hidden from the UI
	 */
	isHidden: boolean
	/**
	 * Whether the button should be in a disabled state
	 * Combines explicit disabled prop with permission-based disabled state
	 */
	isDisabled: boolean
	/**
	 * Whether the user has the required permission
	 */
	hasRequiredPermission: boolean
}

/**
 * Hook that encapsulates common logic for ActionButton and ActionLinkButton
 *
 * Handles:
 * - RTL state for icon/label ordering
 * - Permission checking and access control
 * - Visibility logic (hide vs disable)
 * - Disabled state calculation
 *
 * @example
 * ```tsx
 * const { isRTL, isHidden, isDisabled } = useActionButton({
 *   permission: 'teams:delete',
 *   hideWhenDisabled: true,
 *   disabled: false
 * })
 *
 * if (isHidden) return null
 * ```
 */
export function useActionButton({
	permission,
	hideWhenDisabled = false,
	disabled = false,
}: UseActionButtonOptions = {}): UseActionButtonReturn {
	const user = useUser()

	// Check if user has required permission
	const hasRequiredPermission = permission ? canAccess(user, permission) : true

	// Determine if button should be hidden entirely
	const isHidden = Boolean(permission && !hasRequiredPermission && hideWhenDisabled)

	// Combine permission-based disabled state with explicit disabled prop
	const isDisabled = disabled || Boolean(permission && !hasRequiredPermission)

	return {
		isHidden,
		isDisabled,
		hasRequiredPermission,
	}
}
