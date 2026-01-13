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

We currently support six languages:

- Dutch (`nl`) - Default language
- English (`en`)
- German (`de`)
- French (`fr`)
- Arabic (`ar`) - RTL support with Amiri font
- Turkish (`tr`)

### Language Constants

Supported languages are defined in `app/i18n/config.ts`:

```ts
export const SUPPORTED_LANGUAGES = [
	{ code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
	{ code: 'en', name: 'English', flag: '🇬🇧' },
	{ code: 'de', name: 'Deutsch', flag: '🇩🇪' },
	{ code: 'fr', name: 'Français', flag: '🇫🇷' },
	{ code: 'ar', name: 'العربية', flag: '🇲🇦' },
	{ code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const
```

### Translation Files

Each language has its own JSON file in `app/i18n/locales/`:

```text
app/i18n/locales/nl.json
app/i18n/locales/en.json
app/i18n/locales/de.json
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
import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import nl from './locales/nl.json'
import tr from './locales/tr.json'

export const resources = {
	nl: { translation: nl },
	en: { translation: en },
	de: { translation: de },
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

### VS Code i18n Ally Extension Configuration

For developers using VS Code, the **i18n Ally** extension provides inline translation previews, missing key detection, and quick navigation between locale files. The configuration is split across multiple files to ensure proper functionality.

#### 1. Workspace Settings (`.vscode/settings.json`)

Already configured in the project:

```json
{
	"i18n-ally.localesPaths": ["app/i18n/locales"]
}
```

#### 2. VS Code Workspace File (`tournado.code-workspace`)

If using a VS Code workspace file, add:

```json
{
	"settings": {
		"i18n-ally.sourceLanguage": "nl"
	}
}
```

#### 3. i18n Configuration File (`.i18nrc.jsonc`)

Already configured in the project:

```jsonc
{
	"annotationInPlace": true,
	"enabledFrameworks": ["react-i18next"],
	"enabledParsers": ["json"],
	"extract.autoDetect": true,
	"keepFulfilled": true,
	"keystyle": "nested",
	"namespace": false,
	"pathMatcher": "{locale}.json",
	"preferredDelimiter": ".",
	"projectType": "react-i18next",
	"sortKeys": true,
	"sourceLanguage": "nl",
	"targetLanguages": ["en", "ar", "de", "fr", "tr"],
}
```

#### 4. User Settings (Global)

**⚠️ Required:** Add these settings to your personal VS Code User Settings:

1. Open Command Palette: `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Preferences: Open User Settings (JSON)"
3. Add the following configuration:

```json
{
	"i18n-ally.dirStructure": "dir",
	"i18n-ally.displayLanguage": "en",
	"i18n-ally.localesPaths": ["app/i18n/locales"],
	"i18n-ally.namespace": false,
	"i18n-ally.pathMatcher": "{locale}.json"
}
```

**Key configuration notes:**

- `dirStructure: "dir"` - Treats each locale file as a separate directory-based structure
- `displayLanguage: "en"` - Shows English translations inline (can be set to "nl" for Dutch)
- `namespace: false` - Disables namespace detection (our namespaces are programmatic, not in JSON)
- `localesPaths` - Must point to `app/i18n/locales` (project-relative path)
- `pathMatcher` - Matches files like `en.json`, `nl.json`, etc.

After adding user settings, reload VS Code (`Cmd+Shift+P` → "Developer: Reload Window") to activate i18n Ally.

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

## Language Hydration: SSR to Client Flow

The application uses a three-phase architecture to ensure seamless language switching without hydration mismatches or flash of untranslated content (FOUC).

#### Phase 1: Server-Side Rendering (SSR)

On the initial page load, the server reads the user's language preference from cookies:

