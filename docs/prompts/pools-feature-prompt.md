# Agent Prompt — Pools & Reserve Feature for Tournado

## Context

- **App**: Tournado — manage tournaments, teams, matches.
- **Tech stack**: React Router v7, Vite, Tailwind, Zustand (state), Prisma + SQLite.
- **Admin panel** currently: Team Mgmt, Tournament Mgmt, Matches Mgmt (dummy).
- **Goal**: add **Pools management** to group teams into pools per tournament, with drag-and-drop and a global Reserve (unassigned bag).

---

## Stepwise Objectives (Incremental Delivery)

1. **Create Pools Infrastructure**
   - Add admin menu entry **“Pools”** that routes to a Pools UI for a selected tournament.
   - Create PoolSet (name, pools count, slots per pool, autoFill toggle).
   - Auto-distribute already registered teams round-robin.
   - Display pools and reserve with placeholders.
   - ✅ At this step: you can create PoolSets and see pools/reserve filled with teams.

2. **Manual Editing Basics**
   - Allow adding/removing teams from Reserve.
   - Reassign teams to first available slot when a new team is registered.
   - ✅ At this step: Reserve works as a holding area; new teams auto-insert.

3. **Drag & Drop Mechanics**
   - Implement drag-and-drop using `@dnd-kit`.
   - Pool ↔ Reserve (move or swap).
   - Pool ↔ Pool (swap).
   - Visual feedback (color pulse, highlight, swap animation).
   - ✅ At this step: full manual rearrangement works.

4. **UX Polish & A11y**
   - Responsive layouts (mobile drawer for Reserve, desktop side panel).
   - Smooth animations (Framer Motion).
   - Light/dark gradients consistent with app.
   - Keyboard accessibility (lift/drop with Space/Enter, ARIA live announcements).
   - ✅ At this step: polished, accessible UI.

5. **Persistence & Tests**
   - Wire Zustand actions to Prisma API.
   - Add optimistic updates with rollback.
   - Unit tests: distribution, pushFirstAvailable, swap.
   - E2E tests: Playwright — create PoolSet, drag team to Reserve, swap, add team.
   - ✅ At this step: stable, tested, persisted feature.

---

## Data Model (Prisma, lean version)

```prisma
model Tournament {
  id         String     @id @default(cuid())
  name       String
  location   String
  divisions  Json       // array of Division enum values as JSON (SQLite limitation)
  categories Json       // array of Category enum values as JSON (SQLite limitation)
  startDate  DateTime
  endDate    DateTime?
  teams      Team[]
  poolSets   PoolSet[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model Team {
  id            String     @id @default(cuid())
  name          String
  tournamentId  String
  tournament    Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  category      Category   // e.g., JO8, JO9, VETERANEN_35_PLUS
  division      Division
  clubName      String
  teamLeaderId  String
  teamLeader    TeamLeader @relation(fields: [teamLeaderId], references: [id], onDelete: Cascade)
  poolSlot      PoolSlot?  @relation("TeamPoolSlot")
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@index([tournamentId])
}

model PoolSet {
  id            String     @id @default(cuid())
  tournament    Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  tournamentId  String
  name          String
  categories    Json       // array of Category enum values as JSON (SQLite limitation)
  pools         Pool[]
  configPools   Int
  configSlots   Int
  autoFill      Boolean    @default(true)
  poolSlots     PoolSlot[]
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@unique([tournamentId, name])
  @@index([tournamentId])
}

model Pool {
  id        String   @id @default(cuid())
  poolSet   PoolSet  @relation(fields: [poolSetId], references: [id], onDelete: Cascade)
  poolSetId String
  name      String   // e.g. "Pool A"
  order     Int
  slots     PoolSlot[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([poolSetId, name])
  @@unique([poolSetId, order])
  @@index([poolSetId])
}

model PoolSlot {
  id        String  @id @default(cuid())
  poolSet   PoolSet @relation(fields: [poolSetId], references: [id], onDelete: Cascade)
  poolSetId String
  pool      Pool?   @relation(fields: [poolId], references: [id], onDelete: SetNull)
  poolId    String?         // null ⇒ Reserve
  slotIndex Int             // 0..N-1 inside pool
  team      Team?   @relation("TeamPoolSlot", fields: [teamId], references: [id], onDelete: SetNull)
  teamId    String? @unique // null ⇒ placeholder

  @@unique([poolId, slotIndex]) // each slot unique inside a pool
  @@index([poolSetId])
}
```

