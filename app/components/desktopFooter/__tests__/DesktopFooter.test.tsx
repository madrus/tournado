import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import DesktopFooter from '../DesktopFooter'

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}))

describe('DesktopFooter', () => {
	describe('Basic Rendering', () => {
		it('should render footer element', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			expect(footer).toBeInTheDocument()
		})

		it('should be hidden on mobile (hidden md:block)', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			expect(footer).toHaveClass('hidden', 'md:block')
		})
	})

	describe('Layout Structure', () => {
		it('should have correct container structure', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			const container = screen.getByTestId('footer-container')
			expect(footer).toContainElement(container)
			expect(container).toHaveClass(
				'container',
				'mx-auto',
				'grid',
				'h-14',
				'grid-cols-2',
				'px-4',
			)
		})

		it('should have two main sections in grid layout', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const container = screen.getByTestId('footer-container')
			const leftSection = screen.getByTestId('footer-left-section')
			const rightSection = screen.getByTestId('footer-right-section')

			expect(container).toContainElement(leftSection)
			expect(container).toContainElement(rightSection)

			// Left section (logo)
			expect(leftSection).toHaveClass('flex', 'items-center')

			// Right section (attribution)
			expect(rightSection).toHaveClass('flex', 'items-center', 'justify-end')
		})
	})

	describe('Logo Section', () => {
		it('should render Tournado logo link', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const logoLink = screen.getByRole('link', { name: 'Tournado' })
			expect(logoLink).toBeInTheDocument()
			expect(logoLink).toHaveAttribute('href', '/')
		})

		it('should have correct logo styling', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const logoLink = screen.getByRole('link', { name: 'Tournado' })
			expect(logoLink).toHaveClass('flex', 'items-center')

			const logoText = screen.getByText('Tournado')
			expect(logoText).toHaveClass('m-0', 'p-0', 'leading-[1]', 'font-light')
		})

		it('should render logo as a span element', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const logoText = screen.getByText('Tournado')
			expect(logoText.tagName).toBe('SPAN')
		})
	})

	describe('Attribution Section', () => {
		it('should render attribution text', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const attribution = screen.getByTestId('footer-attribution')
			expect(attribution).toBeInTheDocument()
		})

		it('should have correct attribution styling', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const attribution = screen.getByTestId('footer-attribution')
			expect(attribution).toHaveClass('m-0', 'p-0', 'leading-[1]')
			expect(attribution.tagName).toBe('SPAN')
		})

		it('should include heart emoji', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const attribution = screen.getByTestId('footer-attribution')
			expect(attribution).toHaveTextContent('♥️')
		})
	})

	describe('Accessibility', () => {
		it('should be accessible as contentinfo landmark', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			expect(footer).toBeInTheDocument()
		})

		it('should have accessible logo link', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const [logoLink] = screen.getAllByRole('link')
			expect(logoLink).toBeInTheDocument()
			expect(logoLink).toHaveAttribute('href', '/')
		})
	})

	describe('Responsive Design', () => {
		it('should be hidden on mobile screens', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			expect(footer).toHaveClass('hidden')
		})

		it('should be visible on desktop screens', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			expect(footer).toHaveClass('md:block')
		})
	})

	describe('Grid Layout', () => {
		it('should use 2-column grid layout', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const container = screen.getByTestId('footer-container')
			expect(container).toHaveClass('grid-cols-2')
		})

		it('should have fixed height', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const container = screen.getByTestId('footer-container')
			expect(container).toHaveClass('h-14')
		})

		it('should be centered with container class', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const container = screen.getByTestId('footer-container')
			expect(container).toHaveClass('container', 'mx-auto')
		})

		it('should have horizontal padding', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const container = screen.getByTestId('footer-container')
			expect(container).toHaveClass('px-4')
		})
	})

	describe('Component Structure', () => {
		it('should have correct DOM hierarchy', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			expect(footer.tagName).toBe('FOOTER')

			const container = screen.getByTestId('footer-container')
			expect(container.tagName).toBe('DIV')

			const leftSection = screen.getByTestId('footer-left-section')
			expect(leftSection.tagName).toBe('DIV')

			const rightSection = screen.getByTestId('footer-right-section')
			expect(rightSection.tagName).toBe('DIV')
		})

		it('should render all expected elements', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			// Footer element
			expect(screen.getByRole('contentinfo')).toBeInTheDocument()

			// Logo link
			expect(screen.getByRole('link', { name: 'Tournado' })).toBeInTheDocument()

			// Logo text
			expect(screen.getByText('Tournado')).toBeInTheDocument()

			// Attribution text
			expect(screen.getByTestId('footer-attribution')).toBeInTheDocument()
		})
	})

	describe('Text Content', () => {
		it('should display correct brand name', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			expect(screen.getByText('Tournado')).toBeInTheDocument()
		})

		it('should display correct attribution', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			expect(screen.getByTestId('footer-attribution')).toBeInTheDocument()
		})

		it('should not contain any additional text content', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			const textContent = footer.textContent
			expect(textContent).toBe('TournadoBuilt with ♥️ by Madrus4U')
		})
	})

	describe('CSS Classes Verification', () => {
		it('should apply all required CSS classes correctly', () => {
			render(
				<MemoryRouter>
					<DesktopFooter />
				</MemoryRouter>,
			)

			const footer = screen.getByRole('contentinfo')
			const container = screen.getByTestId('footer-container')
			const leftSection = screen.getByTestId('footer-left-section')
			const rightSection = screen.getByTestId('footer-right-section')
			const [logoLink] = screen.getAllByRole('link')
			const logoText = screen.getByText('Tournado')
			const attribution = screen.getByTestId('footer-attribution')

			// Footer classes
			expect(footer).toHaveClass('hidden', 'md:block')

			// Container classes
			expect(container).toHaveClass(
				'container',
				'mx-auto',
				'grid',
				'h-14',
				'grid-cols-2',
				'px-4',
			)

			// Left section classes
			expect(leftSection).toHaveClass('flex', 'items-center')

			// Right section classes
			expect(rightSection).toHaveClass('flex', 'items-center', 'justify-end')

			// Logo link classes
			expect(logoLink).toHaveClass('flex', 'items-center')

			// Logo text classes
			expect(logoText).toHaveClass('m-0', 'p-0', 'leading-[1]', 'font-light')

			// Attribution classes
			expect(attribution).toHaveClass('m-0', 'p-0', 'leading-[1]')
		})
	})
})
