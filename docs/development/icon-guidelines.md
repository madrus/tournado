# Icon Guidelines

This document provides comprehensive guidelines for using and maintaining the icon system in the Tournado application, based on a complete audit of all 29 icon components.

## 🎯 Overview

The Tournado application features a robust icon system with **29 optimized SVG components** that:

- **100% theme compatibility** - All icons adapt automatically to light/dark modes
- **Perfect `currentColor` inheritance** - Zero hard-coded colors
- **Material Design compliance** - Authentic Google Material Symbols paths
- **Accessibility first** - Complete ARIA labeling and screen reader support
- **Performance optimized** - Efficient SVG paths and consistent class patterns

## 📊 Icon Inventory

### **Navigation & Interface** (8 icons)

- `AddIcon` - Plus/add symbol with stroke-based rendering
- `ChevronLeftIcon` - Left arrow navigation with bold default weight
- `ChevronRightIcon` - Right arrow navigation with bold default weight
- `CloseIcon` - X/close symbol with stroke-based rendering
- `ExpandMoreIcon` - Chevron down for dropdowns
- `MoreHorizIcon` - Three horizontal dots menu
- `MoreVertIcon` - Three vertical dots menu
- `AnimatedHamburgerIcon` - Animated menu toggle with RTL support

### **User & Authentication** (6 icons)

- `PersonIcon` - User profile symbol
- `LoginIcon` - Sign in arrow with door
- `LogoutIcon` - Sign out arrow with door
- `AdminPanelSettingsIcon` - Shield with gear for admin functions
- `BlockIcon` - Prohibition/block symbol
- `SettingsIcon` - Gear/cog for settings

### **Status & Feedback** (6 icons)

- `CheckMarkIcon` - Simple checkmark for success states
- `ErrorIcon` - Exclamation in circle for error states
- `InfoIcon` - Information symbol for informational messages
- `WarningIcon` - Triangle with exclamation for warnings
- `PendingIcon` - Three dots in circle for loading/pending states
- `TrophyIcon` - Award symbol for achievements

### **Theme & Interface** (4 icons)

- `DarkModeIcon` - Moon symbol for dark mode toggle
- `LightModeIcon` - Sun symbol for light mode toggle
- `LanguageIcon` - Globe symbol for language selection
- `TuneIcon` - Sliders symbol for filtering/tuning

### **Content & Actions** (6 icons)

- `HomeIcon` - House symbol for home navigation
- `CalendarIcon` - Calendar grid for date-related functions
- `DeleteIcon` - Trash can for delete actions
- `RestorePageIcon` - Page with refresh arrow for restore functions
- `ApparelIcon` - Clothing/jersey symbol for team apparel

## 🎨 Implementation Patterns

### Pattern 1: Stroke-Based Icons

For simple line-art icons, use the stroke pattern:

```typescript
export const MyStrokeIcon = ({ className = '', size = 24, weight = 400, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block ${className}`}
    stroke="currentColor"
    strokeWidth={weight / 200}
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="My icon"
  >
    <path d="..." />
  </svg>
)
```

**Examples:** AddIcon, CalendarIcon, ChevronIcons, CloseIcon, DeleteIcon

### Pattern 2: Fill-Based Icons

For solid Material Design icons, use the fill pattern:

```typescript
export const MyFillIcon = ({ className = '', size = 24, weight = 400, ...props }) => {
  const strokeWidth = weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      className={`inline-block fill-current ${className}`}
      style={{ strokeWidth }}
      role="img"
      aria-label="My icon"
    >
      <path d="..." />
    </svg>
  )
}
```

**Examples:** All Material Design icons (DarkModeIcon, LightModeIcon, SettingsIcon, etc.)

### Pattern 3: Variant Support

For icons with multiple visual styles:

```typescript
export const MyVariantIcon = ({ variant = 'outlined', ...props }) => {
  const outlinedPath = "..."
  const filledPath = "..."
  const path = variant === 'filled' ? filledPath : outlinedPath

  const strokeWidth = variant === 'outlined' && weight > 400
    ? weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1
    : undefined

  return (
    <svg className={`inline-block fill-current ${className}`} style={{ strokeWidth }}>
      <path d={path} />
    </svg>
  )
}
```

**Examples:** HomeIcon, TrophyIcon, ApparelIcon, PendingIcon

## 🔧 Technical Requirements

### Essential Properties

Every icon component must include:

#### 1. **Theme Compatibility**

```typescript
// ✅ Correct: Uses currentColor
stroke = 'currentColor'
// OR
className = 'fill-current'

// ❌ Incorrect: Hard-coded colors
fill = '#000000'
stroke = '#666666'
```

#### 2. **Accessibility Support**

```typescript
// Required ARIA properties
role="img"
aria-label="Descriptive label"

// Optional test support
data-testid={dataTestId}
```

#### 3. **Responsive Sizing**

```typescript
// Configurable size prop
width={size}
height={size}

// Consistent positioning
className={`inline-block ${className}`}
```

#### 4. **Weight System**

```typescript
// For stroke-based icons
strokeWidth={weight / 200}

// For fill-based Material Design icons
const strokeWidth = weight > 400 ? (weight === 600 ? 1.5 : weight === 500 ? 1.25 : 1) : undefined
style={{ strokeWidth }}
```

### Component Interface

Standard icon component props:

```typescript
type IconProps = {
  className?: string // Additional CSS classes
  size?: number // Icon size in pixels (default: 24)
  variant?: 'outlined' | 'filled' // Visual style (if supported)
  weight?: 400 | 500 | 600 // Font weight equivalent
  'data-testid'?: string // Test identifier
  'aria-label'?: string // Accessibility label
  [key: string]: unknown // Allow extra props for flexibility
}
```

## 🎯 Usage Guidelines

### In Components

Icons automatically inherit the text color from their parent:

```typescript
// ✅ Automatic theme adaptation
<div className="text-foreground">
  <HomeIcon /> Home
