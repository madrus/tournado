import type { Tournament } from '@prisma/client'

import { prisma } from '~/db.server'

export type { Tournament } from '@prisma/client'

// Tournament with full data for editing
export type TournamentFull = Tournament

// Tournament list item for tables/lists
export type TournamentListItem = Pick<
  Tournament,
  'id' | 'name' | 'location' | 'startDate' | 'endDate'
>

export const getTournamentById = ({
  id,
}: {
  id: string
}): Promise<TournamentFull | null> =>
  prisma.tournament.findUnique({
    where: { id },
  })

export const getAllTournamentListItems = async (): Promise<TournamentListItem[]> =>
  prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      startDate: true,
      endDate: true,
    },
    orderBy: { startDate: 'desc' },
  })

export const createTournament = async ({
  name,
  location,
  divisions,
  categories,
  startDate,
  endDate,
}: Pick<Tournament, 'name' | 'location' | 'startDate' | 'endDate'> & {
  divisions: string[]
  categories: string[]
}): Promise<Tournament> =>
  prisma.tournament.create({
    data: {
      name,
      location,
      divisions: JSON.stringify(divisions),
      categories: JSON.stringify(categories),
      startDate,
      endDate,
    },
  })

export const updateTournament = async ({
  id,
  name,
  location,
  divisions,
  categories,
  startDate,
  endDate,
}: Pick<Tournament, 'id' | 'name' | 'location' | 'startDate' | 'endDate'> & {
  divisions: string[]
  categories: string[]
}): Promise<Tournament> =>
  prisma.tournament.update({
    where: { id },
    data: {
      name,
      location,
      divisions: JSON.stringify(divisions),
      categories: JSON.stringify(categories),
      startDate,
      endDate,
    },
  })

export const deleteTournamentById = ({
  id,
}: Pick<Tournament, 'id'>): Promise<Tournament> =>
  prisma.tournament.delete({
    where: { id },
  })

// Helper functions for divisions and categories
export const getAllDivisions = () => [
  'PREMIER_DIVISION',
  'FIRST_DIVISION',
  'SECOND_DIVISION',
  'THIRD_DIVISION',
  'FOURTH_DIVISION',
  'FIFTH_DIVISION',
]

// Based on seed data - these are common Dutch youth soccer categories
export const getAllCategories = () => [
  'JO8', // Jongens Onder 8 (Boys Under 8)
  'JO9', // Jongens Onder 9 (Boys Under 9)
  'JO10', // Jongens Onder 10 (Boys Under 10)
  'JO11', // Jongens Onder 11 (Boys Under 11)
  'JO12', // Jongens Onder 12 (Boys Under 12)
  'JO13', // Jongens Onder 13 (Boys Under 13)
  'JO14', // Jongens Onder 14 (Boys Under 14)
  'JO15', // Jongens Onder 15 (Boys Under 15)
  'JO16', // Jongens Onder 16 (Boys Under 16)
  'JO17', // Jongens Onder 17 (Boys Under 17)
  'JO19', // Jongens Onder 19 (Boys Under 19)
  'MO8', // Meisjes Onder 8 (Girls Under 8)
  'MO9', // Meisjes Onder 9 (Girls Under 9)
  'MO10', // Meisjes Onder 10 (Girls Under 10)
  'MO11', // Meisjes Onder 11 (Girls Under 11)
  'MO12', // Meisjes Onder 12 (Girls Under 12)
  'MO13', // Meisjes Onder 13 (Girls Under 13)
  'MO14', // Meisjes Onder 14 (Girls Under 14)
  'MO15', // Meisjes Onder 15 (Girls Under 15)
  'MO16', // Meisjes Onder 16 (Girls Under 16)
  'MO17', // Meisjes Onder 17 (Girls Under 17)
  'MO19', // Meisjes Onder 19 (Girls Under 19)
  'Veteranen 35+', // Veterans 35+
  'Veteranen 40+', // Veterans 40+
  'Veteranen 45+', // Veterans 45+
  'Veteranen 50+', // Veterans 50+
]
