import bcrypt from 'bcryptjs'

import { PrismaClient } from '@prisma/client'

import type { Team as AppTeam } from '../app/lib/lib.types'

const prisma = new PrismaClient()

async function seed() {
  const email = 'rachel@remix.run'

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  })

  const hashedPassword = await bcrypt.hash('racheliscool', 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  const team1: AppTeam = {
    id: 'cuid1', // Prisma will generate this
    teamName: 'Ajax JO8-1',
    teamClass: 'JO8-1',
  }

  const team2: AppTeam = {
    id: 'cuid2', // Prisma will generate this
    teamName: 'Ajax MO10-1',
    teamClass: 'MO10-1',
  }

  await prisma.team.create({
    data: {
      teamName: team1.teamName,
      teamClass: team1.teamClass,
      userId: user.id,
    },
  })

  await prisma.team.create({
    data: {
      teamName: team2.teamName,
      teamClass: team2.teamClass,
      userId: user.id,
    },
  })

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
