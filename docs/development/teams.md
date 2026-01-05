# Teams Feature

The teams feature provides a comprehensive team management system for tournament organization, including team creation, editing, and multi-language support with advanced form validation.

## Overview

Teams are a fundamental feature of the Tournado application, allowing users to:

- Create new teams with detailed information (name, club, captain details, division)
- View all teams in a responsive list
- Edit existing team information
- Manage team captain information
- Support for multiple tournament contexts
- Advanced form validation with real-time feedback

## Architecture

### File Structure

```text
app/
├── components/
│   ├── TeamForm.tsx                # Form for creating/editing teams
│   ├── TeamList.tsx               # Team listing component
│   ├── TeamChip.tsx               # Team display chip component
│   └── inputs/
│       ├── TextInputField.tsx     # Text input component
│       └── ComboField.tsx         # Dropdown/select component
├── models/
│   └── team.server.ts             # Server-side team operations
├── routes/
│   ├── teams/                     # Public team routes
│   │   ├── teams._index.tsx       # Public team list
│   │   ├── teams.$teamId.tsx      # Team details/edit
│   │   ├── teams.new.tsx          # New team creation
│   │   └── teams.tsx              # Team layout
│   └── a7k9m2x5p8w1n4q6r3y8b5t1/
│       └── teams/                 # Admin team routes
│           ├── teams._index.tsx   # Admin team management
│           ├── teams.$teamId.tsx  # Admin team details
│           ├── teams.new.tsx      # Admin team creation
│           └── teams.tsx          # Admin team layout
└── features/
    └── teams/
        ├── types.ts               # Team type definitions
        └── validation.ts          # Team validation schemas
```

### Database Schema

```sql
model Team {
  id              String   @id @default(cuid())
  name            String
  clubName        String?
  captainName     String
  captainEmail    String
  captainPhone    String?
  division        Division
  tournamentId    String?
  tournament      Tournament? @relation(fields: [tournamentId], references: [id], onDelete: SetNull)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([name, tournamentId])
}

enum Division {
  SENIORS
  YOUTH
  VETERANS
  WOMEN
  MIXED
}
```

## Components

### TeamForm

A comprehensive form component for creating and editing teams with advanced validation.

**Features:**

- Multi-language support with i18n
- Real-time form validation using custom hooks
- Division selection with localized options
- Tournament context support
- Captain information management
- Submit state management with loading indicators

**Props:**

```typescript
type TeamFormProps = {
   team?: Team
   mode: 'create' | 'edit'
   tournamentId?: string
}
```

**Usage:**

```tsx
// Create new team
<TeamForm mode="create" />

// Create team for specific tournament
<TeamForm mode="create" tournamentId="tournament-id" />

// Edit existing team
<TeamForm mode="edit" team={existingTeam} />
```

### TeamList

Responsive team listing component with filtering and search capabilities.

**Features:**

- Responsive grid layout
- Team filtering by division
- Search functionality
- Pagination support
- Empty state handling

### TeamChip

Compact team display component for showing team information in lists.

**Features:**

- Color-coded by division
- Tooltip with additional information
- Click handlers for navigation
- Responsive sizing

## Form Validation

### Custom Hook: useTeamFormValidation

Advanced validation hook providing real-time validation feedback.

**Features:**

- Field-level validation
- Cross-field validation
- Async validation for uniqueness
- Error message localization
- Submit state management

**Usage:**

```typescript
const {
   values,
   errors,
   touched,
   isSubmitting,
   handleChange,
   handleBlur,
   handleSubmit,
   setFieldValue,
} = useTeamFormValidation({
   initialValues: team || defaultTeamValues,
   mode,
   tournamentId,
})
```

### Validation Rules

