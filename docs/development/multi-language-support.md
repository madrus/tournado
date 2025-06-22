# Multi-Language Support

This document describes how multi-language (i18n) support is implemented in the project, including the supported languages, the main components, and the architecture for language detection on both the server and client to ensure a seamless, flash-free experience.

---

## Language Switching: Cookie, Loader, and SSR/CSR Consistency

Tournado supports seamless language switching and persistence across server and client renders:

- The user's language preference is stored in a cookie (`lang`).
- On every page load, the loader reads the `lang` cookie and sets the language accordingly.
- The page component uses a `useEffect` to update the i18n language if it differs from the current one.
- This ensures a consistent language experience, even after form submissions or navigation, and works for both SSR and CSR.

**Key Implementation:**

- Loader reads the `lang` cookie and passes the language to the page.
- Page component sets i18n language from loader data on mount.

For more details on how this works in practice, see the loader and page component code in the tournaments and teams admin features.

---

## 1. Supported Languages & Core Setup

We currently support four languages:

- Dutch (`nl`) - Default language
- English (`en`)
- Arabic (`ar`) - RTL support with Amiri font
- Turkish (`tr`)

### Language Constants

Supported languages are defined in `app/lib/lib.constants.ts`:

```ts
export const SUPPORTED_LANGUAGES = [
   { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
   { code: 'en', name: 'English', flag: '🇬🇧' },
   { code: 'ar', name: 'العربية', flag: '🇲🇦' },
   { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const
```

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

### Language Switching Architecture

Language switching is implemented through a mobile-first approach with the following components:

#### useLanguageSwitcher Hook

A custom hook handles language changes in `app/hooks/useLanguageSwitcher.ts`:

```tsx
import { useTranslation } from 'react-i18next'

export function useLanguageSwitcher(): (language: string) => void {
   const { i18n } = useTranslation()

   return (language: string): void => {
      i18n.changeLanguage(language)
   }
}
```

#### Language Persistence

Language persistence is handled reactively in `app/root.tsx`:

```tsx
// Reactive language persistence
useEffect(() => {
   if (typeof window !== 'undefined') {
      // Write to localStorage
      localStorage.setItem('language', language)

      // Write to cookie for server-side detection
      document.cookie = `language=${language}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
   }
}, [language])
```

This approach ensures:

- **Single responsibility**: Hook only handles i18n changes
- **Automatic persistence**: Root component reactively handles localStorage and cookies
- **Server-side detection**: Cookies enable proper SSR language detection
- **Hydration safety**: No side effects during module loading

For more details on the persistence architecture, see [State Management Documentation](state-management.md).

#### UserMenu Integration

Language switching is integrated into the UserMenu component as a submenu:

```tsx
// app/components/UserMenu.tsx
const changeLanguage = useLanguageSwitcher()

const languageSubMenu = SUPPORTED_LANGUAGES.map(lang => ({
   label: lang.name,
   customIcon: lang.flag,
   onClick: () => changeLanguage(lang.code),
   active: currentLanguage === lang.code,
}))

const menuItems = [
   // ... other menu items
   {
      label: t('common.language'),
      icon: 'language',
      subMenu: languageSubMenu,
   },
]
```

### Font Management System

The application uses a sophisticated font management system to handle Arabic and Latin scripts:

#### Font Configuration

Two Google Fonts are loaded in `app/root.tsx`:

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap"
  rel="stylesheet"
/>
```

#### CSS Font System

The font system uses a mobile-first approach with automatic font switching:

```css
/* Default to Arabic font when Arabic is active */
.text-arabic {
   font-family: 'Amiri', system-ui, sans-serif;
   font-size: 1.25em; /* 25% larger for Arabic readability */
}

/* Latin content within Arabic context */
.text-arabic .latin-content,
.text-arabic [lang='en'],
.text-arabic .text-latin-content {
   font-family: 'Inter', system-ui, sans-serif !important;
   font-size: 0.8em !important; /* Compensate for 25% Arabic scaling */
}

/* Default Latin font for non-Arabic languages */
.text-latin {
   font-family: 'Inter', system-ui, sans-serif;
}
```

#### Content Marking Strategy

The system uses a **minority marking** approach:

- **Arabic mode**: Default to Amiri font, mark Latin content with `.latin-content`
- **Latin modes**: Default to Inter font, no special marking needed

Latin content is marked in key areas:

- App name "Tournado"
- Form input fields (except translated labels)
- Language menu options (except Arabic)
- Footer attribution text

#### Large Title Handling

For large titles (like the homepage "Tournado"), special CSS rules prevent the Arabic scaling compensation from making them too small:

```css
/* App name title specific styling - override latin-content scaling for large titles */
.text-arabic h1.app-name.latin-content {
   font-size: 2.25rem !important; /* text-4xl equivalent in rem to bypass all em scaling */
}

@media (min-width: 640px) {
   .text-arabic h1.app-name.latin-content {
      font-size: 3.75rem !important; /* text-6xl equivalent in rem for sm: breakpoint */
   }
}
```

**Key principles for large titles:**

- Use `rem` units instead of `em` to bypass parent scaling
- Match exact Tailwind class values (text-4xl = 2.25rem, text-6xl = 3.75rem)
- Apply responsive breakpoints to maintain Tailwind's responsive behavior
- Use specific selectors to target only large titles, not regular text

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
    className={`h-full overflow-x-hidden ${isRTL(language) ? 'text-arabic' : 'text-latin'}`}
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

## 3. Mobile-First Design Decisions

### Language Switching UX

The language switching implementation follows a mobile-first approach:

- **Primary Interface**: Language switching is available through the UserMenu
- **Mobile Optimization**: Touch-friendly submenu with proper spacing
- **Desktop Enhancement**: Hover states and collision detection
- **Accessibility**: Keyboard navigation and screen reader support

### Design Rationale

Language switching was consolidated into the UserMenu for several reasons:

1. **Mobile Usage**: Majority of users access the app on mobile devices
2. **Frequency**: Language switching is not a core, frequent action
3. **Space Efficiency**: Reduces header clutter on small screens
4. **Consistency**: Single location for all user preferences and actions

---

## Summary

- Four languages are supported with separate JSON files and constants
- Language switching uses a custom hook with reactive persistence
- Font management automatically handles Arabic (Amiri) and Latin (Inter) scripts
- Mobile-first design consolidates language switching into UserMenu
- i18n is initialized with the correct language on both server and client
- Language is detected server-side and passed to the client, eliminating FOUC
- RTL support is handled via utility functions and Tailwind classes

For more troubleshooting, see [docs/testing/troubleshooting.md](../testing/troubleshooting.md#language-flash-of-unstyledincorrect-content-fouc).
