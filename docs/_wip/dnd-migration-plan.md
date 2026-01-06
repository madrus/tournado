# Group Stage Drag-and-Drop Assignment System

## Overview

The group stage assignment interface provides a drag-and-drop experience where teams can be assigned to group slots, moved between slots, returned to confirmed pool, or moved to waitlist. The system maintains smooth animations, supports RTL layouts, and handles both confirmed teams and waitlist teams with distinct behaviors.

## Core Principles

- Client-side zustand store maintains state during editing
- SAVE and CANCEL are the only persistence boundaries
- Touch sensors and pointer sensors support mobile and desktop interactions
- State changes never corrupt data - validation happens at save time
- Conflict detection validates against server version on save
- Team status (confirmed/waitlist) is explicitly maintained, not calculated by array position
- Drag-to-waitlist replaces traditional delete functionality ("soft delete")

## Architecture

### DnD Library Configuration

- **Library**: @dnd-kit/core v6.3.1 with @dnd-kit/modifiers v9.0.0
- **Collision Detection**: `pointerWithin` strategy for accurate slot targeting
- **Sensors**: PointerSensor (8px activation distance), TouchSensor (200ms delay, 8px tolerance), KeyboardSensor
- **Measuring**: `MeasuringStrategy.Always` for droppable elements
- **DragOverlay**: Uses `snapCenterToCursor` modifier for precise cursor-centered positioning

### Component Structure

**GroupAssignmentBoard.tsx**
- Orchestrates the entire assignment interface
- Manages DndContext with configured sensors and collision detection
- Renders DragOverlay with cursor-centered positioning
- Handles save, cancel, conflict detection, and error states
- Provides mobile/desktop responsive layout switching

**GroupCard.tsx**
- Visual container for a single group
- Displays group name and slot count
- Renders vertical list of GroupSlotDropZone components
- NOT a drop target - purely presentational

**GroupSlotDropZone.tsx**
- The only drop target for group assignments
- Renders either an empty slot placeholder or a DraggableTeamChip
- Highlights when cursor is directly over it
- Handles occupied/empty states with distinct styling

**DraggableTeamChip.tsx**
- Wraps team data with `useDraggable` hook
- Becomes completely invisible (`opacity: 0`) during drag
- No transform applied to original element
- Can be dragged to waitlist for soft delete functionality

**DragOverlayChip.tsx**
- Separate component rendered in DragOverlay
- Follows cursor during drag with enhanced shadow
- Only visible element during drag operation

**ConfirmedPool.tsx**
- Container for confirmed teams (teams that can be assigned to groups)
- Droppable area for teams being moved out of groups
- Capacity-limited based on total group slots minus assigned teams

**WaitlistPool.tsx**
- Container for waitlist teams
- Droppable area for teams being soft-deleted from groups or confirmed pool
- Teams can be promoted to confirmed pool when capacity exists
- Cannot be dragged directly to group slots

### State Management

**useGroupAssignmentStore (Zustand)**
- Maintains snapshot of groups, slots, and unassigned teams (confirmed + waitlist)
- Tracks dirty state for unsaved changes warning
- Calculates confirmed capacity dynamically
- Provides actions: assignTeamToSlot, swapTeamWithSlot, moveTeamToConfirmed, moveTeamToWaitlist, promoteFromWaitlist
- Team status (confirmed/waitlist) is explicitly maintained via `isWaitlist` flag
- No index-based recalculation of team status - status is preserved across operations
- Persists to sessionStorage during editing session
- Resets on cancel or successful save

**useGroupStageDnd Hook**
- Isolates drag-and-drop event handling
- Manages activeDragTeam state for DragOverlay rendering
- Handles dragStart, dragOver, dragEnd, dragCancel events
- No group container drop logic - only individual slot targeting
- Integrates with store for state mutations
- Provides toast notifications for blocked operations

### Utility Functions (groupStageDnd.ts)