```tsx
// app/root.tsx - loader function
export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
  // Read 'lang' cookie from request
  const cookieHeader = request.headers.get('Cookie') || ''
  const langMatch = cookieHeader.match(/lang=([^;]+)/)

  // Validate language
  const rawLanguage = langMatch ? langMatch[1] : undefined
  const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(l => l.code)
  const language = supportedLanguageCodes.includes(rawLanguage as Language)
    ? (rawLanguage as Language)
    : 'nl'

  return { language, ... }
}
```

The server passes this language to the `Document` component, which sets it on the `<html>` tag:

```tsx
// app/root.tsx - Document component
const Document = ({ children, language, theme }: DocumentProps) => {
	// Use server values for SSR, store values after hydration
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	const currentLanguage = isHydrated ? storeLanguage : language

	return (
		<html lang={currentLanguage} dir={getDirection(currentLanguage)}>
			{/* ... */}
		</html>
	)
}
```

#### Phase 2: Hydration

When the client-side JavaScript loads, the Zustand store rehydrates from localStorage, but the App component uses hydration-safe `effectiveLanguage` to match SSR:

```tsx
// app/root.tsx - App component
export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
   const { language: serverLanguage, theme: serverTheme } = loaderData

   // CRITICAL: Rehydrate store FIRST, before accessing store values
   useAuthStoreHydration()
   useSettingsStoreHydration()

   const { setLanguage, language: storeLanguage } = useSettingsStore()
   const [isHydrated, setIsHydrated] = useState(false)

   // Sync store with server language on mount
   useEffect(() => {
      setLanguage(serverLanguage)
   }, [serverLanguage, setLanguage])

   useEffect(() => {
      setIsHydrated(true)
   }, [])

   // Use server values until hydrated, then store values (prevents mismatch)
   const effectiveLanguage = isHydrated ? storeLanguage : serverLanguage

   // ... i18n and other logic ...

   return (
      <Document language={effectiveLanguage} theme={effectiveTheme}>
         <AppLayout i18n={i18n} language={effectiveLanguage} ...>
            {/* App content */}
         </AppLayout>
      </Document>
   )
}
```

The `useSettingsStoreHydration()` hook ensures the store properly rehydrates:

```tsx
// app/stores/useSettingsStore.ts
export const useSettingsStoreHydration = (): void => {
	useEffect(() => {
		if (isBrowser) {
			useSettingsStore.persist.rehydrate()
		}
	}, [])
}
```

**Key Configuration:**

```tsx
// app/stores/useSettingsStore.ts
export const useSettingsStore = create<StoreState & Actions>()(
	devtools(
		persist(
			// ... state and actions
			{
				name: 'settings-storage',
				storage: isBrowser
					? createJSONStorage(() => localStorage)
					: createJSONStorage(createServerSideStorage),
				skipHydration: !isBrowser, // Skip on server
				partialize: (state) => (isBrowser ? state : {}), // Only persist on client
			},
		),
	),
)
```

#### Phase 3: Client-Side Reactivity

After hydration, the Zustand store becomes the single source of truth, but hooks like `useLanguageDirection` and `useLanguageSwitcher` use hydration-safe fallbacks (direct cookie read until `isHydrated`) to ensure the first client render matches SSR exactly, preventing FOUC:

- Hooks fallback to cookie-based language during hydration.
- Components render with correct RTL state from the first paint.

```tsx
// Example from useLanguageDirection.ts
export function useLanguageDirection(): LanguageDirection {
	const [isHydrated, setIsHydrated] = useState(false)
	const currentLanguage = useSettingsStore((state) => state.language)

	useEffect(() => {
		setIsHydrated(true)
	}, [])

	// Direct cookie read for accuracy until hydrated
	const getCookieLang = (): Language => {
		if (typeof document === 'undefined') return 'nl'
		const match = document.cookie.match(/lang=([^;]+)/)
		const raw = match ? match[1] : null
		if (!raw) return 'nl'
		// Normalize Arabic variants to 'ar' (e.g., 'ar-SA' -> 'ar')
		const normalized = raw.startsWith('ar') ? 'ar' : raw
		// Validate against supported (include 'ar' explicitly)
		const supported = ['nl', 'en', 'de', 'fr', 'tr', 'ar']
		return supported.includes(normalized) ? (normalized as Language) : 'nl'
	}

	const effectiveLanguage = isHydrated ? currentLanguage : getCookieLang()

	return useMemo(
		() => ({
			direction: getDirection(effectiveLanguage),
			// ... other values
		}),
		[effectiveLanguage],
	)
}
```

