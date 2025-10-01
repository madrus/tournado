/* eslint-disable no-console */
/* eslint-disable id-blacklist */
import { PrismaClient } from '@prisma/client'

// Idempotent seeding of SUPER_ADMIN_EMAILS into User table
// Usage:
//   node prisma/seedSuperAdmins.js
// Environment:
//   SUPER_ADMIN_EMAILS="a@example.com,b@example.com"

async function run() {
  const prisma = new PrismaClient()
  try {
    const raw = process.env.SUPER_ADMIN_EMAILS || ''
    const emails = raw
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)

    if (emails.length === 0) {
      console.log('[seedSuperAdmins] No SUPER_ADMIN_EMAILS configured, skipping')
      return
    }

    console.log(`[seedSuperAdmins] Ensuring ${emails.length} super admin user(s) exist`)

    for (const email of emails) {
      // If user exists, update role to ADMIN; otherwise create minimal ADMIN user
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        if (existing.role !== 'ADMIN') {
          await prisma.user.update({
            where: { id: existing.id },
            data: { role: 'ADMIN' },
          })
          console.log(`[seedSuperAdmins] Updated role to ADMIN for ${email}`)
        } else {
          console.log(`[seedSuperAdmins] User already ADMIN: ${email}`)
        }
      } else {
        const [firstNameRaw] = email.split('@')
        const firstName = firstNameRaw.charAt(0).toUpperCase() + firstNameRaw.slice(1)
        await prisma.user.create({
          data: {
            email,
            firstName,
            lastName: 'Admin',
            role: 'ADMIN',
          },
        })
        console.log(`[seedSuperAdmins] Created ADMIN user: ${email}`)
      }
    }

    console.log('[seedSuperAdmins] Done')
  } catch (error) {
    console.error('[seedSuperAdmins] Error:', error?.message || error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()