**Key Design Decisions Made:**

- **Categories per PoolSet**: Each PoolSet specifies which categories (e.g., [JO8, JO9]) it handles
- **Auto-assignment workflow**: When a PoolSet is created, all teams matching its categories are automatically moved to Reserve
- **Teams exist independently**: Teams can be created before any PoolSets exist
- **One-to-one relationship**: Each team can be in at most one slot; each slot can have at most one team
- **Reserve is virtual**: Reserve slots are just PoolSlots where `poolId = null`
- **Unique team constraint**: `teamId @unique` ensures each team can only be in one slot across the entire system
- **Realistic team naming**: Different clubs can have teams with the same names (e.g., multiple "JO8-1" teams)

---

## State & Actions (Zustand)

- `createPoolSet(tournamentId, name, categories, poolsCount, slotsPerPool, autoFill)`
- `autoDistributeByCategories(poolSetId, categories)` - Auto-assign teams matching categories to Reserve
- `autoDistributeToPoolsRoundRobin(poolSetId)` - Distribute Reserve teams to pools round-robin
- `pushTeamToFirstAvailable(poolSetId, teamId)`
- `moveOrSwap(poolSetId, fromSlotId, toSlotId | "RESERVE")`
- `onTeamRegistered(tournamentId, teamId)` - Auto-assign to matching PoolSets' Reserve

---

## Routing (RRv7)

```ts
route({ path: "admin/tournaments/:tournamentId/pools", element: <PoolsLayout /> }, [
  layout({ element: <PoolsSetShell /> }, [
    index({ element: <PoolsDashboard /> }),
    route({ path: "new", element: <PoolSetWizard /> }),
    route({ path: ":poolSetId", element: <PoolSetBoard /> }),
    route({ path: ":poolSetId/settings", element: <PoolSetSettings /> }),
  ]),
])
```

---

## UX & UI

- **Mobile-first** design.
- Pools stacked vertically; Reserve as drawer.
- Desktop: pools in grid; Reserve as side panel.
- Drag-and-drop with visual highlights (pulse, tilt, swap animation).
- Light/dark gradients consistent with app theme.
- Keyboard a11y: focus + Space/Enter; ARIA live updates.

---

## Acceptance Criteria per Step

1. Can create PoolSet and auto-see pools filled with teams.
2. Reserve visible; new teams auto-assigned or reserved.
3. Drag & Drop works for Pool ↔ Pool and Pool ↔ Reserve.
4. Responsive, polished UI with animations and a11y.
5. All persisted in DB, tested via Vitest + Playwright.

---

## Deliverables

1. Prisma schema & migration.
2. Zustand slice with tested actions.
3. React components with DnD.
4. API endpoints with optimistic updates.
5. Playwright tests for flows.

---

## Test Data

The seed file now includes **23 JO8 teams** from different clubs for testing the pools feature:

- Teams from clubs: Arsenal, Wolves, Phoenix, Thunder, Lightning, etc.
- Realistic team names: Multiple clubs can have "JO8-1", "JO8-2", etc.
- All teams assigned to **Spring Cup** tournament with JO8 category
- Perfect for testing auto-assignment to PoolSets with JO8 category

Example teams:

- Arsenal JO8-1
- Wolves JO8-1
- Phoenix JO8-2
- Thunder JO8-2
- etc.

## Open Decisions

- Reserve naming: using **Reserve** instead of Bench.
- PoolSet stages: support multiple per tournament.
- Seeding logic: not yet (future extension).
