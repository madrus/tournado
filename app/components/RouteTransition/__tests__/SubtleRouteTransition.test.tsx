import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from '~/hooks/useReducedMotion'
import { SubtleRouteTransition } from '../SubtleRouteTransition'

// Mock useReducedMotion hook
vi.mock('~/hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

describe('SubtleRouteTransition', () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false)
  })

  describe('Rendering', () => {
    it('should render children via Outlet', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition />}>
              <Route path='/' element={<div>Test Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition className='custom-class' />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have animate-slideIn class when motion is not reduced', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.animate-slideIn')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Reduced Motion', () => {
    it('should not apply animation when reduced motion is preferred', () => {
      vi.mocked(useReducedMotion).mockReturnValue(true)

      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.animate-slideIn')
      expect(wrapper).not.toBeInTheDocument()
    })
  })

  describe('Animation Duration', () => {
    it('should use default duration of 300ms', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.animate-slideIn') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      const styleAttr = wrapper.getAttribute('style')
      expect(styleAttr).toContain('animation-duration: 300ms')
    })

    it('should accept custom duration', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition duration={500} />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.animate-slideIn') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      const styleAttr = wrapper.getAttribute('style')
      expect(styleAttr).toContain('animation-duration: 500ms')
    })

    it('should have ease-out timing function', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.animate-slideIn') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      const styleAttr = wrapper.getAttribute('style')
      expect(styleAttr).toContain('animation-timing-function: ease-out')
    })

    it('should have both fill mode', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<SubtleRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.animate-slideIn') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      const styleAttr = wrapper.getAttribute('style')
      expect(styleAttr).toContain('animation-fill-mode: both')
    })
  })

  describe('Props Type Safety', () => {
    it('should accept all valid TransitionWithDurationProps', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route
              element={<SubtleRouteTransition duration={400} className='test-class' />}
            >
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
