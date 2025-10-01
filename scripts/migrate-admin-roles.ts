#!/usr/bin/env tsx
/**
 * Migration script to update admin roles based on SUPER_ADMIN_EMAILS
 * Run this after updating SUPER_ADMIN_EMAILS to sync existing users
 *
 * Usage:
 *   pnpm migrate:admin-roles
 */
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateAdminRoles() {
  const superAdminEmails =
    process.env.SUPER_ADMIN_EMAILS?.split(',').map(e => e.trim()) || []

  console.log('\n' + '='.repeat(80))
  console.log('🔄 Admin Role Migration')
  console.log('='.repeat(80))
  console.log(`\n📋 Target admin emails: ${superAdminEmails.join(', ') || '(none)'}\n`)

  if (superAdminEmails.length === 0) {
    console.log('⚠️  Warning: SUPER_ADMIN_EMAILS is empty or not set')
    console.log('   All current admins will be demoted to PUBLIC role')
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  // Update users who should be admins
  console.log('👆 Promoting users to ADMIN...')
  for (const email of superAdminEmails) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (user && user.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { email },
        data: { role: Role.ADMIN },
      })
      console.log(`   ✅ Promoted ${email} from ${user.role} to ADMIN`)
    } else if (user) {
      console.log(`   ℹ️  ${email} is already ADMIN`)
    } else {
      console.log(
        `   ⚠️  User ${email} not found in database (will be ADMIN on first login)`
      )
    }
  }

  // Demote users who are no longer in the list
  console.log('\n👇 Demoting users no longer in SUPER_ADMIN_EMAILS...')
  const currentAdmins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
  })

  for (const admin of currentAdmins) {
    if (!superAdminEmails.includes(admin.email)) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: Role.MANAGER },
      })
      console.log(`   ⬇️  Demoted ${admin.email} from ADMIN to MANAGER`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✨ Migration complete!')
  console.log('='.repeat(80) + '\n')

  // Summary
  const finalAdmins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { email: true },
  })
  console.log('📊 Current admin users:')
  if (finalAdmins.length === 0) {
    console.log('   (none)')
  } else {
    finalAdmins.forEach(admin => console.log(`   - ${admin.email}`))
  }
  console.log()
}

migrateAdminRoles()
  .catch(error => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
