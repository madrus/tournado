# Teams Route Refactoring Plan

**Date Created**: December 2024
**Status**: In Progress - Phase 1
**Goal**: Refactor teams route to work in both public and admin areas with new chip-based UI

## Overview

Transform the current teams route from a sidebar-based layout to a clean chip-based display that works in both public and admin contexts with different permission levels.

## Current State Analysis

### Current Teams Route Structure

- **Route**: `/teams` with sidebar for team list and main content area
- **Sidebar**: Shows team list with only team names
- **Main Area**: Shows team details when team is selected
- **Permissions**: Public can view/create teams, no admin functionality

### Current Database Schema Issue

⚠️ **Critical Issue Found**: The form collects `clubName` but **doesn't save it to database**!

- Form validates `clubName` field
- During team creation, `clubName` is discarded
- Only `teamName`, `teamClass`, `teamLeaderId`, `tournamentId` are saved

### Admin Area

- **Route**: `/a7k9m2x5p8w1n4q6r3y8b5t1` (encoded admin path)
- **Protection**: Role-based access control for ADMIN users only
- **Current State**: Basic admin dashboard, no team management

## Target State

### Public Area (`/teams`)

- ✅ **View teams as chips** (club name + team name on one line)
- ✅ **Create new teams** (anyone can create)
- ❌ **No team details view** (removed completely)
- ❌ **No team editing/deletion** (admin-only)
- ❌ **No sidebar** (replaced with chip grid)

### Admin Area (`/a7k9m2x5p8w1n4q6r3y8b5t1/teams`)

- ✅ **Full team CRUD operations**:
   - View teams list with admin controls
   - View team details
   - Edit teams
   - Delete teams
   - Create teams (admin can also create)

## Step-by-Step Implementation Plan

### Phase 1: Fix Data Model (Add Club Name Support)

_Must be done first since we want to display club names_

#### Step 1.1: Update Prisma Schema

```prisma
model Team {
  id            String     @id @default(cuid())
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  clubName      String     // ✅ ADD THIS FIELD
  teamName      String
  teamClass     String
  teamLeaderId  String
  teamLeader    TeamLeader @relation(fields: [teamLeaderId], references: [id], onDelete: Cascade)
  tournamentId  String
  tournament    Tournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  homeMatches   Match[]      @relation("Match_homeTeam")
  awayMatches   Match[]      @relation("Match_awayTeam")
}
```

#### Step 1.2: Create and Run Migration

```bash
npx prisma migrate dev --name add_club_name_to_team
```

#### Step 1.3: Update Team Model Functions

Update `app/models/team.server.ts` to:

- Include `clubName` in `createTeam` function
- Include `clubName` in `getAllTeamListItems` return type
- Include `clubName` in all relevant type definitions
- Handle existing teams without `clubName` (set default or nullable)

#### Step 1.4: Update Team Creation Action

Fix `app/routes/teams/teams.new.tsx` action to save `clubName`:

```typescript
const team = await createTeam({
   clubName: clubName!, // ✅ ADD THIS
   teamName: teamName!,
   teamClass: teamClass!,
   teamLeaderId: teamLeader.id,
   tournamentId: tournamentId!,
})
```

### Phase 2: Create Shared Team Components

_Create reusable components before refactoring routes_

#### Step 2.1: Create Team Chip Component

Create `app/components/TeamChip.tsx`:

```typescript
interface TeamChipProps {
   team: {
      id: string
      clubName: string
      teamName: string
   }
   onClick?: () => void
   showActions?: boolean // for admin context
   onDelete?: () => void // admin only
}
```

#### Step 2.2: Create Team List Component

Create `app/components/TeamList.tsx`:

```typescript
interface TeamListProps {
   teams: Array<{
      id: string
      clubName: string
      teamName: string
   }>
   context: 'public' | 'admin'
   onTeamClick?: (teamId: string) => void
   onTeamDelete?: (teamId: string) => void
}
```

### Phase 3: Create New Route Structure

#### Step 3.1: Public Teams Route (View + Create Only)

- **Create** `app/routes/teams.tsx` (simple layout, no sidebar)
- **Create** `app/routes/teams._index.tsx` (teams as chips display)
- **Update** `app/routes/teams.new.tsx` (keep public team creation, remove sidebar context)
- **Remove** `app/routes/teams.$teamId.tsx` (move functionality to admin area)