**ID Creators**
- `createTeamDragId(teamId)` - generates draggable team IDs
- `createSlotDropId(groupId, slotIndex)` - generates droppable slot IDs

**ID Parsers**
- `parseTeamDragId(id)` - extracts team ID from drag ID
- `parseSlotDropId(id)` - extracts groupId and slotIndex from drop ID

**Pool Identifiers**
- `CONFIRMED_POOL_ID` - constant for confirmed pool drop target
- `WAITLIST_POOL_ID` - constant for waitlist pool drop target
- `isConfirmedPoolId(id)` - checks if ID is confirmed pool
- `isWaitlistPoolId(id)` - checks if ID is waitlist pool

**Collision Helpers**
- `findSlotById(groups, slotId)` - locates slot across all groups

**Type Definitions**
- `DndUnassignedTeam` - teams not assigned to any slot (includes both confirmed and waitlist)
- `GroupAssignmentSnapshot` - contains groups and unassignedTeams array

## Drag-and-Drop Behavior

### Drag Sources

- Team chips in the confirmed pool (confirmed teams)
- Team chips in the waitlist pool
- Team chips assigned to group slots

### Drop Targets

- **Individual group slots** - each slot is independently droppable
- **Confirmed pool** - accepts teams from group slots and waitlist
- **Waitlist pool** - accepts teams from group slots and confirmed pool (soft delete)
- **Group containers** - NOT droppable (only individual slots accept drops)

### Drop Operations

**Drop on Empty Slot**
- Assigns the dragged team to that specific slot
- Team is removed from source location (confirmed pool, waitlist, or other slot)

**Drop on Occupied Slot**
- Existing team moves to confirmed pool (explicit `isWaitlist: false`)
- Dragged team takes the slot
- Swap operation if both teams are in slots

**Drop on Confirmed Pool**
- Team moves to confirmed pool (explicit `isWaitlist: false`)
- Group slot becomes empty if team was assigned
- Team retains confirmed status if already confirmed

**Drop on Waitlist Pool**
- Team moves to waitlist pool (explicit `isWaitlist: true`)
- Provides soft delete functionality for removing teams
- Group slot becomes empty if team was assigned

**Drop on Same Slot**
- No action - prevents unnecessary state updates

### Waitlist Behavior

- Waitlist teams can be promoted to confirmed pool when capacity exists
- Capacity = total group slots - currently assigned teams
- Direct drag from waitlist to group slots is blocked
- Error toast: "Only confirmed teams can be moved to group slots"
- Promotion requires available reserve capacity

### Visual Feedback

**During Drag**
- Original chip: completely invisible (`opacity: 0`)
- DragOverlay: visible, centered on cursor, enhanced shadow
- Hovered slot: highlighted with visual indicator
- No group-level highlighting

**Slot States**
- Empty: dashed border, subtle slate tint, "Slot N" label
- Occupied: team chip fills slot, no wrapper border
- Highlighted: animate-pulse, brand color accent
- Drop target: visual glow when cursor is over

**Cursor States**
- Idle: default cursor
- Dragging: `cursor-grabbing` on DragOverlay
- Over valid drop: appropriate cursor feedback
- Over invalid target: blocked operation (waitlist to slot)

## Layout and Responsive Design

### Desktop (≥1024px)

- Groups board: left side, responsive grid (md=2, xl=3, 2xl=4 columns)
- Confirmed pool: right side, fixed 320px width
- Waitlist pool: below confirmed pool
- All groups visible simultaneously

### Mobile (<1024px)

- Groups: top section, one group visible at a time
- Horizontal scrollable pill tabs for group navigation
- Active tab: glossy slate gradient, bold text
- Inactive tabs: semi-transparent, medium weight
- Confirmed pool: below groups
- Waitlist pool: below confirmed pool

### Slot Layout

- Vertical lists (not grids) for compact scanning
- Fixed height (36px/h-9) prevents layout shift
- Single-line labels for empty slots
- Consistent spacing between slots (gap-2)

### RTL Support

