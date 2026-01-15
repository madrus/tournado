# PRD: Group Stage Deletion & Cleanup

## 1. Introduction

This feature introduces the ability to delete a **Group Stage** within the Competition Management module. Currently, users can create a Group Stage (which generates multiple groups like A, B, C at once), but cannot remove the stage itself if it was created in error. This leads to "zombie" stages and groups during tournament setup. This feature implements a destructive action to delete the entire Group Stage.

**Crucially:**

1.  It is an "all-or-nothing" deletion of the Stage and all its child Groups.
2.  Teams assigned to these groups are **unassigned** (returned to the pool), not deleted.
3.  Deletion is **blocked** if any match within the stage has been played, to preserve integrity.

## 2. Goals & Success Metrics

- **Enable Correction:** Allow the Manager who created the tournament and all Admins to remove an entire erroneously created Group Stage.
- **Data Integrity:** Prevent deletion if _any_ match in the stage has active competition history (played matches).
- **Clean State:** Ensure zero orphaned records (matches, standings, slots, groups) remain; teams are cleanly unassigned.
- **Consistent UX:** Match the visual style of the existing "Delete Team" button (White/Red variant) placed in the main Stage Header.

## 3. Use Cases

### UC-001: Implement Safe Delete Group Stage Action

**Description:** As a developer, I need a backend action that verifies the Group Stage deletion request, validates state, and cleans up the database.
**Acceptance Criteria:**

- [ ] **Routing:** Use `intent="delete-group-stage"` in the form submission.
- [ ] **Action Handler:** In the `action` function of the Group Stage detail route, handle this specific intent.
- [ ] **Validation:** Query database to check if _any_ match in _any group_ belonging to this Stage has `status === 'PLAYED'` (or has a score).
- [ ] **Blocking:** If played matches exist, return a 400/403 error: "Cannot delete Group Stage. Matches have already been played."
- [ ] **Cleanup (Transaction):**
  - Delete the `GroupStage` record.
  - Ensure Cascade (or manual deletion) removes all child `Group` records.
  - Remove all associated `Match`, `Standing`, and `Slot` records.
  - **Preserve Teams:** Ensure `Team` records are untouched, only their relationships to the deleted Groups are removed.
- [ ] **Permissions:** Verify user is ADMIN or the specific MANAGER who created/owns the tournament.
- [ ] Typecheck/lint pass.

### UC-002: Add Delete Button to Group Stage Header

**Description:** As a Manager, I want a "Delete" button on the main Group Stage panel (Fuchsia) so I can remove the entire stage.
**Acceptance Criteria:**

