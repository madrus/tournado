import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { NoTransition } from '../NoTransition'

describe('NoTransition', () => {
  describe('Rendering', () => {
    it('should render children via Outlet', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<NoTransition />}>
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
            <Route element={<NoTransition className='custom-class' />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })

    it('should not apply any transition classes', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<NoTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('transition')
      expect(wrapper.className).not.toContain('animate')
    })
  })

  describe('Props Type Safety', () => {
    it('should accept all valid BaseTransitionProps', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<NoTransition className='test-class' />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should work with minimal props', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<NoTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