```typescript
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]+$/

export const baseTeamSchema = z.object({
   tournamentId: z.string().min(1),
   name: z.string().min(1).max(50),
   clubName: z.string().min(1).max(100),
   division: z.string().min(1),
   category: z.string().min(1),
   teamLeaderName: z.string().min(1).max(100),
   teamLeaderPhone: z
      .string()
      .min(1)
      .pipe(
         z.string().refine(val => PHONE_REGEX.test(val), {
            error: 'Invalid phone number format',
         })
      ),
   teamLeaderEmail: z
      .string()
      .min(1)
      .pipe(z.email({ error: 'Invalid email address' })),
   privacyAgreement: z.boolean().refine(val => val, {
      error: 'Privacy agreement is required',
   }),
})

// Additional validation for team name uniqueness
export const TeamFormSchema = TeamSchema.refine(
   async data => {
      if (mode === 'edit' && data.name === originalTeam?.name) {
         return true
      }
      return await isTeamNameUnique(data.name, data.tournamentId)
   },
   {
      message: 'A team with this name already exists',
      path: ['name'],
   }
)
```

## Division System

### Division Types

```typescript
enum Division {
   SENIORS = 'SENIORS', // Adult competition
   YOUTH = 'YOUTH', // Under-18 competition
   VETERANS = 'VETERANS', // Over-35 competition
   WOMEN = 'WOMEN', // Women's competition
   MIXED = 'MIXED', // Mixed gender competition
}
```

### Division Localization

```json
{
   "divisions": {
      "SENIORS": {
         "en": "Seniors",
         "nl": "Senioren",
         "tr": "Büyükler",
         "ar": "الكبار"
      },
      "YOUTH": {
         "en": "Youth",
         "nl": "Jeugd",
         "tr": "Gençler",
         "ar": "الشباب"
      },
      "VETERANS": {
         "en": "Veterans",
         "nl": "Veteranen",
         "tr": "Veteranlar",
         "ar": "المخضرمون"
      },
      "WOMEN": {
         "en": "Women",
         "nl": "Vrouwen",
         "tr": "Kadınlar",
         "ar": "النساء"
      },
      "MIXED": {
         "en": "Mixed",
         "nl": "Gemengd",
         "tr": "Karma",
         "ar": "مختلط"
      }
   }
}
```

## API Routes

### Loader Functions

```typescript
// Public team list
export async function loader({ params }: LoaderArgs): Promise<LoaderData> {
  const teams = await getAllTeams()
  return { teams }
}

// Admin team list
export async function loader({ request }: LoaderArgs): Promise<LoaderData> {
  await requireUserWithMetadata(request, handle)
  const teams = await getAllTeamsWithDetails()
  return { teams }
}

// Team details
export async function loader({ params }: LoaderArgs): Promise<LoaderData> {
  const team = await getTeamById(params.teamId!)
  if (!team) {
    throw new Response('Team not found', { status: 404 })
  }
  return { team }
}
```

### Action Functions

```typescript
export async function action({ request }: ActionArgs): Promise<Response> {
   const formData = await request.formData()
   const intent = formData.get('intent')

   switch (intent) {
      case 'create':
         const createData = await parseTeamFormData(formData)
         const newTeam = await createTeam(createData)
         return redirect(`/teams/${newTeam.id}`)

      case 'update':
         const updateData = await parseTeamFormData(formData)
         const teamId = formData.get('teamId') as string
         await updateTeam(teamId, updateData)
         return redirect(`/teams/${teamId}`)

      case 'delete':
         const deleteTeamId = formData.get('teamId') as string
         await deleteTeam(deleteTeamId)
         return redirect('/teams')

      default:
         throw new Response('Invalid intent', { status: 400 })
   }
}
```

## Server Models

### team.server.ts

**Core Functions:**

- `getAllTeams()`: Fetches teams for public listing
- `getAllTeamsWithDetails()`: Fetches teams with additional admin data
- `getTeamById(id)`: Retrieves single team with full details
- `createTeam(data)`: Creates new team with validation
- `updateTeam(id, data)`: Updates existing team
- `deleteTeam(id)`: Soft delete team
- `isTeamNameUnique(name, tournamentId?)`: Checks name uniqueness

**Type Definitions:**

```typescript
type Team = {
   id: string
   name: string
   clubName?: string
   captainName: string
   captainEmail: string
   captainPhone?: string
   division: Division
   tournamentId?: string
   tournament?: Tournament
   createdAt: Date
   updatedAt: Date
}

type TeamListItem = Pick<Team, 'id' | 'name' | 'clubName' | 'division'>

type TeamFormData = Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'tournament'>
```

