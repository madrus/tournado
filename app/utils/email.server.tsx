/* eslint-disable no-console */
import { render } from '@react-email/render'

import { Resend } from 'resend'

import TeamRegisteredEmail from '~/components/emails/TeamRegisteredEmail'
import type { Team } from '~/lib/lib.types'
import { getTeamLeader } from '~/models/team.server'
import type { Tournament } from '~/models/tournament.server'

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
      try {
        const { addEmailToOutbox } = await import('../../mocks/handlers/emails.js')
        addEmailToOutbox(emailPayload)

        console.info(`[E2E] Email stored for testing - to: ${emailPayload.to}`)
        return
      } catch (importError) {
        console.error('Failed to import MSW email handlers for testing:', importError)
        // Fall through to regular email sending
      }
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
