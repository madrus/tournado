# Implementing Right-to-Left (RTL) Support in a Tailwind CSS React Application

Building a truly international web application requires more than just translating text—it requires adapting the entire user interface to different text directions. This article documents the key changes needed to transform a Left-to-Right (LTR) only application into one that seamlessly supports both LTR and Right-to-Left (RTL) languages like Arabic.

## Table of Contents

1. [Understanding the Challenge](#understanding-the-challenge)
2. [Setting Up the Foundation](#setting-up-the-foundation)
3. [HTML Direction Attribute](#html-direction-attribute)
4. [Language Persistence with Cookies](#language-persistence-with-cookies)
5. [Tailwind CSS Logical Properties](#tailwind-css-logical-properties)
6. [Component Adaptations](#component-adaptations)
7. [Typography Considerations](#typography-considerations)
8. [Advanced Layout Patterns](#advanced-layout-patterns)
9. [Testing and Validation](#testing-and-validation)

## Understanding the Challenge

When adding RTL support to an existing LTR application, you need to consider:

- **Text direction**: Content flows from right to left
- **Layout mirroring**: UI elements should mirror horizontally
- **Icon placement**: Icons and interactive elements need repositioning
- **Typography**: Different fonts and sizing may be needed for optimal readability
- **Form inputs**: Input fields and labels need proper alignment

_[Screenshot placeholder: Side-by-side comparison of LTR vs RTL layout showing the mirrored interface]_

## Setting Up the Foundation

### 1. RTL Utility Functions

The first step is creating utility functions to detect RTL languages and provide direction-aware helpers:

```typescript
// app/utils/rtlUtils.ts
export const isRTL = (languageCode: string): boolean => ['ar'].includes(languageCode)

export const getDirection = (languageCode: string): 'ltr' | 'rtl' =>
   isRTL(languageCode) ? 'rtl' : 'ltr'

export const getTypographyClass = (languageCode: string): string =>
   isRTL(languageCode) ? 'text-arabic' : ''
```

**Key Benefits:**

- Centralized language detection
- Type-safe direction handling
- Easy to extend for additional RTL languages

## HTML Direction Attribute

### 2. Setting the `dir` Attribute on the HTML Tag

The `dir` attribute must be set on the root HTML element to enable browser-level RTL support:

```diff
// app/root.tsx
return (
  <html
    lang={language}
+   dir={getDirection(language)}
    className='h-full overflow-x-hidden'
  >
    <head>...</head>
    <body>...</body>
  </html>
)
```

### 3. Dynamic Direction Updates

For single-page applications, the direction needs to update when users switch languages. The recommended approach is to use React's declarative rendering rather than direct DOM manipulation:

```typescript
// app/root.tsx - Declarative approach (recommended)
type DocumentProps = {
  children: React.ReactNode
  language: string
}

const Document = ({ children, language }: DocumentProps) => {
  const { i18n: i18nInstance } = useTranslation()

  // Use the current language from i18n instance, falling back to initial language
  const currentLanguage = i18nInstance.language || language
  const direction = getDirection(currentLanguage)
  const typographyClass = getTypographyClass(currentLanguage)

  // Save language preference to cookie when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && i18nInstance.language) {
      document.cookie = `lang=${i18nInstance.language}; path=/; max-age=31536000`
    }
  }, [i18nInstance.language])

  return (
    <html
      lang={currentLanguage}
      dir={direction}
      className='h-full overflow-x-hidden'
    >
      <head>...</head>
      <body
        className={cn(
          'bg-background text-foreground flex h-full flex-col',
          typographyClass
        )}
      >
        {children}
      </body>
    </html>
  )
}
```

_[Screenshot placeholder: Developer tools showing the dir="rtl" attribute on the HTML element]_

## Language Persistence with Cookies

### 4. Cookie-Based Language Persistence

To provide a seamless user experience, language preferences should persist across browser sessions. Here's how to implement cookie-based language persistence:

```typescript
// app/utils/cookieUtils.ts
export const LANGUAGE_COOKIE_NAME = 'lang'
export const COOKIE_MAX_AGE = 31536000 // 1 year in seconds

export function setLanguageCookie(language: string): void {
   if (typeof document !== 'undefined') {
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
   }
}

export function getLanguageCookie(): string | null {
   if (typeof document === 'undefined') return null

   const match = document.cookie.match(
      new RegExp(`(^| )${LANGUAGE_COOKIE_NAME}=([^;]+)`)
   )
   return match ? match[2] : null
}

// Server-side cookie reading for SSR
export function getLanguageFromRequest(request: Request): string {
   const cookieHeader = request.headers.get('Cookie') || ''
   const langMatch = cookieHeader.match(/lang=([^;]+)/)
   return langMatch ? langMatch[1] : 'nl' // Default to Dutch
}
```

### 5. Server-Side Language Detection

In your Remix loader, read the language preference from cookies:

```typescript
// app/root.tsx - Loader function
export async function loader({ request }: Route.LoaderArgs): Promise<LoaderData> {
   const user = await getUser(request)
   const language = getLanguageFromRequest(request)

   return {
      authenticated: !!user,
      username: user?.email ?? '',
      user,
      ENV: getEnv(),
      language, // Pass language to client
   }
}
```

### 6. Client-Side Cookie Updates

Update cookies when users change language preferences:

```typescript
// app/root.tsx - Document component
const Document = ({ children, language }: DocumentProps) => {
  const { i18n: i18nInstance } = useTranslation()

  const currentLanguage = i18nInstance.language || language
  const direction = getDirection(currentLanguage)
  const typographyClass = getTypographyClass(currentLanguage)

  // Save language preference to cookie when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && i18nInstance.language) {
      setLanguageCookie(i18nInstance.language)
    }
  }, [i18nInstance.language])

  return (
    <html lang={currentLanguage} dir={direction}>
      {/* ... */}
    </html>
  )
}
```

### 7. Language Switcher with Cookie Support

Update your language switcher to persist changes:

```typescript
// app/components/LanguageSwitcher.tsx
import { setLanguageCookie } from '~/utils/cookieUtils'

export function LanguageSwitcher(): JSX.Element {
  const { i18n } = useTranslation()

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value

    // Update i18n instance
    i18n.changeLanguage(newLanguage)

    // Persist to cookie (handled automatically by useEffect in Document)
    // The useEffect in Document component will save the cookie
  }

  return (
    <select
      value={i18n.language}
      onChange={handleLanguageChange}
      className='cursor-pointer appearance-none bg-transparent py-1 ps-2 pe-8'
    >
      <option value='nl'>Nederlands</option>
      <option value='en'>English</option>
      <option value='ar'>العربية</option>
    </select>
  )
}
```

### 8. Cookie Security Considerations

For production applications, consider these security enhancements:

```typescript
// app/utils/cookieUtils.ts - Production-ready version
export function setLanguageCookie(language: string): void {
   if (typeof document !== 'undefined') {
      const isProduction = process.env.NODE_ENV === 'production'
      const secure = isProduction ? '; Secure' : ''

      document.cookie = [
         `${LANGUAGE_COOKIE_NAME}=${language}`,
         'path=/',
         `max-age=${COOKIE_MAX_AGE}`,
         'SameSite=Lax',
         secure,
      ].join('; ')
   }
}
```

**Cookie Attributes Explained:**

- `path=/` - Cookie available across entire site
- `max-age=31536000` - Cookie expires in 1 year
- `SameSite=Lax` - CSRF protection while allowing normal navigation
- `Secure` - Only send over HTTPS in production

### 9. Fallback Strategy

Implement a robust fallback strategy for language detection:

```typescript
// app/utils/languageDetection.ts
export function detectUserLanguage(request?: Request): string {
   // 1. Try server-side cookie (SSR)
   if (request) {
      const cookieLanguage = getLanguageFromRequest(request)
      if (cookieLanguage) return cookieLanguage
   }

   // 2. Try client-side cookie
   if (typeof window !== 'undefined') {
      const cookieLanguage = getLanguageCookie()
      if (cookieLanguage) return cookieLanguage
   }

   // 3. Try browser language preference
   if (typeof navigator !== 'undefined') {
      const browserLanguage = navigator.language.split('-')[0]
      const supportedLanguages = ['nl', 'en', 'ar']
      if (supportedLanguages.includes(browserLanguage)) {
         return browserLanguage
      }
   }

   // 4. Default fallback
   return 'nl'
}
```

**Benefits of Cookie-Based Persistence:**

- ✅ Works across browser sessions
- ✅ Available on server-side for SSR
- ✅ No JavaScript required for initial load
- ✅ Lightweight and fast
- ✅ Works with disabled localStorage

_[Screenshot placeholder: Browser developer tools showing the language cookie being set and persisted]_

## Tailwind CSS Logical Properties

### 10. Replacing Physical Properties with Logical Properties

The most significant change is moving from physical properties (left/right) to logical properties (start/end):

**Before (Physical Properties):**

```css
/* ❌ Physical properties - don't adapt to text direction */
.ml-4     /* margin-left */
.mr-2     /* margin-right */
.pl-3     /* padding-left */
.pr-6     /* padding-right */
.text-left
```

**After (Logical Properties):**

```css
/* ✅ Logical properties - automatically adapt to text direction */
.ms-4     /* margin-inline-start */
.me-2     /* margin-inline-end */
.ps-3     /* padding-inline-start */
.pe-6     /* padding-inline-end */
.text-start
```

### 11. Language Switcher Example

Here's a practical example showing the conversion of a language switcher component:

```diff
// app/components/LanguageSwitcher.tsx
export function LanguageSwitcher(): JSX.Element {
  return (
    <div className='relative inline-block text-start'>
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
-       className='cursor-pointer appearance-none bg-transparent py-1 pl-2 pr-8 text-white focus:outline-none'
+       className='cursor-pointer appearance-none bg-transparent py-1 ps-2 pe-8 text-white focus:outline-none'
      >
        {/* options */}
      </select>

-     <div className='pointer-events-none absolute right-0 top-0 flex h-full items-center pr-2'>
+     <div className='pointer-events-none absolute end-0 top-0 flex h-full items-center pe-2'>
        {/* dropdown arrow */}
      </div>
    </div>
  )
}
```

_[Screenshot placeholder: Language switcher showing proper arrow positioning in both LTR and RTL modes]_

## Component Adaptations

### 12. Form Input Components

Form components need special attention for proper RTL layout:

```diff
// app/components/inputs/ComboField.tsx
<select
  className={cn(
-   'h-12 w-full appearance-none rounded-md border-2 border-emerald-700/30 bg-white px-0 pl-3 pr-6 text-lg leading-6',
+   'h-12 w-full appearance-none rounded-md border-2 border-emerald-700/30 bg-white px-0 ps-3 pe-6 text-lg leading-6',
  )}
>
  {/* options */}
</select>
- <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
+ <span className='pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2'>
```

### 13. Button Components with Icons

Buttons with icons need special handling to maintain proper visual hierarchy:

```typescript
// app/components/buttons/DeleteButton.tsx
export function DeleteButton({ onClick, label }: DeleteButtonProps): JSX.Element {
  const { i18n } = useTranslation()
  const rtl = isRTL(i18n.language)

  return (
    <button
      type='button'
      onClick={onClick}
      className={`inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 ${rtl ? 'flex-row-reverse gap-3' : ''}`}
    >
      {rtl ? (
        <>
          <TrashIcon className='h-4 w-4' />
          <span>{label}</span>
        </>
      ) : (
        <>
          <TrashIcon className='mr-2 -ml-1 h-4 w-4' />
          {label}
        </>
      )}
    </button>
  )
}
```

**Key Changes:**

- Added `flex-row-reverse` for RTL to change visual order
- Conditional rendering to handle icon spacing differently
- Used logical spacing properties

_[Screenshot placeholder: Delete button showing icon placement in LTR vs RTL layout]_

### 14. Advanced Component Helpers

For more complex components, create reusable helper functions:

```typescript
// app/utils/rtlUtils.ts - Advanced helpers

// Chip/Tag component layout helper
export function getChipClasses(languageCode: string): { container: string } {
   const isRtl = isRTL(languageCode)

   return {
      // ps-3 = more space where content starts
      // pe-2 = less space where delete button is placed
      container: isRtl
         ? 'ps-3 pe-2 gap-2 flex-row-reverse'
         : 'ps-3 pe-2 gap-2 flex-row',
   }
}

// Dropdown positioning helper
export function getDropdownProps(languageCode: string): DropdownProps {
   const isRtl = isRTL(languageCode)

   return {
      align: isRtl ? 'end' : 'start',
      side: 'bottom',
      sideOffset: 8,
      alignOffset: isRtl ? 8 : -8,
   }
}
```

## Typography Considerations

### 15. Custom CSS for Arabic Typography and Mixed Content

Arabic text often requires special typography treatment for optimal readability, especially when mixed with Latin text:

```css
/* app/styles/tailwind.css */

/* Script-aware typography system */
/* Global Arabic sizing - applied to body when app language is Arabic */
.text-arabic {
   font-size: 1.2em; /* Make all text 20% larger for Arabic readability */
}

/* Latin text - always normal size regardless of context */
.text-latin {
   font-size: 1em; /* Normal size */
}

/* Form inputs in RTL */
[dir='rtl'] input,
[dir='rtl'] textarea,
[dir='rtl'] select {
   text-align: right;
}
```

#### Practical Examples of Mixed Content

**Example 1: Arabic Text Within English Documentation**

When you have Arabic text within a primarily English interface, you need to ensure proper sizing:

```typescript
// Help documentation or user instructions with Arabic phrases
<div className="documentation-section">
  <p className="text-slate-700">
    To create a tournament in Arabic, click "Create Tournament" and the interface
    will display <span className="text-arabic">إنشاء بطولة جديدة</span> (Create New Tournament).
    The Arabic text maintains proper readability.
  </p>

    <p className="text-slate-700">
    The welcome message will show: <span className="text-arabic">أهلاً وسهلاً</span>
    (Welcome) instead of the default "Welcome" text.
  </p>
</div>
```

**Example 2: Technical Terms in Arabic Interface**

When the interface is in Arabic but contains technical terms or app names:

```typescript
// Arabic interface with Latin technical terms
<div className="notification bg-blue-50 p-4" dir="rtl">
  <p className="text-arabic">
    تم حفظ الفريق بنجاح في قاعدة البيانات. يمكنك الآن الوصول إليه عبر
    <span className="text-latin">MyApp API v2.1</span>
    أو من خلال لوحة التحكم.
  </p>
  {/*
    Translation: "The team was saved successfully to the database.
    You can now access it via MyApp API v2.1 or through the control panel."
  */}
</div>
```

**Before/After Comparison:**

```diff
<!-- Before: Inconsistent sizing -->
<p>
  Welcome message: إنشاء بطولة جديدة appears too small
</p>

<!-- After: Proper sizing with .text-arabic -->
<p>
  Welcome message: <span class="text-arabic">إنشاء بطولة جديدة</span>
  appears at optimal size
</p>
<!-- Note: "إنشاء بطولة جديدة" means "Create New Tournament" in Arabic -->
```

### 16. Typography Helper Functions

```typescript
// app/utils/rtlUtils.ts - Typography helpers

export const getLatinTextClass = (languageCode: string): string =>
   isRTL(languageCode) ? 'text-latin' : ''

export const getArabicTextClass = (): string => 'text-arabic'

export function getTypographyClasses(languageCode: string): TypographyClasses {
   const isRtl = isRTL(languageCode)

   return {
      title: isRtl ? 'leading-tight' : 'leading-normal',
      heading: isRtl ? 'tracking-normal' : 'tracking-tight',
      textAlign: isRtl ? 'text-right' : 'text-left',
      centerAlign: 'text-center', // Keep center for hero sections
      mixedContent: isRtl ? 'leading-snug text-center' : 'leading-normal text-center',
      appName: 'leading-normal text-center font-bold', // App name stays Latin
   }
}
```

_[Screenshot placeholder: Typography comparison showing Arabic text sizing vs Latin text in both contexts]_

## Advanced Layout Patterns

### 17. Sidebar and Navigation Layouts

Complex layouts require additional considerations:

```diff
// app/components/SidebarLayout.tsx
<aside
  className={`fixed top-0 z-30 h-full w-64 transform bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
-   isSidebarOpen ? 'fixed left-0 shadow-lg' : '-left-full md:left-0'
+   isSidebarOpen ? 'fixed start-0 shadow-lg' : '-start-full md:start-0'
  }`}
>

<button
  className={`fixed bottom-4 z-20 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl md:hidden ${
-   'right-4'
+   'end-4'
  }`}
>
```

### 18. React Hook for RTL Support

Create a custom hook to simplify RTL logic in components:

```typescript
// app/utils/rtlUtils.ts - React hook
export function useRTLDropdown(): {
   dropdownProps: DropdownProps
   menuClasses: MenuClasses
   isRTL: boolean
} {
   const { i18n } = useTranslation()

   return {
      dropdownProps: getDropdownProps(i18n.language),
      menuClasses: getMenuClasses(i18n.language),
      isRTL: isRTL(i18n.language),
   }
}
```

Usage in components:

```typescript
export function MyDropdown() {
  const { dropdownProps, menuClasses, isRTL } = useRTLDropdown()

  return (
    <DropdownMenu.Content {...dropdownProps}>
      <div className={menuClasses.spacing}>
        {/* content */}
      </div>
    </DropdownMenu.Content>
  )
}
```

## Testing and Validation

### 19. Testing Strategy

Implement comprehensive testing for RTL support:

```typescript
// app/components/buttons/__tests__/DeleteButton.test.tsx
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { initI18n } from '~/i18n/config'

test('renders with proper RTL classes in Arabic', () => {
  const i18n = initI18n('ar')

  render(
    <I18nextProvider i18n={i18n}>
      <DeleteButton onClick={() => {}} label="Delete" />
    </I18nextProvider>
  )

  const button = screen.getByRole('button')
  // Check that the button has flex-row-reverse for RTL
  expect(button.className).toMatch(/flex-row-reverse/)
})
```

### 20. Visual Testing Checklist

Create a checklist for manual testing:

- [ ] Text flows in the correct direction
- [ ] Icons appear on the correct side
- [ ] Form inputs align properly
- [ ] Dropdown menus position correctly
- [ ] Navigation elements mirror appropriately
- [ ] Scrollbars appear on the correct side
- [ ] Modal dialogs center properly

_[Screenshot placeholder: Testing checklist showing both LTR and RTL versions of key UI components]_

## Key Benefits of This Approach

1. **Automatic Adaptation**: Logical properties automatically handle most layout changes
2. **Maintainable Code**: Centralized RTL logic reduces code duplication
3. **Performance**: No runtime style calculations needed
4. **Accessibility**: Proper `dir` attribute enables screen reader support
5. **Scalability**: Easy to add support for additional RTL languages

## Common Pitfalls to Avoid

- **Don't** mix physical and logical properties in the same component
- **Don't** forget to update the HTML `dir` attribute dynamically
- **Don't** assume all text will automatically align correctly
- **Don't** hardcode icon positions without considering RTL
- **Do** test with actual RTL content, not placeholder text

## Conclusion

Implementing RTL support requires systematic changes across your application, but with Tailwind CSS's logical properties and a well-structured approach, you can create truly bidirectional layouts that feel natural to users regardless of their language preference.

The key is to:

1. Start with a solid foundation of utility functions
2. Replace physical properties with logical properties systematically
3. Handle complex components with conditional logic
4. Test thoroughly with real content

This approach ensures your application provides an excellent user experience for both LTR and RTL language speakers, opening your product to a truly global audience.

_[Screenshot placeholder: Final comparison showing a complete page layout in both LTR and RTL modes, demonstrating the symmetric beauty of proper bidirectional design]_

---

**Next Steps**: Consider implementing additional RTL languages like Hebrew or Persian, and explore advanced typography features for better text rendering in different scripts.

## 3. Root Layout Setup

Update your root layout to support RTL:

**File: `app/root.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDirection, getTypographyClass } from '~/lib/utils/rtlUtils'

export default function Root() {
  const { i18n } = useTranslation()
  const language = i18n.language

  // Use useState for reactive values that depend on language
  const [direction, setDirection] = useState(getDirection(language))
  const [typographyClass, setTypographyClass] = useState(getTypographyClass(language))

  // Update direction, typography, and cookie when language changes
  useEffect(() => {
    setDirection(getDirection(language))
    setTypographyClass(getTypographyClass(language))
    document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=${60 * 60 * 24 * 365}`
  }, [language])

  return (
    <html
      lang={language}
      dir={direction}
      className='h-full overflow-x-hidden'
    >
      <body className={`h-full ${typographyClass}`}>
        {/* Your app content */}
      </body>
    </html>
  )
}
```

## 16. RTL Context Menus and Dropdowns

Context menus, dropdowns, and language switchers require special RTL handling for proper positioning and layout.

### Key RTL Menu Requirements

In Arabic (RTL), menus should:

1. **Anchor to the right** instead of left
2. **Icons on the right** side of text
3. **Text flows right-to-left**
4. **Animations/transitions** respect RTL direction

### RTL Menu Utilities

**File: `app/utils/rtlUtils.ts`**

```typescript
// Enhanced menu classes for RTL support
export type MenuClasses = {
   spacing: string
   alignment: string
   menuItem: string // Flex direction for menu items
   iconContainer: string // Icon positioning and alignment
   textContainer: string // Text alignment
}

export function getMenuClasses(languageCode: string): MenuClasses {
   const isRtl = isRTL(languageCode)

   return {
      spacing: isRtl ? 'me-4' : 'ms-4',
      alignment: isRtl ? 'end-0' : 'start-0',
      // Menu item layout - icons on correct side for RTL
      menuItem: isRtl ? 'flex-row-reverse' : 'flex-row',
      // Icon container positioning
      iconContainer: isRtl
         ? 'flex w-8 items-center justify-end ps-2 pe-0 text-end' // Icon on right in RTL
         : 'flex w-8 items-center justify-start ps-0 pe-2 text-start', // Icon on left in LTR
      // Text container alignment
      textContainer: isRtl ? 'text-right' : 'text-left',
   }
}

// Language switcher specific classes
export type LanguageSwitcherClasses = {
   container: string
   select: string
   arrow: string
}

export function getLanguageSwitcherClasses(
   languageCode: string
): LanguageSwitcherClasses {
   const isRtl = isRTL(languageCode)

   return {
      container: isRtl ? 'text-end' : 'text-start',
      // Padding: more space on text side, less on arrow side
      select: isRtl
         ? 'ps-8 pe-2' // More padding on right (text side), less on left (arrow side)
         : 'ps-2 pe-8', // More padding on left (text side), less on right (arrow side)
      // Arrow positioning
      arrow: isRtl ? 'start-0 ps-2' : 'end-0 pe-2',
   }
}

// React hooks for easy usage
export function useRTLDropdown() {
   const { i18n } = useTranslation()
   return {
      dropdownProps: getDropdownProps(i18n.language),
      menuClasses: getMenuClasses(i18n.language),
      isRTL: isRTL(i18n.language),
   }
}

export function useRTLLanguageSwitcher() {
   const { i18n } = useTranslation()
   return {
      classes: getLanguageSwitcherClasses(i18n.language),
      isRTL: isRTL(i18n.language),
   }
}
```

### Context Menu Implementation

**File: `app/components/UserMenu.tsx`**

```typescript
import { useRTLDropdown } from '~/utils/rtlUtils'

export function UserMenu({ menuItems, ...props }) {
  const { dropdownProps, menuClasses, isRTL } = useRTLDropdown()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Content
        align={dropdownProps.align}        // 'end' for RTL, 'start' for LTR
        alignOffset={dropdownProps.alignOffset}
        className={menuClasses.spacing}    // Proper margin spacing
      >
        {/* Welcome message with RTL text alignment */}
        <div className='px-4 py-3'>
          <p className={`text-emerald-800 ${menuClasses.textContainer}`}>
            {authenticated ? t('common.signedInAs') : t('common.welcome')}{' '}
            <span className='truncate text-emerald-800'>{displayName}</span>
          </p>
        </div>

        {menuItems.map((item, index) => (
          <DropdownMenu.Item key={index}>
            <Link className={`flex items-center ${menuClasses.menuItem}`}>
              <span className={menuClasses.iconContainer}>
                {item.icon && renderIcon(item.icon)}
              </span>
              <span className={menuClasses.textContainer}>
                {item.label}
              </span>
            </Link>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
```

**File: `app/components/AppBar.tsx`**

```typescript
import { useRTLDropdown } from '~/utils/rtlUtils'

export function AppBar({ authenticated, username, user }) {
  const { menuClasses } = useRTLDropdown()

  const menuItems = [
    // ... other menu items
    {
      label: isAuthenticated ? t('common.auth.signOut') : t('common.auth.signIn'),
      icon: (isAuthenticated ? 'logout' : 'login') as IconName,
      action: isAuthenticated ? (
        <button
          onClick={handleSignOut}
          className={`flex w-full items-center px-3 py-2 text-emerald-800 hover:bg-slate-100 ${menuClasses.menuItem}`}
        >
          <span className={menuClasses.iconContainer}>
            {renderIcon('logout', { className: 'w-5 h-5' })}
          </span>
          <span className={menuClasses.textContainer}>{t('common.auth.signOut')}</span>
        </button>
      ) : (
        <PrimaryNavLink
          to={`/auth/signin?redirectTo=${encodeURIComponent(location.pathname)}`}
          className={`flex w-full items-center px-3 py-2 text-emerald-800 hover:bg-slate-100 ${menuClasses.menuItem}`}
          onClick={handleSignIn}
        >
          <span className={menuClasses.iconContainer}>
            {renderIcon('login', { className: 'w-5 h-5' })}
          </span>
          <span className={menuClasses.textContainer}>{t('common.auth.signIn')}</span>
        </PrimaryNavLink>
      ),
      authenticated: false,
    },
  ]
}
```

### Language Switcher Implementation

**File: `app/components/LanguageSwitcher.tsx`**

```typescript
import { useRTLLanguageSwitcher } from '~/utils/rtlUtils'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { classes } = useRTLLanguageSwitcher()

  return (
    <div className={`relative inline-block ${classes.container}`}>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className={`appearance-none bg-transparent ${classes.select}`}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>

      {/* Arrow positioned correctly for RTL */}
      <div className={`absolute top-0 ${classes.arrow}`}>
        <ChevronDownIcon />
      </div>
    </div>
  )
}
```

### Visual Results

**LTR (English/Dutch/Turkish):**

```
[🏠] Home
[⚙️] Settings
[🌐] Language
```

**RTL (Arabic):**

```
Home [🏠]
Settings [⚙️]
Language [🌐]
```

### Key Benefits

1. **Proper Icon Positioning**: Icons appear on the correct side for each text direction
2. **Natural Text Flow**: Text aligns according to language reading direction
3. **Consistent Spacing**: Logical properties ensure proper spacing in both directions
4. **Dropdown Anchoring**: Menus anchor to the appropriate side of the trigger
5. **Accessibility**: Screen readers get proper text direction context

### Testing RTL Menus

```typescript
// Test that menus adapt to language changes
test('context menu adapts to RTL', () => {
  const { rerender } = render(<UserMenu />)

  // Test LTR layout
  expect(screen.getByRole('menuitem')).toHaveClass('flex-row')

  // Switch to Arabic
  i18n.changeLanguage('ar')
  rerender(<UserMenu />)

  // Test RTL layout
  expect(screen.getByRole('menuitem')).toHaveClass('flex-row-reverse')
})
```

This ensures your context menus and dropdowns provide a native, intuitive experience for both LTR and RTL users.

### Flexible Menu Width for Long Content

Context menus need to handle long email addresses gracefully while maintaining proper alignment.

**Key Requirements:**

1. **Flexible width** - Menu grows to accommodate long content
2. **Consistent padding** - Welcome message aligns with menu item icons
3. **Responsive constraints** - Min/max width limits for usability

**Implementation:**

```typescript
// Desktop menu - fits content exactly
<DropdownMenu.Content
  className={cn(
    'ring-opacity-5 z-40 w-max max-w-80 divide-y divide-slate-100', // No min-width!
    'rounded-md bg-white p-1 shadow-lg ring-1 ring-black focus:outline-none',
    'mx-4',
    menuClasses.spacing
  )}
>

// Mobile menu - fits content exactly
<div className='w-max max-w-[90vw] overflow-visible rounded-lg bg-white shadow-xl'>
```

**Width Constraints:**

- **Desktop**: `w-max` (fits content) with `max-w-80` (320px) limit
- **Mobile**: `w-max` (fits content) with `max-w-[90vw]` (90% viewport) limit
- **No minimum width** - Menu shrinks to fit short content perfectly

**Implementation:**

```typescript
// Desktop menu - fits content exactly
<DropdownMenu.Content
  className={cn(
    'ring-opacity-5 z-40 w-max max-w-80 divide-y divide-slate-100', // No min-width!
    'rounded-md bg-white p-1 shadow-lg ring-1 ring-black focus:outline-none',
    'mx-4',
    menuClasses.spacing
  )}
>

// Mobile menu - fits content exactly
<div className='w-max max-w-[90vw] overflow-visible rounded-lg bg-white shadow-xl'>
```

---

#rtl #internationalization #tailwind #documentation
