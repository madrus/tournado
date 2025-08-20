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

    // Create MANAGER users
    await Promise.all(
      users.map(async email =>
        prisma.user.create({
          data: {
            email,
            firstName:
              email.split('@')[0].charAt(0).toUpperCase() +
              email.split('@')[0].slice(1),
            lastName: 'User',
            role: 'MANAGER',
            password: { create: { hash: hashedInitialPassword } },
          },
        })
      )
    )

    const team1 = {
      name: 'JO8-1',
      category: 'JO8',
      division: 'PREMIER_DIVISION',
    }

    const team2 = {
      name: 'JO10-1',
      category: 'JO10',
      division: 'FIRST_DIVISION',
    }

    const team3 = {
      name: 'JO10-1',
      category: 'JO10',
      division: 'FIRST_DIVISION',
    }

    const team4 = {
      name: 'JO10-2',
      category: 'JO10',
      division: 'SECOND_DIVISION',
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
            phone: '+31 6 1234 5678',
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
        divisions: ['PREMIER_DIVISION', 'FIRST_DIVISION', 'SECOND_DIVISION'],
        categories: ['JO8', 'JO9', 'JO10', 'JO11'],
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-02'),
      },
    })

    const tournament2 = await prisma.tournament.create({
      data: {
        name: 'Summer Cup',
        location: 'Aalsmeer',
        divisions: ['FIRST_DIVISION', 'SECOND_DIVISION', 'THIRD_DIVISION'],
        categories: ['JO9', 'JO10', 'JO11', 'JO12'],
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-02'),
      },
    })

    // minimal two dummy teams playing in the 1st tournament
    const createdTeam1 = await prisma.team.create({
      data: {
        clubName: 'sv DIO',
        name: team1.name,
        category: team1.category,
        division: team1.division,
        teamLeaderId: teamLeader.id,
        tournamentId: tournament1.id,
      },
    })

    const createdTeam2 = await prisma.team.create({
      data: {
        clubName: 'sv DIO',
        name: team2.name,
        category: team2.category,
        division: team2.division,
        teamLeaderId: teamLeader.id,
        tournamentId: tournament1.id,
      },
    })

    // minimal two dummy teams playing in the 2nd tournament
    const createdTeam3 = await prisma.team.create({
      data: {
        clubName: 'sv DIO',
        name: team3.name,
        category: team3.category,
        division: team3.division,
        teamLeaderId: teamLeader.id,
        tournamentId: tournament2.id,
      },
    })

    const createdTeam4 = await prisma.team.create({
      data: {
        clubName: 'sv DIO',
        name: team4.name,
        category: team4.category,
        division: team4.division,
        teamLeaderId: teamLeader.id,
        tournamentId: tournament2.id,
      },
    })

    // Create 23 JO8 teams from different clubs for testing pools feature
    const clubNames = [
      'Arsenal',
      'Wolves',
      'Phoenix',
      'Thunder',
      'Lightning',
      'Eagles',
      'Lions',
      'Tigers',
      'Dragons',
      'Hawks',
      'Falcons',
      'Panthers',
      'Sharks',
      'Bulls',
      'Rams',
      'Bears',
      'Cobras',
      'Vipers',
      'Stallions',
      'Mustangs',
      'Cheetahs',
      'Leopards',
      'Jaguars',
    ]

    const jo8Teams = []
    for (let i = 0; i < 23; i++) {
      const clubName = clubNames[i]
      // Each club can have JO8-1, JO8-2, etc. independently
      const teamName = i < 12 ? 'JO8-1' : i < 18 ? 'JO8-2' : 'JO8-3'

      const jo8Team = await prisma.team.create({
        data: {
          clubName: clubName,
          name: teamName,
          category: 'JO8',
          division: 'PREMIER_DIVISION',
          teamLeaderId: teamLeader.id,
          tournamentId: tournament1.id,
        },
      })
      jo8Teams.push(jo8Team)
    }

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
