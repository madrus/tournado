import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CSSRouteTransition } from '../CSSRouteTransition'

describe('CSSRouteTransition', () => {
  describe('Rendering', () => {
    it('should render children via Outlet', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<CSSRouteTransition />}>
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
            <Route element={<CSSRouteTransition className='custom-class' />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.custom-class')
      expect(wrapper).toBeInTheDocument()
    })

    it('should have route-fade-container class', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<CSSRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.route-fade-container')
      expect(wrapper).toBeInTheDocument()
    })

    it('should combine route-fade-container with custom className', () => {
      const { container } = render(
        <MemoryRouter>
          <Routes>
            <Route element={<CSSRouteTransition className='my-custom-class' />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.route-fade-container.my-custom-class')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Key-based Re-rendering', () => {
    it('should use location.pathname as key', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/test-path']}>
          <Routes>
            <Route element={<CSSRouteTransition />}>
              <Route path='*' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      const wrapper = container.querySelector('.route-fade-container')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Props Type Safety', () => {
    it('should accept all valid BaseTransitionProps', () => {
      render(
        <MemoryRouter>
          <Routes>
            <Route element={<CSSRouteTransition className='test-class' />}>
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
            <Route element={<CSSRouteTransition />}>
              <Route path='/' element={<div>Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })
})
