declare module '*.png' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

export type ENV = {
  MODE: 'test' | 'production' | 'development'
  APP_ENV?: 'production' | 'staging' | 'development'
  VITE_FIREBASE_API_KEY?: string
  VITE_FIREBASE_AUTH_DOMAIN?: string
  VITE_FIREBASE_PROJECT_ID?: string
  VITE_FIREBASE_STORAGE_BUCKET?: string
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  VITE_FIREBASE_APP_ID?: string
  PLAYWRIGHT?: string
}

declare global {
  interface Window {
    ENV?: ENV
    __SSR_LANGUAGE__?: string
    __SSR_THEME__?: string
    playwrightTest?: boolean
  }

  // Global ENV for server-side use
  var ENV: ENV
}

export {}
