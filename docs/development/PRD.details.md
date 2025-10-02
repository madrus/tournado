# PRD Addendum - Detailed Feature Concepts

This addendum complements `.cursor/rules/PRD.mdc` with deeper implementation notes and option trade‑offs. It avoids repeating PRD scope; instead, it elaborates on complex areas referenced there.

<a id="authentication-bridging"></a>

## Authentication Bridging (Firebase + SSR)

- Flow: Client signs in via Firebase (Google or email/password). Server verifies Firebase ID token and mints an HTTP‑only session cookie to preserve SSR security and role checks. Logout clears Firebase session and server cookie.
- Tokens: Avoid long‑lived tokens in `localStorage`. Prefer HTTP‑only cookies; short‑lived in‑memory tokens only when required for client‑initiated calls.
- Redirects: Keep role‑aware post‑login redirects consistent with loader checks.

<a id="i18n-details"></a>

## Internationalization Details

- Centralization: Store supported languages in a single enum/object consumed by i18n config and UI. Fallback language: `nl`.
- Current locales: `nl`, `en`, `fr`, `ar` (RTL), `tr`, `de`. Ensure RTL handling remains correct for `ar`.
- Adding a language: add one enum value + one translation file. Keep sentence casing conventions per locale.

<a id="scheduling-conflicts"></a>

## Scheduling: Conflict Detection & Resolution

- Constraints: field availability, team blackout windows, referee availability, category/division separation, rest time between matches.
- Detection: validate proposed timeslots against constraints; flag conflicts with actionable reasons.
- Resolution strategies:
   - Greedy shift within venue/day window (nearest valid slot).
   - Swap candidates in same division to eliminate cross‑team conflicts.
   - Rebalance across fields using minimal movement cost.
- UX: inline suggestions in the scheduler; batch “auto‑resolve” with preview + undo.

<a id="referee-experience"></a>

## Referee Experience

- Dashboard: upcoming/active/recent matches, field assignment, quick actions (start, pause, complete), per‑match timer hints.
- Offline scoring: score form works without network; queue writes; show pending badge until synced.
- Background sync: service worker Background Sync or periodic sync; retries with exponential backoff.
- Conflict handling: if server state changed, present merge dialog (keep mine vs server, or manual edit).
- Performance tracking (future): log assignments, punctuality, dispute rates, and optional ratings for manager review.

<a id="live-updates"></a>

## Live Updates Architecture

- Transport options:
   - WebSocket (bi‑directional, low latency) for live scoring and dashboards.
   - Server‑Sent Events (SSE) for simpler uni‑directional streaming.
   - Polling + HTTP cache revalidation as a fallback.
- Delivery:
   - Public: tournament dashboard streams match events + standings diffs.
   - Staff: scheduler/referee views subscribe to scoped events only.
- Back‑pressure: coalesce high‑frequency goal/events; debounce standings recompute on server.

<a id="notifications"></a>

## Notifications & Alerts

- Subscriptions: users (public or authenticated) opt into alerts for teams and/or specific matches.
- Channels: Web Push (service worker), email fallbacks for subscribed events.
- Events: kickoff alerts, final score, goals (optionally frequent), reschedules/cancellations.
- Privacy: explicit opt‑in, granular unsubscribe, per‑tournament consent storage.

<a id="public-dashboard"></a>

## Public Tournament Dashboard

- Views: live matches ticker, by‑field view, by‑group view, team‑centric view.
- Data: live scores, match clocks/status, field locations, next up.
- Standings: automatic rankings with configurable tie‑breakers (see below).
- Performance: incremental hydration + streaming updates; prioritize low payload.
- Contact officials: provide a contact form or mailto links for tournament inquiries (rate-limited, spam-protected).

<a id="standings-tie-breakers"></a>

## Standings & Tie‑Breakers

- Defaults: points, goal difference, goals scored, head‑to‑head, fair play (configurable per tournament).
- Transparency: show applied rules on standings page.
- Optional: promotion/relegation rules when tournament format supports it; document per-tournament policy.

<a id="bracket-formats"></a>

## Bracket & Tournament Formats

