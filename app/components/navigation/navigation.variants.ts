import { type VariantProps, cva } from 'class-variance-authority'

/**
 * Navigation component variants for AppBar and BottomNavigation animations.
 *
 * Provides a CVA-based approach for handling navigation animations with:
 * - Component type variants (APP_BAR, BOTTOM_NAV)
 * - Viewport variants (mobile, desktop)
 * - Visibility state variants (visible, hidden)
 * - Compound variants for animation combinations
 *
 * Design System Integration:
 * - Uses animation classes defined in animations.css
 * - Follows established CVA patterns from button.variants.ts
 * - Supports responsive animation behavior
 *
 * @example
 * ```tsx
 * <nav className={navigationVariants({
 *   component: 'APP_BAR',
 *   viewport: 'mobile',
 *   visible: true
 * })}>
 *   Navigation Content
 * </nav>
 * ```
 */
export const navigationVariants = cva(
  // Base classes - common navigation styling
  [],
  {
    variants: {
      /**
       * Component type variants for different navigation components.
       * - APP_BAR: Top navigation bar
       * - BOTTOM_NAV: Bottom navigation for mobile
       */
      component: {
        APP_BAR: [],
        BOTTOM_NAV: [],
      },
      /**
       * Viewport variants for responsive behavior.
       * - mobile: Mobile viewport with animations (AppBar: <1024px, BottomNav: ≤767px)
       * - desktop: Desktop viewport with simple show/hide
       *
       * Note: Tablets (768px-1023px) use different breakpoints for different components:
       * - AppBar: 'mobile' viewport for scroll-based animations
       * - BottomNavigation: 'desktop' viewport (hidden) since it only shows ≤767px
       */
      viewport: {
        mobile: [],
        desktop: [],
      },
      /**
       * Visibility state variants.
       * - true: Component should be visible
       * - false: Component should be hidden
       */
      visible: {
        true: [],
        false: [],
      },
    },
    compoundVariants: [
      // APP_BAR mobile animations
      {
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: true,
        class: 'app-bar-bounce',
      },
      {
        component: 'APP_BAR',
        viewport: 'mobile',
        visible: false,
        class: 'app-bar-slide-out',
      },
      // APP_BAR desktop simple show/hide
      {
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: true,
        class: 'app-bar-visible',
      },
      {
        component: 'APP_BAR',
        viewport: 'desktop',
        visible: false,
        class: 'app-bar-hidden',
      },
      // BOTTOM_NAV mobile animations
      {
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: true,
        class: 'bottom-nav-bounce',
      },
      {
        component: 'BOTTOM_NAV',
        viewport: 'mobile',
        visible: false,
        class: 'bottom-nav-slide-out',
      },
      // BOTTOM_NAV desktop simple show/hide
      {
        component: 'BOTTOM_NAV',
        viewport: 'desktop',
        visible: true,
        class: 'bottom-nav-visible',
      },
      {
        component: 'BOTTOM_NAV',
        viewport: 'desktop',
        visible: false,
        class: 'bottom-nav-hidden',
      },
    ],
    defaultVariants: {
      component: 'APP_BAR',
      viewport: 'desktop',
      visible: true,
    },
  },
)

// TypeScript type exports for component prop typing

/**
 * Type definition for navigationVariants props.
 * Use this when defining component props that accept navigation styling options.
 */
export type NavigationVariants = VariantProps<typeof navigationVariants>

/**
 * Type definition for navigation component types.
 * Ensures type safety when specifying component variants.
 */
export type NavigationComponent = NonNullable<NavigationVariants['component']>

/**
 * Type definition for navigation viewport options.
 * Provides type safety for viewport-related props.
 */
export type NavigationViewport = NonNullable<NavigationVariants['viewport']>

/**
 * Type definition for navigation visibility state.
 * Ensures type safety for visibility-related props.
 */
export type NavigationVisible = NonNullable<NavigationVariants['visible']>
