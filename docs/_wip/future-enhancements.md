# Future Enhancements

Hereunder we specify ideas for future application enhancements that we have thought of when working on MVP tasks. These ideas are out of scope for MVP.

## TASK-0201: User Management Admin Workflows

**Status:** Completed (2025-11-01)
**Context:** These enhancements would extend the current user management system which supports individual user approval, role assignment, audit logging, and user deactivation/reactivation.

**Future Enhancements:**

- Bulk user operations (approve multiple users at once)
- Advanced filtering (by date range, multiple roles, etc.)
- Export audit logs to CSV for compliance reporting
- Email notifications to users when role changes or account is deactivated
- Profile photo upload and management
- Self-service account reactivation requests
- Add devtools panel behind a permanent action button at the bottom left of the screen
- Add feature flags middleware like I did at Conclusion that I can set in the devtools panel
- Add a CSS-based responsive layout fallback for the group assignment board to avoid SSR hydration flashes (render both layouts and toggle with CSS)
- Define explicit server-side refresh triggers for group assignment snapshots (avoid using `updatedAt` unless it reflects meaningful server-side changes)
- Add script detection for RTL font overrides so Latin text uses `latin-text` only when the label is actually Latin