- Layout flips using logical CSS properties
- Text alignment adapts automatically
- Icons rotate where needed (back arrows)
- Maintained through `useLanguageDirection` hook

## Styling System

### Color Scheme

- Surface color: slate-based for panels and cards
- Brand color: accent for interactive elements and highlights
- Semantic colors: primary for confirmed, amber for waitlist
- Background: gradient from surface tones for depth

### Panel Styling

- Group cards: subtle gradients, borders, shadows, backdrop blur
- Unassigned team pools (confirmed/waitlist): similar treatment for visual consistency
- No decorative parent wrapper around main board
- Direct layout without extra chrome

### Component Variants (CVA)

**draggableChipVariants**
- `isDragging: true` - `opacity: 0` (invisible)
- `isDragging: false` - normal state with hover effects
- Variants: default, confirmed, waitlist
- Sizes: sm, md, lg

**groupSlotVariants**
- States: empty, occupied, dropTarget, highlighted
- Fixed height for all states
- Smooth transitions between states

**groupCardVariants**
- Base styling for all group cards
- No drop target states (not droppable)

**unassignedPoolVariants**
- Variants: confirmed, waitlist
- States: normal, dropTarget
- Color-coded borders and backgrounds for each variant

### Mobile Tab Styling

- Pill shape (rounded-full)
- Active: `from-slate-400/50 via-surface to-surface`
- Inactive: `from-slate-400/30 via-surface/80 to-surface/60`
- Thin minimal scrollbar
- Smooth scroll animation centers active tab

### Accessibility

- ARIA labels for all interactive elements
- Screen reader announcements for drag operations
- Keyboard navigation with @dnd-kit keyboard sensor
- Focus visible states on all controls
- Drag-to-waitlist provides keyboard-accessible soft delete

## Data Flow

### Loading

1. Route loader returns `groupStage` and `availableTeams`
2. Unassigned teams calculated as: availableTeams + teams in group stage confirmed slots
3. Each team explicitly tagged with `isWaitlist` flag (true/false)
4. Unassigned teams include both confirmed (capacity-limited) and waitlist teams
5. Zustand store initialized from loader snapshot
6. sessionStorage restores any unsaved edits

### Editing

1. User drags and drops teams
2. Store updates immediately (optimistic)
3. UI reflects changes instantly
4. No server communication during editing
5. Dirty state tracked for navigation warning

### Saving

1. User clicks SAVE button
2. Store marked as saving (disables drag)
3. Slot assignments serialized from store snapshot
4. POST to `/resources/competition/group-assignments`
5. Server validates against group stage version
6. On success: store reset with new baseline, dirty flag cleared
7. On conflict: show dialog, force reload
8. On error: keep store state, show inline error, allow retry

### Canceling

1. User clicks CANCEL button
2. Store resets to original loader snapshot
3. All unsaved changes discarded
4. sessionStorage cleared
5. UI reflects original state

### Persistence Boundary

- Client state: ephemeral, sessionStorage only
- Server state: persisted on SAVE only
- No auto-save, no incremental saves
- Clear undo/redo via CANCEL

## Resource Route

**Path**: `/resources/competition/group-assignments`

**Intents**
- `save` - persist store snapshot, validate version, return success/conflict/error

**Validation**
- Group stage version check (optimistic locking)
- Tournament consistency (all teams belong to same tournament)
- Slot index validity (within group bounds)

**Response Format**
- JSON (not redirect) to keep UI route stable
- `{ success: true }` on successful save
- `{ conflict: true }` if version mismatch
- `{ error: string }` on validation failure

## Error Handling

### Drag-Related Errors

- Waitlist to group: toast error, return to origin
- No capacity for promotion: toast error, block promotion
- Invalid drop target: no operation, no state change

### Save Errors

- Network error: inline banner, retry button, store preserved
- Validation error: inline banner with message
- Conflict: blocking dialog, force reload required

### Error Recovery

- All errors preserve current store state
- User can retry after fixing issues
- Conflict resolution requires fresh data reload
- Error boundary catches component crashes