When `setLanguage()` is called:

1. **Updates Zustand store** → triggers React re-renders
2. **Writes cookie** → ensures SSR uses correct language on next page load
3. **Writes localStorage** → persists preference across sessions

```tsx
// app/stores/useSettingsStore.ts
setLanguage: (language) => {
	// Persist to both localStorage and cookies
	if (isBrowser) {
		document.cookie = `lang=${language}; path=/; max-age=31536000`
	}
	const isRTL = language.split('-')[0] === 'ar'
	set({ language, isRTL }, false, 'setLanguage')
}
```

#### Preventing Hydration Mismatches

To prevent hydration mismatches, components use a special pattern for reactive state:

```tsx
// CORRECT: Hydration-safe pattern in subcomponents
const { direction } = useLanguageDirection() // Uses effectiveLanguage from hook (cookie until hydrated)

// WRONG: Direct store access (causes mismatch)
const isRTL = useSettingsStore((state) => state.isRTL) // Sees default 'nl' during hydration
```

This pattern ensures:

- **Server/First render**: Uses `serverLanguage` (from cookie)
- **After hydration**: Uses `storeLanguage` (from localStorage/cookie)
- **No mismatch**: Both render the same HTML initially

**Example from AppBar.tsx:**

```tsx
// app/components/AppBar.tsx
subMenu: SUPPORTED_LANGUAGES.map((lang) => ({
	label: lang.name,
	customIcon: lang.flag,
	onClick: () => switchLanguage(lang.code),
	// Hydration-safe active state (uses effectiveLanguage from hook)
	active: lang.code === currentLanguage,
}))
```

#### Why Both Cookie AND localStorage?

The dual persistence strategy serves different purposes:

- **Cookie (`lang`)**:
  - Read by server on every request
  - Enables correct SSR with no FOUC
  - Survives browser refresh

- **localStorage (`settings-storage`)**:
  - Persists entire settings object
  - Faster client-side access
  - Includes theme, isRTL, and other preferences

This ensures the language is correct from the very first server render, with no flash or layout shift.

#### UserMenu Integration

Language switching is integrated into the UserMenu component as a submenu:

```tsx
// app/components/UserMenu.tsx
const changeLanguage = useLanguageSwitcher()

const languageSubMenu = SUPPORTED_LANGUAGES.map((lang) => ({
	label: lang.name,
	customIcon: lang.flag,
	onClick: () => changeLanguage(lang.code),
	active: currentLanguage === lang.code, // currentLanguage from hydration-safe hook
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

// Basic RTL detection (now handles variants like 'ar-SA' via startsWith('ar'))
export function isRTL(lang: string) {
	return String(lang).startsWith('ar')
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

// Latin font family for numbers and Latin content in RTL
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

#### Element Order Reversal with `rtl:order-*`

The codebase uses CSS `order` properties to reverse visual element order in RTL layouts without changing the DOM structure. This is the preferred pattern for buttons, tabs, and inline components with icons.

**Two-Element Pattern: Use `rtl:order-last` for simple swaps**

When you have exactly **2 elements** (e.g., icon + label), use `rtl:order-last` on one element:

```tsx
// Button with icon + text (2 elements)
<button className='inline-flex items-center gap-2'>
	<IconComponent className='h-5 w-5 rtl:order-last' />
	<span>Label Text</span>
</button>

