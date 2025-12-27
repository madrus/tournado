# DnD migration plan for group stage assignments

## Goal
Create a drag and drop group assignment experience where all unassigned teams live in a reserve pool, can be dropped into group slots, and can be dragged back to reserve, with displacement of existing teams and smooth motion. This replaces manual assignment forms and Move to reserve actions while preserving the panel color traditions and RTL support.

## Non goals
- No backend schema changes.
- No new route structure.
- No cross feature re-export hubs.

## Hard truths and constraints
- A full page reload after each drop will feel cheap and will kill the smoothness target. Keep the route stable and use a client side zustand store until SAVE.
- You cannot get a clean displacement animation without a client side zustand state store. Pure loader data will not cut it.
- Mobile drag and drop needs touch sensors and large drop targets or it will fail in real use.
- DnD failures must not corrupt state. Keep SAVE and CANCEL as the only persistence boundary.

## Key decisions to make
- **Reserve source of truth** - calculate reserve on the fly from DB on load, then from the zustand store while editing.
- **DnD library** - use @dnd-kit for sensors, accessible drag layer, and drop animation. Native HTML5 drag and drop will be unreliable on mobile and will not give the animation quality you want.
- **Mutation strategy** - use a resource route for SAVE to return JSON and keep the UI route stable. Use fetcher so the page never navigates.
- **Conflict handling** - on SAVE, validate against a group stage version and return a conflict state if data changed on the server.

## UX redesign direction
- Replace the current three column layout with a dedicated assignment board.
- Desktop layout - groups board on the left and reserve pool on the right.
- Mobile layout - groups on top and reserve pool below.
- Mobile group navigation - show one group at a time with horizontally scrollable tabs.
- Mobile group navigation hint - add a dot pagination indicator like a carousel to show current group when many groups exist.
- Reserve placement - confirmed teams pool sits under the groups. Waitlist sits directly below confirmed teams on both desktop and mobile.
- Waitlist interaction - allow dragging waitlist chips into the confirmed pool area, but block crossing into group slots.
- Provide a top hero strip that shows the group stage title, tournament context, and a single instruction line for drag and drop.
- Use existing panel color system and gradients. Compose panels with `Panel` and panel variants rather than raw borders.
- Add clear drag states - hover glow on droppable slots, muted chip state while dragging, and a ghost overlay for the chip in flight.
- Ensure RTL layout flips the board and aligns slot labels and drop hints using logical properties.

## Component architecture changes
Create a dedicated set of group assignment components under competition features.

New components
- `app/features/competition/components/GroupAssignmentBoard.tsx` - container orchestrating groups and reserve.
- `app/features/competition/components/GroupCard.tsx` - single group container.
- `app/features/competition/components/GroupSlotDropZone.tsx` - droppable slot with assigned team chip or empty state.
- `app/features/competition/components/ReservePool.tsx` - list of draggable team chips.
- `app/features/competition/components/DraggableTeamChip.tsx` - wrapper around TeamChip with drag props.
- `app/features/competition/components/groupAssignment.variants.ts` - CVA variants for board, slot, reserve.
- `app/features/competition/components/index.ts` - add re-exports for the new components.
- `app/features/competition/hooks/useGroupStageDnd.ts` - required hook to isolate DnD logic and event handling.
- `app/features/competition/utils/groupStageDnd.ts` - required helpers for drag ids, collision logic, and mapping.

Updated components
- `app/features/competition/components/CompetitionGroupStageDetails.tsx` - replace form based UI with the new board.

## Drag and drop behavior
- Drag sources - reserve chips and assigned chips inside group slots.
- Drop targets - group slots, group container, and reserve pool.
- Drop on empty slot - assign the dragged team to the slot.
- Drop on occupied slot - move the existing team to reserve and assign the dragged team to the slot.
- Drop on reserve pool - move team to reserve and clear its slot.
- Drop on a group container - if there is a free slot, place the team in the first empty slot.
- Slot level hover - only active when the group is full so replacement targets are explicit.
- Provide a subtle hint on the group container hover state that dropping will fill the next available slot.
- When hovering over a group container with free slots, highlight the specific slot that will receive the drop.
- Prevent dropping a team into the same slot it already occupies.
- Waitlist to confirmed - only allowed when confirmed pool has free spaces. Otherwise show an error message: no free spaces, only confirmed teams can be moved to group slots.
- Waitlist to group slots - blocked. On drop attempt, show an error message and return the chip to its origin.
- Confirmed capacity rule - confirmed pool capacity equals total group slots minus already assigned teams. Only allow waitlist promotion when capacity remains.
- Highlight the first empty slot on hover when dragging over a group container to clarify auto placement.
- Provide a short drop animation and chip transition using dnd kit drop animation and CSS transitions with ease in and out.

## Data and state flow
- Loader still returns `groupStage` and `availableTeams`.
- Reserve is calculated on load from DB as `availableTeams` plus group stage reserve slots.
- Reserve is split into `reservePool` (capacity equals total group slots minus assigned teams) and `waitlist` for overflow teams.
- Initialize a zustand store from loader data for slots and reserve.
- Store becomes the source of truth during editing.
- SAVE persists the store state to the DB.
- CANCEL resets the store to the loader snapshot.
- Store persistence - persist edits to sessionStorage. Closing the browser or tab discards changes.
- Unsaved changes guard - warn on navigation if the store is dirty.

