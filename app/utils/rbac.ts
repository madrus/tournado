/**
 * Role-Based Access Control (RBAC) utilities
 *
 * This module provides utilities for managing user roles and permissions
 * based on the actual Prisma schema roles.
 */
import type { Role, User } from '@prisma/client'

// Define a custom error for forbidden access
export class ForbiddenError extends Error {
  statusCode: number

  constructor(message = 'Forbidden: Insufficient permissions') {
    super(message)
    this.name = 'ForbiddenError'
    this.statusCode = 403
  }
}

// Define available permissions using standard CRUD conventions (Create, Read, Update, Delete)
export type Permission =
  // Teams CRUD
  | 'teams:create' // Create new teams
  | 'teams:read' // View teams
  | 'teams:update' // Update team details
  | 'teams:delete' // Delete teams
  // Tournaments CRUD
  | 'tournaments:create' // Create new tournaments
  | 'tournaments:read' // View tournaments
  | 'tournaments:update' // Update tournament details
  | 'tournaments:delete' // Delete tournaments
  // Matches CRUD
  | 'matches:create' // Create new matches
  | 'matches:read' // View matches
  | 'matches:update' // Update match details
  | 'matches:delete' // Delete matches
  // Special permissions (not standard CRUD)
  | 'groups:manage' // Manage groups and assignments (no individual CRUD operations)
  | 'matches:referee' // Referee match actions
  | 'users:read' // View user list
  | 'users:approve' // Approve/manage users
  | 'roles:assign' // Assign roles to users
  | 'system:settings' // System settings configuration
  | 'system:reports' // View reports and analytics
  | 'system:billing' // Billing and payment management

// Role permission matrix based on actual Prisma roles
// Note: Unauthenticated users are treated as PUBLIC users
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  PUBLIC: [
    'teams:create', // Public users can create teams (self-registration)
    'teams:read',
    'tournaments:read',
    'matches:read',
  ],
  REFEREE: [
    'teams:read',
    'tournaments:read',
    'groups:manage', // Referees need access to competition/groups to update scores and calendar
    'matches:read',
    'matches:update', // Referees can update match details
    'matches:referee', // Special referee actions
  ],
  EDITOR: ['teams:read', 'tournaments:read', 'matches:read', 'system:reports'],
  BILLING: [
    'teams:read',
    'tournaments:read',
    'matches:read',
    'system:reports',
    'system:billing',
  ],
  MANAGER: [
    'teams:create',
    'teams:read',
    'teams:update',
    'teams:delete',
    'tournaments:create',
    'tournaments:read',
    'tournaments:update',
    'tournaments:delete',
    'groups:manage', // Full competition/groups management
    'matches:create',
    'matches:read',
    'matches:update',
    'matches:delete',
    'matches:referee', // Referee actions for full competition control
    'system:reports',
  ],
  ADMIN: [
    'teams:create',
    'teams:read',
    'teams:update',
    'teams:delete',
    'tournaments:create',
    'tournaments:read',
    'tournaments:update',
    'tournaments:delete',
    'groups:manage',
    'matches:create',
    'matches:read',
    'matches:update',
    'matches:delete',
    'matches:referee', // Admins can also perform referee actions
    'users:read',
    'users:approve',
    'roles:assign',
    'system:settings',
    'system:reports',
    'system:billing',
  ],
}

/**
 * Get user role, with fallback to PUBLIC for unauthenticated users
 */
export const getUserRole = (user: User | null): Role => user?.role ?? 'PUBLIC'

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
  return ['ADMIN', 'MANAGER'].includes(role) ? 'admin' : 'public'
}

/**
 * Check if user has admin-level access (full management permissions)
 */
export function isAdmin(user: User | null): boolean {
  const role = getUserRole(user)
  return ['ADMIN', 'MANAGER'].includes(role)
}

/**
 * Check if user has admin panel access (can access admin interface)
 */
export function hasAdminPanelAccess(user: User | null): boolean {
  const role = getUserRole(user)
  return ['ADMIN', 'MANAGER', 'EDITOR', 'BILLING', 'REFEREE'].includes(role)
}

/**
 * Route guard for checking permissions
 * Throws a 403 response if permission is denied
 */
export function requirePermission(user: User | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError()
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
export function getRoleLevel(role: Role): number {
  const levels = {
    PUBLIC: 0,
    REFEREE: 1,
    EDITOR: 2,
    BILLING: 3,
    MANAGER: 4,
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
