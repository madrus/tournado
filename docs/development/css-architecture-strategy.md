# CSS Architecture Strategy: Component-to-Infrastructure Promotion

> **Owner:** Frontend Team  
> **Status:** Architectural Guidelines  
> **Last Updated:** 2025-01-20

---

## Overview

This document outlines our strategy for promoting CSS patterns from component-specific implementations to infrastructure-level utilities, ensuring maintainable, consistent, and performant styling across the application.

## The Problem: Duplication Across Components

### Current State

Our codebase has grown to include multiple component variant systems (CVA) that often repeat the same patterns:

```typescript
// Panel/panel.variants.ts
color: {
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
}

// buttons/button.variants.ts
color: {
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
}

// TeamChip/teamChip.variants.ts
color: {
  red: 'text-red-600 dark:text-red-400',
  // Same pattern repeated...
}
```

### Problems This Creates

1. **Maintenance Burden**: Changing red's dark mode color requires updates in 5+ files
2. **Inconsistency Risk**: Easy to miss updating one component, creating visual inconsistencies
3. **Bundle Size**: CSS duplication across multiple components
4. **Developer Experience**: Difficult to understand the global color system

---

## Decision Matrix: When to Promote

### CVA Variants (Component-Specific)

**Use when:**

- Component-specific styling logic
- Props drive different visual states
- Type safety is crucial
- Styles are unique to one component

**Example:**

```typescript
// Button-specific interaction states
export const buttonVariants = cva(baseStyles, {
   variants: {
      size: { sm: '...', md: '...', lg: '...' }, // Button-specific
      intent: { primary: '...', secondary: '...' }, // Button-specific
   },
})
```

### @layer components (Cross-Component Utilities)

**Use when:**

- 3+ components use the same pattern
- Pattern can be meaningfully named
- Reusable utility that maintains component boundaries

**Example:**

```css
@layer components {
   .text-adaptive-red {
      @apply text-red-600 dark:text-red-400;
   }
   .panel-foundation {
      @apply rounded-xl border shadow-lg;
   }
}
```

### @variant dark (Global Theme Adjustments)

**Use when:**

- Complex dark mode logic
- Theme-wide adjustments
- CSS variables or custom properties needed

**Example:**

```css
@variant dark {
   .shadow-adaptive-red {
      box-shadow: 0 10px 15px -3px rgb(var(--color-red-400) / 0.3);
   }
}
```

### @theme (Design System Tokens)

**Use when:**

- Foundational design tokens
- Values that should be consistent app-wide
- Light/dark mode value definitions

**Example:**

```css
@theme {
   --color-adaptive-red-text: var(--color-red-600);
   --color-adaptive-red-bg: var(--color-red-50);
}
```

### @layer base (Global Defaults)

**Use when:**

- HTML element defaults
- Universal resets
- Foundation-level styling

**Example:**

```css
@layer base {
   h1,
   h2,
   h3,
   h4,
   h5,
   h6 {
      color: var(--color-title);
   }
}
```

---

## Promotion Thresholds

### 1. Usage Frequency Threshold

**Trigger:** When 3+ components use identical patterns
**Action:** Promote to `@layer components` utilities

### 2. Complexity Threshold

**Trigger:** When dark mode logic becomes complex (multiple properties, calculations)
**Action:** Promote to `@variant dark` custom implementations

### 3. Semantic Abstraction Threshold

**Trigger:** When you can meaningfully name the pattern beyond component boundaries
**Action:** Create semantic utility classes

### 4. Design System Threshold

**Trigger:** When values should be consistent across entire app
**Action:** Promote to `@theme` design tokens

---

## The Bi-Modal Problem: Light + Dark Generalization

### Current Issue

We're hardcoding both light AND dark mode values in component variants:

```typescript
// Both modes hardcoded everywhere
color: {
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-blue-600 dark:text-blue-400',
}
```

**Problem:** Changing light mode red from `red-600` to `red-700` requires updates across multiple files.

### Solution: Adaptive Color System

#### Phase 1: Design Tokens

```css
/* @theme - Semantic color tokens that adapt */
@theme {
   --color-adaptive-red-text: var(--color-red-600);
   --color-adaptive-blue-text: var(--color-blue-600);
   --color-adaptive-emerald-text: var(--color-emerald-600);
}

/* Dark mode overrides */
@variant dark {
   :root {
      --color-adaptive-red-text: var(--color-red-400);
      --color-adaptive-blue-text: var(--color-blue-400);
      --color-adaptive-emerald-text: var(--color-emerald-400);
   }
}
```

#### Phase 2: Infrastructure Utilities

```css
@layer components {
   .text-adaptive-red {
      color: var(--color-adaptive-red-text);
   }
   .text-adaptive-blue {
      color: var(--color-adaptive-blue-text);
   }
   .text-adaptive-emerald {
      color: var(--color-adaptive-emerald-text);
   }
}
```

#### Phase 3: Simplified Components

```typescript
// Clean component variants
export const panelDescriptionVariants = cva(['text-foreground'], {
   variants: {
      color: {
         red: 'text-adaptive-red', // Delegates to infrastructure
         blue: 'text-adaptive-blue', // Single source of truth
         emerald: 'text-adaptive-emerald',
      },
   },
})
```