- Round‑robin (single/double), knockout (single/double elimination), placement matches, Swiss system, group‑to‑knockout pipelines.
- Round-robin (single/double): teams in a group play each other once (single) or twice (double). Standings are based on points with tie-breakers; top teams advance or win on points.
- Knockout (single-elimination): teams are seeded in a bracket; a single loss eliminates a team. Winners advance each round until a final determines the champion.
- Knockout (double-elimination): teams must lose twice to be eliminated. A losers bracket provides a second chance; finals may include a bracket reset if the winners and losers bracket champions split results.
- Placement matches: additional classification matches to determine precise final positions for teams eliminated from title contention. Ensures a fixed number of matches and clear placement beyond the champion.
- Swiss system: multiple rounds where teams are paired against opponents with similar records. No eliminations; after a fixed number of rounds, standings determine placements or advancement.
- Group-to-knockout (multi-stage): a group phase (often round-robin) followed by a seeded knockout bracket. Group standings seed the bracket; byes may apply for top group finishers.
- Model: Bracket, Round, MatchNode, Seeding; support byes and reseeding.
- Generation: pluggable generators per format; deterministic seeds; reproducible with input hash.
- UI: visual bracket with drag‑to‑adjust seeds (permission‑gated).

### Multi-stage Scope Split (Phases)

- Phase 2 (MVP): multi-stage via groups only. After initial group play, managers can form a new “knockout group” composed of champions (one or two per group) and configure how they play each other using the existing group interface; no dedicated knockout UI yet.
- Phase 5: full multi-stage with a dedicated knockout UI. Introduces visual bracket creation, seeding, byes, and progression management integrated with group results.

<a id="email-integration"></a>

## Email Integration

- Providers: currently Resend, alternatives Postmark and SendGrid (TBD).
- Templates: team registration confirmation, match reminders, schedule changes, final result wrap‑ups.
- Outbox pattern: persist pending emails; retry with backoff; admin view for failures.
- Deliverability: domain authentication (SPF/DKIM/DMARC); per‑locale templates.

<a id="api-integrations"></a>

## API & Integrations (Future)

- Public read‑only API for tournaments, teams, matches, standings.
- Calendar exports (ICS) per team/tournament/field.
- Social sharing links with dynamic images.
- Export formats: CSV, PDF, and JSON for data export.

<a id="operations-reporting"></a>

## Operations & Reporting (Future)

- Multi‑tournament series, equipment/field inventory, financials (fees, payouts), referee assignment automation.
- Reporting and analytics dashboards (tournaments, teams, referees); custom and role-based views.
- Historical data exploration and comparisons; export to CSV/PDF for stakeholders.

<a id="communications-system"></a>

## Communications System (Future)

- In‑app messaging between authenticated staff roles (scoped to tournaments).
- Announcements/broadcasts: tournament-wide notices visible to relevant audiences.
- Contact forms for unauthenticated public to reach organizers; triage + rate limiting.

<a id="performance-data-loading"></a>

## Performance & Data Loading (Detailed)

### Prefetching Strategy (React Router v7)

- Use route‑level prefetching: `intent` (hover/focus), `render` (on render), and `viewport` (when visible).
- Default contexts: primary navigation = `intent`, action buttons/CTAs = `render`, list items = `intent`.
- Adaptive prefetching: reduce aggressiveness on slow connections, data‑saver, and mobile; disable `viewport` on poor networks.

### Data Freshness on Back/Forward

- Add `popstate` listener on list pages (teams, tournaments) to revalidate data when navigating back/forward.
- Use `useRevalidator()` to trigger refetch; navigation via in‑app links fetches fresh data by default.

### Targets

- Navigation latency budget: sub‑500ms for prefetched routes.
- Prefetch overhead: 2–5 KB typical; measure via analytics.

<a id="pwa-details"></a>

## PWA Implementation Details

- Offline scoring queues with background sync; visible pending state and conflict handling.
- Service worker update prompts and background sync where applicable.
- `SW_DEBUG` toggle in `public/sw.js` for controlled logging (disable in prod).

<a id="testing-tooling"></a>

## Testing & Tooling Details

- Vitest for unit/component tests; Playwright for E2E tests (`playwright/tests`).
- Tests colocated per project standards; include accessibility states.
- Comprehensive test coverage with automated quality gates.

<a id="deployment-details"></a>

## Deployment Details

- Hosting: Fly.io (see `fly.toml`). SQLite persistent volume mounted at `/data`. SSR enabled.
- Process/ports: internal port `8080`; example healthcheck endpoint `/resources/healthcheck`.
- Build/start: `pnpm build`; entrypoint via `start.sh` or configured container entrypoint.

<a id="mobile-wrapper"></a>

## Mobile Wrapper (Capacitor)

- Targets: Android and iOS via Capacitor. Assets are bundled with the app; web runtime runs in a WebView.

### Setup

