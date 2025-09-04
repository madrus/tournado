# Phase 2 - RBAC Hardening

Purpose: align the implementation with the PRD RBAC matrix and scopes, give admins clear control over user approvals and roles, let managers issue scoped referee access, and restrict referees to assigned matches only.

## Goals

- Admin approves users and assigns roles (ADMIN, MANAGER). No manager-level role assignment.
- Managers issue and revoke pre-auth referee links scoped to tournament and assigned matches.
- Referees do not have regular accounts; they access a referee dashboard via expiring, revocable links.
- Managers have full matches CRUD. Referees can act only on assigned matches.

## Scope

- Permissions additions
   - `groups:manage`, `referees:assign`, `assignments:manage`, `refereeTokens:manage`
   - Admin-only: `users:approve`, `roles:assign`
- Admin responsibilities
   - Review new users, approve, and assign roles (ADMIN, MANAGER)
- Manager responsibilities
   - Assign referees to matches
   - Issue and revoke referee pre-auth links
- Referee access model
   - Token-based access, scoped to tournament and assigned matches
   - No general Admin Panel navigation; dedicated referee dashboard only

## Implementation Tasks

1. RBAC utilities

- Update `app/utils/rbac.ts`:
   - Extend `Permission` with new keys
   - Add to `ROLE_PERMISSIONS` for MANAGER and ADMIN where applicable

2. Middleware and redirects

- `app/utils/rbacMiddleware.server.ts` and `app/utils/rbac.ts`:
   - Referee must not have general Admin Panel access
- `app/utils/roleBasedRedirects.ts`:
   - Send referees to dedicated referee dashboard only

3. Referee scoping checks

- In match loaders/actions that allow score updates or edits:
   - Verify referee is assigned to the match before permitting changes

4. Referee tokens

- Data model: add `RefereePreAuthToken` (token, tournamentId, matchIds scope, expiresAt, revokedAt, issuedBy)
- Issuance/revocation endpoints and storage

5. Admin UI for approvals and roles

- Minimal UI to review pending users, approve, and set role (ADMIN or MANAGER)

6. Manager UI for referee links

- Minimal UI to generate and revoke referee pre-auth links for selected matches

## Acceptance Criteria

- Admin can approve a pending user and set role to MANAGER or ADMIN
- Manager can issue and revoke a referee link scoped to selected matches and a tournament
- Referee with a valid link can see only assigned matches and submit scores
- Referee cannot navigate to general Admin Panel menus
- Manager can create, edit, and delete matches
- Public users can still create teams without authentication

## Test Plan

- Unit tests: new permissions in `app/utils/__tests__/rbac.test.ts`
- Middleware tests: referee denied general Admin Panel; admin and manager allowed
- Route tests: score submission/edit requires assignment ownership for referees
- E2E: role-based redirects and menu visibility per role

## Risks

- Token revocation latency: mitigate with server-side checks on each request
- Edge cases on assignment changes after link issuance: invalidate or rescope tokens

## Out of Scope

- Full UX polish for the admin and manager UIs
- Non-RBAC feature work

## References

- PRD RBAC matrix: `.cursor/rules/PRD.mdc` (RBAC section)
- Permissions glossary: `docs/development/PRD.details.md#permissions-glossary`
- Referee access model: `docs/development/PRD.details.md#referee-access-model`
