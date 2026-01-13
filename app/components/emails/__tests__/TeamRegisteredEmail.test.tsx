import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'
import TeamRegisteredEmail from '../TeamRegisteredEmail'

describe('TeamRegisteredEmail', () => {
  const defaultProps = {
    teamLeaderName: 'John Doe',
    teamName: 'Ajax Amsterdam',
    tournamentName: 'Spring Cup',
    teamId: 'team-123',
    baseUrl: 'https://example.com',
    logoUrl: 'https://example.com/logo.png',
  }

  it('should render email with correct content', async () => {
    const html = await render(<TeamRegisteredEmail {...defaultProps} />)

    // The render function returns HTML, so we need to check for the actual HTML content
    expect(html).toContain('Hi <!-- -->John Doe<!-- -->,')
    expect(html).toContain('<strong>Ajax Amsterdam</strong>')
    expect(html).toContain('<strong>Spring Cup</strong>')
    expect(html).toContain('successfully registered')
  })

  it('should include correct View Team link', async () => {
    const html = await render(<TeamRegisteredEmail {...defaultProps} />)

    expect(html).toContain('https://example.com/teams/team-123')
    expect(html).toContain('View Team')
  })

  it('should include logo with correct src', async () => {
    const html = await render(<TeamRegisteredEmail {...defaultProps} />)

    expect(html).toContain('https://example.com/logo.png')
    expect(html).toContain('alt="Tournado"')
  })

  it('should use baseUrl for logo when logoUrl is not provided', async () => {
    const props = { ...defaultProps, logoUrl: undefined }

    const html = await render(<TeamRegisteredEmail {...props} />)

    expect(html).toContain('https://example.com/favicon/soccer_ball.png')
  })

  it('should use default baseUrl when not provided', async () => {
    const props = { ...defaultProps, baseUrl: undefined }

    const html = await render(<TeamRegisteredEmail {...props} />)

    expect(html).toContain('http://localhost:5173/teams/team-123')
  })

  it('should include footer link to website', async () => {
    const html = await render(<TeamRegisteredEmail {...defaultProps} />)

    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('Tournado</a>')
  })

  it('should include appropriate email styling', async () => {
    const html = await render(<TeamRegisteredEmail {...defaultProps} />)

    // Check for key styling elements
    expect(html).toContain('background-color:#f6f9fc') // Main background
    expect(html).toContain('background-color:#047857') // Button color (emerald-700)
    expect(html).toContain('color:#374151') // Text color (slate-700)
  })

  it('should have proper email structure', async () => {
    const html = await render(<TeamRegisteredEmail {...defaultProps} />)

    expect(html).toContain('<html dir="ltr" lang="en">')
    expect(html).toContain('<head>')
    expect(html).toContain('<body')
    expect(html).toContain(
      'Your team Ajax Amsterdam has been registered for Spring Cup',
    )
  })
})
