import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { describe, expect, test, vi } from 'vitest'

import { ConfirmDialog } from '../ConfirmDialog'

describe('ConfirmDialog - Controlled Mode', () => {
  describe('Controlled State Management', () => {
    test('renders when open is true', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    })

    test('does not render when open is false', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={false}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    test('calls onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })

    test('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      const handleConfirm = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
          onConfirm={handleConfirm}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const confirmButton = within(dialog).getByRole('button', { name: 'Confirm' })
      await user.click(confirmButton)

      expect(handleConfirm).toHaveBeenCalledOnce()
    })
  })

  describe('Loading State', () => {
    test('disables buttons when isLoading is true', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
          isLoading={true}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const confirmButton = within(dialog).getByRole('button', { name: 'Confirm' })
      const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })

      expect(confirmButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    test('prevents dialog from closing when isLoading is true', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
          isLoading={true}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const confirmButton = within(dialog).getByRole('button', { name: 'Confirm' })

      await user.click(confirmButton)

      // Dialog should not attempt to close (onOpenChange not called with false)
      // The button is disabled, so click won't trigger anything
      expect(handleOpenChange).not.toHaveBeenCalled()
    })

    test('allows dialog to close when isLoading is false', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
          isLoading={false}
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })

      await user.click(cancelButton)

      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Content and Props', () => {
    test('displays title and description', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Delete Item'
          description='This action cannot be undone'
          confirmLabel='Delete'
          cancelLabel='Cancel'
        />
      )

      expect(screen.getByText('Delete Item')).toBeInTheDocument()
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument()
    })

    test('applies intent styling (danger)', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Danger'
          intent='danger'
          confirmLabel='Delete'
          cancelLabel='Cancel'
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const icon = within(dialog).getByRole('img', { hidden: true })

      // Verify danger intent colors are applied
      expect(icon).toHaveClass('text-red-600')
    })

    test('applies intent styling (warning)', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Warning'
          intent='warning'
          confirmLabel='Proceed'
          cancelLabel='Cancel'
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const icon = within(dialog).getByRole('img', { hidden: true })

      // Verify warning intent colors are applied
      expect(icon).toHaveClass('text-amber-600')
    })
  })

  describe('Icon Contrast', () => {
    test.each([['danger'], ['warning'], ['success'], ['info']] as const)(
      'renders appropriate icon for %s intent',
      intent => {
        const handleOpenChange = vi.fn()

        render(
          <ConfirmDialog
            open={true}
            onOpenChange={handleOpenChange}
            title='Danger dialog'
            intent={intent}
            confirmLabel='Confirm'
            cancelLabel='Cancel'
          />
        )

        const dialog = screen.getByRole('alertdialog')
        const iconContainer = within(dialog).getByTestId(
          'confirm-dialog-icon-container'
        )
        const icon = within(iconContainer).getByTestId('confirm-dialog-icon')

        // Verify icon is rendered with proper SVG element and correct viewBox
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
        expect(icon).toHaveAttribute('role', 'img')

        // Icon container is marked as decorative since the intent is conveyed by color and structure
        expect(iconContainer).toHaveAttribute('aria-hidden', 'true')

        // Each intent icon is designed with white stroke details for contrast
        // (Verified through dedicated icon component unit tests)
      }
    )
  })

  describe('Focus Management', () => {
    test('focuses confirm button by default', async () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog')
        const confirmButton = within(dialog).getByRole('button', { name: 'Confirm' })
        expect(confirmButton).toHaveFocus()
      })
    })

    test('focuses cancel button when destructive is true', async () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Delete Item'
          confirmLabel='Delete'
          cancelLabel='Cancel'
          destructive={true}
        />
      )

      await waitFor(() => {
        const dialog = screen.getByRole('alertdialog')
        const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
        expect(cancelButton).toHaveFocus()
      })
    })
  })

  describe('Accessibility', () => {
    test('has proper alertdialog role', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    })

    test('includes aria-describedby when description is provided', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          description='This is important'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      const dialog = screen.getByRole('alertdialog')
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description')
      expect(screen.getByText('This is important')).toHaveAttribute(
        'id',
        'dialog-description'
      )
    })

    test('icon container is marked as decorative', () => {
      const handleOpenChange = vi.fn()

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={handleOpenChange}
          title='Confirm Action'
          confirmLabel='Confirm'
          cancelLabel='Cancel'
        />
      )

      const dialog = screen.getByRole('alertdialog')
      const iconContainer = within(dialog).getByTestId('confirm-dialog-icon-container')
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
