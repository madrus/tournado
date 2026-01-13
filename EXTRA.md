# Extra bits & pieces

## Google Authentication Features

- Google Authentication - Allow users to authenticate using their Google accounts via the Firebase SDK.
- Email/Password Authentication - Enable users to register and login using their email and password; passwords will be securely stored in Firebase Authentication.
- Login Redirect - Implement secure redirects upon successful login, navigating users to a designated home or profile page using React Router - possibly (partially) implemented
- Logout Functionality - Allow users to securely log out of the application - possibly partially implemented
- Credential Persistence Tool - The AI Tool uses reasoning to identify and then set authentication tokens with appropriate expiration, for continuous access without re-login, unless explicitly logged out.
- Authentication Status Indicator - Clearly display the user's authentication status (logged in/logged out) and username.

## Credential Persistence Tool Implementation Plan

The 5th item describes a "Credential Persistence Tool" leveraging AI reasoning to manage authentication tokens dynamically - ensuring continuous access (e.g., no forced re-logins during active sessions) while handling expirations intelligently based on context like user role, activity, or device trust. Current implementation uses Firebase's default session persistence (browser session) with server-side cookie bridging and Zustand store hydration, but lacks:

- **AI-driven reasoning**: No logic to evaluate/optimize token lifecycles (e.g., proactive refresh based on predicted expiration or user behavior).
- **Custom expiration handling**: Relies on Firebase's 1-hour ID tokens + refresh; no explicit modes like `browserLocalPersistence` for longer sessions.
- **Continuous access guarantees**: Basic persistence exists, but no safeguards for idle timeouts or cross-tab sync.
- **Explicit logout integration**: Clears sessions correctly but doesn't reason about partial expirations (e.g., warn vs. auto-renew).

This plan addresses these gaps by introducing an AI-augmented persistence layer. It builds on existing Firebase/Zustand infrastructure for minimal disruption, prioritizing security (e.g., role-based persistence levels) and SSR compatibility. Estimated effort: 8-12 hours, assuming no major Firebase config changes.

#### High-Level Architecture

- **Core Components**:
  - **AI Reasoning Engine**: A lightweight function (in `useFirebaseAuth.ts` or a new hook) that analyzes token health (e.g., `getIdTokenResult().expirationTime`) against criteria (e.g., user role: admin=longer; idle>30min=shorten). Outputs actions: renew, warn, or expire.
  - **Enhanced Persistence**: Switch to `browserLocalPersistence` for non-sensitive users; fallback to session for admins. Sync across tabs via BroadcastChannel.
  - **Token Management Middleware**: Zustand middleware in `useAuthStore.ts` for periodic checks (e.g., every 5min) and event-driven renewals (e.g., on focus).
  - **UI/UX Layer**: Subtle indicators in `UserMenu.tsx` (e.g., "Session expires in X min") and proactive logout prompts.
  - **Server-Side Sync**: Extend `session.server.ts` to validate/renew during requests, flagging AI-reasoned expirations.
- **Security Considerations**:
  - Never persist sensitive data (e.g., no localStorage for tokens; use secure cookies).
  - Rate-limit renewals to prevent abuse.
  - Explicit logout always clears all persistence (local + session + cookies).
- **Fallbacks**: If AI reasoning fails (e.g., offline), default to Firebase's standard behavior.

#### Detailed Implementation Steps

I've broken this into prioritized tasks (tracked via internal TODO system for progress). Each includes affected files, rationale, and success criteria.

1. **Define AI Reasoning Criteria (1-2 hours)**
   - Research Firebase token best practices (e.g., refresh thresholds) and user contexts (role from `user.role`, activity via Visibility API).
   - Create a reasoning function: Input (token data, user context); Output (action: 'renew', 'warn', 'expire'; new TTL). Example: If admin + active >1h, extend to 24h; else, 1h default.
   - **Files**: New `app/utils/authReasoning.ts` (export `reasonTokenPersistence`).
   - **Success**: Unit-testable function with 5+ scenarios (e.g., Vitest in `__tests__`).
   - **Rationale**: Grounds the "AI Tool" in logic; prevents over-persistence for security.

   Example of the reasoning function (pure JS logic for token decisions):

   ```typescript
   // In a new authReasoning.ts (step 1 of plan)
   export function reasonTokenPersistence(
     tokenExpiration: number, // From getIdTokenResult()
     userRole: string, // e.g., 'ADMIN'
     idleTime: number, // From Visibility API
     deviceTrusted: boolean, // e.g., from localStorage flag
   ): { action: 'renew' | 'warn' | 'expire'; ttl: number } {
     const now = Date.now()
     const timeLeft = (tokenExpiration - now) / (1000 * 60) // Minutes left

     if (userRole === 'ADMIN' && timeLeft > 30 && !deviceTrusted) {
       return { action: 'warn', ttl: 15 * 60 * 1000 } // Shorten for untrusted device
     }
     if (idleTime > 30 && timeLeft < 5) {
       return { action: 'expire', ttl: 0 } // Force re-login after idle
     }
     // Default: renew if viable
     return { action: 'renew', ttl: 60 * 60 * 1000 } // 1 hour
   }
   ```