## Internationalization

All user-facing text internationalized in 6 languages:
- English (en)
- Dutch (nl)
- German (de)
- French (fr)
- Turkish (tr)
- Arabic (ar)

### Key Translation Paths

- `competition.groupAssignment.instruction` - hero strip text
- `competition.groupAssignment.slot.label` - slot numbering
- `competition.groupAssignment.group.ariaLabel` - group announcements
- `competition.groupAssignment.errors.*` - error messages
- `competition.groupAssignment.hints.*` - user guidance

## Testing Coverage

### Unit Tests

- Slot assignment logic in store
- ID parsing and generation utilities
- Collision detection helpers
- Reserve capacity calculations

### Component Tests

- Drag-and-drop operations (pointer and keyboard)
- Slot state transitions
- Team chip rendering and interactions
- Error boundary behavior

### E2E Tests (Playwright)

- Complete drag → drop → save → DB verification flow
- Conflict detection and resolution
- Mobile touch interactions
- RTL layout rendering
- Failed save retry

### Accessibility Tests

- Keyboard navigation completeness
- Screen reader announcement accuracy
- Focus management during drag
- ARIA attribute correctness

## Technical Stack

### Dependencies

- `@dnd-kit/core`: ^6.3.1
- `@dnd-kit/modifiers`: ^9.0.0
- `@dnd-kit/utilities`: ^3.2.2
- `zustand`: state management
- `react-i18next`: internationalization
- `sonner`: toast notifications
- `cva`: component variant API

### Browser Support

- Modern evergreen browsers
- Touch-enabled devices
- Keyboard-only navigation
- Screen reader compatibility

## File Structure

```text
app/features/competition/
├── components/
│   ├── GroupAssignmentBoard.tsx
│   ├── GroupCard.tsx
│   ├── GroupSlotDropZone.tsx
│   ├── ConfirmedPool.tsx
│   ├── WaitlistPool.tsx
│   ├── DraggableTeamChip.tsx
│   ├── groupAssignment.variants.ts
│   └── CompetitionGroupStageDetails.tsx
├── hooks/
│   └── useGroupStageDnd.ts
├── stores/
│   └── useGroupAssignmentStore.ts
├── utils/
│   └── groupStageDnd.ts

app/models/
└── group.server.ts (backend types and utilities)

app/routes/
└── resources/
    └── competition.group-assignments.tsx

docs/images/
├── dnd-current.png (current screenshot)
└── dnd-mobile-inspiration.png (design reference)
```

## Terminology

**Unassigned Teams**
Teams not currently assigned to any group slot. This includes both confirmed teams and waitlist teams. Stored as a single array with each team having an explicit `isWaitlist` flag.

**Confirmed Teams**
Teams officially accepted into the tournament field. Can be assigned to group slots. Have `isWaitlist: false`. Limited by confirmed capacity.

**Waitlist Teams**
Teams that want to participate but are outside the initial field. Have `isWaitlist: true`. Must be promoted to confirmed before group assignment.

**Confirmed Pool**
Visual component displaying confirmed teams (those with `isWaitlist: false`). Droppable zone for teams being moved out of groups or promoted from waitlist. Capacity-limited.

**Waitlist Pool**
Visual component displaying waitlist teams (those with `isWaitlist: true`). Droppable zone for soft-deleting teams from groups or confirmed pool.

**Confirmed Capacity**
Number of available slots for confirmed teams, calculated as: total group slots - currently assigned teams.

**Slot**
A position within a group where a team can be assigned. Fixed height, individually droppable.

**Group Container**
Visual wrapper for a group's slots. Not a drop target. Purely presentational.

**DragOverlay**
The floating element that follows the cursor during drag. The only visible representation of the dragged item.

**Explicit Status Management**
Team status (confirmed/waitlist) is maintained via the `isWaitlist` boolean flag and is never recalculated based on array position. Each store operation explicitly sets the flag when adding or moving teams.
