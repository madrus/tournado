import { isE2EClient, isUnitTestRuntime } from '../utils/env'

export async function submitAuthCallback(
  idToken: string,
  redirectTo: string
): Promise<void> {
  if (isE2EClient()) {
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
    formData.append('redirectTo', redirectTo)
    await fetch('/auth/callback', { method: 'POST', body: formData })
    window.location.href = redirectTo
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
