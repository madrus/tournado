# Design System

This document describes the comprehensive design system implemented in the Tournado application, including the semantic token system, color accent patterns, and dark mode guidelines.

## 🎨 Semantic Token System

The Tournado application uses a sophisticated semantic token system that provides consistent theming across light and dark modes. All colors are defined as CSS custom properties and mapped to semantic tokens in Tailwind CSS.

### Core Architecture

The semantic token system is built on three main layers:

1. **CSS Custom Properties** (`app/styles/colors.css`) - Core color definitions and theme switching
2. **Tailwind Configuration** (`tailwind.config.ts`) - Semantic token mapping
3. **Component Variants** (`*.variants.ts` files) - Color accent usage patterns

### 🔧 CSS Custom Properties Structure

The color system is defined in `app/styles/colors.css` with the following structure:

#### Core Semantic Tokens

```css
:root {
   /* Background & Surface */
   --color-background: var(--color-white);
   --color-border: var(--color-slate-200);

   /* Typography */
   --color-foreground: var(--color-slate-900);
   --color-foreground-light: var(--color-slate-600);
   --color-foreground-lighter: var(--color-slate-400);
   --color-foreground-lightest: var(--color-slate-400);
   --color-placeholder: var(--color-foreground-lightest);

   /* Brand Colors (Red-based) */
   --color-brand: var(--color-brand-600);
   --color-brand-50: var(--color-red-50);
   /* ... complete 50-950 scale */

   /* Primary Colors (Emerald-based) */
   --color-primary: var(--color-primary-600);
   --color-primary-50: var(--color-emerald-50);
   /* ... complete 50-950 scale */
}
```

#### Dark Mode Overrides

```css
.dark {
   --color-background: var(--color-slate-900);
   --color-border: var(--color-slate-500);
   --color-foreground: var(--color-slate-100);
   /* ... all semantic tokens redefined for dark mode */
}
```

### 🎯 Color Accent System

The application supports **20+ color accents** for visual variety and component theming:

#### Available Accents

- **Brand**: `brand` (red-based, primary brand color)
- **Primary**: `primary` (emerald-based, main UI color)
- **Core Colors**: `blue`, `green`, `yellow`, `red`, `purple`, `pink`
- **Extended Palette**: `teal`, `cyan`, `violet`, `orange`, `amber`, `lime`, `sky`, `indigo`, `fuchsia`, `rose`
- **Neutrals**: `slate`, `zinc`

#### Usage in Components

Each color accent provides a complete design system:

```typescript
// Border variants
color: {
  brand: 'border-brand-400',
  primary: 'border-primary-400',
  blue: 'border-blue-400',
  // ... all 20+ accents
}

// Background variants
background: {
  brand: 'bg-panel-brand',
  primary: 'bg-panel-primary',
  blue: 'bg-panel-blue',
  // ... all 20+ accents
}
```

### 📊 Panel Background System

Each color accent has dedicated panel background tokens that automatically adapt to theme:

#### Light Mode Panel Backgrounds

```css
--panel-bg-primary: var(--color-emerald-100);
--panel-bg-brand: var(--color-slate-100);
--panel-bg-blue: var(--color-blue-100);
/* ... complete set of 20+ accents */
```

#### Dark Mode Panel Backgrounds

```css
--panel-bg-primary: var(--color-emerald-800);
--panel-bg-brand: var(--color-slate-800);
--panel-bg-blue: var(--color-blue-800);
/* ... complete set of 20+ accents */
```

## 🌗 Dark Mode Implementation

### Activation System

Dark mode is controlled by the `dark` class on the root element:

```html
<!-- Light mode -->
<html class="">
   <!-- Dark mode -->
   <html class="dark"></html>
</html>
```

### Theme Switching Logic

The theme system provides automatic and manual theme switching:

1. **System Preference Detection** - Respects `prefers-color-scheme`
2. **Manual Toggle** - ThemeToggle component allows user override
3. **Persistence** - Theme preference stored in localStorage

### Component Guidelines

When creating components that support both themes:

#### ✅ Correct: Use Semantic Tokens

```css
.component {
   background-color: var(--color-background);
   color: var(--color-foreground);
   border-color: var(--color-border);
}
```

#### ❌ Incorrect: Hard-coded Colors

```css
.component {
   background-color: white;
   color: black;
   border-color: #e2e8f0;
}
```

## 🎨 Button Color System

The button system provides comprehensive theming with **6 variants** × **10+ colors**:

### Button Variants

1. **Primary** - Solid background, high emphasis
2. **Secondary** - Outlined style, medium emphasis
3. **Tertiary** - Minimal style, low emphasis
4. **Danger** - Error/destructive actions
5. **Brand** - Brand-specific actions
6. **Neutral** - Neutral/disabled state

### Button Color Implementation

```typescript
// Each variant supports all color accents
{
  variant: 'primary',
  color: 'brand',
  class: [
    'bg-brand-600',
    'hover:bg-brand-700',
    'focus-visible:ring-brand-600',
    // ... complete button styling
  ]
}
```

### Button Design Tokens

All button colors use semantic tokens:

```css
/* Light mode buttons */
--color-button-primary-background: var(--color-primary-700);
--color-button-primary-text: var(--color-white);
--color-button-primary-hover-background: var(--color-primary-700);

/* Dark mode overrides */
.dark {
   --color-button-primary-background: var(--color-primary-900);
}
```

## 🔧 Component Variants Pattern

### File Structure

Each component with color variants follows this pattern:

```
ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.variants.ts  # CVA variants
├── index.ts                  # Export barrel
└── __tests__/
    └── ComponentName.test.tsx # Component tests
```

### CVA Implementation

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