---

## Implementation Strategy

### Phase 1: Audit Current Duplication

1. **Identify Repeated Patterns**

   ```bash
   # Find repeated color patterns
   grep -r "text-red-600 dark:text-red-400" app/components
   grep -r "bg-gradient-to-br" app/components
   ```

2. **Catalog Usage Frequency**
   - Create spreadsheet of pattern → component usage
   - Identify promotion candidates (3+ usage threshold)

### Phase 2: Create Infrastructure Layer

1. **Design Tokens** (`@theme`)
   - Define adaptive color variables
   - Set up light/dark mode mappings

2. **Utility Classes** (`@layer components`)
   - Create semantic utilities for common patterns
   - Focus on high-frequency, cross-component patterns

### Phase 3: Component Migration

1. **Update CVA Variants**
   - Replace hardcoded values with utility classes
   - Maintain component API (props don't change)

2. **Testing**
   - Visual regression testing
   - Ensure no breaking changes

### Phase 4: Validation

1. **Bundle Analysis**
   - Measure CSS size reduction
   - Verify no duplication remains

2. **Developer Experience**
   - Document new utility classes
   - Update component documentation

---

## Benefits of Promotion

### Maintainability

- **Single Source of Truth**: Change red color app-wide in one place
- **Consistency**: All components automatically follow same rules
- **Easier Debugging**: Clear separation between component logic and design tokens

### Performance

- **Reduced Bundle Size**: Eliminate CSS duplication
- **Better Caching**: Infrastructure utilities cached separately from components
- **Tree Shaking**: Unused utilities can be eliminated

### Developer Experience

- **Clearer Architecture**: Obvious separation of concerns
- **Faster Development**: Reuse existing utilities instead of recreating
- **Better Testing**: Test design system separately from component logic

### Design System

- **Systematic Theming**: Easy to implement design changes
- **Brand Consistency**: Impossible to have inconsistent colors
- **Accessibility**: Centralized place to ensure contrast ratios

---

## Trade-offs and Considerations

### When NOT to Promote

1. **Single-Use Patterns**: If only one component uses it
2. **Highly Context-Specific**: Button hover states vs panel backgrounds
3. **Performance-Critical**: When CVA tree-shaking is important
4. **Rapid Prototyping**: During early development when patterns aren't stable

### Potential Downsides

1. **Indirection**: Harder to see actual CSS values when debugging
2. **Learning Curve**: Team needs to understand the utility system
3. **Over-Abstraction**: Risk of creating utilities that are too generic
4. **Migration Effort**: Upfront cost to refactor existing components

### Mitigation Strategies

1. **Good Documentation**: Clear examples and naming conventions
2. **Gradual Migration**: Promote incrementally, not all at once
3. **Team Training**: Ensure everyone understands the system
4. **Tooling**: Browser dev tools extensions, VS Code snippets

---

## Naming Conventions

### Utility Class Naming

```css
/* Pattern: [scope]-[semantic-name]-[property] */
.text-adaptive-red          /* Adaptive text color */
.bg-adaptive-panel         /* Adaptive background pattern */
.panel-foundation-red      /* Panel-specific foundation */
.shadow-adaptive-elevated  /* Adaptive shadow system */
```

### CSS Variable Naming

```css
/* Pattern: --color-[semantic-name]-[property] */
--color-adaptive-red-text      /* Text color that adapts to theme */
--color-adaptive-red-bg        /* Background color that adapts */
--color-primary-border         /* Primary brand border color */
```

---

## Future Considerations

### Potential Extensions

1. **Motion System**: Promote animation patterns to infrastructure
2. **Spacing System**: Standardize component spacing patterns
3. **Typography Scale**: Promote text sizing and leading patterns
4. **Border Radius System**: Standardize rounded corner patterns

### Tooling Opportunities

1. **Design Token Sync**: Integrate with design tools (Figma, etc.)
2. **Documentation Generation**: Auto-generate utility class docs
3. **Usage Analytics**: Track which utilities are most/least used
4. **Migration Tools**: Scripts to help migrate from old patterns

---

## Conclusion

The promotion strategy provides a clear path from component-specific styling to infrastructure-level utilities. By following the decision matrix and implementation phases, we can:

1. Reduce code duplication
2. Improve maintainability
3. Ensure design consistency
4. Enhance developer experience

The key is **gradual adoption** - promote patterns as they prove themselves worthy, rather than trying to abstract everything upfront.

---

## Examples from Tournado Codebase

### Current Duplication

```typescript
// Found in: Panel, Button, TeamChip, ToggleChip variants
red: 'text-red-600 dark:text-red-400',
blue: 'text-blue-600 dark:text-blue-400',
emerald: 'text-emerald-600 dark:text-emerald-400',
```

### Promotion Candidates

1. **Text color patterns** (5+ components)
2. **Panel gradient backgrounds** (3+ components)
3. **Border + background combinations** (4+ components)
4. **Shadow patterns** (6+ components)

### Implementation Priority

1. **High Impact**: Text colors (used in 8+ files)
2. **Medium Impact**: Panel backgrounds (used in 4 files)
3. **Low Impact**: Component-specific hover states
