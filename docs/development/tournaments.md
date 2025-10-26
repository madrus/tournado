# Tournaments Feature

The tournaments feature provides a complete tournament management system for administrators, including creation, editing, and mobile-optimized swipe-to-delete functionality. **Tournaments now appear as the first menu item for admin users** in the navigation.

## Overview

Tournaments are a core feature of the Tournado application, allowing administrators to:

- **Access via dedicated menu item** - First item in admin navigation menu
- Create new tournaments with essential details (name, location, dates, categories)
- View all tournaments in a responsive list
- Edit existing tournament information
- Delete tournaments with confirmation
- Mobile-optimized swipe gestures for deletion

## Navigation & Access

### Two Ways to Access Tournaments

Admin users can access the tournaments feature through **two different methods**:

#### 1. Context Menu Navigation (First Menu Item)

For **admin users**, tournaments appear as the first item in the navigation menu:

```typescript
// In AppBar.tsx - Menu structure for admin users:
const menuItems = [
   // Tournaments - only show for admin users, first item
   ...(isAdmin
      ? [
           {
              label: t('common.titles.tournaments'),
              icon: 'trophy' as IconName,
              href: '/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments',
              authenticated: true,
           },
        ]
      : []),
   // ... other menu items follow
]
```

#### 2. Admin Panel Button Access

Tournaments can also be accessed directly from the **Admin Panel dashboard**:

```typescript
// In a7k9m2x5p8w1n4q6r3y8b5t1._index.tsx - Admin Panel Dashboard
<div className='rounded-lg border bg-white p-6 shadow-sm'>
  <h3 className='mb-4 text-lg font-semibold'>
    Tournament Management
  </h3>
  <p className='text-foreground-light mb-4'>
    Create and manage tournaments and competitions.
  </p>
  <div className='mb-4 space-y-2'>
    <p className='text-foreground-light'>
      <strong>Total Tournaments:</strong> {tournaments.length}
    </p>
  </div>
  <Link
    to='/a7k9m2x5p8w1n4q6r3y8b5t1/tournaments'
    className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
  >
    Manage Tournaments
  </Link>
</div>
```

**Navigation Flow**: Admin Panel (`/a7k9m2x5p8w1n4q6r3y8b5t1`) → "Manage Tournaments" button → Tournaments List

### Access Control

- **Admin Users**:
   - Full access via context menu (first menu item)
   - Full access via Admin Panel dashboard button
   - Complete tournament management features
- **Regular Users**: No access to tournaments functionality (menu item hidden, no admin panel access)
- **Unauthenticated Users**: No access to tournaments functionality

## Architecture

### File Structure

```
app/
├── components/
│   ├── TournamentForm.tsx          # Form for creating/editing tournaments
│   └── inputs/
│       └── DateInputField.tsx      # Date input component
├── models/
│   └── tournament.server.ts        # Server-side tournament operations
├── routes/
│   └── a7k9m2x5p8w1n4q6r3y8b5t1/
│       └── tournaments/
│           ├── tournaments._index.tsx    # Tournament list with swipe-to-delete
│           ├── tournaments.$tournamentId.tsx  # Tournament details/edit
│           ├── tournaments.new.tsx       # New tournament creation
│           └── tournaments.tsx          # Tournament layout
└── features/
    └── tournaments/
        ├── types.ts                # Tournament type definitions
        └── validation.ts           # Tournament validation schemas
```

### Database Schema

```sql
model Tournament {
  id          String   @id @default(cuid())
  name        String
  location    String
  startDate   DateTime
  endDate     DateTime?
  categories  Json?    // Flexible categories storage
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Components

### TournamentForm

A comprehensive form component for creating and editing tournaments.

**Features:**

- Multi-language support with i18n
- Form validation using Zod schemas
- Date input handling with proper formatting
- Category management (flexible JSON storage)
- Submit state management

**Props:**

```typescript
type TournamentFormProps = {
   tournament?: Tournament
   mode: 'create' | 'edit'
}
```

**Usage:**

```tsx
// Create new tournament
<TournamentForm mode="create" />

