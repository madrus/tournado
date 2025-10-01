import { type JSX } from 'react'
import { Form, type MetaFunction, useActionData, useLoaderData } from 'react-router'

import { Role } from '@prisma/client'

import { getAllUsers, updateUserRole } from '~/models/user.server'
import type { RouteMetadata } from '~/utils/routeTypes'
import { requireUserWithRole } from '~/utils/session.server'

import type { Route } from './+types/a7k9m2x5p8w1n4q6r3y8b5t1.users'

type LoaderData = {
  users: Awaited<ReturnType<typeof getAllUsers>>
}

type ActionData = {
  error?: string
  success?: boolean
}

// Route metadata
export const handle: RouteMetadata = {
  isPublic: false,
  title: 'admin.titles.userManagement',
}

export const loader = async ({ request }: Route.LoaderArgs): Promise<LoaderData> => {
  await requireUserWithRole(request, [Role.ADMIN])
  const users = await getAllUsers()

  return { users } satisfies LoaderData
}

export const action = async ({ request }: Route.ActionArgs): Promise<ActionData> => {
  await requireUserWithRole(request, [Role.ADMIN])

  const formData = await request.formData()
  const userId = formData.get('userId') as string
  const newRole = formData.get('role') as Role
  const intent = formData.get('intent') as string

  if (intent !== 'updateRole') {
    throw new Response('Invalid action', { status: 400 })
  }

  if (!userId || !newRole) {
    throw new Response('Missing required fields', { status: 400 })
  }

  if (!Object.values(Role).includes(newRole)) {
    throw new Response('Invalid role', { status: 400 })
  }

  try {
    await updateUserRole(userId, newRole)
    return { success: true } satisfies ActionData
  } catch (_error) {
    throw new Response('Failed to update user role', { status: 500 })
  }
}

export const meta: MetaFunction = () => [
  { title: 'User Management | Tournado Admin' },
  {
    name: 'description',
    content: 'Manage user roles and permissions in the Tournado system.',
  },
]

export default function AdminUsersPage(): JSX.Element {
  const { users } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>User Management</h1>
          <p className='text-muted-foreground'>Manage user roles and permissions</p>
        </div>
      </div>

      {actionData?.error ? (
        <div className='bg-destructive/10 text-destructive rounded-md p-4'>
          {actionData.error}
        </div>
      ) : null}

      {actionData?.success ? (
        <div className='rounded-md bg-green-500/10 p-4 text-green-700'>
          User role updated successfully
        </div>
      ) : null}

      <div className='bg-card rounded-lg border'>
        <div className='p-6'>
          <h2 className='mb-4 text-lg font-semibold'>All Users</h2>

          {users.length === 0 ? (
            <p className='text-muted-foreground'>No users found.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='px-4 py-3 text-left'>Name</th>
                    <th className='px-4 py-3 text-left'>Email</th>
                    <th className='px-4 py-3 text-left'>Current Role</th>
                    <th className='px-4 py-3 text-left'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className='border-b last:border-b-0'>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>
                          {user.firstName} {user.lastName}
                        </div>
                        {user.firebaseUid ? (
                          <div className='text-muted-foreground text-sm'>
                            Firebase User
                          </div>
                        ) : null}
                      </td>
                      <td className='text-muted-foreground px-4 py-3 text-sm'>
                        {user.email}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === Role.ADMIN
                              ? 'bg-red-100 text-red-800'
                              : user.role === Role.MANAGER
                                ? 'bg-blue-100 text-blue-800'
                                : user.role === Role.REFEREE
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <Form method='post' className='flex items-center gap-2'>
                          <input type='hidden' name='intent' value='updateRole' />
                          <input type='hidden' name='userId' value={user.id} />
                          <select
                            name='role'
                            defaultValue={user.role}
                            className='rounded border px-2 py-1 text-sm'
                          >
                            <option value={Role.PUBLIC}>PUBLIC</option>
                            <option value={Role.REFEREE}>REFEREE</option>
                            <option value={Role.MANAGER}>MANAGER</option>
                            <option value={Role.ADMIN}>ADMIN</option>
                          </select>
                          <button
                            type='submit'
                            className='bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-sm'
                          >
                            Update
                          </button>
                        </Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
