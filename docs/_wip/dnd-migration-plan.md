# Group Stage Drag-and-Drop Assignment System

## Overview

The group stage assignment interface provides a drag-and-drop experience where teams can be assigned to group slots, moved between slots, returned to confirmed pool, or moved to waitlist. The system maintains smooth animations, supports RTL layouts, and handles both confirmed teams and waitlist teams with distinct behaviors.

## Core Principles

- [x] Client-side zustand store maintains state during editing
- [x] SAVE and CANCEL are the only persistence boundaries
- [x] Touch sensors and pointer sensors support mobile and desktop interactions
- [x] State changes never corrupt data - validation happens at save time
- [x] Conflict detection validates against server version on save
- [x] Team status (confirmed/waitlist) is explicitly maintained, not calculated by array position
- [x] Drag-to-waitlist replaces traditional delete functionality ("soft delete")

## Architecture

### DnD Library Configuration

- [x] **Library**: @dnd-kit/core v6.3.1 with @dnd-kit/modifiers v9.0.0
- [x] **Collision Detection**: `pointerWithin` strategy for accurate slot targeting
- [x] **Sensors**: PointerSensor (8px activation distance), TouchSensor (200ms delay, 8px tolerance), KeyboardSensor
- [x] **Measuring**: `MeasuringStrategy.Always` for droppable elements
- [x] **DragOverlay**: Uses `snapCenterToCursor` modifier for precise cursor-centered positioning

### Component Structure

**GroupAssignmentBoard.tsx**
- [x] Orchestrates the entire assignment interface
- [x] Manages DndContext with configured sensors and collision detection
- [x] Renders DragOverlay with cursor-centered positioning
- [x] Handles save, cancel, conflict detection, and error states
- [x] Provides mobile/desktop responsive layout switching

**GroupCard.tsx**
- [x] Visual container for a single group
- [x] Displays group name and slot count
- [x] Renders vertical list of GroupSlotDropZone components
- [x] NOT a drop target - purely presentational

**GroupSlotDropZone.tsx**
- [x] The only drop target for group assignments
- [x] Renders either an empty slot placeholder or a DraggableTeamChip
- [x] Highlights when cursor is directly over it (empty and occupied slots)
- [x] Handles occupied/empty states with distinct styling

**DraggableTeamChip.tsx**
- [x] Wraps team data with `useDraggable` hook
- [x] Becomes completely invisible (`opacity: 0`) during drag
- [x] No transform applied to original element
- [x] Can be dragged to waitlist for soft delete functionality

**DragOverlayChip.tsx**
- [x] Separate component rendered in DragOverlay
- [x] Follows cursor during drag with enhanced shadow
- [x] Only visible element during drag operation

**ConfirmedPool.tsx**
- [x] Container for confirmed teams (teams that can be assigned to groups)
- [x] Droppable area for teams being moved out of groups
- [x] Capacity-limited based on total group slots minus assigned teams

**WaitlistPool.tsx**
- [x] Container for waitlist teams
- [x] Droppable area for teams being soft-deleted from groups or confirmed pool
- [x] Teams can be promoted to confirmed pool when capacity exists
- [x] Cannot be dragged directly to group slots

### State Management

**useGroupAssignmentStore (Zustand)**
- [x] Maintains snapshot of groups, slots, and unassigned teams (confirmed + waitlist)
- [x] Tracks dirty state for unsaved changes warning
- [x] Calculates confirmed capacity dynamically
- [x] Provides actions: assignTeamToSlot, swapTeamWithSlot, moveTeamToConfirmed, moveTeamToWaitlist, promoteFromWaitlist
- [x] Team status (confirmed/waitlist) is explicitly maintained via `isWaitlist` flag
- [x] No index-based recalculation of team status - status is preserved across operations
- [x] Persists to sessionStorage during editing session
- [x] Resets on cancel or successful save

**useGroupStageDnd Hook**
- [x] Isolates drag-and-drop event handling
- [x] Manages activeDragTeam state for DragOverlay rendering
- [x] Handles dragStart, dragOver, dragEnd, dragCancel events
- [x] No group container drop logic - only individual slot targeting
- [x] Integrates with store for state mutations
- [x] Provides toast notifications for blocked operations

### Utility Functions (groupStageDnd.ts)

**ID Creators**
- [x] `createTeamDragId(teamId)` - generates draggable team IDs
- [x] `createSlotDropId(groupId, slotIndex)` - generates droppable slot IDs

**ID Parsers**
- [x] `parseTeamDragId(id)` - extracts team ID from drag ID
- [x] `parseSlotDropId(id)` - extracts groupId and slotIndex from drop ID

**Pool Identifiers**
- [x] `CONFIRMED_POOL_ID` - constant for confirmed pool drop target
- [x] `WAITLIST_POOL_ID` - constant for waitlist pool drop target
- [x] `isConfirmedPoolId(id)` - checks if ID is confirmed pool
- [x] `isWaitlistPoolId(id)` - checks if ID is waitlist pool

**Collision Helpers**
- [x] `findSlotById(groups, slotId)` - locates slot across all groups

