import type { User } from '@prisma/client'

import { describe, expect, it } from 'vitest'

import {
  canAccess,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  manager: {
    id: '2',
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@test.com',
    role: 'MANAGER',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  referee: {
    id: '3',
    firstName: 'Referee',
    lastName: 'User',
    email: 'referee@test.com',
    role: 'REFEREE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  public: {
    id: '4',
    firstName: 'Public',
    lastName: 'User',
    email: 'public@test.com',
    role: 'PUBLIC',
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
      expect(hasPermission(manager, 'teams:manage')).toBe(false) // Only ADMIN
      expect(hasPermission(manager, 'tournaments:read')).toBe(true)
      expect(hasPermission(manager, 'tournaments:create')).toBe(true)
      expect(hasPermission(manager, 'tournaments:edit')).toBe(true)
      expect(hasPermission(manager, 'tournaments:delete')).toBe(false) // Only ADMIN
      expect(hasPermission(manager, 'tournaments:manage')).toBe(false) // Only ADMIN
      expect(hasPermission(manager, 'matches:read')).toBe(true)
      expect(hasPermission(manager, 'matches:create')).toBe(true)
      expect(hasPermission(manager, 'matches:edit')).toBe(true)
      expect(hasPermission(manager, 'matches:delete')).toBe(false) // Only ADMIN
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

    it('should grant only read permissions to PUBLIC', () => {
      const publicUser = mockUsers.public

      // PUBLIC should only have read permissions
      expect(hasPermission(publicUser, 'teams:read')).toBe(true)
      expect(hasPermission(publicUser, 'teams:create')).toBe(false)
      expect(hasPermission(publicUser, 'tournaments:read')).toBe(true)
      expect(hasPermission(publicUser, 'tournaments:create')).toBe(false)
      expect(hasPermission(publicUser, 'matches:read')).toBe(true)
      expect(hasPermission(publicUser, 'matches:create')).toBe(false)
      expect(hasPermission(publicUser, 'matches:edit')).toBe(false)
      expect(hasPermission(publicUser, 'matches:referee')).toBe(false)
    })

    it('should handle unauthenticated users', () => {
      // Unauthenticated users should only have read permissions
      expect(hasPermission(null, 'teams:read')).toBe(true)
      expect(hasPermission(null, 'teams:create')).toBe(false)
      expect(hasPermission(null, 'tournaments:read')).toBe(true)
      expect(hasPermission(null, 'tournaments:create')).toBe(false)
      expect(hasPermission(null, 'matches:read')).toBe(true)
      expect(hasPermission(null, 'matches:create')).toBe(false)
    })
  })

  describe('getUIContext', () => {
    it('should return admin context for ADMIN and MANAGER', () => {
      expect(getUIContext(mockUsers.admin)).toBe('admin')
      expect(getUIContext(mockUsers.manager)).toBe('admin')
    })

    it('should return public context for REFEREE and PUBLIC', () => {
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

    it('should not identify REFEREE and PUBLIC as admin users', () => {
      expect(isAdmin(mockUsers.referee)).toBe(false)
      expect(isAdmin(mockUsers.public)).toBe(false)
      expect(isAdmin(null)).toBe(false)
    })
  })

  describe('getRoleLevel', () => {
    it('should return correct hierarchy levels', () => {
      expect(getRoleLevel('PUBLIC')).toBe(0)
      expect(getRoleLevel('REFEREE')).toBe(1)
      expect(getRoleLevel('MANAGER')).toBe(2)
      expect(getRoleLevel('ADMIN')).toBe(3)
    })
  })

  describe('hasRoleLevel', () => {
    it('should correctly compare role levels', () => {
      expect(hasRoleLevel(mockUsers.admin, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'MANAGER')).toBe(true)
      expect(hasRoleLevel(mockUsers.admin, 'ADMIN')).toBe(true)

      expect(hasRoleLevel(mockUsers.manager, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'MANAGER')).toBe(true)
      expect(hasRoleLevel(mockUsers.manager, 'ADMIN')).toBe(false)

      expect(hasRoleLevel(mockUsers.referee, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.referee, 'REFEREE')).toBe(true)
      expect(hasRoleLevel(mockUsers.referee, 'MANAGER')).toBe(false)
      expect(hasRoleLevel(mockUsers.referee, 'ADMIN')).toBe(false)

      expect(hasRoleLevel(mockUsers.public, 'PUBLIC')).toBe(true)
      expect(hasRoleLevel(mockUsers.public, 'REFEREE')).toBe(false)
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
      expect(hasAllPermissions(manager, ['teams:read', 'teams:manage'])).toBe(false)
      expect(hasAnyPermission(manager, ['teams:read', 'teams:manage'])).toBe(true)

      // Referee has matches:edit but not matches:create
      expect(hasAnyPermission(referee, ['matches:edit', 'matches:create'])).toBe(true)
      expect(hasAllPermissions(referee, ['matches:edit', 'matches:create'])).toBe(false)
    })
  })

  describe('requirePermission', () => {
    it('should not throw for users with permission', () => {
      expect(() => requirePermission(mockUsers.admin, 'teams:read')).not.toThrow()
      expect(() =>
        requirePermission(mockUsers.manager, 'tournaments:create')
      ).not.toThrow()
      expect(() => requirePermission(mockUsers.referee, 'matches:edit')).not.toThrow()
      expect(() => requirePermission(mockUsers.public, 'teams:read')).not.toThrow()
    })

    it('should throw 403 for users without permission', () => {
      expect(() => requirePermission(mockUsers.public, 'teams:create')).toThrow(
        'Forbidden: Insufficient permissions'
      )
      expect(() => requirePermission(mockUsers.referee, 'tournaments:create')).toThrow(
        'Forbidden: Insufficient permissions'
      )
      expect(() => requirePermission(mockUsers.manager, 'teams:manage')).toThrow(
        'Forbidden: Insufficient permissions'
      )
      expect(() => requirePermission(null, 'teams:create')).toThrow(
        'Forbidden: Insufficient permissions'
      )
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