// LTR: icon(0) → label(0) = visual: [Icon] [Text]
// RTL: label(0) → icon(9999) = visual: [Text] [Icon]
```

**Implementation in ActionButton/ActionLinkButton:**

```tsx
// app/components/buttons/ActionButton.tsx
const iconElement = rawIcon ? (
	iconNeedsCircle ? (
		<span
			className={cn(iconCircleVariants({ size, color }), 'rtl:order-last')}
			aria-hidden
		>
			{rawIcon}
		</span>
	) : (
		<span className='icon-spacing rtl:order-last' aria-hidden>
			{rawIcon}
		</span>
	)
) : null

return (
	<button className={buttonClasses}>
		{iconElement}
		{children}
	</button>
)
```

**Three-or-More-Element Pattern: Use explicit numeric order values**

When you have **3+ elements** (e.g., icon + label + badge), you must use explicit `rtl:order-N` classes on **each element**:

```tsx
// Competition page tabs with icon, label, and badge (3 elements)
<button className='flex items-center gap-2'>
	{/* LTR: icon(0) → label(0) → badge(0) = visual: icon, label, badge
      RTL: icon(1) → label(2) → badge(3) = visual: badge, label, icon */}
	<tab.icon className='h-6 w-6 rtl:order-1' />
	<span className='rtl:order-2'>{t(tab.nameKey)}</span>
	{tab.disabled ? <span className='latin-text ... rtl:order-3'>Soon</span> : null}
</button>

// LTR: [Icon] [Label] [Badge]
// RTL: [Badge] [Label] [Icon]
```

**Why explicit order numbers for 3+ elements:**

- With 2 elements, `rtl:order-last` (9999) on one element is enough to swap positions
- With 3+ elements, you need to control the exact sequence of all elements
- There is **no generic CSS-only solution** that automatically reverses N elements
- Using `rtl:flex-row-reverse` on the container would give you LTR order in RTL (incorrect)

**Why `rtl:order-*` instead of `rtl:flex-row-reverse`:**

- ✅ Granular control - only specific elements reverse, not entire container
- ✅ No need to modify parent flex direction
- ✅ Works with any number of elements (when using numeric order values)
- ✅ Maintains semantic HTML structure
- ❌ `flex-row-reverse` reverses visual order, giving LTR layout in RTL mode (incorrect)

**Required Safelist Entries:**

Add RTL order classes to `app/styles/safelist.txt`:

```text
# RTL Support - Flex Order
rtl:order-last
rtl:order-first
rtl:order-1
rtl:order-2
rtl:order-3
# Add more numeric orders as needed (rtl:order-4, rtl:order-5, etc.)
```

**Required CSS Rules:**

Add explicit CSS rules to `app/styles/tailwind_rtl_typography.css`:

```css
[dir='rtl'] .rtl\:order-last {
	order: 9999;
}

[dir='rtl'] .rtl\:order-first {
	order: -9999;
}

[dir='rtl'] .rtl\:order-1 {
	order: 1;
}

[dir='rtl'] .rtl\:order-2 {
	order: 2;
}

[dir='rtl'] .rtl\:order-3 {
	order: 3;
}
/* Add more numeric orders as needed */
```

#### Radix UI Components and RTL

Radix UI components (Select, Dropdown, Dialog, etc.) require explicit `dir` attribute on their elements for proper RTL text alignment and layout. Simply relying on the `html` element's `dir="rtl"` is not sufficient.

**The Problem:**

Radix components default to `dir="ltr"` even when the page is in RTL mode, causing:

- Text aligned to the left instead of right in Arabic mode
- Icons and content in wrong visual order

**The Solution:**

Use `useLanguageDirection` to get the RTL state and set `dir` explicitly on Radix trigger and content elements:

```tsx
// app/components/inputs/ComboField.tsx
import { useLanguageDirection } from '~/hooks/useLanguageDirection'

