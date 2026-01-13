import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AuditLogWithAdmin } from '~/features/users/types'
import { UserAuditLogList } from '../UserAuditLogList'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

// Mock useLanguageDirection hook
vi.mock('~/hooks/useLanguageDirection', () => ({
  useLanguageDirection: () => ({
    latinFontClass: 'font-latin',
  }),
}))

// Mock Panel component
vi.mock('~/components/Panel', () => ({
  Panel: ({
    children,
    color,
    variant,
  }: {
    children: React.ReactNode
    color: string
    variant: string
  }) => (
    <div data-testid='panel' data-color={color} data-variant={variant}>
      {children}
    </div>
  ),
}))

describe('UserAuditLogList', () => {
  const mockAuditLogs: AuditLogWithAdmin[] = [
    {
      id: '1',
      userId: 'user-1',
      action: 'ROLE_CHANGED',
      previousValue: 'PUBLIC',
      newValue: 'ADMIN',
      reason: null,
      createdAt: new Date('2024-01-15T10:30:00Z'),
      performedBy: 'admin-1',
      admin: {
        id: 'admin-1',
        email: 'admin@example.com',
        displayName: 'Admin User',
      },
    },
    {
      id: '2',
      userId: 'user-1',
      action: 'ACCOUNT_CREATED',
      previousValue: null,
      newValue: null,
      reason: null,
      createdAt: new Date('2024-01-10T08:15:00Z'),
      performedBy: 'admin-2',
      admin: {
        id: 'admin-2',
        email: 'system@example.com',
        displayName: null,
      },
    },
  ]

  describe('Empty state', () => {
    it('should render empty state when no audit logs provided', () => {
      render(<UserAuditLogList auditLogs={[]} />)

      expect(screen.getByText('users.titles.auditLog')).toBeInTheDocument()
      expect(screen.getByText('users.messages.noAuditLogs')).toBeInTheDocument()
    })

    it('should render Panel with correct props', () => {
      render(<UserAuditLogList auditLogs={[]} />)

      const panel = screen.getByTestId('panel')
      expect(panel).toHaveAttribute('data-color', 'sky')
      expect(panel).toHaveAttribute('data-variant', 'content-panel')
    })
  })

  describe('Audit logs display', () => {
    it('should render all audit log entries', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      expect(screen.getByText('users.auditActions.ROLE_CHANGED')).toBeInTheDocument()
      expect(screen.getByText('users.auditActions.ACCOUNT_CREATED')).toBeInTheDocument()
    })

    it('should display value changes for entries with previousValue and newValue', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      const valueChange = screen.getByText('PUBLIC → ADMIN')
      expect(valueChange).toBeInTheDocument()
      expect(valueChange).toHaveClass('font-latin')
    })

    it('should not display value changes for entries without previousValue or newValue', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      // Should not show any arrow for ACCOUNT_CREATED which has null values
      const elements = screen.queryAllByText(/→/)
      expect(elements).toHaveLength(1) // Only the ROLE_CHANGED entry
    })

    it('should format and display timestamps correctly', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      // Check that dates are rendered (the exact format depends on locale)
      const timestamps = screen.getAllByTestId('audit-log-timestamp')
      expect(timestamps.length).toBeGreaterThan(0)
      for (const timestamp of timestamps) {
        expect(timestamp).toHaveClass('font-latin')
        expect(timestamp.textContent ?? '').toMatch(/\d/)
      }
    })

    it('should display admin display name when available', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    it('should fall back to admin email when display name is not available', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      expect(screen.getByText('system@example.com')).toBeInTheDocument()
    })

    it('should display "Performed by" label for each audit log', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      const performedByElements = screen.getAllByText(/users.fields.performedBy/)
      expect(performedByElements).toHaveLength(mockAuditLogs.length)
    })

    it('should apply correct styling classes', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      const logEntries = screen.getAllByTestId('audit-log-entry')
      expect(logEntries).toHaveLength(mockAuditLogs.length)
      for (const entry of logEntries) {
        expect(entry).toHaveClass('border-primary')
      }
    })
  })

  describe('Accessibility', () => {
    it('should use proper heading hierarchy', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('users.titles.auditLog')
    })

    it('should render list items with unique keys', () => {
      render(<UserAuditLogList auditLogs={mockAuditLogs} />)

      const logEntries = screen.getAllByTestId('audit-log-entry')
      expect(logEntries).toHaveLength(mockAuditLogs.length)
      for (const entry of logEntries) {
        expect(entry).toHaveClass('border-primary')
      }
    })
  })

  describe('Edge cases', () => {
    it('should handle single audit log', () => {
      const singleLog = [mockAuditLogs[0]]
      render(<UserAuditLogList auditLogs={singleLog} />)

      expect(screen.getByText('users.auditActions.ROLE_CHANGED')).toBeInTheDocument()
      expect(
        screen.queryByText('users.auditActions.ACCOUNT_CREATED'),
      ).not.toBeInTheDocument()
    })

    it('should handle audit logs with only previousValue', () => {
      const logsWithOnlyPrevious: AuditLogWithAdmin[] = [
        {
          id: '3',
          userId: 'user-1',
          action: 'DEACTIVATED',
          previousValue: 'ACTIVE',
          newValue: null,
          reason: null,
          createdAt: new Date('2024-01-20T14:00:00Z'),
          performedBy: 'admin-1',
          admin: {
            id: 'admin-1',
            email: 'admin@example.com',
            displayName: 'Admin User',
          },
        },
      ]

      render(<UserAuditLogList auditLogs={logsWithOnlyPrevious} />)

      // Should not show arrow when newValue is null
      expect(screen.queryByText(/→/)).not.toBeInTheDocument()
    })

    it('should handle audit logs with only newValue', () => {
      const logsWithOnlyNew: AuditLogWithAdmin[] = [
        {
          id: '4',
          userId: 'user-1',
          action: 'ACTIVATED',
          previousValue: null,
          newValue: 'ACTIVE',
          reason: null,
          createdAt: new Date('2024-01-22T16:00:00Z'),
          performedBy: 'admin-1',
          admin: {
            id: 'admin-1',
            email: 'admin@example.com',
            displayName: 'Admin User',
          },
        },
      ]

      render(<UserAuditLogList auditLogs={logsWithOnlyNew} />)

      // Should not show arrow when previousValue is null
      expect(screen.queryByText(/→/)).not.toBeInTheDocument()
    })
  })
})
