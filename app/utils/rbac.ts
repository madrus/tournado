/**
 * Role-Based Access Control (RBAC) utilities
 *
 * This module provides utilities for managing user roles and permissions
 * based on the actual Prisma schema roles.
 */
import type { Role, User } from '@prisma/client'

// Define available permissions
export type Permission =
  | 'teams:read' // View teams
  | 'teams:create' // Create new teams
  | 'teams:edit' // Edit team details
  | 'teams:delete' // Delete teams
  | 'teams:manage' // Full team management
  | 'tournaments:read' // View tournaments
  | 'tournaments:create'
  | 'tournaments:edit'
  | 'tournaments:delete'
  | 'tournaments:manage'
  | 'matches:read'
  | 'matches:create'
  | 'matches:edit'
  | 'matches:delete'
  | 'matches:referee' // Referee match actions

// Role permission matrix based on actual Prisma roles
const ROLE_PERMISSIONS: Record<Role | 'UNAUTHENTICATED', Permission[]> = {
  PUBLIC: ['teams:read', 'tournaments:read', 'matches:read'],
  REFEREE: ['teams:read', 'tournaments:read', 'matches:read', 'matches:referee'],
  REFEREE_COORDINATOR: [
    'teams:read',
    'tournaments:read',
    'matches:read',
    'matches:create',
    'matches:edit',
    'matches:referee',
  ],
  TOURNAMENT_MANAGER: [
    'teams:read',
    'teams:create',
    'teams:edit',
    'teams:delete',
    'tournaments:read',
    'tournaments:create',
    'tournaments:edit',
    'matches:read',
    'matches:create',
    'matches:edit',
  ],
  ADMIN: [
    'teams:read',
    'teams:create',
    'teams:edit',
    'teams:delete',
    'teams:manage',
    'tournaments:read',
    'tournaments:create',
    'tournaments:edit',
    'tournaments:delete',
    'tournaments:manage',
    'matches:read',
    'matches:create',
    'matches:edit',
    'matches:delete',
    'matches:referee',
  ],
  UNAUTHENTICATED: ['teams:read', 'tournaments:read', 'matches:read'],
}

/**
 * Get user role, with fallback for unauthenticated users
 */
export const getUserRole = (user: User | null): Role | 'UNAUTHENTICATED' =>
  user?.role ?? 'UNAUTHENTICATED'

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  const role = getUserRole(user)
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[]
): boolean => permissions.some(permission => hasPermission(user, permission))

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[]
): boolean => permissions.every(permission => hasPermission(user, permission))

/**
 * Get UI context based on user role
 * This determines which UI variant to show (public vs admin)
 */
export function getUIContext(user: User | null): 'public' | 'admin' {
  const role = getUserRole(user)
  return ['ADMIN', 'TOURNAMENT_MANAGER'].includes(role) ? 'admin' : 'public'
}

/**
 * Check if user has admin-level access
 */
export function isAdmin(user: User | null): boolean {
  const role = getUserRole(user)
  return ['ADMIN', 'TOURNAMENT_MANAGER'].includes(role)
}

/**
 * Route guard for checking permissions
 * Throws a 403 response if permission is denied
 */
export function requirePermission(user: User | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Response('Forbidden: Insufficient permissions', { status: 403 })
  }
}

/**
 * Component guard for conditional rendering based on permissions
 */
export const canAccess = (user: User | null, permission: Permission): boolean =>
  hasPermission(user, permission)

/**
 * Get role hierarchy level for comparison
 */
export function getRoleLevel(role: Role | 'UNAUTHENTICATED'): number {
  const levels = {
    UNAUTHENTICATED: 0,
    PUBLIC: 1,
    REFEREE: 2,
    REFEREE_COORDINATOR: 3,
    TOURNAMENT_MANAGER: 4,
    ADMIN: 5,
  }
  return levels[role] ?? 0
}

/**
 * Check if user role is at least the specified level
 */
export function hasRoleLevel(user: User | null, minimumRole: Role): boolean {
  const userRole = getUserRole(user)
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole)
}