export const ComboField = forwardRef<HTMLButtonElement, ComboFieldProps>(
  ({ ... }, selectRef) => {
    const { direction } = useLanguageDirection()  // Hydration-safe RTL detection

    return (
      <Select.Root ...>
        <Select.Trigger dir={direction} ...>
          <div className='flex-1 truncate text-start'>
            <Select.Value placeholder={placeholder} />
          </div>
          <Select.Icon>...</Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content dir={direction} ...>
            {/* Dropdown options */}
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    )
  }
)
```

**Key Points:**

- ✅ Apply `dir={direction}` to both `Select.Trigger` and `Select.Content`
- ✅ Use `text-start` on value containers for proper text alignment
- ✅ Remove `rtl:order-*` classes from icons when using `dir` on the parent
- ✅ The browser's native RTL handling works correctly with `dir="rtl"`
- ❌ Don't rely on HTML `dir="rtl"` alone - Radix overrides it
- ❌ Don't use `getDirection()` without the hydration-safe hook

**Applies to these Radix components:**

- Select (ComboField, DropdownField)
- DropdownMenu
- Dialog
- Popover
- Tooltip (when containing interactive content)

#### Panel Background Gradient Mirroring

Panel backgrounds use directional gradients that must mirror in RTL layouts to maintain proper visual hierarchy and readability. The gradient direction changes to create a true mirror effect, while color stops remain the same.

**LTR vs RTL Gradient Behavior:**

```css
/* LTR: Gradient flows from top-left to bottom-right */
.panel-fuchsia-bg {
	background: linear-gradient(
		to bottom right,
		var(--color-fuchsia-50),
		var(--color-fuchsia-100),
		var(--color-fuchsia-50)
	);
}

/* RTL: Gradient flows from top-right to bottom-left (mirrored) */
html[dir='rtl'] .panel-fuchsia-bg {
	background: linear-gradient(
		to bottom left,
		/* ← Changed direction, NOT color order */ var(--color-fuchsia-50),
		var(--color-fuchsia-100),
		var(--color-fuchsia-50)
	);
}
```

**Critical CSS Selector Pattern:**

When the `dir="rtl"` attribute is on the `<html>` element itself, use **no space** between selectors:

```css
/* ✅ Correct: Matches <html dir="rtl"> */
html[dir="rtl"] .panel-fuchsia-bg { ... }
html.dark[dir="rtl"] .panel-fuchsia-bg { ... }

/* ❌ Wrong: Descendant selector - won't match */
html [dir="rtl"] .panel-fuchsia-bg { ... }
html.dark [dir="rtl"] .panel-fuchsia-bg { ... }
```

**Implementation Pattern (app/styles/tailwind_panel.css):**

```css
/* Light mode - LTR */
.panel-fuchsia-bg {
	background: linear-gradient(
		to bottom right,
		var(--color-fuchsia-50),
		var(--color-fuchsia-100),
		var(--color-fuchsia-50)
	);
}

/* Light mode - RTL */
html[dir='rtl'] .panel-fuchsia-bg {
	background: linear-gradient(
		to bottom left,
		var(--color-fuchsia-50),
		var(--color-fuchsia-100),
		var(--color-fuchsia-50)
	);
}

/* Dark mode - LTR */
html.dark .panel-fuchsia-bg {
	background: linear-gradient(
		to bottom right,
		var(--color-fuchsia-950),
		var(--color-fuchsia-800),
		var(--color-fuchsia-950)
	);
}

