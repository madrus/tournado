import type { User } from '@prisma/client'

import { describe, expect, it } from 'vitest'

import {
  canAccess,
  ForbiddenError,
  getRoleLevel,
  getUIContext,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRoleLevel,
  isAdmin,
  requirePermission,
} from '../rbac'

// Mock users for testing
const mockUsers: Record<string, User> = {
  admin: {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    role: 'ADMIN',
    firebaseUid: 'firebase-admin-uid',
    displayName: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  manager: {
    id: '2',
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@test.com',
    role: 'MANAGER',
    firebaseUid: 'firebase-manager-uid',
    displayName: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  editor: {
    id: '3',
    firstName: 'Editor',
    lastName: 'User',
    email: 'editor@test.com',
    role: 'EDITOR',
    firebaseUid: 'firebase-editor-uid',
    displayName: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  billing: {
    id: '4',
    firstName: 'Billing',
    lastName: 'User',
    email: 'billing@test.com',
    role: 'BILLING',
    firebaseUid: 'firebase-billing-uid',
    displayName: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  referee: {
    id: '5',
    firstName: 'Referee',
    lastName: 'User',
    email: 'referee@test.com',
    role: 'REFEREE',
    firebaseUid: 'firebase-referee-uid',
    displayName: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  public: {
    id: '6',
    firstName: 'Public',
    lastName: 'User',
    email: 'public@test.com',
    role: 'PUBLIC',
    firebaseUid: 'firebase-public-uid',
    displayName: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

describe('RBAC', () => {
  describe('hasPermission', () => {
    it('should grant correct permissions to ADMIN', () => {
      const admin = mockUsers.admin

      // ADMIN should have all permissions
      expect(hasPermission(admin, 'teams:read')).toBe(true)
      expect(hasPermission(admin, 'teams:create')).toBe(true)
      expect(hasPermission(admin, 'teams:edit')).toBe(true)
      expect(hasPermission(admin, 'teams:delete')).toBe(true)
      expect(hasPermission(admin, 'teams:manage')).toBe(true)
      expect(hasPermission(admin, 'tournaments:read')).toBe(true)
      expect(hasPermission(admin, 'tournaments:create')).toBe(true)
      expect(hasPermission(admin, 'tournaments:edit')).toBe(true)
      expect(hasPermission(admin, 'tournaments:delete')).toBe(true)
      expect(hasPermission(admin, 'tournaments:manage')).toBe(true)
      expect(hasPermission(admin, 'matches:read')).toBe(true)
      expect(hasPermission(admin, 'matches:create')).toBe(true)
      expect(hasPermission(admin, 'matches:edit')).toBe(true)
      expect(hasPermission(admin, 'matches:delete')).toBe(true)
      expect(hasPermission(admin, 'matches:referee')).toBe(true)
    })

    it('should grant correct permissions to MANAGER', () => {
      const manager = mockUsers.manager

      // MANAGER should have team and tournament management permissions
      expect(hasPermission(manager, 'teams:read')).toBe(true)
      expect(hasPermission(manager, 'teams:create')).toBe(true)
      expect(hasPermission(manager, 'teams:edit')).toBe(true)
      expect(hasPermission(manager, 'teams:delete')).toBe(true)
      expect(hasPermission(manager, 'teams:manage')).toBe(true)
      expect(hasPermission(manager, 'tournaments:read')).toBe(true)
      expect(hasPermission(manager, 'tournaments:create')).toBe(true)
      expect(hasPermission(manager, 'tournaments:edit')).toBe(true)
      expect(hasPermission(manager, 'tournaments:delete')).toBe(false) // Only ADMIN
      expect(hasPermission(manager, 'tournaments:manage')).toBe(false) // Only ADMIN
      expect(hasPermission(manager, 'matches:read')).toBe(true)
      expect(hasPermission(manager, 'matches:create')).toBe(true)
      expect(hasPermission(manager, 'matches:edit')).toBe(true)
      expect(hasPermission(manager, 'matches:delete')).toBe(true)
      expect(hasPermission(manager, 'matches:referee')).toBe(false) // Only ADMIN and REFEREE
    })

    it('should grant correct permissions to REFEREE (including matches:edit)', () => {
      const referee = mockUsers.referee

      // REFEREE should have read permissions and match management
      expect(hasPermission(referee, 'teams:read')).toBe(true)
      expect(hasPermission(referee, 'teams:create')).toBe(false)
      expect(hasPermission(referee, 'teams:edit')).toBe(false)
      expect(hasPermission(referee, 'teams:delete')).toBe(false)
      expect(hasPermission(referee, 'tournaments:read')).toBe(true)
      expect(hasPermission(referee, 'tournaments:create')).toBe(false)
      expect(hasPermission(referee, 'tournaments:edit')).toBe(false)
      expect(hasPermission(referee, 'matches:read')).toBe(true)
      expect(hasPermission(referee, 'matches:create')).toBe(false)
      expect(hasPermission(referee, 'matches:edit')).toBe(true)
      expect(hasPermission(referee, 'matches:delete')).toBe(false)
      expect(hasPermission(referee, 'matches:referee')).toBe(true)
    })

    it('should grant read-only permissions to EDITOR', () => {
      const editor = mockUsers.editor

      // EDITOR should have read-only permissions
      expect(hasPermission(editor, 'teams:read')).toBe(true)
      expect(hasPermission(editor, 'teams:create')).toBe(false)
      expect(hasPermission(editor, 'teams:edit')).toBe(false)
      expect(hasPermission(editor, 'teams:delete')).toBe(false)
      expect(hasPermission(editor, 'tournaments:read')).toBe(true)
      expect(hasPermission(editor, 'tournaments:create')).toBe(false)
      expect(hasPermission(editor, 'tournaments:edit')).toBe(false)
      expect(hasPermission(editor, 'matches:read')).toBe(true)
      expect(hasPermission(editor, 'matches:create')).toBe(false)
      expect(hasPermission(editor, 'matches:edit')).toBe(false)
      expect(hasPermission(editor, 'matches:delete')).toBe(false)
      expect(hasPermission(editor, 'matches:referee')).toBe(false)
      expect(hasPermission(editor, 'system:reports')).toBe(true)
    })

    it('should grant read-only permissions to BILLING', () => {
      const billing = mockUsers.billing

      // BILLING should have read-only permissions plus billing
      expect(hasPermission(billing, 'teams:read')).toBe(true)
      expect(hasPermission(billing, 'teams:create')).toBe(false)
      expect(hasPermission(billing, 'teams:edit')).toBe(false)
      expect(hasPermission(billing, 'teams:delete')).toBe(false)
      expect(hasPermission(billing, 'tournaments:read')).toBe(true)
      expect(hasPermission(billing, 'tournaments:create')).toBe(false)
      expect(hasPermission(billing, 'tournaments:edit')).toBe(false)
      expect(hasPermission(billing, 'matches:read')).toBe(true)
      expect(hasPermission(billing, 'matches:create')).toBe(false)
      expect(hasPermission(billing, 'matches:edit')).toBe(false)
      expect(hasPermission(billing, 'matches:delete')).toBe(false)
      expect(hasPermission(billing, 'matches:referee')).toBe(false)
      expect(hasPermission(billing, 'system:reports')).toBe(true)
      expect(hasPermission(billing, 'system:billing')).toBe(true)
    })

    it('should grant read and team creation permissions to PUBLIC', () => {
      const publicUser = mockUsers.public

      // PUBLIC should have read permissions and team creation for public registration
      expect(hasPermission(publicUser, 'teams:read')).toBe(true)
      expect(hasPermission(publicUser, 'teams:create')).toBe(true)
      expect(hasPermission(publicUser, 'tournaments:read')).toBe(true)
      expect(hasPermission(publicUser, 'tournaments:create')).toBe(false)
      expect(hasPermission(publicUser, 'matches:read')).toBe(true)
      expect(hasPermission(publicUser, 'matches:create')).toBe(false)
      expect(hasPermission(publicUser, 'matches:edit')).toBe(false)
      expect(hasPermission(publicUser, 'matches:delete')).toBe(false)
      expect(hasPermission(publicUser, 'matches:referee')).toBe(false)
    })

    it('should handle unauthenticated users', () => {
      // Unauthenticated users get PUBLIC permissions (including team creation)
      expect(hasPermission(null, 'teams:read')).toBe(true)
      expect(hasPermission(null, 'teams:create')).toBe(true)
      expect(hasPermission(null, 'tournaments:read')).toBe(true)
      expect(hasPermission(null, 'tournaments:create')).toBe(false)
      expect(hasPermission(null, 'matches:read')).toBe(true)
      expect(hasPermission(null, 'matches:create')).toBe(false)
      expect(hasPermission(null, 'matches:edit')).toBe(false)
      expect(hasPermission(null, 'matches:delete')).toBe(false)
      expect(hasPermission(null, 'matches:referee')).toBe(false)
    })
  })

  describe('getUIContext', () => {
    it('should return admin context for ADMIN and MANAGER', () => {
      expect(getUIContext(mockUsers.admin)).toBe('admin')
      expect(getUIContext(mockUsers.manager)).toBe('admin')
    })

    it('should return public context for EDITOR, BILLING, REFEREE and PUBLIC', () => {
      expect(getUIContext(mockUsers.editor)).toBe('public')
      expect(getUIContext(mockUsers.billing)).toBe('public')
      expect(getUIContext(mockUsers.referee)).toBe('public')
      expect(getUIContext(mockUsers.public)).toBe('public')
      expect(getUIContext(null)).toBe('public')
    })
  })

  describe('isAdmin', () => {
    it('should identify ADMIN and MANAGER as admin users', () => {
      expect(isAdmin(mockUsers.admin)).toBe(true)
      expect(isAdmin(mockUsers.manager)).toBe(true)
    })

    it('should not identify EDITOR, BILLING, REFEREE and PUBLIC as admin users', () => {
      expect(isAdmin(mockUsers.editor)).toBe(false)
      expect(isAdmin(mockUsers.billing)).toBe(false)
      expect(isAdmin(mockUsers.referee)).toBe(false)
      expect(isAdmin(mockUsers.public)).toBe(false)
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('getRoleLevel', () => {
    it('should return correct hierarchy levels', () => {
      expect(getRoleLevel('PUBLIC')).toBe(0)
      expect(getRoleLevel('REFEREE')).toBe(1)
      expect(getRoleLevel('EDITOR')).toBe(2)
      expect(getRoleLevel('BILLING')).toBe(3)
      expect(getRoleLevel('MANAGER')).toBe(4)
      expect(getRoleLevel('ADMIN')).toBe(5)
    })
  })

  describe('hasRoleLevel', () => {
    it('should correctly compare role levels', () => {
      // ADMIN (level 5) should have all levels
      expect(hasRoleLevel(mockUsers.admin, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'EDITOR')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'BILLING')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'MANAGER')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'ADMIN')).toBe(true)

      // MANAGER (level 4) should not have ADMIN level
      expect(hasRoleLevel(mockUsers.manager, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'EDITOR')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'BILLING')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'MANAGER')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'ADMIN')).toBe(false)

      // BILLING (level 3) should not have MANAGER or ADMIN levels
      expect(hasRoleLevel(mockUsers.billing, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.billing, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.billing, 'EDITOR')).toBe(true)
      expect(hasRoleLevel(mockUsers.billing, 'BILLING')).toBe(true)
      expect(hasRoleLevel(mockUsers.billing, 'MANAGER')).toBe(false)
      expect(hasRoleLevel(mockUsers.billing, 'ADMIN')).toBe(false)

      // EDITOR (level 2) should not have BILLING, MANAGER or ADMIN levels
      expect(hasRoleLevel(mockUsers.editor, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.editor, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.editor, 'EDITOR')).toBe(true)
      expect(hasRoleLevel(mockUsers.editor, 'BILLING')).toBe(false)
      expect(hasRoleLevel(mockUsers.editor, 'MANAGER')).toBe(false)
      expect(hasRoleLevel(mockUsers.editor, 'ADMIN')).toBe(false)

      // REFEREE (level 1) should only have PUBLIC and REFEREE levels
      expect(hasRoleLevel(mockUsers.referee, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.referee, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.referee, 'EDITOR')).toBe(false)
      expect(hasRoleLevel(mockUsers.referee, 'BILLING')).toBe(false)
      expect(hasRoleLevel(mockUsers.referee, 'MANAGER')).toBe(false)
      expect(hasRoleLevel(mockUsers.referee, 'ADMIN')).toBe(false)

      // PUBLIC (level 0) should only have PUBLIC level
      expect(hasRoleLevel(mockUsers.public, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.public, 'REFEREE')).toBe(false)
      expect(hasRoleLevel(mockUsers.public, 'EDITOR')).toBe(false)
      expect(hasRoleLevel(mockUsers.public, 'BILLING')).toBe(false)
      expect(hasRoleLevel(mockUsers.public, 'MANAGER')).toBe(false)
      expect(hasRoleLevel(mockUsers.public, 'ADMIN')).toBe(false)
    })
  })

  describe('hasAnyPermission and hasAllPermissions', () => {
    it('should work with multiple permissions', () => {
      const manager = mockUsers.manager
      const referee = mockUsers.referee

      // Manager has both team read and create permissions
      expect(hasAnyPermission(manager, ['teams:read', 'teams:create'])).toBe(true)
      expect(hasAllPermissions(manager, ['teams:read', 'teams:create'])).toBe(true)

      // Manager doesn't have teams:manage
      expect(hasAllPermissions(manager, ['teams:read', 'teams:manage'])).toBe(true)
      expect(hasAnyPermission(manager, ['teams:read', 'teams:manage'])).toBe(true)

      // Referee has matches:edit but not matches:create
      expect(hasAnyPermission(referee, ['matches:edit', 'matches:create'])).toBe(true)
      expect(hasAllPermissions(referee, ['matches:edit', 'matches:create'])).toBe(false)
    })
  })

  describe('requirePermission', () => {
    it('should not throw for users with permission', () => {
      expect(() => requirePermission(mockUsers.admin, 'teams:read')).not.toThrow()
      expect(() => requirePermission(mockUsers.manager, 'teams:manage')).not.toThrow()
      expect(() =>
        requirePermission(mockUsers.admin, 'tournaments:manage')
      ).not.toThrow()
      expect(() =>
        requirePermission(mockUsers.manager, 'tournaments:create')
      ).not.toThrow()
      expect(() => requirePermission(mockUsers.referee, 'matches:edit')).not.toThrow()
      expect(() => requirePermission(mockUsers.public, 'teams:read')).not.toThrow()
    })

    it('should throw 403 for users without permission', () => {
      // PUBLIC users can now create teams, so test a different permission they don't have
      expect(() => requirePermission(mockUsers.public, 'teams:edit')).toThrow(
        ForbiddenError
      )
      expect(() => requirePermission(mockUsers.referee, 'tournaments:create')).toThrow(
        ForbiddenError
      )

      // Unauthenticated users (null) now have teams:create permission, test teams:edit instead
      expect(() => requirePermission(null, 'teams:edit')).toThrow(ForbiddenError)
    })
  })

  describe('canAccess', () => {
    it('should be equivalent to hasPermission', () => {
      const admin = mockUsers.admin
      const permission = 'teams:create'

      expect(canAccess(admin, permission)).toBe(hasPermission(admin, permission))
      expect(canAccess(null, permission)).toBe(hasPermission(null, permission))
    })
  })
})
