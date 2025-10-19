import { render, screen } from '@testing-library/react'

import { describe, expect, it } from 'vitest'

import { AnimatedHamburgerIcon } from '../AnimatedHamburgerIcon'

describe('AnimatedHamburgerIcon', () => {
  describe('when closed (hamburger state)', () => {
    it('should render three lines in hamburger configuration', () => {
      render(<AnimatedHamburgerIcon isOpen={false} isRTL={false} />)

      const topLine = screen.getByTestId('hamburger-top-line')
      const middleLine = screen.getByTestId('hamburger-middle-line')
      const bottomLine = screen.getByTestId('hamburger-bottom-line')

      // Top line - should be at original position
      expect(topLine).toHaveClass('translate-y-0', 'rotate-0')

      // Middle line - should be fully visible
      expect(middleLine).toHaveClass('scale-100', 'opacity-100')

      // Bottom line - should be at original position
      expect(bottomLine).toHaveClass('translate-y-0', 'rotate-0')
    })

    it('should have proper ARIA label', () => {
      render(<AnimatedHamburgerIcon isOpen={false} isRTL={false} />)

      const svg = screen.getByRole('img')
      expect(svg).toHaveAttribute('aria-label', 'Menu')
    })
  })

  describe('when open (cross/X state)', () => {
    describe('for LTR (left-to-right) languages', () => {
      it('should transform into X shape', () => {
        render(<AnimatedHamburgerIcon isOpen={true} isRTL={false} />)

        const topLine = screen.getByTestId('hamburger-top-line')
        const middleLine = screen.getByTestId('hamburger-middle-line')
        const bottomLine = screen.getByTestId('hamburger-bottom-line')

        // Top line - should rotate -45deg and move down
        expect(topLine).toHaveClass('translate-y-[6px]', 'rotate-[-45deg]')

        // Middle line - should be hidden
        expect(middleLine).toHaveClass('scale-0', 'opacity-0')

        // Bottom line - should rotate 45deg and move up
        expect(bottomLine).toHaveClass('translate-y-[-6px]', 'rotate-45')
      })
    })

    describe('for RTL (right-to-left) languages', () => {
      it('should transform into X shape with mirrored rotation', () => {
        render(<AnimatedHamburgerIcon isOpen={true} isRTL={true} />)

        const topLine = screen.getByTestId('hamburger-top-line')
        const middleLine = screen.getByTestId('hamburger-middle-line')
        const bottomLine = screen.getByTestId('hamburger-bottom-line')

        // Top line - should rotate 45deg and move down (mirrored for RTL)
        expect(topLine).toHaveClass('translate-y-[6px]', 'rotate-45')

        // Middle line - should be hidden
        expect(middleLine).toHaveClass('scale-0', 'opacity-0')

        // Bottom line - should rotate -45deg and move up (mirrored for RTL)
        expect(bottomLine).toHaveClass('translate-y-[-6px]', 'rotate-[-45deg]')
      })
    })
  })

  describe('animation classes', () => {
    it('should have transition classes on all lines', () => {
      render(<AnimatedHamburgerIcon isOpen={false} isRTL={false} />)

      const topLine = screen.getByTestId('hamburger-top-line')
      const middleLine = screen.getByTestId('hamburger-middle-line')
      const bottomLine = screen.getByTestId('hamburger-bottom-line')

      // All lines should have transition classes for smooth animation
      expect(topLine).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
      expect(middleLine).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
      expect(bottomLine).toHaveClass('transition-all', 'duration-300', 'ease-in-out')
    })
  })

  describe('custom props', () => {
    it('should apply custom className', () => {
      render(
        <AnimatedHamburgerIcon
          isOpen={false}
          isRTL={false}
          className='custom-class h-10 w-10'
        />
      )

      const svg = screen.getByRole('img')
      expect(svg).toHaveClass('custom-class', 'h-10', 'w-10')
    })

    it('should apply custom aria-label', () => {
      render(
        <AnimatedHamburgerIcon
          isOpen={false}
          isRTL={false}
          aria-label='Custom Menu Label'
        />
      )

      const svg = screen.getByRole('img')
      expect(svg).toHaveAttribute('aria-label', 'Custom Menu Label')
    })
  })

  describe('visual state transitions', () => {
    it('should show three horizontal lines when closed', () => {
      render(<AnimatedHamburgerIcon isOpen={false} isRTL={false} />)

      const topLine = screen.getByTestId('hamburger-top-line')
      const middleLine = screen.getByTestId('hamburger-middle-line')
      const bottomLine = screen.getByTestId('hamburger-bottom-line')

      // Verify y-coordinates for hamburger (three horizontal lines)
      expect(topLine).toHaveAttribute('y1', '6')
      expect(topLine).toHaveAttribute('y2', '6')

      expect(middleLine).toHaveAttribute('y1', '12')
      expect(middleLine).toHaveAttribute('y2', '12')

      expect(bottomLine).toHaveAttribute('y1', '18')
      expect(bottomLine).toHaveAttribute('y2', '18')
    })

    it('should maintain line coordinates but change transforms when open', () => {
      render(<AnimatedHamburgerIcon isOpen={true} isRTL={false} />)

      const topLine = screen.getByTestId('hamburger-top-line')
      const bottomLine = screen.getByTestId('hamburger-bottom-line')

      // Base coordinates should remain the same
      // The X shape is created via CSS transforms, not by changing coordinates
      expect(topLine).toHaveAttribute('y1', '6')
      expect(bottomLine).toHaveAttribute('y1', '18')
    })
  })
})