#### Step 3.2: Admin Teams Management (Full CRUD)

- **Create** `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams.tsx` (admin layout)
- **Create** `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams._index.tsx` (admin teams list)
- **Create** `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams.$teamId.tsx` (team details with edit/delete)
- **Create** `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams.new.tsx` (admin team creation)

#### Step 3.3: Update Route Protection

- Ensure admin routes inherit admin layout protection
- Update route metadata for new public routes
- Test role-based access control

### Phase 4: UI Implementation

#### Step 4.1: Implement Chip Layout

- Design responsive chip grid (mobile-first)
- One-line layout: Club name + Team name
- Proper touch targets for mobile
- Hover states for desktop

#### Step 4.2: Remove Sidebar Dependencies

- Update layouts to remove sidebar context
- Remove sidebar-specific CSS
- Update mobile navigation if needed

#### Step 4.3: Admin UI Enhancements

- Add delete buttons to admin team chips
- Create confirmation dialogs for destructive actions
- Add admin-specific team creation/editing forms

### Phase 5: Testing and Migration

#### Step 5.1: Update Tests

- Update Cypress tests for new route structure
- Test both public and admin team management flows
- Test responsive design on both mobile and desktop

#### Step 5.2: Update Navigation

- Update `app/components/AppBar.tsx` for admin team management link
- Update `app/components/mobileNavigation/BottomNavigation.tsx` if needed
- Ensure proper navigation between public and admin areas

#### Step 5.3: Data Migration (if needed)

- Handle existing teams without `clubName`
- Create migration script if default values needed
- Test with existing data

#### Step 5.4: Remove Old Files

**Only after everything is working:**

- Remove old `app/routes/teams/` directory
- Clean up unused components
- Remove sidebar-related code

## Important Notes

### Breaking Changes to Avoid

1. **Don't delete old routes until new ones are fully working**
2. **Preserve existing team creation functionality during transition**
3. **Maintain backward compatibility for existing teams**
4. **Keep current URL structure working until migration is complete**

### Testing Checklist

- [ ] Phase 1: Club names are saved and retrieved correctly
- [ ] Phase 2: Team components work in both contexts
- [ ] Phase 3: New routes work with proper permissions
- [ ] Phase 4: UI is responsive and accessible
- [ ] Phase 5: All existing functionality still works
- [ ] Phase 5: Admin-only features are properly protected

### Files to Update/Create

#### Phase 1

- [ ] `prisma/schema.prisma` - Add clubName field
- [ ] `app/models/team.server.ts` - Update functions
- [ ] `app/routes/teams/teams.new.tsx` - Fix action to save clubName

#### Phase 2

- [ ] `app/components/TeamChip.tsx` - New component
- [ ] `app/components/TeamList.tsx` - New component

#### Phase 3

- [ ] `app/routes/teams.tsx` - New public layout
- [ ] `app/routes/teams._index.tsx` - New public teams list
- [ ] `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams.tsx` - Admin layout
- [ ] `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams._index.tsx` - Admin list
- [ ] `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams.$teamId.tsx` - Admin details
- [ ] `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/a7k9m2x5p8w1n4q6r3y8b5t1.teams.new.tsx` - Admin creation

#### Phase 5 (Cleanup)

- [ ] Remove `app/routes/teams/` directory (old structure)
- [ ] Update navigation components
- [ ] Update tests

## Current Progress

- [x] **Plan Created** - This document
- [x] **Phase 1.1** - Update Prisma schema ✅ Added clubName field
- [x] **Phase 1.2** - Run migration ✅ All existing teams now have clubName 'sv DIO'
- [x] **Phase 1.3** - Update team model functions ✅ Updated createTeam, getAllTeamListItems, getTeamListItems
- [x] **Phase 1.4** - Fix team creation action ✅ Now saves clubName to database
- [ ] **Phase 2.1** - Create Team Chip Component
- [ ] **Phase 2.2** - Create Team List Component

## Next Steps

1. **Start with Phase 1.1**: Update the Prisma schema to add `clubName` field
2. **Test thoroughly**: Ensure no existing functionality breaks
3. **Proceed incrementally**: Complete each phase before moving to the next

---

**Last Updated**: December 2024
**Contact**: Continue from this plan if conversation is lost