/* Dark mode - RTL */
html.dark[dir='rtl'] .panel-fuchsia-bg {
	background: linear-gradient(
		to bottom left,
		var(--color-fuchsia-950),
		var(--color-fuchsia-800),
		var(--color-fuchsia-950)
	);
}
```

**Key Principles:**

- ✅ Change gradient **direction** (`to bottom right` ↔ `to bottom left`)
- ✅ Keep color **stops** in same order
- ✅ Use attribute selector without space: `html[dir="rtl"]`
- ✅ Apply to all theme variants (light mode, dark mode)
- ❌ Don't reverse color order - this creates wrong visual effect
- ❌ Don't use descendant selector with space: `html [dir="rtl"]`

**Why Direction Change Creates Mirror:**

- **LTR gradient**: Starts at top-left (lightest), flows to bottom-right (darkest)
- **RTL gradient**: Starts at top-right (lightest), flows to bottom-left (darkest)
- Visual effect: Light source appears to come from reading-direction side
- Readability: Maintains proper contrast for text regardless of direction

**Border Radius Adaptation:**

When panels have rounded corners positioned differently in RTL:

```tsx
// Panel in Competition layout
<Panel
	color='fuchsia'
	className='rounded-tl-none rtl:rounded-tl-xl rtl:rounded-tr-none border-t shadow-lg'
>
	<Outlet />
</Panel>
```

**Safelist Requirements:**

Add RTL border radius classes to `app/styles/safelist.txt`:

```text
# RTL Support - Border Radius
rtl:rounded-tl-none
rtl:rounded-tr-none
rtl:rounded-tl-lg
rtl:rounded-tr-lg
rtl:rounded-tl-xl
rtl:rounded-tr-xl
```

#### Menu Line-Height Compensation

When displaying menu items with mixed font sizes (Arabic at 1.25rem vs Latin at 1rem), line-height compensation ensures consistent visual height and vertical alignment.

**The Problem:**

Arabic text uses Amiri font at 1.25rem (25% larger than Latin), which creates taller menu items. Using the same line-height for both creates inconsistent spacing:

```tsx
// ❌ Without compensation: Inconsistent heights
<button className="leading-normal"> {/* line-height: 1.5 */}
  <span className="arabic-text">العربية</span> {/* 1.25rem × 1.5 = 1.875rem total */}
</button>

<button className="leading-normal"> {/* line-height: 1.5 */}
  <span className="latin-text">English</span> {/* 1rem × 1.5 = 1.5rem total */}
</button>
```

**The Solution:**

The `getMenuItemLineHeight()` utility applies tighter line-height to RTL menus, compensating for the larger font size:

```tsx
// app/utils/rtlUtils.ts
export const getMenuItemLineHeight = (languageOverride?: Language | string): string => {
	const isRTL = resolveIsRTL(languageOverride)

	// In RTL (Arabic): use tighter line-height to compensate for 25% larger font
	// 1.5 / 1.25 = 1.2 (maintains same visual height as LTR's leading-normal)
	// In LTR: use normal line-height (1.5)
	return isRTL ? 'leading-tight' : 'leading-normal'
}
```

**Implementation Pattern:**

Apply the line-height class to the **button container**, not individual text spans. Combine with fixed height and vertical centering:

```tsx
// app/components/UserMenu.tsx
import { getMenuItemLineHeight } from '~/utils/rtlUtils'
;<button
	className={cn(
		'h-10 w-full items-center px-3 py-2 focus:outline-none',
		getMenuItemLineHeight(), // ← Applied to container, no parameters
		'hover:bg-neutral',
		menuClasses.menuItem,
	)}
>
	<span className={menuClasses.iconContainer}>{subItem.customIcon}</span>
	<span className={cn(menuClasses.textContainer, subItem.className || '')}>
		{subItem.label}
	</span>
