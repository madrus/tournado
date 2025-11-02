/* eslint-disable no-console */
import { render } from '@react-email/render'

import { Resend } from 'resend'

import TeamRegisteredEmail from '~/components/emails/TeamRegisteredEmail'
import type { Team } from '~/features/teams/types'
import { getTeamLeader } from '~/models/team.server'
import type { Tournament } from '~/models/tournament.server'

// Cache for MSW email handler (lazy loaded on first use)
let mswEmailHandler:
  | ((emailData: { from: string; to: string; subject: string; html: string }) => void)
  | null = null
let mswHandlerLoaded = false

/**
 * Lazy load and cache MSW email handler for E2E testing
 * Only loads once on first call, subsequent calls use cached handler
 */
async function getEmailOutboxHandler(): Promise<typeof mswEmailHandler> {
  if (!mswHandlerLoaded) {
    try {
      const { addEmailToOutbox } = await import('test/mocks/handlers/emails.js')
      mswEmailHandler = addEmailToOutbox
    } catch (error) {
      console.error('Failed to load MSW email handlers:', error)
    }
    mswHandlerLoaded = true
  }
  return mswEmailHandler
}

// Toggle this to false when using Resend sandbox, true when using your own domain
const isRealDomainRegistered = false

// Lazy initialization of Resend client to avoid crashes when API key is missing
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// For testing purposes - allows resetting the client
export function resetResendClient(): void {
  resendClient = null
}

/**
 * Masks email addresses to protect PII in logs
 * @param email - Email address to mask
 * @returns Masked email (e.g., "jo***@example.com")
 * @example
 * maskEmail("john@example.com") // "jo***@example.com"
 * maskEmail("ab@test.org")      // "**@test.org"
 */
function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!name || !domain) return '***@***' // Malformed email
  const safeName = name.length <= 2 ? '*'.repeat(name.length) : `${name.slice(0, 2)}***`
  return `${safeName}@${domain}`
}

/**
 * Masks multiple email addresses
 * @param emails - Array of email addresses or single email
 * @returns Masked emails as comma-separated string
 */
const maskEmails = (emails: string | string[]): string =>
  Array.isArray(emails) ? emails.map(maskEmail).join(', ') : maskEmail(emails)

/**
 * Adds email to MSW outbox for E2E testing
 * Lazy loads the handler on first call and caches it
 */
async function storeEmailForTesting(emailPayload: {
  from: string
  to: string
  subject: string
  html: string
}): Promise<void> {
  const handler = await getEmailOutboxHandler()
  if (!handler) {
    throw new Error('MSW email handlers not available in test environment')
  }
  handler(emailPayload)
  console.info(`[E2E] Email stored for testing - to: ${maskEmails(emailPayload.to)}`)
}

export async function sendConfirmationEmail(
  team: Team,
  tournament: Tournament
): Promise<void> {
  const teamLeader = await getTeamLeader(team.teamLeaderId)

  if (!teamLeader) {
    throw new Error(`Team leader not found for team ${team.id}`)
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM environment variable is not set')
  }

  const teamLeaderName = `${teamLeader.firstName} ${teamLeader.lastName}`
  const baseUrl = isRealDomainRegistered
    ? process.env.BASE_URL
    : process.env.EMAIL_BASE_URL || // Allow manual override
      (process.env.NODE_ENV === 'production'
        ? process.env.FLY_APP_NAME
          ? `https://${process.env.FLY_APP_NAME}.fly.dev`
          : 'https://tournado.fly.dev' // fallback for production
        : 'http://localhost:5173') // local development
  const emailFrom = isRealDomainRegistered
    ? process.env.EMAIL_FROM || 'pending-email-from@localhost'
    : 'onboarding@resend.dev'

  // Logo should always come from the actual running website
  // For localhost development, use staging logo since email clients can't access localhost URLs
  const logoUrl =
    process.env.NODE_ENV === 'development'
      ? 'https://tournado-staging.fly.dev/favicon/soccer_ball.png' // Use staging logo for localhost testing
      : process.env.EMAIL_BASE_URL
        ? `${process.env.EMAIL_BASE_URL}/favicon/soccer_ball.png`
        : process.env.FLY_APP_NAME
          ? `https://${process.env.FLY_APP_NAME}.fly.dev/favicon/soccer_ball.png`
          : 'https://tournado.fly.dev/favicon/soccer_ball.png'

  const emailHtml = await render(
    <TeamRegisteredEmail
      teamName={team.name}
      teamLeaderName={teamLeaderName}
      tournamentName={tournament.name}
      teamId={team.id}
      baseUrl={baseUrl}
      logoUrl={logoUrl}
    />
  )

  const emailPayload = {
    from: emailFrom,
    to: teamLeader.email,
    subject: `Team ${team.name} registered for ${tournament.name}`,
    html: emailHtml,
  }

  try {
    // In E2E test environment, store the email in MSW outbox instead of sending
    if (process.env.PLAYWRIGHT === 'true') {
      await storeEmailForTesting(emailPayload)
      return
    }

    const resend = getResendClient()
    await resend.emails.send(emailPayload)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)

    // Re-throw configuration errors as-is for better debugging
    if (
      error instanceof Error &&
      (error.message.includes('RESEND_API_KEY') || error.message.includes('EMAIL_FROM'))
    ) {
      throw error
    }

    throw new Error('Failed to send confirmation email')
  }
}