// Edit existing tournament
<TournamentForm mode="edit" tournament={existingTournament} />
```

### DateInputField

Specialized input component for handling date inputs with proper localization.

**Features:**

- Browser-native date picker
- Locale-aware date formatting
- Validation integration
- Accessibility support

## Mobile Swipe-to-Delete

The tournament list implements a sophisticated swipe-to-delete feature optimized for mobile devices.

### Implementation Approach

We use a **sidebar/slider approach** instead of expanding elements:

1. **Two Fixed Blocks**: Content block + Red delete block
2. **Side-by-Side Layout**: Both blocks have full width (`w-full` and `w-screen`)
3. **Unified Movement**: The entire container slides as one unit using `translateX()`

### Technical Details

**Container Structure:**

```jsx
<div
   className='flex transition-transform duration-200'
   style={{ transform: `translateX(${x}px)` }}
>
   {/* Content Block - 100% width */}
   <div className='w-full flex-shrink-0 bg-white'>{/* Tournament content */}</div>

   {/* Delete Block - Screen width to prevent white space */}
   <div className='w-screen flex-shrink-0 bg-red-500'>{/* Delete button */}</div>
</div>
```

**Swipe Logic:**

- **Left Swipe**: Content moves left, revealing red delete area
- **Right Swipe**: Content moves right, hiding red delete area
- **50% Threshold**: At -200px, snaps to either delete state or normal state
- **Visual Feedback**: Border follows finger movement in real-time

**State Management:**

```typescript
type SwipeState = {
   x: number // Current position (-400 to 0)
   swiping: boolean // Currently being swiped
   showDelete: boolean // In persistent delete state
}
```

### Touch Event Handling

**handleTouchStart:**

- Initializes swipe state
- Differentiates between normal state and delete state start
- Sets up touch move and end listeners

**handleTouchMove:**

- Tracks finger movement with deltaX calculation
- Provides real-time visual feedback
- Handles both left and right swipe directions
- Progressive movement calculation for smooth animation

**handleTouchEnd:**

- Implements snap-to behavior based on 50% threshold
- Handles cancel logic for right swipes from delete state
- Cleans up event listeners

### Progressive Movement Logic

**Left Swipe (Normal → Delete):**

```typescript
// Direct movement mapping
finalX = clampedDeltaX // -400 to 0
showDelete = finalX < -50
```

**Right Swipe (Delete → Normal):**

```typescript
// Progressive calculation from delete state
const progress = Math.min(Math.max(deltaX, 0), 400) / 400 // 0 to 1
finalX = -400 + 400 * progress // -400 to 0 progressively
showDelete = finalX < -200 // 50% threshold
```

### Responsive Design

**Desktop:**

- Traditional table layout with click-to-delete buttons
- Grid system: Name+Location | Start Date | End Date | Actions
- Hover states and clean typography

**Mobile:**

- Card-style layout with swipe gestures
- Stacked date information
- Touch-optimized delete areas
- No visible delete elements initially

## API Routes

### Loader Function

```typescript
export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
   await requireUserWithMetadata(request, handle)
   const tournamentListItems = await getAllTournaments()
   return { tournamentListItems }
}
```

### Action Function

```typescript
export async function action({ request }: ActionArgs): Promise<Response> {
   await requireUserWithMetadata(request, handle)

   const formData = await request.formData()
   const intent = formData.get('intent')

   if (intent === 'delete') {
      const tournamentId = formData.get('tournamentId')
      await deleteTournamentById({ id: tournamentId })
      return redirect('.')
   }

   // Handle other intents...
}
```

## Server Models

### tournament.server.ts

**Core Functions:**

- `getAllTournaments()`: Fetches tournaments for listing
- `getTournamentById(id)`: Retrieves single tournament
- `createTournament(data)`: Creates new tournament
- `updateTournament(id, data)`: Updates existing tournament
- `deleteTournamentById(id)`: Soft or hard delete tournament

**Type Definitions:**

```typescript
type Tournament = {
   id: string
   name: string
   location: string
   startDate: Date
   endDate?: Date
   categories?: unknown
   createdAt: Date
   updatedAt: Date
}

type TournamentListItem = Pick<
   Tournament,
   'id' | 'name' | 'location' | 'startDate' | 'endDate'