- Add: `pnpm add -D @capacitor/cli` and `pnpm add @capacitor/core`
- Init: `npx cap init tournado com.example.tournado`
- Platforms: `pnpm add @capacitor/ios @capacitor/android`; then `npx cap add ios` and `npx cap add android`
- Sync after builds: `npx cap sync`
- Open projects: `npx cap open ios` / `npx cap open android`

#### Minimal Capacitor config (SSR via server.url)

```ts
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
   appId: 'com.example.tournado',
   appName: 'Tournado',
   webDir: 'dist',
   server: {
      // Point to your SSR origin to preserve SSR in WebView
      url: 'https://tournado.fly.io',
      cleartext: false,
      allowNavigation: ['tournado.fly.io', 'tournado-staging.fly.io'],
   },
}

export default config
```

### Build strategy

- SSR-first: load the web app from the production/staging HTTPS origin via Capacitor `server.url` (e.g., `https://tournado.fly.io`). This preserves SSR semantics and role checks in WebViews.
- Offline support: rely on the origin’s service worker for caching/queueing where supported; keep background sync logic aligned with ADR-0008.
- Environment: configure `server.url` and `allowNavigation` for the target domain(s). Keep API base URLs consistent with web.

### SSR integration (required)

- Boot path: ensure the HTTPS origin is reachable on app start; display an offline screen if the origin is unavailable and provide retry.
- Service worker: register from the HTTPS origin (not app scheme). Test SW registration and background sync in iOS (WKWebView) and Android.
- Cookies/session: verify HttpOnly/Lax/Secure cookie persistence across suspend/resume and app relaunch on iOS/Android WebViews.
- CSP: if any plugin uses a custom scheme, extend CSP (e.g., include `capacitor:` in `connect-src` when needed). ✅ **Nonce-based scripts implemented per ADR-0011** with `'unsafe-inline'` for styles during migration period.
- OAuth (Firebase/Google): prefer system browser (SFSafariViewController / Custom Tabs) with a custom URL scheme or universal link back to the app; whitelist redirect URIs and confirm SSR endpoint handles return paths.

### Offline and background

- Service workers in WebViews: support varies, especially on iOS. When using `server.url` (HTTPS origin), register the SW from the origin and verify behavior on both platforms. For app-scheme fallbacks, do not rely on SW; use in-app queues/native background tasks instead.
- Storage: persist pending actions (e.g., offline scoring) using IndexedDB or a lightweight SQLite plugin if needed.

### Push notifications

- Use Capacitor Push Notifications: APNs on iOS and FCM on Android. For iOS, configure APNs keys/certs; for Android, FCM sender ID and JSON config.
- Topics/targeting: subscribe users to team/tournament topics when they opt-in; respect privacy and granular unsubscribe.

### Risks & mitigations

- Service worker behavior in WebViews: test on iOS and Android; provide graceful offline UI if SW is unavailable.
- Cookie/session persistence: run suspend/resume and relaunch tests; adjust cookie attributes if needed.
- OAuth redirects: validate deep link/universal link flows and server handling of redirect completion.
- CSP allowances: add any required schemes (e.g., `capacitor:`) while keeping the policy strict; ✅ **Nonce migration completed** with `'unsafe-inline'` for styles during transition.
- Storage/offline data: verify IndexedDB/caches availability and quotas; fall back to SQLite plugin if required.

### Recommendation

- Serve the app via `server.url` from the HTTPS SSR origin to retain SSR across routes. Use the origin’s SW for offline where supported. Monitor iOS/Android differences for SW, cookies, and OAuth.

### Review checklist (Apple/Google)

- Provide app-like value beyond a webview (offline scoring, push alerts, saved favorites, native share, settings).
- Handle login flows cleanly (web SSO in WebView or native OAuth if needed).
- Privacy: consent for analytics/notifications; clear policy links; data minimization.
- Performance: quick startup, responsive navigation; test on low-end devices.
- Branding: proper icons, splash screens, and store listings; App Tracking Transparency if applicable.

### Nice-to-haves

- Native share sheet for match pages; deep links into app views.
- In-app updates/check for new web assets; prompt to refresh if backend schema changes.

<a id="data-model-migrations"></a>

## Data Model Touchpoints & Migrations

- Anticipated changes:
   - `Team.clubIcon: String?` (URL to an icon)
   - Playoffs: new models for brackets/rounds (TBD after design)
   - Subscriptions and Payments/Transactions (Stripe)
   - Referee pre‑auth tokens (scoped, expiring) for match access
   - Notification subscriptions for team/match alerts (channels, consent, scope)