</button>
```

**Key Principles:**

1. **Apply to container**: Use `getMenuItemLineHeight()` on the button/link, not individual text spans
2. **No parameters needed**: The function reads current UI language from store to apply same compensation to ALL menu items
3. **Combine with fixed height**: Use `h-10` (40px minimum) to ensure consistent heights despite font-size differences
4. **Vertical centering**: Add `items-center` to button and `self-center` to text spans for proper alignment
5. **Icon padding adjustments**: RTL icons may need extra padding (`pt-2` vs `pt-0.5`) to align with compensated text

**Why This Works:**

- **LTR mode**: 1rem × 1.5 (leading-normal) = 1.5rem total height
- **RTL mode**: 1.25rem × 1.2 (leading-tight) = 1.5rem total height

Both modes achieve the same visual height, preventing layout shifts and inconsistent spacing in menus.

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

## 2. Language State Management Flow

This section documents how language state flows through the application, from the initial server request to client-side navigation.

### Complete Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                    1. Initial Page Load (SSR)                   │
├─────────────────────────────────────────────────────────────────┤
│  Cookie: lang=ar                                                 │
│         ↓                                                        │
│  Loader reads cookie → returns { language: 'ar' }                │
│         ↓                                                        │
│  Document renders <html lang="ar" dir="rtl">                     │
│  AppLayout creates i18n instance with 'ar'                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              2. Client Hydration (JavaScript Loads)              │
├─────────────────────────────────────────────────────────────────┤
│  useSettingsStoreHydration() runs                                │
│         ↓                                                        │
│  Store rehydrates from localStorage                              │
│         ↓                                                        │
│  setLanguage(serverLanguage) syncs store with server             │
│         ↓                                                        │
│  effectiveLanguage = isHydrated ? storeLanguage : serverLanguage │
│         ↓                                                        │
│  Hooks (useLanguageDirection) use cookie fallback until hydrated │
│  Components render with effectiveLanguage (matches SSR)          │
│  isHydrated = true → switch to store values (no change)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               3. User Switches Language (Client-Side)            │
├─────────────────────────────────────────────────────────────────┤
│  User clicks language in menu → switchLanguage('nl')             │
│         ↓                                                        │
│  Store updates: { language: 'nl', isRTL: false }                 │
│         ↓                                                        │
│  Cookie written: lang=nl                                         │
│  localStorage written: settings-storage                          │
│         ↓                                                        │
│  React re-renders with new language                              │
│  i18n instance updates to 'nl'                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  4. Next Navigation/Refresh                      │
├─────────────────────────────────────────────────────────────────┤
│  Server reads cookie: lang=nl                                    │
│  Cycle repeats from step 1 with 'nl'                             │
└─────────────────────────────────────────────────────────────────┘
```

### Server-Side Language Detection

The root loader in `app/root.tsx` reads the `lang` cookie on every server request:

```tsx
// app/root.tsx
export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
	// Read 'lang' cookie from request headers
	const cookieHeader = request.headers.get('Cookie') || ''
	const langMatch = cookieHeader.match(/lang=([^;]+)/)

	// Validate against supported languages
	const rawLanguage = langMatch ? langMatch[1] : undefined
	const supportedLanguageCodes = SUPPORTED_LANGUAGES.map((l) => l.code)
	const language = supportedLanguageCodes.includes(rawLanguage as Language)
		? (rawLanguage as Language)
		: 'nl' // Default to Dutch

	return {
		authenticated: !!user,
		username: user?.email ?? '',
		user,
		ENV: getEnv(),
		language, // ← Passed to client
		theme,
		tournaments,
	}
}
```

### Client-Side Hydration

The `App` component receives the server language and initializes the store:

```tsx
// app/root.tsx
export default function App({ loaderData }: Route.ComponentProps): JSX.Element {
  const { language: serverLanguage, theme: serverTheme } = loaderData

  // CRITICAL: Rehydrate store FIRST
  useAuthStoreHydration()
  useSettingsStoreHydration()

  const { setLanguage, language: storeLanguage } = useSettingsStore()
  const [isHydrated, setIsHydrated] = useState(false)

  // Sync store with server language on mount
  useEffect(() => {
    setLanguage(serverLanguage)
  }, [serverLanguage, setLanguage])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Use server values until hydrated, then store values (prevents mismatch)
  const effectiveLanguage = isHydrated ? storeLanguage : serverLanguage

  // ... i18n and other logic ...

  return (
    <Document language={effectiveLanguage} theme={effectiveTheme}>
      <AppLayout i18n={i18n} language={effectiveLanguage} ...>
        {/* App content */}
      </AppLayout>
    </Document>
  )
}
```

