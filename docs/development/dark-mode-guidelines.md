# Dark Mode Guidelines

This document provides comprehensive guidelines for implementing and maintaining dark mode support in the Tournado application.

## 🌗 Overview

The Tournado application features a sophisticated dark mode implementation that provides:

- **Automatic theme detection** - Respects user's system preference
- **Manual theme toggle** - Users can override system preference
- **Persistent preferences** - Theme choice is saved across sessions
- **Seamless switching** - Instant theme changes without page reload
- **Accessibility compliance** - Maintains WCAG 2.1 AA contrast ratios

## 🎯 Core Principles

### 1. Semantic Token First Approach

**Always use semantic tokens instead of hard-coded colors:**

```css
/* ✅ Correct: Semantic tokens */
.component {
  background-color: var(--color-background);
  color: var(--color-foreground);
  border-color: var(--color-border);
}

/* ❌ Incorrect: Hard-coded colors */
.component {
  background-color: white;
  color: black;
  border-color: #e2e8f0;
}
```

### 2. Theme-Agnostic Components

Components should work seamlessly in both themes without conditional logic:

```typescript
// ✅ Correct: Theme-agnostic styling
<div className="bg-background text-foreground border-border">
  Content adapts automatically
</div>

// ❌ Incorrect: Theme-specific conditions
<div className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'}>
  Manual theme handling
</div>
```

### 3. Contrast Preservation

All color combinations must maintain proper contrast ratios in both themes:

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum contrast ratio
- **Focus indicators**: Must be visible in both themes

## 🔧 Implementation Guidelines

### Adding Dark Mode to New Components

#### Step 1: Use Semantic Tokens

Start with the core semantic tokens defined in the design system:

```css
/* Core tokens available */
--color-background       /* Page/container background */
--color-foreground      /* Primary text color */
--color-foreground-light    /* Secondary text */
--color-foreground-lighter  /* Tertiary text */
--color-foreground-lightest /* Placeholder text */
--color-border          /* Border color */
--color-accent          /* Hover/active backgrounds */
```

#### Step 2: Implement Component Styles

Use Tailwind classes that map to semantic tokens:

```typescript
const MyComponent = () => (
  <div className="bg-background text-foreground border border-border rounded-lg p-4">
    <h2 className="text-foreground-heading font-semibold">Title</h2>
    <p className="text-foreground-light">Secondary text</p>
    <button className="bg-primary-600 hover:bg-primary-700 text-white">
      Action
    </button>
  </div>
)
```

#### Step 3: Test Both Themes

Always verify your component in both light and dark modes:

1. **Light mode testing**: Default state
2. **Dark mode testing**: Add `dark` class to `<html>` element
3. **Toggle testing**: Use the ThemeToggle component to verify transitions
4. **Accessibility testing**: Check contrast ratios with browser dev tools

### Working with Color Accents

The application supports 20+ color accents that automatically adapt to dark mode:

```typescript
// Color accents automatically work in both themes
const colorVariants = {
  brand: 'border-brand-400 bg-panel-brand', // Red-based
  primary: 'border-primary-400 bg-panel-primary', // Emerald-based
  blue: 'border-blue-400 bg-panel-blue',
  green: 'border-green-400 bg-panel-green',
  // ... all 20+ accents supported
}
```

### Panel and Background Colors

Use the panel background system for consistent theming:

```css
/* Panel backgrounds automatically adapt */
--panel-bg-primary    /* Emerald-100 → Emerald-800 */
--panel-bg-brand      /* Slate-100 → Slate-800 */
--panel-bg-blue       /* Blue-100 → Blue-800 */
/* ... complete set of 20+ panel backgrounds */
```

## 🎨 Design Token Categories

### 1. Surface Colors

```css
/* Light Mode → Dark Mode */
--color-background: white → slate-900 --color-input: white → slate-800
  --footer-bg: white → primary-800;
```

### 2. Text Colors

```css
/* Light Mode → Dark Mode */
--color-foreground: slate-900 → slate-100 --color-foreground-light: slate-600 →
  slate-300 --color-foreground-lighter: slate-400 → slate-400
  --color-foreground-lightest: slate-400 → slate-500 --color-placeholder: slate-400 →
  slate-400;
```

### 3. Border Colors

```css
/* Light Mode → Dark Mode */
--color-border: slate-200 → slate-500 --color-chip-border: red-600 → slate-100;
```

### 4. Interactive Elements

```css
/* Light Mode → Dark Mode */
--color-accent: brand-50 → slate-800 --color-background-hover: slate-100 →
  [automatically handled];
```

## 🧪 Testing Guidelines

### Manual Testing Checklist

For every component or feature, verify:

- [ ] **Light mode rendering** - Component displays correctly
- [ ] **Dark mode rendering** - Component displays correctly with proper contrast
- [ ] **Theme switching** - Smooth transition between themes
- [ ] **Text readability** - All text is readable in both themes
- [ ] **Interactive states** - Hover, focus, active states work in both themes
- [ ] **Color accents** - If using color accents, verify they adapt properly
- [ ] **Images/icons** - SVG icons inherit `currentColor` properly
- [ ] **Focus indicators** - Focus rings are visible in both themes

### Automated Testing

Include theme testing in your component tests:

```typescript
// Example test pattern
describe('MyComponent', () => {
  it('renders correctly in light mode', () => {
    render(<MyComponent />)
    // Test light mode appearance
  })

  it('renders correctly in dark mode', () => {
    document.documentElement.classList.add('dark')
    render(<MyComponent />)
    // Test dark mode appearance
    document.documentElement.classList.remove('dark')
  })
})
```

### Browser Testing

Use browser developer tools to verify:

1. **Contrast ratios**: Use accessibility inspector
2. **Color values**: Verify CSS custom properties resolve correctly
3. **Theme persistence**: Check localStorage for theme preference
4. **System preference**: Test with `prefers-color-scheme` media query

## 🚫 Common Pitfalls

### 1. Hard-coded Colors

```css
/* ❌ Never do this */
.component {
  background: white;
  color: black;
  border: 1px solid #e2e8f0;
}

/* ✅ Always use semantic tokens */
.component {
  background: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-border);
}
```

### 2. Conditional Theme Styling

```typescript
// ❌ Avoid theme-specific logic
const Component = ({ theme }) => (
  <div className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>
    Content
  </div>
)

// ✅ Use semantic tokens that adapt automatically
const Component = () => (
  <div className="bg-background">
    Content
  </div>
)
```

### 3. Missing Focus States

```css
/* ❌ Focus not visible in dark mode */
.button:focus {
  outline: 2px solid blue;
}

/* ✅ Theme-aware focus states */
.button:focus {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}
```

### 4. Poor Contrast Ratios

Always verify contrast ratios meet accessibility standards:

- **Text on backgrounds**: 4.5:1 minimum
- **Interactive elements**: 3:1 minimum
- **Focus indicators**: Must be visible against all backgrounds

## 🔄 Theme Switching Implementation

### Using the Theme Hook

```typescript
import { useTheme } from '~/hooks/useTheme'

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

### Theme Detection Logic

The theme system follows this priority:

1. **Explicit user choice** (stored in localStorage)
2. **System preference** (`prefers-color-scheme`)
3. **Default to light mode** (fallback)

### Theme Persistence

Theme preferences are automatically persisted:

```typescript
// Automatic persistence - no action needed
const { theme, setTheme } = useTheme()
setTheme('dark') // Automatically saved to localStorage
```

## 📱 Mobile Considerations

### Touch Targets

Ensure interactive elements have adequate touch targets in both themes:

```css
.touch-target {
  min-height: 44px; /* iOS minimum */
  min-width: 44px;
}
```

### Status Bar Handling

The application automatically handles status bar theming:

```html
<!-- Automatic status bar color in PWA mode -->
<meta name="theme-color" content="#059669" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#064e3b" media="(prefers-color-scheme: dark)" />
```

## 🎯 Advanced Patterns

### Gradient Theming

Use the gradient system for sophisticated backgrounds:

```css
/* Gradients that adapt to theme */
.gradient-background {
  background: linear-gradient(
    to bottom,
    var(--panel-gradient-from),
    var(--panel-gradient-via),
    var(--panel-gradient-to)
  );
}
```

### SVG Icon Theming

Ensure SVG icons adapt to theme changes:

```typescript
// ✅ Icons that inherit color
const Icon = () => (
  <svg className="w-6 h-6 text-foreground">
    <path fill="currentColor" d="..." />
  </svg>
)

// ❌ Icons with hard-coded colors
const Icon = () => (
  <svg className="w-6 h-6">
    <path fill="#000000" d="..." />
  </svg>
)
```

### Custom Component Theming

For complex components, extend the semantic token system:

```css
/* Add component-specific tokens */
:root {
  --color-my-component-bg: var(--color-background);
  --color-my-component-border: var(--color-border);
}

.dark {
  --color-my-component-bg: var(--color-slate-800);
  --color-my-component-border: var(--color-slate-600);
}
```

## 📝 Contribution Guidelines

### Pull Request Checklist

When contributing components with dark mode support:

- [ ] Component uses only semantic tokens
- [ ] Both light and dark modes tested
- [ ] Contrast ratios verified
- [ ] Focus states work in both themes
- [ ] No hard-coded colors in implementation
- [ ] Test coverage includes theme variations
- [ ] Documentation updated if needed

### Code Review Focus Areas

When reviewing dark mode implementations, check:

1. **Semantic token usage** - No hard-coded colors
2. **Accessibility compliance** - Proper contrast ratios
3. **Theme switching behavior** - Smooth transitions
4. **Test coverage** - Both themes tested
5. **Performance impact** - No unnecessary re-renders

## 🔗 Related Documentation

- [Design System](design-system.md) - Complete design system overview
- [UI Components](ui-components.md) - Component implementation patterns
- [Accessibility Guidelines](../testing/accessibility.md) - Accessibility best practices
- [Testing Guide](../testing/overview.md) - Testing strategies and tools

## 🏆 Success Metrics

A well-implemented dark mode feature should:

- **Zero hard-coded colors** in component implementation
- **100% accessibility compliance** - All contrast ratios meet standards
- **Seamless theme switching** - No visual glitches during transitions
- **Complete test coverage** - Both themes tested in automated tests
- **User preference respect** - System preference detected and honored
- **Performance optimized** - No significant performance impact from theming

By following these guidelines, contributors can ensure consistent, accessible, and maintainable dark mode implementations across the entire Tournado application.