- Migration workflow (development):
   - `pnpm prisma generate`
   - `pnpm prisma migrate dev --name <descriptive_name>`
   - `pnpm prisma migrate reset` as needed
- Seed data updates: `prisma/seed.ts` (or `seed.js`).
- Note: Keep schema changes minimal per iteration. Document details in implementation PRDs.

<a id="routing-map"></a>

## Routing Map (Current)

- Public: `/`, `/teams`, `/about`, `/auth/*`
- Authenticated: `/profile`, `/settings`, `/<admin_base>/*` (obfuscated base path)
- Admin (example): `/<admin_base>/tournaments/*`

<a id="roles-future"></a>

## Roles — Additional (Future)

- No additional roles planned beyond `PUBLIC`, `REFEREE`, `MANAGER`, `ADMIN`, `EDITOR` (future), `BILLING` (future).

<a id="permissions-glossary"></a>

## Permissions Glossary

- teams:read/create/edit/delete/manage: view and CRUD teams; manage = full control.
- tournaments:read/create/edit/delete/manage: view and CRUD tournaments; manage = full control.
- matches:read/create/edit/delete: view and CRUD matches; edit includes score updates and reschedules (subject to role scope).
- matches:referee: referee-specific actions (start/pause/complete matches, submit scores) scoped to assigned matches.
- groups:manage: create/edit/delete groups and allocations within a tournament.
- referees:assign: assign referees to matches; manage pre-auth links and revocation.
- assignments:manage: manage match assignments (referees, fields, times) including reassignment within constraints.
- system:settings/reports: platform settings and reporting access.
- users:approve: approve user registrations (admin only).
- roles:assign: assign roles to approved users (admin only).
- refereeTokens:manage: issue and revoke pre-auth links for referees (manager/admin).

<a id="team-registration"></a>

## Team Registration Model

- TeamLeader model: stores contact information for registrations; not a user account. Used for public team registration without authentication.
- Admin review workflow: admin reviews new team registrations, assigns status (pending, approved, rejected), and triggers email notifications.
- Advanced team forms: real-time validation and progressive steps (panel-based) for robust UX on mobile.

<a id="referee-access-model"></a>

## Referee Access Model

- Goal: Allow referees to submit scores and manage assigned matches without creating or managing standard user accounts.
- Access: Pre‑validated, expiring links scoped to a tournament and the referee’s assigned matches; revocable by managers.
- Identity options:
   - Shadow user (recommended): create a virtual `REFEREE` user record marked `isVirtual: true`, without credentials. Tokens map to this user for auditability; no password nor interactive login.
   - Token-only claims: mint tokens with role and scope claims, without a backing user record; lighter but less auditable.
- Tokens: include `tournamentId`, `matchIds` scope, `exp`, `jti` (revocable); store issued/revoked states.
- Lifecycle: managers issue/revoke tokens; admins can override/revoke; tokens expire automatically.
- UI: a dedicated “Referee dashboard” route that reads token scope and shows assigned matches only.

<a id="mobile-navigation"></a>

## Mobile Navigation (UX)

- Bottom navigation bar on small screens for primary sections; proper touch handling and safe areas.

<a id="categories-divisions"></a>

## Categories & Divisions (Domain)

- Age categories: JO8–JO19, MO8–MO19, Veterans.
- Divisions: six‑tier division system (D1–D6 or equivalent).

<a id="platform-data-reqs"></a>

## Platform & Data Requirements (Extended)

- Cross‑browser support: modern Chrome, Firefox, Safari, Edge.
- Offline support: local storage with background sync for critical flows.
- Analytics: user behavior and tournament insights; privacy controls required.
- Backups: daily automated backups with point‑in‑time recovery.
- Real‑time updates: WebSockets preferred; SSE/polling as fallback.

<a id="success-metrics"></a>

## Success Metrics (Targets)

- User engagement: DAU during tournaments 80%+; session duration 10+ minutes; core feature adoption 70%+; retention 85%+ for multi‑day events.
- Operations: setup time <30 minutes; score entry <60 seconds; data accuracy 99.9%; uptime 99.9% during tournaments.
- Performance: page load <2s; API <500ms; mobile Lighthouse >90; offline scoring 100% functional.
- Business: tournament completion 95%+; satisfaction 4.5+; support tickets <5%; track prioritized feature requests.

<a id="risks"></a>

## Additional Risk Considerations

- Real‑time data complexity: streaming fan‑out and back‑pressure; coalescing updates and debounced recomputes.
- Offline sync conflicts: robust conflict resolution UI for referees/managers.
- Role refactoring: mapping legacy roles to RBAC and loader checks.