</div>

<div className="text-brand-600">
  <AddIcon /> Add Item
</div>

<div className="text-red-600">
  <ErrorIcon /> Error message
</div>
```

### With Color Accents

Icons work seamlessly with the color accent system:

```typescript
// Brand accent button
<button className="text-brand-600 hover:text-brand-700">
  <LoginIcon size={20} />
  Sign In
</button>

// Primary accent navigation
<nav className="text-primary-600">
  <HomeIcon />
  <SettingsIcon />
  <PersonIcon />
</nav>
```

### Sizing Conventions

Standard icon sizes for different contexts:

```typescript
// Small icons (16px) - For inline text, form fields
<CheckMarkIcon size={16} />

// Default icons (24px) - For buttons, navigation
<HomeIcon size={24} />

// Medium icons (32px) - For prominent actions
<AddIcon size={32} />

// Large icons (48px) - For feature highlights
<TrophyIcon size={48} />
```

## 🚀 Advanced Features

### RTL Support

The `AnimatedHamburgerIcon` demonstrates RTL-aware animations:

```typescript
<AnimatedHamburgerIcon
  isOpen={menuOpen}
  isRTL={direction === 'rtl'}
/>
```

### Weight Variants

Icons support multiple weight levels:

```typescript
// Light weight for secondary elements
<ChevronRightIcon weight={400} />

// Medium weight for standard UI
<ChevronRightIcon weight={500} />

// Bold weight for emphasis
<ChevronRightIcon weight={600} />
```

### Style Variants

Some icons support multiple visual styles:

```typescript
// Outlined style for secondary actions
<HomeIcon variant="outlined" />

// Filled style for primary actions
<HomeIcon variant="filled" />
```

## 📝 Adding New Icons

### Step 1: Choose the Right Pattern

- **Simple line art** → Use stroke-based pattern
- **Material Design symbols** → Use fill-based pattern
- **Multiple styles needed** → Use variant pattern

### Step 2: Implement the Component

```typescript
import { JSX } from 'react'
import type { IconWeight } from '~/lib/lib.types'

type MyIconProps = {
  className?: string
  size?: number
  weight?: IconWeight
  'aria-label'?: string
}

export function MyIcon({
  className = '',
  size = 24,
  weight = 400,
  'aria-label': ariaLabel = 'My icon description',
}: MyIconProps): JSX.Element {
  const path = "..." // SVG path data

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24" // Adjust based on source
      className={`inline-block fill-current ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d={path} />
    </svg>
  )
}
```

### Step 3: Export from Index

Add to `app/components/icons/index.ts`:

```typescript
export { MyIcon } from './MyIcon'
```

### Step 4: Test Theme Compatibility

Verify the icon works in both light and dark modes:

```typescript
// Test component
const IconTest = () => (
  <div className="space-y-4">
    <div className="text-foreground">
      <MyIcon /> Default color
    </div>
    <div className="text-brand-600">
      <MyIcon /> Brand color
    </div>
    <div className="text-primary-600">
      <MyIcon /> Primary color
    </div>
  </div>
)
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

For every icon, verify:

- [ ] **Theme compatibility** - Icon color changes with light/dark mode
- [ ] **Color inheritance** - Icon adopts parent text color
- [ ] **Sizing** - Icon scales correctly with size prop
- [ ] **Weight variants** - Different weights render appropriately
- [ ] **Accessibility** - Screen reader announces icon properly
- [ ] **Performance** - No layout shifts or rendering issues

### Automated Testing

Include icon testing in component tests:

```typescript
import { render } from '@testing-library/react'
import { MyIcon } from './MyIcon'

describe('MyIcon', () => {
  it('renders with correct aria-label', () => {
    const { getByRole } = render(<MyIcon aria-label="Test icon" />)
    expect(getByRole('img')).toHaveAttribute('aria-label', 'Test icon')
  })

  it('applies custom className', () => {
    const { getByRole } = render(<MyIcon className="text-red-500" />)
    expect(getByRole('img')).toHaveClass('text-red-500')
  })

  it('uses correct size', () => {
    const { getByRole } = render(<MyIcon size={32} />)
    const svg = getByRole('img')
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
  })
})
```

## 🔍 Icon Audit Results

**Complete audit of 29 icons performed ✅**

- **Theme compatibility**: 29/29 perfect ✅
- **currentColor usage**: 29/29 compliant ✅
- **Accessibility**: 29/29 properly labeled ✅
- **Performance**: 29/29 optimized ✅
- **Type safety**: 29/29 TypeScript compliant ✅

## 📚 Related Documentation

- [Design System](design-system.md) - Complete design system overview
- [Dark Mode Guidelines](dark-mode-guidelines.md) - Theme implementation patterns
- [UI Components](ui-components.md) - Component usage in context
- [Accessibility Guidelines](../testing/accessibility.md) - Accessibility best practices

## 🏆 Best Practices Summary

1. **Always use `currentColor`** - Never hard-code icon colors
2. **Include accessibility labels** - Every icon needs descriptive ARIA labels
3. **Support configurable sizing** - Use size prop for responsive design
4. **Follow naming conventions** - Clear, descriptive component names
5. **Test theme compatibility** - Verify icons work in both light and dark modes
6. **Optimize SVG paths** - Use authentic, optimized paths from design sources
7. **Maintain consistency** - Follow established patterns and interfaces

The Tournado icon system represents excellent engineering practices and ensures seamless integration with the sophisticated dark mode implementation across the entire application.
