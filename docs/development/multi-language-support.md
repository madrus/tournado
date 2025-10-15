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

We currently support five languages:

- Dutch (`nl`) - Default language
- English (`en`)
- French (`fr`)
- Arabic (`ar`) - RTL support with Amiri font
- Turkish (`tr`)

### Language Constants

Supported languages are defined in `app/i18n/config.ts`:

```ts
export const SUPPORTED_LANGUAGES = [
   { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
   { code: 'en', name: 'English', flag: '🇬🇧' },
   { code: 'fr', name: 'Français', flag: '🇫🇷' },
   { code: 'ar', name: 'العربية', flag: '🇲🇦' },
   { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const
```

### Translation Files

Each language has its own JSON file in `app/i18n/locales/`:

```text
app/i18n/locales/en.json
app/i18n/locales/nl.json
app/i18n/locales/fr.json
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
import fr from './locales/fr.json'
import nl from './locales/nl.json'
import tr from './locales/tr.json'

export const resources = {
   en: { translation: en },
   nl: { translation: nl },
   fr: { translation: fr },
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
- **French is LTR and uses the Latin font**

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

RTL support is enabled for Arabic using utility functions and Tailwind classes. The system provides comprehensive helpers for RTL-aware layouts, interactions, and typography.

#### Core RTL Utilities

```ts
// app/utils/rtlUtils.ts

// Basic RTL detection
export function isRTL(lang: string) {
   return lang === 'ar'
}

export function getDirection(lang: string) {
   return isRTL(lang) ? 'rtl' : 'ltr'
}

// Typography helpers
export function getTypographyClass(languageCode: string): string {
   return isRTL(languageCode) ? 'arabic-text' : ''
}

export function getLatinTextClass(languageCode: string): string {
   return isRTL(languageCode) ? 'latin-text' : ''
}

// NEW: Latin font family for numbers and Latin content in RTL
export function getLatinFontFamily(languageCode: string): string {
   return isRTL(languageCode) ? '!font-sans' : ''
}
```

The root HTML element sets the `dir` attribute based on the current language.

#### Latin Font in RTL Context

When displaying Latin content (names, numbers, dates) in Arabic mode, use `getLatinFontFamily()` to ensure proper font rendering:

```tsx
import { getLatinFontFamily } from '~/utils/rtlUtils'

function Component() {
   const { i18n } = useTranslation()
   const latinFontClass = getLatinFontFamily(i18n.language)

   return (
      <div>
         {/* Numbers and Latin text use system font in Arabic mode */}
         <span className={latinFontClass}>42</span>
         <span className={latinFontClass}>Tournament Name</span>
      </div>
   )
}
```

**Why `!font-sans` instead of hardcoded fonts:**

- Uses Tailwind's `font-sans` utility class for consistency
- Respects your configured default font
- Centralized configuration - change once, apply everywhere
- `!important` override to supersede Arabic font cascade

**When to use:**

- ✅ Numbers and dates in RTL context
- ✅ Tournament/team names (Latin script content)
- ✅ Locations and proper nouns
- ❌ Arabic text content (use default font)
- ❌ Translated UI labels (use default font)

#### RTL-Aware Interactive Components

For touch interactions like swipeable rows, the system provides direction-aware helpers:

```ts
// Direction multiplier for swipe calculations
export type SwipeRowConfig = {
   directionMultiplier: 1 | -1 // 1 for LTR, -1 for RTL
}

export function getSwipeRowConfig(languageCode: string): SwipeRowConfig {
   return {
      directionMultiplier: isRTL(languageCode) ? -1 : 1,
   }
}
```

**Usage in swipeable components:**

```tsx
import { getSwipeRowConfig } from '~/utils/rtlUtils'

function SwipeableRow() {
   const { i18n } = useTranslation()
   const { directionMultiplier } = getSwipeRowConfig(i18n.language)

   const handleTouchMove = (event: TouchEvent) => {
      const deltaX = (currentTouch.clientX - startX) * directionMultiplier
      // LTR: left swipe = negative deltaX
      // RTL: right swipe = negative deltaX (inverted by multiplier)
   }

   const transform = `translateX(${position * directionMultiplier}px)`
   // LTR: negative position moves left
   // RTL: negative position moves right (inverted by multiplier)
}
```

**CSS Logical Properties:**

Always use logical properties for RTL-aware layout:

```tsx
// ✅ Correct: Logical properties (auto-adapt to direction)
<div className="ps-3 pe-2 ms-4 me-1 text-end">

// ❌ Incorrect: Physical properties (fixed direction)
<div className="pl-3 pr-2 ml-4 mr-1 text-right">
```

**Logical Property Reference:**

- `ps-*` / `pe-*` = padding-inline-start / padding-inline-end
- `ms-*` / `me-*` = margin-inline-start / margin-inline-end
- `text-start` / `text-end` = text alignment (adapts to direction)
- `start-*` / `end-*` = positioning (adapts to direction)

#### RTL Typography Helpers

Additional typography helpers for specific use cases:

```ts
// Layout helpers
export function getChipClasses(languageCode: string) {
   // Returns RTL-aware chip container classes with flex-row-reverse
}

export function getMenuClasses(languageCode: string) {
   // Returns RTL-aware menu spacing and alignment
}

export function getDropdownProps(languageCode: string) {
   // Returns Radix UI dropdown positioning for RTL
}

export function getTypographyClasses(languageCode: string) {
   // Returns typography-specific classes for titles, headings, etc.
}
```

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

### Core Features

- **Five languages** supported with separate JSON files and constants (Dutch, English, French, Arabic, Turkish)
- **Language switching** uses custom hook with reactive persistence in localStorage and cookies
- **Font management** automatically handles Arabic (Amiri) and Latin (Inter) scripts with proper scaling
- **Mobile-first design** consolidates language switching into UserMenu for optimal mobile UX

### i18n Architecture

- **Server-side detection** with client-side initialization prevents FOUC
- **Centralized i18n instance** in `app/i18n/config.ts` ensures consistency
- **Cookie-based persistence** enables proper SSR language detection
- **Reactive language updates** handled automatically in root component

### RTL Support

- **Comprehensive RTL helpers** in `app/utils/rtlUtils.ts` for layout and interactions
- **Direction multiplier pattern** for touch interactions (swipeable rows, gestures)
- **Logical CSS properties** (`ps-*`, `ms-*`, `text-end`) for automatic RTL adaptation
- **Latin font helper** (`getLatinFontFamily`) for numbers and Latin content in Arabic mode
- **Typography utilities** for dropdowns, menus, chips, and complex layouts

### Best Practices

- ✅ Always use `getLatinFontFamily()` for Latin content in RTL context (numbers, dates, names)
- ✅ Use logical properties (`ps-*`, `ms-*`) instead of physical (`pl-*`, `ml-*`)
- ✅ Use `!font-sans` via helper for centralized font configuration
- ✅ Multiply touch deltas and transforms by `directionMultiplier` for RTL-aware interactions
- ✅ Import i18n utilities only from central `app/i18n/config.ts`
- ❌ Don't hardcode fonts - use Tailwind utility classes
- ❌ Don't use physical directional properties in new components
- ❌ Don't create multiple i18n instances

For more troubleshooting, see [docs/testing/troubleshooting.md](../testing/troubleshooting.md#language-flash-of-unstyledincorrect-content-fouc).
