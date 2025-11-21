import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from '@react-email/components'
import type { JSX } from 'react'

type TeamRegisteredEmailProps = {
	teamLeaderName: string
	teamName: string
	tournamentName: string
	teamId: string
	baseUrl?: string
	logoUrl?: string
}

function TeamRegisteredEmail({
	teamLeaderName,
	teamName,
	tournamentName,
	teamId,
	baseUrl = 'http://localhost:5173',
	logoUrl,
}: Readonly<TeamRegisteredEmailProps>): JSX.Element {
	const viewTeamUrl = `${baseUrl}/teams/${teamId}`

	return (
		<Html>
			<Head />
			<Preview>
				Your team {teamName} has been registered for {tournamentName}
			</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoSection}>
						<Img
							src={logoUrl || `${baseUrl}/favicon/soccer_ball.png`}
							width='64'
							height='64'
							alt='Tournado'
							style={logo}
						/>
					</Section>

					<Section style={content}>
						<Text style={greeting}>Hi {teamLeaderName},</Text>

						<Text style={paragraph}>
							Great news! Your team <strong>{teamName}</strong> has been successfully registered for{' '}
							<strong>{tournamentName}</strong>.
						</Text>

						<Text style={paragraph}>
							We're excited to have you participate in this tournament. You can view your team
							details and track updates using the button below.
						</Text>

						<Section style={buttonSection}>
							<Button style={button} href={viewTeamUrl}>
								View Team
							</Button>
						</Section>

						<Text style={paragraph}>
							If you have any questions or need assistance, please don't hesitate to contact us.
						</Text>

						<Text style={paragraph}>Good luck with your tournament!</Text>

						<Text style={signature}>
							Best regards,
							<br />
							The Tournado Team
						</Text>
					</Section>

					<Section style={footer}>
						<Text style={footerText}>
							This email was sent because your team was registered for a tournament on{' '}
							<Link href={baseUrl} style={link}>
								Tournado
							</Link>
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

const main = {
	backgroundColor: '#f6f9fc',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '20px 0 48px',
	marginBottom: '64px',
	maxWidth: '580px',
}

const logoSection = {
	padding: '32px 20px',
	textAlign: 'center' as const,
}

const logo = {
	margin: '0 auto',
}

const content = {
	padding: '0 20px',
}

const greeting = {
	fontSize: '18px',
	lineHeight: '1.4',
	color: '#374151', // slate-700 equivalent
	fontWeight: '500',
	margin: '30px 0',
}

const paragraph = {
	fontSize: '16px',
	lineHeight: '1.4',
	color: '#374151', // slate-700 equivalent
	margin: '24px 0',
}

const buttonSection = {
	textAlign: 'center' as const,
	margin: '32px 0',
}

const button = {
	backgroundColor: '#047857', // emerald-700 - matches website primary button
	borderRadius: '8px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: '600',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'inline-block',
	padding: '12px 24px',
	lineHeight: '1.25',
}

const signature = {
	fontSize: '16px',
	lineHeight: '1.4',
	color: '#374151', // slate-700 equivalent
	margin: '48px 0 24px',
}

const footer = {
	borderTop: '1px solid #e5e7eb', // gray-200 equivalent
	padding: '32px 20px',
	textAlign: 'center' as const,
}

const footerText = {
	fontSize: '14px',
	lineHeight: '1.4',
	color: '#6b7280', // gray-500 equivalent
	margin: '0',
}

const link = {
	color: '#047857', // emerald-700 - matches website primary color
	textDecoration: 'underline',
}

export default TeamRegisteredEmail
