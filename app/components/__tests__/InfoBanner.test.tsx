import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InfoBanner } from '../InfoBanner'

describe('InfoBanner', () => {
  describe('Rendering', () => {
    it('should render children correctly', () => {
      render(<InfoBanner>Test message</InfoBanner>)

      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<InfoBanner className='custom-class'>Test message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('should render info variant by default', () => {
      render(<InfoBanner>Info message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveClass('bg-info-700/10')
      expect(banner).toHaveClass('text-info-700')
      expect(banner).toHaveClass('border-info-700')
    })

    it('should render warning variant', () => {
      render(<InfoBanner variant='warning'>Warning message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveClass('bg-warning-700/10')
      expect(banner).toHaveClass('text-warning-700')
      expect(banner).toHaveClass('border-warning-700')
    })

    it('should render success variant', () => {
      render(<InfoBanner variant='success'>Success message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveClass('bg-success-700/10')
      expect(banner).toHaveClass('text-success-700')
      expect(banner).toHaveClass('border-success-700')
    })

    it('should render error variant', () => {
      render(<InfoBanner variant='error'>Error message</InfoBanner>)

      const banner = screen.getByRole('alert')
      expect(banner).toHaveClass('bg-error-700/10')
      expect(banner).toHaveClass('text-error-700')
      expect(banner).toHaveClass('border-error-700')
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert" for error variant', () => {
      render(<InfoBanner variant='error'>Error message</InfoBanner>)

      const banner = screen.getByRole('alert')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveTextContent('Error message')
    })

    it('should not have aria-live for error variant (implicit in role="alert")', () => {
      render(<InfoBanner variant='error'>Error message</InfoBanner>)

      const banner = screen.getByRole('alert')
      expect(banner).not.toHaveAttribute('aria-live')
    })

    it('should have role="status" for info variant', () => {
      render(<InfoBanner variant='info'>Info message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveTextContent('Info message')
    })

    it('should have aria-live="polite" for info variant', () => {
      render(<InfoBanner variant='info'>Info message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveAttribute('aria-live', 'polite')
    })

    it('should have role="status" for warning variant', () => {
      render(<InfoBanner variant='warning'>Warning message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveTextContent('Warning message')
    })

    it('should have aria-live="polite" for warning variant', () => {
      render(<InfoBanner variant='warning'>Warning message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveAttribute('aria-live', 'polite')
    })

    it('should have role="status" for success variant', () => {
      render(<InfoBanner variant='success'>Success message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveTextContent('Success message')
    })

    it('should have aria-live="polite" for success variant', () => {
      render(<InfoBanner variant='success'>Success message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toHaveAttribute('aria-live', 'polite')
    })

    it('should have role="status" when no variant is specified (defaults to info)', () => {
      render(<InfoBanner>Default message</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Content', () => {
    it('should render complex children', () => {
      render(
        <InfoBanner variant='warning'>
          <strong>Warning:</strong> This is a complex message with{' '}
          <a href='/test'>a link</a>.
        </InfoBanner>,
      )

      expect(screen.getByText('Warning:')).toBeInTheDocument()
      expect(screen.getByText(/This is a complex message/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'a link' })).toBeInTheDocument()
    })

    it('should handle multiline content', () => {
      render(
        <InfoBanner variant='info'>
          <div>Line 1</div>
          <div>Line 2</div>
          <div>Line 3</div>
        </InfoBanner>,
      )

      expect(screen.getByText('Line 1')).toBeInTheDocument()
      expect(screen.getByText('Line 2')).toBeInTheDocument()
      expect(screen.getByText('Line 3')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty children', () => {
      render(<InfoBanner variant='info'>{''}</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toBeInTheDocument()
      expect(banner).toBeEmptyDOMElement()
    })

    it('should handle null children gracefully', () => {
      render(<InfoBanner variant='info'>{null}</InfoBanner>)

      const banner = screen.getByRole('status')
      expect(banner).toBeInTheDocument()
      expect(banner).toBeEmptyDOMElement()
    })
  })
})
