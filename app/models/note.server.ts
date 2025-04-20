import { prisma } from '@/db.server'
import type { Note, Prisma, User } from '@prisma/client'

export type { Note } from '@prisma/client'

export type NoteWithUser = Note & {
  user: Pick<User, 'id' | 'email'>
}

// Define types using Prisma.Args utility
type NotePayload = Prisma.NoteGetPayload<{
  include: { user: true }
}>

type UserPayload = Prisma.UserGetPayload<{
  select: { id: true; email: true }
}>

export function getNote({ id, userId }: { id: string; userId: string }) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  }) as Promise<Pick<NoteWithUser, 'id' | 'body' | 'title'> | null>
}

export function getNoteListItems({ userId }: { userId: User['id'] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, 'body' | 'title'> & {
  userId: User['id']
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })
}

export function deleteNote({ id, userId }: Pick<Note, 'id'> & { userId: User['id'] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  })
}