**Type Definitions**
- [x] `DndUnassignedTeam` - teams not assigned to any slot (includes both confirmed and waitlist)
- [x] `GroupAssignmentSnapshot` - contains groups and unassignedTeams array

## Drag-and-Drop Behavior

### Drag Sources

- [x] Team chips in the confirmed pool (confirmed teams)
- [x] Team chips in the waitlist pool
- [x] Team chips assigned to group slots

### Drop Targets

- [x] **Individual group slots** - each slot is independently droppable
- [x] **Confirmed pool** - accepts teams from group slots and waitlist
- [x] **Waitlist pool** - accepts teams from group slots and confirmed pool (soft delete)
- [x] **Group containers** - NOT droppable (only individual slots accept drops)

### Drop Operations

**Drop on Empty Slot**
- [x] Assigns the dragged team to that specific slot
- [x] Team is removed from source location (confirmed pool, waitlist, or other slot)

**Drop on Occupied Slot**
- [x] If both teams are in the same group: swap slots
- [x] Otherwise: existing team moves to confirmed pool (explicit `isWaitlist: false`)
- [x] Dragged team takes the slot

**Drop on Confirmed Pool**
- [x] Team moves to confirmed pool (explicit `isWaitlist: false`)
- [x] Group slot becomes empty if team was assigned
- [x] Team retains confirmed status if already confirmed

**Drop on Waitlist Pool**
- [x] Team moves to waitlist pool (explicit `isWaitlist: true`)
- [x] Provides soft delete functionality for removing teams
- [x] Group slot becomes empty if team was assigned

**Drop on Same Slot**
- [x] No action - prevents unnecessary state updates

### Waitlist Behavior

- [x] Waitlist teams can be promoted to confirmed pool when capacity exists
- [x] Confirmed capacity = total group slots - currently assigned teams
- [x] Direct drag from waitlist to group slots is blocked
- [x] Error toast: "Only confirmed teams can be moved to group slots"
- [x] Promotion requires available reserve capacity
- [x] Waitlist is uncapped and can contain any number of teams

### Visual Feedback

**During Drag**
- [x] Original chip: completely invisible (`opacity: 0`)
- [x] DragOverlay: visible, centered on cursor, enhanced shadow
- [x] Hovered slot: highlighted with visual indicator (empty slots only)
- [x] No group-level highlighting
- [x] Hovering an occupied slot shows the same highlight as empty slots

**Slot States**
- [x] Empty: dashed border, subtle slate tint, "Slot N" label
- [x] Occupied: team chip fills slot, no wrapper border
- [x] Highlighted: animate-pulse, brand color accent
- [x] Drop target: visual glow when cursor is over

**Cursor States**
- Idle: default cursor
- Dragging: `cursor-grabbing` on DragOverlay
- Over valid drop: appropriate cursor feedback
- Over invalid target: blocked operation (waitlist to slot)

## Layout and Responsive Design

### Desktop (≥1024px)

- [x] Groups board: left side, responsive grid (md=2, xl=3, 2xl=4 columns)
- [x] Confirmed pool: right side, fixed 320px width
- [x] Waitlist pool: below confirmed pool
- [x] All groups visible simultaneously

### Mobile (<1024px)

- [x] Groups: top section, one group visible at a time
- [x] Horizontal scrollable pill tabs for group navigation
- [x] Active tab: glossy slate gradient, bold text
- [x] Inactive tabs: semi-transparent, medium weight
- [x] Confirmed pool: below groups
- [x] Waitlist pool: below confirmed pool

### Slot Layout

- [x] Vertical lists (not grids) for compact scanning
- [x] Fixed height (36px/h-9) prevents layout shift
- [x] Single-line labels for empty slots
- [x] Consistent spacing between slots (gap-2)

### RTL Support

- [x] Layout flips using logical CSS properties
- [x] Text alignment adapts automatically
- [x] Icons rotate where needed (back arrows)

## Styling System

### Color Scheme

- [x] Surface color: slate-based for panels and cards
- [x] Brand color: accent for interactive elements and highlights
- [x] Semantic colors: primary for confirmed, amber for waitlist
- [x] Background: gradient from surface tones for depth

### Panel Styling

- [x] Group cards: subtle gradients, borders, shadows, backdrop blur
- [x] Unassigned team pools (confirmed/waitlist): similar treatment for visual consistency
- [x] No decorative parent wrapper around main board
- [x] Direct layout without extra chrome

### Component Variants (CVA)

**draggableChipVariants**
- [x] `isDragging: true` - `opacity: 0` (invisible)
- [x] `isDragging: false` - normal state with hover effects
- [x] Variants: default, confirmed, waitlist
- [x] Sizes: sm, md, lg

**groupSlotVariants**
- [x] States: empty, occupied, dropTarget, highlighted (highlighted not wired)
- [x] Fixed height for all states
- [x] Smooth transitions between states

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

- Waitlist to group: toast warning, return to origin
- No capacity for promotion: toast warning, block promotion
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
- Waitlist promotion capacity enforcement

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
