import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RouteTransition } from '../RouteTransition'

// Mock useLocation to control location.key
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
}
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useLocation: vi.fn(() => mockLocation),
  }
})

describe('RouteTransition', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  describe('Rendering', () => {
    it('should render children via Outlet', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<RouteTransition />}>
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
            <Route element={<RouteTransition className='custom-class' />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have transition-opacity class', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<RouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.transition-opacity')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Opacity Transitions', () => {
    it('should use default minOpacity of 0.6 during transition', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<RouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.transition-opacity') as HTMLElement
      expect(wrapper.style.opacity).toBe('0.6')
    })

    it('should use custom minOpacity during transition', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<RouteTransition minOpacity={0.3} />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.transition-opacity') as HTMLElement
      expect(wrapper.style.opacity).toBe('0.3')
    })
  })

  describe('Duration', () => {
    it('should use default duration of 300ms', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<RouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.transition-opacity')
      expect(wrapper).toBeInTheDocument()
      expect((wrapper as HTMLElement)?.style.transitionDuration).toBe('300ms')
    })

    it('should accept custom duration prop', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<RouteTransition duration={500} />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      // Component should render without errors
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Props Type Safety', () => {
    it('should accept all valid OpacityTransitionProps', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route
              element={
                <RouteTransition
                  duration={400}
                  className='test-class'
                  minOpacity={0.5}
                />
              }
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
