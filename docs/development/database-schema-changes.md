# Database Schema Changes

This document tracks significant changes to the database schema over time.

## December 2024: Category Field Addition

### Overview

Added support for team categories (e.g., JO8, MO9, 35+) to enable better tournament organization and team classification.

### Migration: `20250613172548_add_categories_to_tournament`

**Date**: December 13, 2024
**Purpose**: Add category field to Tournament and Team models

### Changes Made

#### 1. Tournament Model Updates

**Added Field:**

```prisma
model Tournament {
  // ... existing fields ...
  categories Json       // array of category strings (as JSON in SQLite)
  // ... existing fields ...
}
```

**Description:**

- **Field**: `categories`
- **Type**: `Json` (SQLite limitation - stores array as JSON)
- **Purpose**: Stores available categories for the tournament (e.g., `["JO8", "JO9", "JO10", "MO8", "MO9", "35+"]`)
- **Required**: Yes
- **Example**: `["JO8", "JO9", "JO10", "MO8", "MO9"]`

#### 2. Team Model Updates

**Added Field:**

```prisma
model Team {
  // ... existing fields ...
  category      String      // e.g., JO8, MO9, 35+
  // ... existing fields ...
}
```

**Description:**

- **Field**: `category`
- **Type**: `String`
- **Purpose**: Specifies which category the team belongs to
- **Required**: Yes
- **Example**: `"JO8"`, `"MO9"`, `"35+"`
- **Validation**: Must be one of the categories available in the associated tournament

### Frontend Changes

#### 1. TeamForm Component Updates

**New Category Field:**

- Added category selection dropdown in `TeamForm.tsx`
- Categories are dynamically loaded based on selected tournament
- Field appears between Club Name and Division fields
- Includes proper validation and error handling

**Key Features:**

- **Dynamic Options**: Categories populate based on tournament selection
- **Validation**: Required field with client-side and server-side validation
- **Internationalization**: Supports multiple languages (Dutch, English, French, Arabic, Turkish)
- **Responsive Design**: Consistent with existing form layout

#### 2. Translation Updates

**Added Keys:**

```json
{
	"teams": {
		"form": {
			"category": "Category",
			"selectCategory": "Select category"
		}
	}
}
```

**Languages Updated:**

- English (`en.json`)
- Dutch (`nl.json`)
- French (`fr.json`)
- Arabic (`ar.json`)
- Turkish (`tr.json`)

### Backend Changes

#### 1. Type System Updates

**Updated Types in `lib.types.ts`:**

```typescript
type TournamentData = {
	// ... existing fields ...
	categories: string[]
	// ... existing fields ...
}

type TeamFormData = {
	// ... existing fields ...
	category: string
	// ... existing fields ...
}
```

#### 2. Validation Schema Updates

**Updated Zod Schemas in `lib.zod.ts`:**

```typescript
export const teamFormSchema = z.object({
	// ... existing fields ...
	category: z.string().min(1, 'teams.form.errors.categoryRequired'),
	// ... existing fields ...
})

export const tournamentSchema = z.object({
	// ... existing fields ...
	categories: z.array(z.string()).min(1),
	// ... existing fields ...
})
```

#### 3. Server Model Updates

**Updated `team.server.ts`:**

- Added category field to team creation and updates
- Added category to team list queries
- Updated form data processing to handle category field

### Data Migration Strategy

**For Existing Data:**

- The migration adds required fields without default values
- Existing teams need category values assigned during migration
- Existing tournaments need categories array populated

**Recommended Migration Data:**

```sql
-- Example: Assign default categories during migration
UPDATE Tournament SET categories = '["JO8", "JO9", "JO10", "MO8", "MO9"]' WHERE categories IS NULL;
UPDATE Team SET category = 'JO8' WHERE category IS NULL;
```

### Testing Updates

#### 1. Unit Test Updates

**TeamForm Tests (`TeamForm.test.tsx`):**

- Added tests for category field rendering
- Added tests for category validation
- Added tests for dynamic category loading based on tournament selection
- Updated mock data to include category field

**Mock Data Updates:**

```typescript
const mockTournaments = [
	{
		id: 'tournament-1',
		name: 'Spring Tournament',
		location: 'Sports Center',
		categories: ['JO8', 'JO9', 'JO10'], // Added categories
		divisions: ['PREMIER_DIVISION', 'FIRST_DIVISION'],
		startDate: '2024-03-15',
	},
]
```

#### 2. Test Coverage

**New Test Cases:**

- Category field placeholder text validation
- Category field requirement validation
- Category options populated from tournament selection
- Form submission with category data
- Category field error display

### Performance Considerations

#### 1. Database Queries

**Tournament Queries:**

- Categories are loaded as JSON and parsed in TypeScript
- No additional queries needed - categories come with tournament data

**Team Queries:**

- Category is a simple string field - no joins required
- Indexed for filtering if needed in the future

#### 2. Frontend Performance

**Form Updates:**

- Category options update reactively when tournament changes
- No additional API calls needed - categories come with tournament data
- Form validation runs client-side for immediate feedback

### Usage Examples

#### 1. Creating a Tournament with Categories

```typescript
const tournamentData = {
	name: 'Youth Soccer Tournament',
	location: 'City Sports Complex',
	divisions: ['PREMIER_DIVISION', 'FIRST_DIVISION'],
	categories: ['JO8', 'JO9', 'JO10', 'MO8', 'MO9'], // New field
	startDate: '2024-06-15',
	endDate: '2024-06-16',
}
```

#### 2. Creating a Team with Category

```typescript
const teamData = {
	tournamentId: 'tournament-123',
	category: 'JO8', // New field
	division: 'PREMIER_DIVISION',
	clubName: 'FC Ajax',
	teamName: 'Eagles',
	teamLeaderName: 'John Doe',
	teamLeaderEmail: 'john@example.com',
	teamLeaderPhone: '+1234567890',
}
```

### Future Considerations

#### 1. Category Management

**Potential Enhancements:**

- Add category management interface for admins
- Implement category templates for common tournament types
- Add category-specific rules or settings

#### 2. Reporting and Analytics

**Category-Based Features:**

- Team statistics by category
- Category-specific tournament brackets
- Age group progression tracking

#### 3. Validation Enhancements

**Advanced Validation:**

- Category format validation (e.g., age group patterns)
- Category availability validation against tournament
- Cross-field validation between category and division

### Migration Rollback

**If Rollback Needed:**

```sql
-- Remove category fields (destructive - backup first!)
PRAGMA foreign_keys=OFF;

-- Recreate Team table without category
CREATE TABLE "Team_backup" AS SELECT * FROM "Team";
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamLeaderId" TEXT NOT NULL,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE,
    CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "TeamLeader" ("id") ON DELETE CASCADE
);
INSERT INTO "new_Team" SELECT "id", "createdAt", "updatedAt", "tournamentId", "division", "clubName", "teamName", "teamLeaderId" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";

-- Similar process for Tournament table categories field
PRAGMA foreign_keys=ON;
```

### Related Documentation

- [Database Development Guide](database.md)
- [Teams Refactoring Plan](teams-refactoring-plan.md)
- [Type System Documentation](type-system.md)
- [Testing Guidelines](../testing/README.md)

---

**Status**: ✅ Complete
**Next Review**: March 2025 (quarterly schema review)