## Error handling and loading states
- Wrap the assignment board in an error boundary to prevent page crashes on DnD failures.
- Disable drag interactions during SAVE and show a loading state on the SAVE button.
- On SAVE failure, keep the store state, show an inline error banner, and allow retry.
- On conflict, show a blocking prompt and force reload of latest data.
- Conflict message copy - "Another user saved changes. Your unsaved edits were discarded and the page was refreshed."

## Accessibility requirements
- Keyboard navigation for drag and drop using @dnd-kit keyboard sensors.
- Screen reader announcements for pick up, move, drop, and error states.
- ARIA labels for delete buttons, pools, slots, and tabs.

## Server side updates
- `app/models/group.server.ts` - add a new transaction helper for save on submit:
  - clear all group slots for the group stage
  - assign teams to slots according to the store snapshot
  - no persistence for reserve, it is derived
- `app/routes/resources/competition.group-assignments.tsx` - new resource route for SAVE and CANCEL:
  - save intent persists the store snapshot
  - save intent validates group stage version and returns conflict state if stale
  - cancel intent returns a fresh loader snapshot for reset if needed
  - return JSON for fetcher and keep validation for tournament consistency
  - delete intent removes a team from the group stage context when a chip is deleted

## i18n updates
Add new copy for instructions, empty state, and reserve headings.
- `app/i18n/locales/en.json`
- `app/i18n/locales/nl.json`
- `app/i18n/locales/de.json`
- `app/i18n/locales/fr.json`
- `app/i18n/locales/tr.json`
- `app/i18n/locales/ar.json`
Add new copy for waitlist errors and waitlist labels.
Add new copy for save errors, conflict warnings, unsaved changes, and delete confirmation.
- Requirement - any new labels or messages introduced during this migration must be added to all locale files listed above.

## Styling plan
- Reuse `Panel` and panel variants to keep the established panel color tradition.
- Build new CVA variants for slots and reserve list to keep the look consistent and future proof.
- Use semantic color classes from `app/styles/tailwind.css` where applicable.
- Add subtle background gradients and gloss effects for the board, but keep contrast at AA.
- Provide RTL aware spacing and alignment using logical CSS classes and `useLanguageDirection` where needed.
- Add a chip level delete affordance that is visible on hover and has a clear focus state.
- Use a compact inline error banner in the waitlist panel for capacity errors.

## Testing plan
- Add unit tests for slot replacement logic in `app/models/group.server.ts`.
- Add component tests for the new drag and drop behavior with pointer and keyboard interactions.
- Update any existing group stage tests to align with the new UI and intents.
- Add Playwright E2E test for drag → drop → save → verify DB.
- Add edge case tests for save conflicts and failed save retry.
- Add accessibility checks for keyboard and screen reader flows.

## Migration steps
1. Add DnD dependency and create the new assignment components.
2. Add a zustand store for group assignments and reserve.
3. Update `CompetitionGroupStageDetails` to render the new board.
4. Implement DnD state updates in the store with drop rules.
5. Add SAVE, CANCEL, and DELETE UI and resource route actions.
6. Add error boundary, loading states, and unsaved changes guard.
7. Add conflict detection and error recovery UX.
8. Update i18n copy and verify RTL layout.
9. Polish motion and visual details to reach the new design quality bar.
10. Add and adjust tests.

## File change list
Create
- `app/features/competition/components/GroupAssignmentBoard.tsx`
- `app/features/competition/components/GroupCard.tsx`
- `app/features/competition/components/GroupSlotDropZone.tsx`
- `app/features/competition/components/ReservePool.tsx`
- `app/features/competition/components/ReserveWaitlist.tsx`
- `app/features/competition/components/DraggableTeamChip.tsx`
- `app/features/competition/components/groupAssignment.variants.ts`
- `app/features/competition/stores/useGroupAssignmentStore.ts`
- `app/features/competition/hooks/useGroupStageDnd.ts`
- `app/features/competition/utils/groupStageDnd.ts`
- `app/routes/resources/competition.group-assignments.tsx`

Update
- `app/features/competition/components/CompetitionGroupStageDetails.tsx`
- `app/features/competition/components/index.ts`
- `app/models/group.server.ts`
- `app/routes/a7k9m2x5p8w1n4q6r3y8b5t1/competition/competition.groups.$groupStageId.tsx`
- `app/i18n/locales/en.json`
- `app/i18n/locales/nl.json`
- `app/i18n/locales/de.json`
- `app/i18n/locales/fr.json`
- `app/i18n/locales/tr.json`
- `app/i18n/locales/ar.json`
- `package.json` - add DnD dependency

## State model
- Define `GroupAssignmentStoreState` type and action types for all store updates.
- Use normalized maps for slots and teams to avoid deep nesting and reduce re-renders.
- Use selectors and memoization to avoid rerendering full lists on each drag.

## Reference images
Current group assignment screen
![Current group assignment UI](docs/images/dnd-current.png)

Mobile inspiration reference
![Mobile inspiration UI](docs/images/dnd-mobile-inspiration.png)

## Terminology
- Confirmed teams - teams officially accepted into the tournament field.
- Waitlist or reserve - teams that want to play but are outside the initial field.

## Open questions
- Confirmed - group container drop targets the first empty slot. Slot targeting is only used for replacements when full.
- Confirmed - conflict resolution forces reload of server state.
