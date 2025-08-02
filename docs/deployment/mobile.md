# Mobile Deployment

This document covers mobile-specific deployment considerations for the Tournado tournament management platform.

## Progressive Web App (PWA) Configuration

The application is configured as a Progressive Web App to provide a native-like experience on mobile devices.

### Web App Manifest

The project uses a single web app manifest file:

**`public/manifest.json`** - The main PWA manifest used by the application

- Contains comprehensive icon sets including maskable icons with `"purpose": "any maskable"`
- Configured with `"display": "standalone"` and display overrides for enhanced mobile experience
- Sets appropriate theme colors (`#03c989`) and background colors (`#134e4a`)
- Includes complete app metadata: name, description, categories, and orientation settings
- Supports both regular and maskable icon purposes in a single efficient configuration

### Maskable Icons for Android

Android smartphones support **maskable icons** which adapt to various device themes and icon shapes. These icons are designed to fit within different mask shapes (circle, squircle, rounded rectangle, etc.) that different Android launchers and devices may apply.

#### Important Design Considerations

- **Safe zone requirement**: Maskable icons should be designed with content fitting within approximately **80% of the total canvas size**
- **Avoid edge placement**: Important visual elements should not be placed near the edges as they may be cropped by different mask shapes
- **Center-focused design**: Keep the main logo/content centered to ensure visibility across all mask variations

#### Creating Maskable Icons

Use [maskable.app](https://maskable.app) to:

- Test your existing icons against different mask shapes
- Preview how your icon will appear on various Android devices
- Generate properly sized maskable icons
- Validate that your design fits within the safe zone

#### Current Implementation

The project includes maskable icons in two sizes:

- `maskable_icon_x192.png` (192�192px)
- `maskable_icon_x512.png` (512�512px)

These are properly configured in the manifest with `"purpose": "any maskable"` which efficiently serves both regular icon display and Android's adaptive icon system. This combined purpose ensures optimal compatibility across all devices while reducing redundant icon definitions.

## Installation and App-like Experience

The PWA configuration enables users to:

- Install the app directly from their mobile browser
- Access the app from their home screen like a native app
- Experience full-screen or standalone display modes
- Benefit from offline capabilities (when implemented)

## Testing Mobile Deployment

When testing the mobile experience:

1. Test the PWA installation flow on various devices
2. Verify maskable icons display correctly across different Android launchers
3. Ensure responsive design works on various screen sizes
4. Test touch interactions and mobile-specific features