2. **Upgrade Firebase Persistence Modes (1 hour)**
   - Set `setPersistence(auth, browserLocalPersistence)` in `app/features/firebase/client.ts` for qualified users (e.g., non-admins). Fallback to `inMemoryPersistence` for incognito/security.
   - Handle errors (e.g., quota exceeded → session mode).
   - **Files**: `app/features/firebase/client.ts`; update `useFirebaseAuth.ts` init.
   - **Success**: Tokens survive page refresh; test via E2E (Playwright: login → refresh → still auth'd).
   - **Rationale**: Enables "continuous access" without re-login; role-based to mitigate risks.

3. **Implement AI Token Health Checker (2-3 hours)**
   - Add Zustand middleware to `app/stores/useAuthStore.ts`: Poll token via `getIdTokenResult()` every 5min (throttle with `useCallback`).
   - Integrate reasoning: If expiring soon (e.g., <15min), call `reasonTokenPersistence` → auto-renew if safe, else queue UI warning. Use BroadcastChannel for cross-tab sync.
   - **Files**: `app/stores/useAuthStore.ts`; import reasoning from step 1.
   - **Success**: Logs/simulates renewals; covers edge cases (offline, expired refresh).
   - **Rationale**: Core "AI Tool" logic; ensures proactive management without user intervention.

4. **Enhance Auth Hook and Server Validation (1-2 hours)**
   - In `useFirebaseAuth.ts`: Wrap `signIn`/`signOut` with reasoning (e.g., set initial TTL post-login). Add `isTokenHealthy` query.
   - Server-side: In `app/features/firebase/session.server.ts`, add expiration check during `createSessionFromFirebaseToken`; if AI-flagged (via custom claim), shorten TTL.
   - **Files**: `app/features/firebase/hooks/useFirebaseAuth.ts`; `app/features/firebase/session.server.ts`.
   - **Success**: Server rejects near-expired tokens; client auto-refreshes seamlessly.
   - **Rationale**: Bridges client/server; prevents stale sessions.

5. **Add UI Feedback and Logout Integration (1 hour)**
   - In `UserMenu.tsx`/`AppBar.tsx`: Display session status (e.g., via `useAuthStore` selector for remaining time). Prompt on low TTL (e.g., "Re-login to continue?").
   - Ensure logout (`signOut` in hook) clears all (localStorage, cookies, Firebase) + reasoning reset.
   - **Files**: `app/components/UserMenu.tsx`; `app/components/AppBar.tsx`.
   - **Success**: Visual indicators appear; logout persists across tabs.
   - **Rationale**: Makes persistence user-visible; reinforces "unless explicitly logged out."

6. **Testing and Documentation (2 hours)**
   - **Unit Tests**: Cover reasoning function, middleware polls, and persistence modes in `app/features/firebase/__tests__/useFirebaseAuth.test.tsx`. Mock Firebase with MSW.
   - **E2E Tests**: In `playwright/tests/auth.spec.ts`: Login → idle 30min → refresh (expect auth'd); force expiration → auto-renew/warn.
   - **Docs**: Update `docs/development/authentication.md` with architecture diagram, reasoning criteria, and migration notes.
   - **Success**: 90% coverage on new code; E2E passes with mocked expirations.
   - **Rationale**: Validates "continuous access"; documents for maintainability.

#### Potential Challenges & Mitigations

- **Privacy/Security Trade-offs**: Long persistence risks session hijacking. **Mitigate**: Role-based (short for admins); audit logs for renewals; comply with GDPR (e.g., explicit consent UI).
- **Cross-Browser/Tab Sync**: BroadcastChannel may fail in older browsers. **Mitigate**: Fallback to polling; test in Safari/Chrome.
- **Performance Overhead**: Polling drains battery. **Mitigate**: Throttle to 5-10min; pause on visibility hidden.
- **Firebase Limits**: Refresh token revocation. **Mitigate**: Handle `auth/user-token-expired` errors with graceful re-login.
- **SSR Conflicts**: LocalPersistence doesn't work server-side. **Mitigate**: Browser-only init (already in codebase via `isBrowser` checks).

#### Next Actions

- **Immediate**: Review/approve this plan. Start with step 1 (reasoning definition) for quick validation.
- **Timeline**: 1-2 days for core implementation; 1 day for testing.
- **Dependencies**: Ensure Firebase env vars are set; run `pnpm typecheck && pnpm lint` post-changes.
- **Metrics for Success**: 100% re-auth-free navigation during active sessions; <5% false expirations in tests.
