import type { Role, User } from '@prisma/client'

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock Prisma - use vi.hoisted() for objects referenced in mock factory
const { mockUser, mockTransaction, mockPrisma } = vi.hoisted(() => {
	const mockUser = {
		findUnique: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		count: vi.fn(),
		create: vi.fn(),
		delete: vi.fn(),
	}

	const mockUserAuditLog = {
		create: vi.fn(),
	}

	const mockTransaction = vi.fn()

	const mockPrisma = {
		user: mockUser,
		userAuditLog: mockUserAuditLog,
		$transaction: mockTransaction,
	}

	return { mockUser, mockUserAuditLog, mockTransaction, mockPrisma }
})

vi.mock('~/db.server', () => ({
	prisma: mockPrisma,
}))

import {
	createUserFromFirebase,
	deactivateUser,
	deleteUserByEmail,
	getActiveUsersCount,
	getAllUsers,
	getAllUsersWithPagination,
	getPendingApprovalUsers,
	getUserByEmail,
	getUserByFirebaseUid,
	getUserById,
	getUsersByRole,
	reactivateUser,
	searchUsers,
	updateUserDisplayName,
	updateUserFirebaseData,
	updateUserRole,
} from '../user.server'

describe('user.server', () => {
	const mockUserData: User = {
		id: 'user-123',
		email: 'test@example.com',
		firstName: 'Test',
		lastName: 'User',
		firebaseUid: 'firebase-123',
		displayName: 'Test User',
		role: 'PUBLIC' as Role,
		active: true,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('getUserById', () => {
		it('should return user when found', async () => {
			mockUser.findUnique.mockResolvedValue(mockUserData)

			const result = await getUserById('user-123')

			expect(mockUser.findUnique).toHaveBeenCalledWith({
				where: { id: 'user-123' },
			})
			expect(result).toEqual(mockUserData)
		})

		it('should return null when user not found', async () => {
			mockUser.findUnique.mockResolvedValue(null)

			const result = await getUserById('nonexistent-id')

			expect(result).toBeNull()
		})

		it('should handle database errors', async () => {
			mockUser.findUnique.mockRejectedValue(new Error('Database error'))

			await expect(getUserById('user-123')).rejects.toThrow('Database error')
		})
	})

	describe('getUserByEmail', () => {
		it('should return user when found', async () => {
			mockUser.findUnique.mockResolvedValue(mockUserData)

			const result = await getUserByEmail('test@example.com')

			expect(mockUser.findUnique).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			})
			expect(result).toEqual(mockUserData)
		})

		it('should return null when user not found', async () => {
			mockUser.findUnique.mockResolvedValue(null)

			const result = await getUserByEmail('nonexistent@example.com')

			expect(result).toBeNull()
		})
	})

	describe('deleteUserByEmail', () => {
		it('should delete user and return deleted user data', async () => {
			mockUser.delete.mockResolvedValue(mockUserData)

			const result = await deleteUserByEmail('test@example.com')

			expect(mockUser.delete).toHaveBeenCalledWith({
				where: { email: 'test@example.com' },
			})
			expect(result).toEqual(mockUserData)
		})

		it('should handle database errors', async () => {
			mockUser.delete.mockRejectedValue(new Error('User not found'))

			await expect(deleteUserByEmail('nonexistent@example.com')).rejects.toThrow(
				'User not found',
			)
		})
	})

	describe('createUserFromFirebase', () => {
		it('should create user with full display name', async () => {
			const newUser = { ...mockUserData, firstName: 'John', lastName: 'Doe' }
			mockUser.create.mockResolvedValue(newUser)

			const result = await createUserFromFirebase({
				firebaseUid: 'firebase-123',
				email: 'john.doe@example.com',
				displayName: 'John Doe',
			})

			expect(mockUser.create).toHaveBeenCalledWith({
				data: {
					firebaseUid: 'firebase-123',
					email: 'john.doe@example.com',
					firstName: 'John',
					lastName: 'Doe',
					role: 'PUBLIC',
				},
			})
			expect(result).toEqual(newUser)
		})

		it('should create user with single name', async () => {
			const newUser = { ...mockUserData, firstName: 'John', lastName: '' }
			mockUser.create.mockResolvedValue(newUser)

			const result = await createUserFromFirebase({
				firebaseUid: 'firebase-123',
				email: 'john@example.com',
				displayName: 'John',
			})

			expect(mockUser.create).toHaveBeenCalledWith({
				data: {
					firebaseUid: 'firebase-123',
					email: 'john@example.com',
					firstName: 'John',
					lastName: '',
					role: 'PUBLIC',
				},
			})
			expect(result).toEqual(newUser)
		})

		it('should use email prefix when displayName is not provided', async () => {
			const newUser = { ...mockUserData, firstName: 'john.doe', lastName: '' }
			mockUser.create.mockResolvedValue(newUser)

			const result = await createUserFromFirebase({
				firebaseUid: 'firebase-123',
				email: 'john.doe@example.com',
				displayName: null,
			})

			expect(mockUser.create).toHaveBeenCalledWith({
				data: {
					firebaseUid: 'firebase-123',
					email: 'john.doe@example.com',
					firstName: 'john.doe',
					lastName: '',
					role: 'PUBLIC',
				},
			})
			expect(result).toEqual(newUser)
		})
	})

	describe('getUserByFirebaseUid', () => {
		it('should return user when found', async () => {
			mockUser.findUnique.mockResolvedValue(mockUserData)

			const result = await getUserByFirebaseUid('firebase-123')

			expect(mockUser.findUnique).toHaveBeenCalledWith({
				where: { firebaseUid: 'firebase-123' },
			})
			expect(result).toEqual(mockUserData)
		})

		it('should return null when user not found', async () => {
			mockUser.findUnique.mockResolvedValue(null)

			const result = await getUserByFirebaseUid('nonexistent-uid')

			expect(result).toBeNull()
		})
	})

	describe('updateUserFirebaseData', () => {
		it('should update all provided fields', async () => {
			const updatedUser = {
				...mockUserData,
				email: 'new@example.com',
				firstName: 'Jane',
				lastName: 'Smith',
			}
			mockUser.update.mockResolvedValue(updatedUser)

			const result = await updateUserFirebaseData({
				userId: 'user-123',
				firebaseUid: 'new-firebase-uid',
				email: 'new@example.com',
				displayName: 'Jane Smith',
			})

			expect(mockUser.update).toHaveBeenCalledWith({
				where: { id: 'user-123' },
				data: {
					firebaseUid: 'new-firebase-uid',
					email: 'new@example.com',
					firstName: 'Jane',
					lastName: 'Smith',
				},
			})
			expect(result).toEqual(updatedUser)
		})

		it('should update only email when other fields not provided', async () => {
			mockUser.update.mockResolvedValue(mockUserData)

			await updateUserFirebaseData({
				userId: 'user-123',
				email: 'new@example.com',
			})

			expect(mockUser.update).toHaveBeenCalledWith({
				where: { id: 'user-123' },
				data: {
					email: 'new@example.com',
				},
			})
		})

		it('should handle empty displayName', async () => {
			mockUser.update.mockResolvedValue(mockUserData)

			await updateUserFirebaseData({
				userId: 'user-123',
				displayName: '',
			})

			expect(mockUser.update).toHaveBeenCalledWith({
				where: { id: 'user-123' },
				data: {},
			})
		})
	})

	describe('getAllUsers', () => {
		it('should return all users ordered by createdAt desc', async () => {
			const users = [mockUserData]
			mockUser.findMany.mockResolvedValue(users)

			const result = await getAllUsers()

			expect(mockUser.findMany).toHaveBeenCalledWith({
				orderBy: { createdAt: 'desc' },
			})
			expect(result).toEqual(users)
		})
	})

	describe('updateUserRole', () => {
		it('should update role and create audit log', async () => {
			const currentUser = {
				id: 'user-123',
				email: 'test@example.com',
				role: 'PUBLIC',
			}
			const updatedUser = { ...mockUserData, role: 'ADMIN' as Role }

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(null),
						update: vi.fn().mockResolvedValue(updatedUser),
					},
					userAuditLog: {
						create: vi.fn().mockResolvedValue({}),
					},
				}
				return transactionFn(tx)
			})

			const result = await updateUserRole({
				userId: 'user-123',
				newRole: 'ADMIN' as Role,
				performedBy: 'admin-123',
				reason: 'Promotion',
			})

			expect(result).toEqual(updatedUser)
		})

		it('should short-circuit if role is already the desired value', async () => {
			const currentUser = {
				id: 'user-123',
				email: 'test@example.com',
				role: 'ADMIN',
			}

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(mockUserData),
						update: vi.fn(),
					},
					userAuditLog: {
						create: vi.fn(),
					},
				}
				return transactionFn(tx)
			})

			const result = await updateUserRole({
				userId: 'user-123',
				newRole: 'ADMIN' as Role,
				performedBy: 'admin-123',
			})

			expect(result).toEqual(mockUserData)
		})

		it('should throw error when user not found', async () => {
			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi.fn().mockResolvedValue(null),
					},
				}
				return transactionFn(tx)
			})

			await expect(
				updateUserRole({
					userId: 'nonexistent',
					newRole: 'ADMIN' as Role,
					performedBy: 'admin-123',
				}),
			).rejects.toThrow('User not found')
		})
	})

	describe('updateUserDisplayName', () => {
		it('should update display name and create audit log', async () => {
			const currentUser = {
				id: 'user-123',
				email: 'test@example.com',
				displayName: 'Old Name',
			}
			const updatedUser = { ...mockUserData, displayName: 'New Name' }

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(null),
						update: vi.fn().mockResolvedValue(updatedUser),
					},
					userAuditLog: {
						create: vi.fn().mockResolvedValue({}),
					},
				}
				return transactionFn(tx)
			})

			const result = await updateUserDisplayName({
				userId: 'user-123',
				displayName: 'New Name',
				performedBy: 'admin-123',
			})

			expect(result).toEqual(updatedUser)
		})

		it('should short-circuit if display name is already the desired value', async () => {
			const currentUser = {
				id: 'user-123',
				email: 'test@example.com',
				displayName: 'Same Name',
			}

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(mockUserData),
						update: vi.fn(),
					},
					userAuditLog: {
						create: vi.fn(),
					},
				}
				return transactionFn(tx)
			})

			const result = await updateUserDisplayName({
				userId: 'user-123',
				displayName: 'Same Name',
				performedBy: 'admin-123',
			})

			expect(result).toEqual(mockUserData)
		})

		it('should throw error when user not found', async () => {
			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi.fn().mockResolvedValue(null),
					},
				}
				return transactionFn(tx)
			})

			await expect(
				updateUserDisplayName({
					userId: 'nonexistent',
					displayName: 'New Name',
					performedBy: 'admin-123',
				}),
			).rejects.toThrow('User not found')
		})
	})

	describe('deactivateUser', () => {
		it('should deactivate user and create audit log', async () => {
			const currentUser = { id: 'user-123', active: true }
			const deactivatedUser = { ...mockUserData, active: false }

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(null),
						update: vi.fn().mockResolvedValue(deactivatedUser),
					},
					userAuditLog: {
						create: vi.fn().mockResolvedValue({}),
					},
				}
				return transactionFn(tx)
			})

			const result = await deactivateUser({
				userId: 'user-123',
				performedBy: 'admin-123',
				reason: 'Policy violation',
			})

			expect(result).toEqual(deactivatedUser)
		})

		it('should short-circuit if user is already inactive', async () => {
			const currentUser = { id: 'user-123', active: false }

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(mockUserData),
						update: vi.fn(),
					},
					userAuditLog: {
						create: vi.fn(),
					},
				}
				return transactionFn(tx)
			})

			const result = await deactivateUser({
				userId: 'user-123',
				performedBy: 'admin-123',
			})

			expect(result).toEqual(mockUserData)
		})

		it('should throw error when user not found', async () => {
			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi.fn().mockResolvedValue(null),
					},
				}
				return transactionFn(tx)
			})

			await expect(
				deactivateUser({
					userId: 'nonexistent',
					performedBy: 'admin-123',
				}),
			).rejects.toThrow('User not found')
		})
	})

	describe('reactivateUser', () => {
		it('should reactivate user and create audit log', async () => {
			const currentUser = { id: 'user-123', active: false }
			const reactivatedUser = { ...mockUserData, active: true }

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(null),
						update: vi.fn().mockResolvedValue(reactivatedUser),
					},
					userAuditLog: {
						create: vi.fn().mockResolvedValue({}),
					},
				}
				return transactionFn(tx)
			})

			const result = await reactivateUser({
				userId: 'user-123',
				performedBy: 'admin-123',
				reason: 'Appeal approved',
			})

			expect(result).toEqual(reactivatedUser)
		})

		it('should short-circuit if user is already active', async () => {
			const currentUser = { id: 'user-123', active: true }

			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi
							.fn()
							.mockResolvedValueOnce(currentUser)
							.mockResolvedValueOnce(mockUserData),
						update: vi.fn(),
					},
					userAuditLog: {
						create: vi.fn(),
					},
				}
				return transactionFn(tx)
			})

			const result = await reactivateUser({
				userId: 'user-123',
				performedBy: 'admin-123',
			})

			expect(result).toEqual(mockUserData)
		})

		it('should throw error when user not found', async () => {
			mockTransaction.mockImplementation(async (transactionFn) => {
				const tx = {
					user: {
						findUnique: vi.fn().mockResolvedValue(null),
					},
				}
				return transactionFn(tx)
			})

			await expect(
				reactivateUser({
					userId: 'nonexistent',
					performedBy: 'admin-123',
				}),
			).rejects.toThrow('User not found')
		})
	})

	describe('getUsersByRole', () => {
		it('should return users with specified role', async () => {
			const adminUsers = [{ ...mockUserData, role: 'ADMIN' as Role }]
			mockUser.findMany.mockResolvedValue(adminUsers)

			const result = await getUsersByRole({ role: 'ADMIN' as Role })

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: { role: 'ADMIN' },
				orderBy: { createdAt: 'desc' },
			})
			expect(result).toEqual(adminUsers)
		})

		it('should return empty array when no users found', async () => {
			mockUser.findMany.mockResolvedValue([])

			const result = await getUsersByRole({ role: 'MANAGER' as Role })

			expect(result).toEqual([])
		})
	})

	describe('searchUsers', () => {
		it('should search users by email and displayName', async () => {
			const searchResults = [mockUserData]
			mockUser.findMany.mockResolvedValue(searchResults)

			const result = await searchUsers({ query: 'test' })

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: {
					AND: [
						{},
						{
							OR: [
								{ email: { contains: 'test' } },
								{ displayName: { contains: 'test' } },
							],
						},
					],
				},
				orderBy: { createdAt: 'desc' },
				take: 50,
			})
			expect(result).toEqual(searchResults)
		})

		it('should search users with role filter', async () => {
			const searchResults = [mockUserData]
			mockUser.findMany.mockResolvedValue(searchResults)

			const result = await searchUsers({
				query: 'test',
				role: 'PUBLIC' as Role,
			})

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: {
					AND: [
						{ role: 'PUBLIC' },
						{
							OR: [
								{ email: { contains: 'test' } },
								{ displayName: { contains: 'test' } },
							],
						},
					],
				},
				orderBy: { createdAt: 'desc' },
				take: 50,
			})
			expect(result).toEqual(searchResults)
		})

		it('should respect custom limit', async () => {
			mockUser.findMany.mockResolvedValue([])

			await searchUsers({ query: 'test', limit: 10 })

			expect(mockUser.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 10,
				}),
			)
		})
	})

	describe('getPendingApprovalUsers', () => {
		it('should return users with PUBLIC role', async () => {
			const pendingUsers = [mockUserData]
			mockUser.findMany.mockResolvedValue(pendingUsers)

			const result = await getPendingApprovalUsers()

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: { role: 'PUBLIC' },
				orderBy: { createdAt: 'desc' },
			})
			expect(result).toEqual(pendingUsers)
		})

		it('should accept empty props object', async () => {
			mockUser.findMany.mockResolvedValue([])

			const result = await getPendingApprovalUsers({})

			expect(result).toEqual([])
		})
	})

	describe('getAllUsersWithPagination', () => {
		it('should return paginated users with default values', async () => {
			const users = [mockUserData]
			mockUser.findMany.mockResolvedValue(users)
			mockUser.count.mockResolvedValue(25)

			const result = await getAllUsersWithPagination({})

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: {},
				orderBy: { createdAt: 'desc' },
				skip: 0,
				take: 20,
			})
			expect(mockUser.count).toHaveBeenCalledWith({ where: {} })
			expect(result).toEqual({
				users,
				total: 25,
				totalPages: 2,
			})
		})

		it('should handle custom page and pageSize', async () => {
			const users = [mockUserData]
			mockUser.findMany.mockResolvedValue(users)
			mockUser.count.mockResolvedValue(100)

			const result = await getAllUsersWithPagination({ page: 3, pageSize: 10 })

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: {},
				orderBy: { createdAt: 'desc' },
				skip: 20,
				take: 10,
			})
			expect(result).toEqual({
				users,
				total: 100,
				totalPages: 10,
			})
		})

		it('should filter by role when provided', async () => {
			const users = [mockUserData]
			mockUser.findMany.mockResolvedValue(users)
			mockUser.count.mockResolvedValue(5)

			const result = await getAllUsersWithPagination({ role: 'ADMIN' as Role })

			expect(mockUser.findMany).toHaveBeenCalledWith({
				where: { role: 'ADMIN' },
				orderBy: { createdAt: 'desc' },
				skip: 0,
				take: 20,
			})
			expect(mockUser.count).toHaveBeenCalledWith({ where: { role: 'ADMIN' } })
			expect(result).toEqual({
				users,
				total: 5,
				totalPages: 1,
			})
		})

		it('should calculate totalPages correctly', async () => {
			mockUser.findMany.mockResolvedValue([])
			mockUser.count.mockResolvedValue(21)

			const result = await getAllUsersWithPagination({ pageSize: 10 })

			expect(result.totalPages).toBe(3)
		})
	})

	describe('getActiveUsersCount', () => {
		it('should return count of active users', async () => {
			mockUser.count.mockResolvedValue(42)

			const result = await getActiveUsersCount()

			expect(mockUser.count).toHaveBeenCalledWith({
				where: { active: true },
			})
			expect(result).toBe(42)
		})

		it('should return 0 when no active users', async () => {
			mockUser.count.mockResolvedValue(0)

			const result = await getActiveUsersCount()

			expect(result).toBe(0)
		})
	})
})
