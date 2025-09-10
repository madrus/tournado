import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { FirebaseSignIn } from '../FirebaseSignIn'

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
}))

vi.mock('~/features/firebase/client', () => ({
  auth: {},
  googleProvider: {},
}))

// Mock form submission
const mockSubmit = vi.fn()
let mockFormElement: HTMLFormElement

// Store original createElement
const originalCreateElement = document.createElement.bind(document)

// Mock document.createElement for forms only
Object.defineProperty(document, 'createElement', {
  value: vi.fn((tagName: string) => {
    if (tagName === 'form') {
      mockFormElement = {
        tagName: 'FORM',
        method: '',
        action: '',
        appendChild: vi.fn(),
        submit: mockSubmit,
      } as unknown as HTMLFormElement
      return mockFormElement
    }
    if (tagName === 'input') {
      return {
        tagName: 'INPUT',
        type: '',
        name: '',
        value: '',
      }
    }
    // Use original createElement for all other elements
    return originalCreateElement(tagName)
  }),
  writable: true,
  configurable: true,
})

// Mock appendChild only when called with our mock form
const originalAppendChild = document.body.appendChild.bind(document.body)
Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn((element: Node) => {
    if (element === mockFormElement) {
      return element
    }
    return originalAppendChild(element)
  }),
  writable: true,
  configurable: true,
})

describe('FirebaseSignIn', () => {
  let mockSignInWithPopup: Mock
  let mockGetIdToken: Mock

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSubmit.mockClear()

    // Get the mocked functions
    const { signInWithPopup } = await import('firebase/auth')
    mockSignInWithPopup = vi.mocked(signInWithPopup)
    mockGetIdToken = vi.fn()
  })

  test('renders sign-in button correctly', () => {
    render(<FirebaseSignIn />)

    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })

  test('displays loading state during authentication', async () => {
    // Mock a delayed sign-in
    mockSignInWithPopup.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<FirebaseSignIn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)

    // Should show loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  test('handles successful Google sign-in flow', async () => {
    const mockUser = {
      getIdToken: mockGetIdToken,
    }
    const mockResult = { user: mockUser }

    mockSignInWithPopup.mockResolvedValue(mockResult)
    mockGetIdToken.mockResolvedValue('mock-id-token')

    render(<FirebaseSignIn redirectTo='/custom-redirect' />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalledWith({}, {})
    })

    await waitFor(() => {
      expect(mockGetIdToken).toHaveBeenCalled()
    })

    // Should create and submit a form
    await waitFor(() => {
      expect(document.createElement).toHaveBeenCalledWith('form')
      expect(document.createElement).toHaveBeenCalledWith('input')
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  test('shows error message when authentication fails', async () => {
    const error = new Error('Authentication failed')
    mockSignInWithPopup.mockRejectedValue(error)

    render(<FirebaseSignIn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
    })

    // Button should be enabled again
    expect(button).toBeEnabled()
  })

  test('applies variants and custom className correctly', () => {
    render(<FirebaseSignIn variant='outline' size='lg' className='custom-class' />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).toHaveClass('custom-class')
  })

  test('uses default redirectTo when none provided', async () => {
    const mockUser = {
      getIdToken: mockGetIdToken,
    }
    const mockResult = { user: mockUser }

    mockSignInWithPopup.mockResolvedValue(mockResult)
    mockGetIdToken.mockResolvedValue('mock-id-token')

    render(<FirebaseSignIn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)

    // Should create form with default redirect value
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  test('handles successful form submission', async () => {
    const mockUser = {
      getIdToken: mockGetIdToken,
    }
    const mockResult = { user: mockUser }

    mockSignInWithPopup.mockResolvedValue(mockResult)
    mockGetIdToken.mockResolvedValue('mock-id-token')

    render(<FirebaseSignIn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(button)

    // Should create and submit form without client-side error
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled()
    })

    // Should not show error message
    expect(screen.queryByText('Authentication failed')).not.toBeInTheDocument()
  })
})
