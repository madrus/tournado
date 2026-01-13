# Mobile Web App Configuration

## Overview

This document describes the PWA (Progressive Web App) configuration implemented to provide a native-like mobile experience, specifically eliminating browser chrome when the app is added to the home screen.

## Changes Made

### 1. Web App Manifest (`/public/manifest.json`)

Created a comprehensive manifest file with the following key properties:

```json
{
  "name": "Tournado",
  "short_name": "Tournado",
  "display": "standalone",
  "background_color": "#134e4a",
  "theme_color": "#03c989",
  "scope": "/",
  "categories": ["sports", "utilities"],
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "48x48",
      "type": "image/x-icon"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

The `"display": "standalone"` property is crucial - it removes the browser address bar and navigation buttons when launched from home screen as in the following picture:

<img src="development/images/browser_artifacts.jpg" alt="browser artifacts - appbar and footer" width="300">

### 2. Meta Tags in Root Template (`app/root.tsx`)

Added PWA-specific meta tags to the `meta` function:

- `apple-mobile-web-app-capable: yes` - Enables full-screen mode on iOS Safari
- `apple-mobile-web-app-status-bar-style: black-translucent` - iOS status bar styling
- `mobile-web-app-capable: yes` - Enables full-screen mode on Android Chrome

### 3. Manifest Link

Added manifest link to the `links` function in `root.tsx`:

```typescript
{ rel: 'manifest', href: '/manifest.json' }
```

## PWA Improvements Made

### Enhanced Manifest Properties

Based on PR review feedback, the following improvements were implemented:

#### ✅ **Multiple Icon Sizes**

- Added `192x192` icon for standard PWA requirements
- Added `512x512` icon for high-resolution displays and splash screens
- Both icons support `"purpose": "any maskable"` for adaptive Android icons

#### ✅ **Navigation Scope**

- Added `"scope": "/"` to define the navigation scope
- Ensures all app URLs are handled within the PWA context
- Prevents navigation outside the app boundaries

#### ✅ **App Store Classification**

- Added `"categories": ["sports", "utilities"]` for better app store discovery
- Helps users find the app in relevant categories

### Icon Requirements

**Note**: The actual icon files (`icon-192.png`, `icon-512.png`) need to be created and placed in the `/public` directory. These should be:

- **192x192**: Standard PWA icon, used for home screen shortcuts
- **512x512**: High-resolution icon for splash screens and app stores
- **Format**: PNG with transparent background
- **Design**: Should work well with maskable icon treatment on Android

## How It Works

1. User visits the app in mobile browser
2. Browser detects PWA manifest and meta tags
3. Browser shows "Add to Home Screen" prompt
4. When launched from home screen, app opens in standalone mode without browser UI
5. App appears as a native application with full screen real estate

## Testing

To test the implementation:

1. Open the app on mobile device
2. Add to home screen via browser menu
3. Launch from home screen icon
4. Verify no browser address bar or navigation buttons are visible

## Mobile Scroll Behavior & Navigation

### Bounce Detection Implementation

To improve mobile UX, we implemented smart bounce detection that prevents navigation flicker during overscroll bounce animations.

#### Problem Solved

When users scroll to the bottom of pages on mobile devices and experience the natural iOS/Android bounce effect, the bounce-back motion was incorrectly interpreted as "scroll up" which caused navigation bars to flicker in and out of view, making it difficult to see content at the bottom of pages.

#### Solution

**Touch-based bounce detection** implemented in `app/hooks/useScrollDirection.ts`:

- **Touch event tracking**: Listens to `touchstart`, `touchmove`, `touchend` events to detect user intent
- **Position-based detection**: When user is near bottom (within 5px) and dragging up, bounce is detected
- **State isolation**: During bounce, scroll direction changes are ignored but visual bounce animation is preserved
- **Clean state management**: Bounce state resets when touch ends

#### Key Constants

```typescript
const OVERSCROLL_TOLERANCE = 50 // Max pixels beyond content to allow
```

#### Technical Features

- **SSR-safe mobile detection**: Prevents hydration mismatches
- **Performance optimized**: Uses `requestAnimationFrame` for smooth scroll handling
- **Comprehensive test coverage**: Unit tests verify bounce detection behavior

#### Result

- ✅ Beautiful bounce animation preserved
- ✅ No navigation flicker during overscroll bounce
- ✅ Normal scroll behavior intact
- ✅ Better mobile user experience

### CSS Scroll Configuration

Located in `app/styles/safe-areas.css`:

```css
/* Enable smooth scrolling on mobile */
html,
body {
  -webkit-overflow-scrolling: touch;
}
```

**Note**: We intentionally removed `overscroll-behavior: none` to preserve the natural bounce effect while using JavaScript-based bounce detection for navigation control.

## Browser Support

- **iOS Safari**: Uses `apple-mobile-web-app-*` meta tags
- **Android Chrome**: Uses manifest.json `display: standalone`
- **Other browsers**: Fallback to standard web view
