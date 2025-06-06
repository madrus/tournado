/* eslint-disable no-console */
/* eslint-disable id-blacklist */
import { PrismaClient } from '@prisma/client'

import bcrypt from 'bcryptjs'

// Retry mechanism for Prisma Client initialization
async function createPrismaClient(maxRetries = 5, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const prisma = new PrismaClient()
      // Test the connection
      await prisma.$connect()
      return prisma
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`)
      if (i === maxRetries - 1) {
        throw error
      }
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Keep this file as .js for manual seeding on remote
 */
async function seed() {
  // Initialize Prisma Client with retry logic
  const prisma = await createPrismaClient()

  try {
    const admins = ['madrusnl@hotmail.com', 'otmanabdel@hotmail.com']
    const users = ['madrus@gmail.com']
    // cleanup the existing database
    await Promise.all(
      admins.map(email =>
        prisma.user.delete({ where: { email } }).catch(() => {
          // no worries if it doesn't exist yet
        })
      )
    )

    // Cleanup users as well
    await Promise.all(
      users.map(email =>
        prisma.user.delete({ where: { email } }).catch(() => {
          // no worries if it doesn't exist yet
        })
      )
    )

    // Cleanup existing tournaments (this will cascade delete teams and matches)
    await prisma.tournament.deleteMany({
      where: {
        name: {
          in: ['Spring Cup', 'Summer Cup'],
        },
      },
    })

    const hashedInitialPassword = await bcrypt.hash('Tournado@2025', 10)

    // Create admin users
    await Promise.all(
      admins.map(async email =>
        prisma.user.create({
          data: {
            email,
            firstName:
              email.split('@')[0].charAt(0).toUpperCase() +
              email.split('@')[0].slice(1),
            lastName: 'Admin',
            role: 'ADMIN',
            password: { create: { hash: hashedInitialPassword } },
          },
        })
      )
    )

    // Create TOURNAMENT_MANAGER users
    await Promise.all(
      users.map(async email =>
        prisma.user.create({
          data: {
            email,
            firstName:
              email.split('@')[0].charAt(0).toUpperCase() +
              email.split('@')[0].slice(1),
            lastName: 'User',
            role: 'TOURNAMENT_MANAGER',
            password: { create: { hash: hashedInitialPassword } },
          },
        })
      )
    )

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

    // Minimal two dummy tournaments
    const tournament1 = await prisma.tournament.create({
      data: {
        name: 'Spring Cup',
        location: 'Amsterdam',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-02'),
      },
    })

    const tournament2 = await prisma.tournament.create({
      data: {
        name: 'Summer Cup',
        location: 'Aalsmeer',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-02'),
      },
    })

    // minimal two dummy teams playing in the 1st tournament
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

    // minimal two dummy teams playing in the 2nd tournament
    const createdTeam3 = await prisma.team.create({
      data: {
        teamName: team1.teamName,
        teamClass: team1.teamClass,
        teamLeaderId: teamLeader.id,
        tournamentId: tournament2.id,
      },
    })

    const createdTeam4 = await prisma.team.create({
      data: {
        teamName: team2.teamName,
        teamClass: team2.teamClass,
        teamLeaderId: teamLeader.id,
        tournamentId: tournament2.id,
      },
    })

    // Minimal two dummy matches
    await prisma.match.create({
      data: {
        date: new Date('2025-05-01'),
        time: new Date('2025-06-01T10:00:00Z'),
        location: 'Green Field',
        status: 'UPCOMING',
        tournamentId: tournament1.id,
        homeTeamId: createdTeam1.id,
        awayTeamId: createdTeam2.id,
      },
    })

    await prisma.match.create({
      data: {
        date: new Date('2025-06-01'),
        time: new Date('2025-06-01T10:00:00Z'),
        location: 'Red Field',
        status: 'UPCOMING',
        tournamentId: tournament2.id,
        homeTeamId: createdTeam4.id,
        awayTeamId: createdTeam3.id,
      },
    })

    console.log(`Database has been seeded. 🌱`)
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