## Responsive Design

### Desktop Layout

- **Grid System**: 3-4 column layout with proper spacing
- **Form Layout**: Two-column form with logical grouping
- **Navigation**: Sidebar navigation with breadcrumbs
- **Actions**: Hover states and clear action buttons

### Mobile Layout

- **Card Design**: Full-width cards with touch-friendly targets
- **Single Column**: Stacked form fields for easy completion
- **Bottom Navigation**: Mobile-optimized navigation
- **Swipe Actions**: Consideration for future swipe-to-edit functionality

### Responsive Breakpoints

```css
/* Mobile First Approach */
.team-grid {
   @apply grid grid-cols-1 gap-2;
}

/* Tablet */
@screen md {
   .team-grid {
      @apply grid-cols-2 gap-4;
   }
}

/* Desktop */
@screen lg {
   .team-grid {
      @apply grid-cols-3 gap-6;
   }
}

/* Large Desktop */
@screen xl {
   .team-grid {
      @apply grid-cols-4;
   }
}
```

## Internationalization

### Translation Keys

```json
{
   "teams": {
      "teamName": "Team name",
      "clubName": "Club name",
      "captainName": "Captain name",
      "captainEmail": "Captain email",
      "captainPhone": "Captain phone",
      "division": "Division",
      "tournament": "Tournament",
      "createTeam": "Create team",
      "editTeam": "Edit team",
      "deleteTeam": "Delete team",
      "teamInfo": "Team information",
      "captainInfo": "Captain information",
      "noTeams": "No teams found",
      "noTeamsDescription": "Create your first team to get started"
   },
   "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "phone": "Please enter a valid phone number",
      "maxLength": "Must be {{max}} characters or less",
      "teamNameExists": "A team with this name already exists"
   }
}
```

### Dutch Localization

Following Dutch capitalization rules:

```json
{
   "teams": {
      "teamName": "Teamnaam",
      "clubName": "Clubnaam",
      "captainName": "Aanvoerdernaam",
      "captainEmail": "Aanvoerder e-mail",
      "captainPhone": "Aanvoerder telefoon",
      "division": "Divisie",
      "createTeam": "Team aanmaken",
      "teamInfo": "Team informatie",
      "captainInfo": "Aanvoerder informatie"
   }
}
```

## Security & Authorization

### Public Access

- Team listing (read-only)
- Team details (read-only)
- Team registration (create-only)

### Authenticated Access

- Edit own teams
- View captain contact details
- Team management dashboard

### Admin Access

- Full CRUD operations
- View all team details
- Bulk operations
- Team statistics and reports

## Performance Optimizations

### Database Queries

- Indexed team name and tournament combinations
- Optimized joins for team listings
- Pagination for large team lists
- Caching for division lookups

### Client-Side Performance

- Form debouncing for real-time validation
- Lazy loading for team details
- Optimistic UI updates
- Image optimization for team logos

### SEO Optimization

- Meta tags for team pages
- Structured data for teams
- Sitemap generation
- Social media previews

## Testing Strategy

### Unit Tests

- Component rendering
- Form validation logic
- Server model functions
- Utility functions

### Integration Tests

- Full team CRUD workflows
- Form submission and validation
- Authentication and authorization
- Multi-language functionality

### E2E Tests

- Team registration flow
- Team editing workflow
- Admin management features
- Responsive layout testing

## Future Enhancements

### Planned Features

- Team logos and photos
- Player roster management
- Team statistics tracking
- Tournament registration integration
- Team communication tools

### Technical Improvements

- Real-time collaboration
- Advanced search and filtering
- Bulk import/export
- API endpoints for mobile apps
- Enhanced analytics

## Best Practices

### Data Management

- Consistent validation across client and server
- Proper error handling and user feedback
- Data integrity through database constraints
- Audit logging for administrative actions

### User Experience

- Clear form validation messages
- Progressive disclosure of information
- Consistent navigation patterns
- Accessible design principles

### Code Quality

- TypeScript for type safety
- Comprehensive testing coverage
- Consistent code formatting
- Documentation and comments

This teams feature exemplifies modern web application development with comprehensive form handling, real-time validation, responsive design, and multi-language support.
