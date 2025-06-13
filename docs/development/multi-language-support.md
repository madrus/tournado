# Multi-Language Support

This document describes how multi-language (i18n) support is implemented in the project, including the supported languages, the main components, and the architecture for language detection on both the server and client to ensure a seamless, flash-free experience.

---

## 1. Supported Languages & Core Setup

We currently support four languages:

- Dutch (`nl`)
- English (`en`)
- Arabic (`ar`)
- Turkish (`tr`)

### Translation Files

Each language has its own JSON file in `app/i18n/locales/`:

```text
app/i18n/locales/en.json
app/i18n/locales/nl.json
app/i18n/locales/ar.json
app/i18n/locales/tr.json
```

Each file contains a nested structure of translation keys. Example (`en.json`):

```json
{
   "common": {
      "appName": "Tournado",
      "titles": {
         "adminPanel": "Admin Panel",
         "profile": "Profile"
      }
   },
   "admin": {
      "teams": {
         "title": "Teams Management"
      }
   }
}
```

### i18n Configuration

The i18n instance is configured in `app/i18n/config.ts`:

```ts
import { initReactI18next } from 'react-i18next'

import i18n from 'i18next'

import ar from './locales/ar.json'
import en from './locales/en.json'
import nl from './locales/nl.json'
import tr from './locales/tr.json'

export const resources = {
   en: { translation: en },
   nl: { translation: nl },
   ar: { translation: ar },
   tr: { translation: tr },
}

export function initI18n(language: string) {
   return i18n
      .createInstance()
      .use(initReactI18next)
      .init({
         resources,
         lng: language,
         fallbackLng: 'nl',
         interpolation: { escapeValue: false },
         react: { useSuspense: false },
      })
}
```

!> **Important:** Always import the i18n instance and related utilities (such as `initI18n`, `resources`, etc.) from the central `app/i18n/config.ts` file. Do **not** create or import i18n instances from different places in the codebase. Having multiple i18n instances can cause subtle bugs, including hydration mismatches, language switching issues, and inconsistent translations between server and client. Centralizing all i18n imports ensures a single source of truth and a consistent user experience.

### Language Switcher

A language switcher component allows users to change languages. Example snippet:

```tsx
// app/components/LanguageSwitcher.tsx
const languages = [
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
]

return (
  <Menu>
    {languages.map(lang => (
      <MenuItem key={lang.code} onClick={() => i18n.changeLanguage(lang.code)}>
        <span>{lang.flag}</span> {lang.name}
      </MenuItem>
    ))}
  </Menu>
)
```

### RTL (Right-to-Left) Support

RTL support is enabled for Arabic using utility functions and Tailwind classes:

```ts
// app/utils/rtlUtils.ts
export function isRTL(lang: string) {
   return lang === 'ar'
}

export function getDirection(lang: string) {
   return isRTL(lang) ? 'rtl' : 'ltr'
}
```

The root HTML element sets the `dir` attribute based on the current language.

### Setting the `dir` Property on the Top-Level HTML Tag

To ensure correct text direction (LTR for most languages, RTL for Arabic), the `dir` property is set on the top-level `<html>` tag. This is handled in `app/root.tsx`:

```tsx
// app/root.tsx
return (
  <html
    lang={language}
    dir={getDirection(language)} // 'ltr' for most, 'rtl' for Arabic
    className='h-full overflow-x-hidden'
  >
    <head>...</head>
    <body>...</body>
  </html>
)
```

The `getDirection` utility returns `'rtl'` for Arabic and `'ltr'` for all other supported languages. This ensures that the browser renders the page in the correct direction from the very first paint, which is essential for proper RTL support and a seamless user experience.

---

## 2. Language Detection: Server & Client

### Server-Side Language Detection

The server determines the user's language preference during the initial request. This is done in the root loader or a utility:

```ts
// app/root.tsx (simplified)
export const meta: MetaFunction = () => [ ... ]

export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
  const { language } = loaderData
  const i18n = initI18n(language)
  return (
    <I18nextProvider i18n={i18n}>
      {/* ... */}
    </I18nextProvider>
  )
}
```

The loader reads the language from cookies, headers, or defaults:

```ts
// app/root.tsx or app/utils/session.server.ts
export async function loader({ request }: LoaderArgs) {
  const cookieLang = getCookieLang(request)
  const headerLang = getHeaderLang(request)
  const language = cookieLang || headerLang || 'nl'
  return { language, ... }
}
```

### Client-Side Language Initialization

On the client, the i18n instance is initialized with the same language as the server, preventing mismatches and flashes:

```ts
// app/root.tsx
const i18n = initI18n(language)
<I18nextProvider i18n={i18n}>...</I18nextProvider>
```

### No Flash of Untranslated Content (FOUC)

Because the server and client both use the same detected language from the very start, the user never sees a flash of the wrong language. The `dir` attribute and RTL/LTR logic are also set server-side, so layout is always correct from the first paint.

---

## Summary

- Four languages are supported with separate JSON files.
- i18n is initialized with the correct language on both server and client.
- Language is detected server-side and passed to the client, eliminating FOUC.
- RTL support is handled via utility functions and Tailwind classes.

For more troubleshooting, see [docs/testing/troubleshooting.md](../testing/troubleshooting.md#language-flash-of-unstyledincorrect-content-fouc).