>
```

## Validation

### Zod Schemas

```typescript
// Base tournament schema without translations (for server-side validation)
const baseTournamentSchema = z
   .object({
      name: z.string().min(1).max(100),
      location: z.string().min(1).max(100),
      startDate: z.iso.date(),
      endDate: z.iso.date(),
      divisions: z.array(z.string()).min(1),
      categories: z.array(z.string()).min(1),
   })
   .refine(formData => formData.endDate >= formData.startDate, {
      error: 'End date must be on or after start date',
      path: ['endDate'],
   })

// Factory function for creating schemas with translated error messages
const createTournamentFormSchema = (t: TFunction) =>
   z
      .object({
         name: z
            .string()
            .min(1, t('messages.tournament.nameRequired'))
            .max(100, t('messages.tournament.nameTooLong')),
         location: z
            .string()
            .min(1, t('messages.tournament.locationRequired'))
            .max(100, t('messages.tournament.locationTooLong')),
         startDate: z.iso.date({
            error: t('messages.tournament.invalidDateFormat'),
         }),
         endDate: z.iso.date({
            error: t('messages.tournament.invalidDateFormat'),
         }),
         divisions: z
            .array(z.string())
            .min(1, t('messages.tournament.divisionsRequired')),
         categories: z
            .array(z.string())
            .min(1, t('messages.tournament.categoriesRequired')),
      })
      .refine(formData => formData.endDate >= formData.startDate, {
         error: t('messages.tournament.endDateBeforeStartDate'),
         path: ['endDate'],
      })
```

## Internationalization

### Translation Keys

```json
{
   "tournaments": {
      "name": "Tournament name",
      "location": "Location",
      "startDate": "Start date",
      "endDate": "End date",
      "categories": "Categories",
      "noTournaments": "No tournaments found",
      "noTournamentsDescription": "Create your first tournament to get started",
      "deleteTournament": "Delete tournament",
      "createTournament": "Create tournament",
      "editTournament": "Edit tournament"
   },
   "admin": {
      "tournaments": {
         "allTournaments": "All tournaments",
         "allTournamentsDescription": "Manage and organize tournaments",
         "totalTournaments": "Total tournaments",
         "confirmDelete": "Are you sure you want to delete this tournament?"
      }
   }
}
```

### Dutch Localization

Following Dutch capitalization rules (sentence case):

```json
{
   "tournaments": {
      "name": "Toernoooi naam",
      "location": "Locatie",
      "deleteTournament": "Toernooi verwijderen"
   }
}
```

## Testing Considerations

### Unit Testing

- Component rendering with different states
- Form validation scenarios
- Server model functions
- Zod schema validation

### Integration Testing

- Full tournament CRUD operations
- Swipe gesture simulation
- Responsive layout testing
- Multi-language functionality

### Mobile Testing

- Touch event handling
- Swipe threshold accuracy
- Visual feedback responsiveness
- Gesture cancellation

## Performance Optimizations

### Touch Event Management

- Passive event listeners where appropriate
- Proper cleanup of event listeners
- Debounced state updates during swiping

### Responsive Images

- Optimized icon usage
- SVG icons for scalability
- Proper touch target sizing (minimum 44px)

### State Management

- Minimal re-renders during swipe
- Efficient state updates
- Local state for UI interactions

## Accessibility

### Keyboard Navigation

- Full keyboard support for desktop
- Focus management in modals
- Proper tab order

### Screen Readers

- Semantic HTML structure
- ARIA labels for actions
- Descriptive text for delete actions

### Touch Accessibility

- Minimum touch target sizes
- Clear visual feedback
- Alternative interaction methods

## Future Enhancements

### Potential Features

- Tournament brackets/matches
- Participant management
- Tournament statistics
- Export functionality
- Advanced filtering/search

### Technical Improvements

- Optimistic UI updates
- Enhanced error handling
- Offline support via service worker
- Real-time updates via WebSockets

## Best Practices

### Code Organization

- Separation of concerns (UI, logic, data)
- Reusable components
- Consistent naming conventions
- Proper TypeScript typing

### UX Design

- Progressive disclosure
- Clear visual hierarchy
- Intuitive gesture recognition
- Responsive feedback

### Error Handling

- Graceful degradation
- User-friendly error messages
- Proper validation feedback
- Network error recovery

This tournaments feature demonstrates modern web development practices including responsive design, progressive enhancement, accessibility, and mobile-first development approaches.