- [ ] Add "Delete" button to the main `GroupStageHeader` component.
- [ ] **Style:** Use the existing secondary danger style (White background, Red text/border) similar to the "Team Management" delete button.
- [ ] **Placement:** Align logically (end/right side in LTR) within the header.
- [ ] **RTL Support:** Ensure button mirrors correctly (e.g., appears on the far left in RTL if it's on the right in LTR) using logical properties (`ms-auto` or `justify-end`).
- [ ] **Mobile-First:** Ensure the header wraps or the button remains accessible on small screens without breaking layout.
- [ ] **I18n:** Extract label "Delete Group Stage" to translation files.
- [ ] Typecheck/lint pass.
- [ ] Verify in browser using `dev-browser` skill.

### UC-003: Deletion Confirmation Modal

**Description:** As a Manager, I want to be warned before deleting to prevent accidental loss of the entire stage setup.
**Acceptance Criteria:**

- [ ] Clicking "Delete" triggers a modal/dialog.
- [ ] **Content:** "Are you sure you want to delete this Group Stage? This will remove all contained groups, unplayed matches, and standings. Teams will be unassigned."
- [ ] **Action:** "Confirm Delete" button triggers the `DELETE` action.
- [ ] **Cancel:** Closes modal without action.
- [ ] **RTL Support:** Modal text alignment (`text-start`), close button position, and action button order (Confirm/Cancel) must respect the user's locale direction.
- [ ] **Mobile-First:** Modal must be fully responsive, centered with appropriate max-width on mobile devices.
- [ ] **I18n:** All modal text extracted to translation keys.
- [ ] Typecheck/lint pass.
- [ ] Verify in browser using `dev-browser` skill.

### UC-004: Handle Validation Feedback & Redirection

**Description:** As a Manager, I need to know if the deletion failed or succeeded.
**Acceptance Criteria:**

- [ ] **Success:** On successful deletion, redirect user to the parent Competition Dashboard (`/tournaments/:id/competition`).
- [ ] **Success:** Show a generic "Group Stage deleted" toast notification.
- [ ] **Failure:** If backend returns "active matches" error, show an Error Toast/Alert: "Cannot delete Group Stage. Matches have already been played."
- [ ] Typecheck/lint pass.
- [ ] Verify in browser using `dev-browser` skill.

## 4. Functional Requirements

- **FR-1:** System MUST query `Match` table for all groups in the target `GroupStage` where `isPlayed` is true.
- **FR-2:** If FR-1 finds records, the operation MUST abort.
- **FR-3:** The Delete operation MUST be atomic (Transaction) – deleting the `GroupStage` must remove all child `Group` entities and their relations (`_TeamToGroup` or `Slot` assignments) without deleting the `Team` entities themselves.
- **FR-4:** Navigation MUST return to the Competition Dashboard root after deletion.

## 5. Technical & Architectural Considerations

- **React Router 7:**
  - **Route:** The action should be implemented in the route displaying the Group Stage (likely `app/routes/admin/competition/competition.groups.$groupStageId.tsx` or similar).
  - **Intent:** Use the "Intent Pattern". The form must include `<input type="hidden" name="intent" value="delete-group-stage" />`.
  - **Method:** Use `method="post"` for the submission (standard for intent patterns) or `DELETE` if preferred, but "intent" usually implies POST in this architecture. Let's standardize on **POST** with `intent`.
- **Database (Prisma):**
  - Verify `GroupStage` -> `Group` relation.
  - Ensure clean removal of `Group` records cascades to `Matches` and `Standings`.
  - **Crucial:** Ensure the `Team` relation is optional or many-to-many so that deleting the `Group` (side A) simply removes the record in the join table/slot, leaving the `Team` (side B) intact.
- **Data Isolation:** Ensure `where: { id: stageId, tournament: { userId: currentUserId } }` (for Managers) to verify they are the specific owner of the tournament.
- **I18n:**
  - `stage.delete.button`
  - `stage.delete.confirm.title`
  - `stage.delete.confirm.body`
  - `stage.delete.error.activeMatches`

## 6. Non-Goals

- **Individual Group Deletion:** We are NOT implementing deletion of single groups (e.g., removing just "Group A" from a stage).
- **Undo:** No undo for this destructive action.

## 7. Design Considerations

- **Component Reuse:** Reuse `Button` component with `variant="destructive-outline"`.
- **Placement:** Main header of the Fuchsia Group Stage panel.
- **RTL & Logical Properties:** Use logical Tailwind classes (e.g., `ps-4`, `me-2`, `start-0`) instead of physical ones (`pl-4`, `mr-2`, `left-0`) to ensure instant mirroring for Arabic/Hebrew.
- **Mobile Responsiveness:** The Group Stage header can be dense. Ensure the Delete button doesn't squeeze the title text. On mobile, it might need to move to a "More actions" menu or stack below the title if space is tight.

## 8. Success Metrics

- Managers can remove a "bad" Group Stage setup in one click (plus confirmation).
- No teams are accidentally deleted from the database.
- Attempting to delete a stage with played matches is blocked.

## 9. Open Questions

- Confirm the Prisma schema for `GroupStage` vs `Group` hierarchy to ensure the cascade delete setup is correct.