export const componentVariants = cva(
   // Base classes
   ['common', 'styling', 'classes'],
   {
      variants: {
         color: {
            brand: 'color-specific-classes',
            primary: 'color-specific-classes',
            // ... all 20+ color accents
         },
         // Other variant axes
      },
      compoundVariants: [
         // Complex variant combinations
      ],
   }
)

export type ComponentVariants = VariantProps<typeof componentVariants>
```

## 📝 Implementation Guidelines

### For Developers

#### Adding New Components

1. **Start with semantic tokens** - Never use hard-coded colors
2. **Use the color accent system** - Support multiple color variants
3. **Test both themes** - Verify light and dark mode compatibility
4. **Follow the variants pattern** - Use CVA for consistent API

#### Color Selection Guide

- **Brand actions**: Use `brand` color (red-based)
- **Primary actions**: Use `primary` color (emerald-based)
- **Success states**: Use `green` or `emerald`
- **Warning states**: Use `yellow` or `amber`
- **Error states**: Use `red` or `brand`
- **Info states**: Use `blue` or `cyan`
- **Neutral states**: Use `slate` or `zinc`

#### Design Tokens Priority

1. **Semantic tokens first** - `--color-foreground`, `--color-background`
2. **Color system tokens** - `--color-brand-600`, `--color-primary-500`
3. **Component-specific tokens** - `--color-button-primary-background`

### For Designers

#### Color Palette

The design system provides:

- **2 main brand colors** (brand red, primary emerald)
- **20+ accent colors** for visual variety
- **Complete 50-950 scales** for each color
- **Automatic dark mode adaptation**

#### Accessibility

- **WCAG 2.1 AA compliance** - All color combinations meet contrast requirements
- **High contrast ratios** - Text remains readable in both themes
- **Focus indicators** - Visible focus rings on all interactive elements
- **Reduced motion support** - Global route transitions and component animations honor the user's `prefers-reduced-motion` setting

## 🎯 Advanced Features

### Gradient System

The design system includes sophisticated gradient support:

```css
/* Panel gradients adapt to theme */
--panel-gradient-from: var(--color-slate-50); /* Light mode */
--panel-gradient-via: var(--color-slate-100);
--panel-gradient-to: var(--color-slate-50);

.dark {
   --panel-gradient-from: var(--color-slate-900); /* Dark mode */
   --panel-gradient-via: var(--color-slate-800);
   --panel-gradient-to: var(--color-slate-800);
}
```

### Focus Ring System

Comprehensive focus ring system with theme adaptation:

```css
.focus-ring {
  focus-visible:ring-2
  focus-visible:ring-offset-2
  focus-visible:ring-primary-600
  focus-visible:ring-offset-background
}
```

### RTL Support

The color system includes RTL-aware styling:

- **Directional-agnostic colors** - All colors work in both LTR and RTL
- **Cultural considerations** - Color meanings adapt to cultural context
- **Accessibility maintained** - Contrast ratios preserved in RTL layouts

## 🎯 Icon System Integration

The Tournado application features a **comprehensive icon system with 31 optimized SVG components** that seamlessly integrate with the design system:

### Perfect Theme Compatibility

All icons have been audited and optimized for flawless theme adaptation:

```typescript
// ✅ Stroke-based icons (currentColor inheritance)
<svg stroke="currentColor" className="inline-block">
  <path d="..." />
</svg>

// ✅ Fill-based icons (semantic token integration)
<svg className="inline-block fill-current">
  <path d="..." />
</svg>
```

### Icon System Achievements

- ✅ **31/31 icons audited** - Complete coverage of all icon components
- ✅ **100% theme compatibility** - All icons adapt automatically to light/dark modes
- ✅ **Zero hard-coded colors** - Perfect `currentColor` inheritance
- ✅ **Complete accessibility** - All icons include proper ARIA labels
- ✅ **Performance optimized** - Efficient SVG paths and consistent patterns

### Icon Categories

The icon system covers all application needs:

- **Navigation & Interface** (8 icons) - AddIcon, ChevronIcons, CloseIcon, etc.
- **User & Authentication** (6 icons) - PersonIcon, LoginIcon, AdminPanelSettings, etc.
- **Status & Feedback** (7 icons) - CheckIcon, ErrorIcon, WarningIcon, etc.
- **Theme & Interface** (4 icons) - DarkModeIcon, LightModeIcon, LanguageIcon, etc.
- **Content & Actions** (6 icons) - HomeIcon, CalendarIcon, DeleteIcon, etc.

### Advanced Icon Features

- **Weight variants** - Support for 400/500/600 font weights
- **Style variants** - Outlined and filled variants for key icons
- **RTL support** - AnimatedHamburgerIcon includes RTL-aware animations
- **Responsive sizing** - Configurable size props for different contexts

For comprehensive icon usage guidelines and implementation patterns, see [Icon Guidelines](icon-guidelines.md).

## 📚 Reference

### Key Files

- **Color System**: `app/styles/colors.css`
- **Tailwind Config**: `tailwind.config.ts`
- **Theme Hook**: `app/hooks/useTheme.ts`
- **Theme Toggle**: `app/components/ThemeToggle.tsx`

### Component Examples

- **ActionLinkPanel**: Full color accent system implementation
- **Button Components**: Comprehensive variant system
- **Form Inputs**: Semantic token usage patterns
- **Navigation**: Theme-aware styling
- **Icon System**: 31 optimized SVG components with perfect theme adaptation

### Testing

- **Visual Regression**: Automated theme testing
- **Accessibility**: Color contrast validation
- **Cross-browser**: Theme compatibility testing

This design system ensures consistent, accessible, and maintainable theming across the entire Tournado application.
