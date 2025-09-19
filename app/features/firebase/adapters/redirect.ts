/* eslint-disable no-console */
import { isE2EClient, isUnitTestRuntime } from '../utils/env'

export async function submitAuthCallback(
  idToken: string,
  redirectTo?: string
): Promise<void> {
  if (isE2EClient()) {
    // In specific auth tests with Firebase mocks, handle authentication specially
    // since MSW can't intercept form submissions and the mock token won't verify server-side
    if (
      window.playwrightTest &&
      window.localStorage.getItem('bypassAuthCallback') === 'true'
    ) {
      console.log(
        'E2E test: Using fetch for auth callback with mock token to:',
        redirectTo || '/'
      )

      // Send the mock token to server via fetch instead of form submission
      const formData = new FormData()
      formData.append('idToken', idToken)
      formData.append('redirectTo', redirectTo || '/')

      fetch('/auth/callback', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'x-test-bypass': 'true',
        },
      })
        .then(async response => {
          console.log(
            'E2E auth callback response:',
            response.status,
            response.statusText
          )
          if (!response.ok) {
            const text = await response.text()
            console.log('E2E auth callback response body:', text)
          }
          // After server authenticates, redirect to the intended destination
          window.location.href = redirectTo || '/'
        })
        .catch(error => {
          console.error('E2E auth callback error:', error)
          // Fall back to client-side redirect even if server auth fails
          window.location.href = redirectTo || '/'
        })
      return
    }

    // Use a real form post to ensure Set-Cookie + redirect semantics work reliably in Playwright
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/auth/callback'
    const idTokenInput = document.createElement('input')
    idTokenInput.type = 'hidden'
    idTokenInput.name = 'idToken'
    idTokenInput.value = idToken
    form.appendChild(idTokenInput)
    const redirectInput = document.createElement('input')
    redirectInput.type = 'hidden'
    redirectInput.name = 'redirectTo'
    redirectInput.value = redirectTo || '/'
    form.appendChild(redirectInput)
    document.body.appendChild(form)
    form.submit()
    return
  }

  if (isUnitTestRuntime()) {
    const formData = new FormData()
    formData.append('idToken', idToken)
    formData.append('redirectTo', redirectTo || '/')
    await fetch('/auth/callback', { method: 'POST', body: formData })
    window.location.href = redirectTo || '/'
    return
  }

  // Production-safe cookie + redirect semantics via form submit
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = '/auth/callback'
  const idTokenInput = document.createElement('input')
  idTokenInput.type = 'hidden'
  idTokenInput.name = 'idToken'
  idTokenInput.value = idToken
  form.appendChild(idTokenInput)
  const redirectInput = document.createElement('input')
  redirectInput.type = 'hidden'
  redirectInput.name = 'redirectTo'
  redirectInput.value = redirectTo || '/'
  form.appendChild(redirectInput)
  document.body.appendChild(form)
  form.submit()
}

export async function postSignOut(): Promise<void> {
  const init: RequestInit = { method: 'POST' }
  if (!isUnitTestRuntime() && !isE2EClient()) {
    init.credentials = 'same-origin'
  }
  await fetch('/auth/signout', init)
  window.location.href = '/auth/signin'
}
