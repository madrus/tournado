import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { FormActionFooter } from '~/components/shared/FormActionFooter'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
      options: { fallbackLng: 'en' },
    },
  }),
}))

type FormActionFooterProps = Parameters<typeof FormActionFooter>[0]

const baseProps: FormActionFooterProps = {
  isDirty: false,
  onPrimary: vi.fn(),
  onSecondary: vi.fn(),
}

const renderFooter = (props: Partial<FormActionFooterProps> = {}) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <div>
            <FormActionFooter {...{ ...baseProps, ...props }} />
            <button type='button' onClick={() => router.navigate('/other')}>
              Navigate Away
            </button>
          </div>
        ),
      },
      {
        path: '/other',
        element: <div>Other Page</div>,
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    },
  )

  return {
    user: userEvent.setup(),
    router,
    ...render(<RouterProvider router={router} />),
  }
}

describe('FormActionFooter', () => {
  it('renders warning text when dirty', () => {
    renderFooter({
      isDirty: true,
    })

    const warningElement = screen.getByTestId('form-unsaved-warning')
    expect(warningElement).toBeInTheDocument()
    expect(warningElement).toHaveTextContent('common.confirm.unsavedChanges')
  })

  it('renders action buttons with permission checks', () => {
    renderFooter({ isDirty: false, permission: 'teams:create' })

    expect(screen.getByTestId('form-action-secondary')).toBeInTheDocument()
    expect(screen.getByTestId('form-action-primary')).toHaveTextContent(
      'common.actions.save',
    )
  })

  it('disables primary button when loading is true', () => {
    renderFooter({ loading: true })

    expect(screen.getByTestId('form-action-primary')).toBeDisabled()
    expect(screen.getByTestId('form-action-secondary')).toBeDisabled()
  })

  it('enables secondary button when form is invalid but not loading', () => {
    renderFooter({ isValid: false, loading: false })

    expect(screen.getByTestId('form-action-primary')).toBeDisabled()
    expect(screen.getByTestId('form-action-secondary')).toBeEnabled()
  })

  it('shows "Saving..." label when loading in create mode', () => {
    renderFooter({ loading: true, mode: 'create' })
    expect(screen.getByTestId('form-action-primary')).toHaveTextContent(
      'common.actions.saving',
    )
  })

  it('shows "Updating..." label when loading in edit mode', () => {
    renderFooter({ loading: true, mode: 'edit' })
    expect(screen.getByTestId('form-action-primary')).toHaveTextContent(
      'common.actions.updating',
    )
  })

  it('shows confirmation dialog when navigating away while dirty', async () => {
    const { user } = renderFooter({ isDirty: true })

    // Navigation is initially allowed but we are on '/'
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

    // Attempt to navigate away
    await user.click(screen.getByRole('button', { name: /Navigate Away/i }))

    // The blocker should trigger and show the ConfirmDialog
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('common.confirm.unsavedTitle')).toBeInTheDocument()
  })

  it('stays on page when navigation is cancelled in dialog', async () => {
    const { user, router } = renderFooter({ isDirty: true })

    await user.click(screen.getByRole('button', { name: /Navigate Away/i }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    // Click Cancel in Dialog
    await user.click(screen.getByRole('button', { name: 'common.confirm.stayOnPage' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('proceeds with navigation when confirmed in dialog', async () => {
    const { user, router } = renderFooter({ isDirty: true })

    await user.click(screen.getByRole('button', { name: /Navigate Away/i }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    // Click Leave Anyway in Dialog
    await user.click(screen.getByRole('button', { name: 'common.confirm.leaveAnyway' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/other')
  })
})