### Preventing FOUC (Flash of Untranslated Content)

The application prevents FOUC through several mechanisms:

1. **Server-side language detection** ensures the correct language from first render
2. **Hydration-safe patterns** prevent mismatches between server and client HTML
3. **Cookie + localStorage dual persistence** maintains consistency across page loads
4. **Synchronous i18n initialization** before any content renders
5. **Hooks fallback to cookie** until fully hydrated, ensuring components match SSR classes (e.g., RTL direction, logical 'text-start' alignment in panels)

Because the server reads the cookie and renders with the correct language, and the client hydrates with the same language (via effectiveLanguage and hook fallbacks), there is **no flash or layout shift** on initial load.

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
- **Hydration-safe hooks** (e.g., `useLanguageDirection`) fallback to cookie until store sync, ensuring no mismatch

### RTL Support

- **Comprehensive RTL helpers** in `app/utils/rtlUtils.ts` for layout and interactions
- **Element order reversal** using `rtl:order-last` on icons in buttons, tabs, and inline components
- **Panel gradient mirroring** changes gradient direction (`to bottom right` ↔ `to bottom left`) while keeping color stops the same
- **Direction multiplier pattern** for touch interactions (swipeable rows, gestures)
- **Logical CSS properties** (`ps-*`, `ms-*`, `text-start`) for automatic RTL adaptation (e.g., panels align right in Arabic via 'text-start' with dir=rtl)
- **Latin font helper** (`getLatinFontFamily`) for numbers and Latin content in Arabic mode
- **Typography utilities** for dropdowns, menus, chips, and complex layouts
- **Attribute selector pattern** for RTL CSS: `html[dir="rtl"]` (no space) when `dir` is on `<html>` element
- **Radix UI components** require explicit `dir` prop on trigger/content elements for proper RTL behavior (Select, Dropdown, etc.)

### Best Practices

#### Layout & Order

- ✅ Use `rtl:order-last` on icons in buttons/tabs for element order reversal
- ✅ Use logical properties (`ps-*`, `ms-*`, `text-start`) instead of physical (`pl-*`, `ml-*`, `text-left`)
- ✅ Mirror gradient directions in RTL, keep color stops the same
- ✅ Use `html[dir="rtl"]` (no space) for attribute selectors
- ✅ Add RTL classes to safelist when using dynamic/CVA classes

#### Typography & Fonts

- ✅ Use `.latin-text` class with `font-size: inherit` for Latin content in RTL (respects parent size)
- ✅ Always use `getLatinFontFamily()` for Latin content in RTL context (numbers, dates, names)
- ✅ Use `!font-sans` via helper for centralized font configuration

#### Interactions & State

- ✅ Multiply touch deltas and transforms by `directionMultiplier` for RTL-aware interactions
- ✅ Import i18n utilities only from central `app/i18n/config.ts`
- ✅ Use hydration-safe hooks (e.g., `useLanguageDirection`) that fallback to cookie until store sync

#### Anti-patterns

- ❌ Don't use `rtl:flex-row-reverse` on containers - use `rtl:order-*` on specific elements instead
- ❌ Don't reverse gradient color order - only change direction
- ❌ Don't use fixed `font-size` in `.latin-text` - use `inherit` to respect Tailwind utilities
- ❌ Don't hardcode fonts - use Tailwind utility classes
- ❌ Don't use physical directional properties in new components
- ❌ Don't create multiple i18n instances
- ❌ Don't use descendant selector `html [dir="rtl"]` when `dir` is on `<html>` itself

For more troubleshooting, see [docs/testing/troubleshooting.md](../testing/troubleshooting.md#language-flash-of-unstyledincorrect-content-fouc).
