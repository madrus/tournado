# UI Components

This document describes the key UI components in the Tournado application, with special focus on components that implement role-based access control.

## AppBar Component

The `AppBar` component provides the main navigation header for the application, including a context menu that adapts based on user authentication status and role permissions.

### Location

- **Component**: `app/components/AppBar.tsx`
- **Tests**: `app/components/__tests__/AppBar.test.tsx`

### Context Menu Functionality

The AppBar includes a responsive context menu (UserMenu) that displays different menu items based on the user's authentication status and role. The menu uses a unified implementation that adapts automatically to both mobile and desktop viewports.

#### Role-Based Access Control

The application supports three distinct user contexts:

##### 1. **Public Users (Not Authenticated)**

- **Status**: `authenticated = false`
- **User Object**: `null`
- **Visible Menu Items**:
   - Teams (public access)
   - About (public access)
   - Language Selector
   - Sign In

##### 2. **Authenticated Non-Admin Users**

- **Status**: `authenticated = true`
- **Roles**: `PUBLIC`, `TOURNAMENT_MANAGER`, `REFEREE_COORDINATOR`, `REFEREE`
- **Visible Menu Items**:
   - Teams (public access)
   - Profile (authenticated only)
   - Settings (authenticated only)
   - About (public access)
   - Language Selector
   - Sign Out

##### 3. **Admin Users**

- **Status**: `authenticated = true`
- **Role**: `ADMIN`
- **Visible Menu Items**:
   - **Tournaments** (admin only) - First menu item
   - Teams (admin view)
   - **Admin Panel** (admin only)
   - Profile (authenticated only)
   - Settings (authenticated only)
   - About (public access)
   - Language Selector
   - Sign Out

#### Menu Structure

The context menu follows a consistent structure:

1. **Tournaments** - First for admin users only, with trophy icon
2. **Teams** - Available to all users (admin view for admins, public view for others)
3. **Divider** - Visual separator
4. **Admin Panel** - Only visible to users with `ADMIN` role
5. **Profile** - Available to authenticated users
6. **Settings** - Available to authenticated users
7. **About** - Available to all users
8. **Language Selector** - Available to all users
9. **Authentication Action** - Sign In (public) or Sign Out (authenticated)

#### Implementation Details

The role-based visibility is implemented through:

```typescript
// Check if user is admin
const isAdmin = user?.role === 'ADMIN'

// Admin Panel menu item - only added for admin users
...(isAdmin
  ? [
      {
        label: t('common.titles.adminPanel'),
        icon: 'admin_panel_settings',
        href: '/admin',
        authenticated: true,
      },
    ]
  : []),
```

Menu items are filtered based on authentication status:

```typescript
menuItems.filter(item => !item.authenticated || isAuthenticated)
```

This ensures that:

- Items marked `authenticated: true` only appear for authenticated users
- Items marked `authenticated: false` appear for all users
- Admin-specific items are conditionally added to the menu array

### Language Support

The context menu includes an integrated language switcher that:

- Displays "Language" as the menu item with a language icon
- Provides a submenu with all supported languages (Dutch, English, Arabic, Turkish)
- Uses flag emojis for visual identification of each language
- Highlights the currently active language with a light emerald background
- Maintains language state across the application through reactive persistence
- Uses the `useLanguageSwitcher` hook for language changes
- Supports proper RTL positioning for Arabic language mode

### Responsive Design

The AppBar renders a single unified UserMenu component that automatically adapts to different screen sizes:

- **Mobile Behavior**: Dropdown menu with touch-friendly interactions and collision detection
- **Desktop Behavior**: Dropdown menu with hover states and proper spacing from viewport edges

The unified implementation ensures consistent menu items and functionality across all devices while providing optimal positioning and spacing for each viewport size.

### Testing

The context menu functionality is thoroughly tested with 19 comprehensive unit tests covering:

- **Role-based visibility**: Verifies correct menu items for each user type
- **Authentication filtering**: Ensures protected items only show to authenticated users
- **Menu structure consistency**: Validates proper ordering and divider placement
- **Unified menu design**: Tests the single responsive menu implementation
- **Edge cases**: Handles null users, role changes, and navigation states

### Security Considerations

The context menu implements client-side UI filtering for user experience, but security is enforced at multiple levels:

1. **Server-side route protection**: Protected routes verify user permissions
2. **Component-level access control**: Components check user roles before rendering
3. **Database-level permissions**: User roles are validated against database records

The context menu serves as the first line of defense by hiding unauthorized options, but all security decisions are ultimately validated server-side.

## UserMenu Component

The `UserMenu` component is a reusable dropdown/overlay menu that powers the AppBar's context menu functionality.

### Location

- **Component**: `app/components/UserMenu.tsx`

### Features

- Unified responsive design that adapts to mobile and desktop viewports
- Support for dividers and submenus
- Icon integration with Material Symbols
- Customizable menu items with authentication requirements
- RTL (Right-to-Left) language support with proper positioning
- Keyboard navigation support
- Auto-close on navigation
- Collision detection to prevent off-screen positioning

### Props Type

```typescript
type MenuItemType = {
   label: string
   icon: string
   href?: string
   todo?: boolean
   action?: JSX.Element
   customIcon?: string
   authenticated?: boolean
   divider?: boolean
   subMenu?: Array<{
      label: string
      customIcon: string
      onClick: () => void
      active: boolean
   }>
}
```

This component provides the foundation for any dropdown menu needs throughout the application while maintaining consistent styling and behavior.
