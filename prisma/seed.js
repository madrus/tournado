/* eslint-disable no-console */
/* eslint-disable id-blacklist */
import bcrypt from 'bcryptjs'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Keep this file as .js for manual seeding on remote
 */
async function seed() {
  const admins = ['madrusnl@hotmail.com', 'otmanabdel@hotmail.com']

  // cleanup the existing database
  await Promise.all(
    admins.map(email =>
      prisma.user.delete({ where: { email } }).catch(() => {
        // no worries if it doesn't exist yet
      })
    )
  )

  const hashedInitialPassword = await bcrypt.hash('Tournado@2025', 10)

  let user
  for (const email of admins) {
    const createdUser = await prisma.user.create({
      data: {
        email,
        firstName:
          email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        lastName: 'Admin',
        role: 'ADMIN',
        password: { create: { hash: hashedInitialPassword } },
      },
    })
    if (!user) user = createdUser // captures the first one
  }

  const team1 = {
    teamName: 'JO8-1',
    teamClass: '1ste klasse',
  }

  const team2 = {
    teamName: 'MO10-2',
    teamClass: '2de klasse',
  }

  // Find or create a default team leader
  let teamLeader = await prisma.teamLeader.findFirst({
    where: { email: 'madrusnl@hotmail.com' },
  })

  if (!teamLeader) {
    try {
      teamLeader = await prisma.teamLeader.create({
        data: {
          firstName: 'Madrusnl',
          lastName: 'Admin',
          email: 'madrusnl@hotmail.com',
          phone: '000-000-0000',
        },
      })
    } catch (error) {
      // If creation fails due to unique constraint, try to find it again
      teamLeader = await prisma.teamLeader.findFirst({
        where: { email: 'madrusnl@hotmail.com' },
      })

      if (!teamLeader) {
        throw error // Re-throw if we still can't find it
      }
    }
  }

  // Minimal dummy tournament
  const tournament1 = await prisma.tournament.create({
    data: {
      name: 'Spring Cup',
      location: 'Amsterdam',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-02'),
    },
  })

  const createdTeam1 = await prisma.team.create({
    data: {
      teamName: team1.teamName,
      teamClass: team1.teamClass,
      teamLeaderId: teamLeader.id,
      tournamentId: tournament1.id,
    },
  })

  const createdTeam2 = await prisma.team.create({
    data: {
      teamName: team2.teamName,
      teamClass: team2.teamClass,
      teamLeaderId: teamLeader.id,
      tournamentId: tournament1.id,
    },
  })

  // Minimal dummy match
  await prisma.match.create({
    data: {
      date: new Date('2025-06-01'),
      time: new Date('2025-06-01T10:00:00Z'),
      location: 'Main Field',
      status: 'UPCOMING',
      tournamentId: tournament1.id,
      homeTeamId: createdTeam1.id,
      awayTeamId: createdTeam2.id,
    },
  })

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
