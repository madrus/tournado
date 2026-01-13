# PRD Questions Asked by the Agent

## First Round

**NOTES for the Agent**:

- my answers to these questions are prepended with "-->"
- English is not my native language, please improve grammar and style as necessary
- same holds for my architectural capabilities, please improve my answers to sound more professional when I will show them to the Client
- keep consistent terminology (e.g. matches rather than games)
- soccer/football is not my primary knowledge area, please advise me on discrepancies or missed options - I will be glad to update or enhance this document and application

### 1. Scope & naming

- Which PRD do you want to author now? --> Whole product “Tournado”
- Exact Product/Feature name to use in the PRD header? --> Tournado Tournament Management

---

### 2. Executive summary

**TL;DR (complete the blanks)**: For [target user], build [capability] so they can [value] -->

- For PUBLIC (anyone without a user account) build a place to get insight into the tournaments, teams, and matches that the user is interested in so that they can:
  - view the tournament list
  - view teams per tournament
  - view team divisions, groups, playoffs
  - view matches information like locations and calendar details
  - view scores and qualifications
  - register teams and team leaders for existing tournaments
  - am I missing anything?
- For ADMIN build a way to manage users so that they can approve/reject user registrations and assign their role(s)
- For MANAGER build a way to manage their tournaments so that they can CRUD tournaments, teams, group distributions, matches calendar, and allocate REFEREEs to matches
- For REFEREE build a way to log in via a pre-authenticated link so that they can register scores and make changes to calendar of the matches they were appointed to (e.g. change date/time or cancel)
- For EDITOR build a CMS facility so that they can add/edit/delete articles on the homepage, tournament page, game page
- For BILLING build a financial dashboard so that they can see the financial picture with subscriptions and contributions to develop the app (also delays in payments) but also can zoom in on specific financial transactions if necessary

### 3. Vision & mission

- Vision (1–2 sentences)? --> please create one for me to see (search internet for examples)
- Mission (1–2 sentences)? --> please create one for me to see (search internet for examples)

### 4. Personas & roles (from schema: ADMIN, MANAGER, REFEREE, PUBLIC, EDITOR, BILLING)

- Primary persona(s) for this PRD? --> I need from you more explanation on this as I don't understand your question
- Top 2 jobs-to-be-done per primary persona? --> I need from you more explanation on this as I don't quite understand your question, but here are some ideas:
  - ADMIN: max rights for everything but mainly approve all user registrations (not automatic) and their role
  - MANAGER: CRUD on tournaments, teams, groups, matches, etc., but not on other users except appointing REFEREEs by delegating them the necessary access rights via a temporary pre-authenticated link (without REFEREEs having to create their own account) -- AGENT: we will need to think it over how to best do it in more details in the corresponding technical section
  - REFEREE: can register scores for matches (or matches?)
  - PUBLIC: can view public information and register teams for tournaments
  - EDITOR: (in the far future) can add articles (text, images, videos) to the home page, tournaments and matches (via some 3d party backend like Contentful, NetlifyCMS, or some such -- to be researched later)
  - BILLING: (in the far future) can view subscriptions and contributions to develop the app

### 5. Current state confirmation (I’ll prefill unless you correct)

- Authentication: Email/password with cookie session; sign-in/sign-up/sign-out routes; role-based guards; smart redirects; unauthorized flow. Confirm? --> yes
- Teams: Public browse + create; public team detail; Admin full CRUD. Confirm? --> yes (although no public team details page is implemented yet)
- Tournaments: Admin-only full CRUD with swipe-to-delete on mobile. Confirm? --> yes
- i18n: Multi-language with RTL support; Dutch sentence case. Confirm? --> yes, for all languages except English
- State: Zustand stores with SSR-safe hydration. Confirm? --> yes, mainly for forms or global states
- Routing: React Router v7, nested layouts, protected admin area. Confirm? --> yes, based on flat routes
- PWA: Manifest + service worker present. Confirm? --> yes
- Testing: Vitest + Playwright configured. Confirm? --> yes
- Deployment to Fly.io
- Prisma database based on SQLite
- Styling based on Tailwind classes

### 6. In-progress features

What’s currently in progress that should appear in “In Progress Features”? -->

- Teams allocations in groups for the selected tournament (full CRUD)

### 7. Planned features (this PRD’s scope)

- From EXTRA.md: Add Google Auth via Firebase; login redirect; logout; credential persistence; auth status indicator --> yes, top prio
- Include all of these now? --> yes, authentication via Google auth (either with an existing Google account or plain username/password to replace completely the cookie based we have now)
- Any others? --> yes, although some only in the far future:
  1.  playoffs schema
  2.  game score registration
  3.  real-time qualifications statistics (totals, places, what else?)
  4.  subscriptions for MANAGERs to organize their own tournaments
  5.  payments for subscriptions and contributions to support this app development (via Stripe)
  6.  financial dashboard (BILLING and ADMIN) with totals stats and the possibility to zoom in on details (actual, delayed and expected payments)
  7.  adding articles (text, images, videos) to the homepage, tournament page, game page
  8.  (optionally) uploading images and videos for/during a game
  9.  (optionally and yet to be confirmed) signup for anyone without approval in the PUBLIC role with the extra possibility to chat with each other
  10. (optionally) votes on who will get which place
  11. (optionally) totalisator = betting on game scores (no money)

### 8. Success metrics (targets)

- User engagement (e.g., signup→first-team-created conversion %, admin weekly active, returning users %) — which and target values? -->
  - signup is only necessary for managers, so an overview per manager of tournaments and registered teams -- targets at this moment are unclear
- Performance (mobile Lighthouse ≥ 90, TTI < 2s, CLS < 0.1) — confirm targets? --> yes, but not the first priority
- Business (teams created/week, tournaments created/month, admin retention %) — which and targets? --> targets at this moment are unclear
  - teams created/week
  - tournaments created/month
  - overview of tournaments and teams per tournament, also % played matches per tournament
  - total subscriptions and total monthly subscription payments
  - total monthly contributions to develop the app

### 9. Scope table

- Must-have (MVP): list 3–6 bullets? -->
  - groups and playoffs
  - Google auth (Google account or username/password)
  - fetch team club icons via API
  - matches planning
  - matches calender
  - matches scores
  - competition status (total scores and places)
- Nice-to-have (Later): list 2–5 bullets? -->
  - payments (contributions to develop the app)
- Explicitly out (Not now): list 2–5 bullets? -->
  - CMS + uploading
  - subscriptions for manager to organize there own tournaments
  - chat
  - votes + totalisator

### 10. Technical requirements

- Deployment target: Fly.io (per fly.toml)? Confirm. --> yes, it works already
- Browser support (mobile-first; which minimums)? -->
  - up to s = mobile phone
  - m = tablet (same layout as desktop)
  - l and above = desktop
- Accessibility bar (WCAG AA)? Confirm. --> yes
- All components should be LTR/RTL compliant with System-UI font for latin text and Amiri for Arabic. There is a whole library that I'm using to make sure that Amiri looks the same size as the Latin text. It is mostly increased by 20%, and if inside the Arabic we use Latin, then there are Tailwind classes that make sure the font size is consistent visually.
- Use CVA (Color Variance Authority) variants for colors (see the codebase)
- Avoid code duplication, refactor large components as necessary but creating dedicated folders for them
- Stick to the existing naming conventions
- Any non-functional constraints (bundle size, cold start, memory/CPU)? --> must be snappy after evt. cold start

### 11. Data model touchpoints

Any schema changes needed for this PRD? If yes, which models/fields? --> to be determined

- are we missing anything for playoffs? I understand there are several types of them
- clubIcon field for Team pointing to some url (remote or local)
- Subscription
- Payment/Transaction (I have little experience with what we might need)

### 12. Routing & navigation

Routes affected and access levels (public/auth/admin)? Any specific redirects or error boundaries to call out? --> yes, but then you have to look in the existing codebase how it is being done and we can discuss if not the best way

### 13. Internationalization

- Supported languages to list in PRD (nl, en, fr, ar, tr)? Confirm. --> yes, but you missed de, and I want the language set to be organized in such a way that adding a new language later would mean adding somewhere - in one place! - a new value in an enum or property in an object + create the corresponding translation file (no need to create UI for this)
- Any new translation key groups to add? --> yes, but I can't say that in advance. mostly I do that for one language (en or nl) in the new components, then when it is finished, add the corresponding new or updated translations to all other languages

### 14. Design system & UI

- Use Panel and ActionLinkPanel components for key flows? Any special variants to call out? --> this is not a dogma but definitely fits the UI guidlines. Panel is handy for information presentation and ActionLinkPanel for clickable menu options
- Use the specific set of colors: brand = red and primary = emerald, but also sky, teal, fuchsia, indigo, amber, slate. (I noticed we have cyan in several places, it should be replaced with sky in components. If there are any other colors used in components except the just mentioned, please, let me know)
- Any new UI components or states (loading/empty/error) to define? --> that will only be clear when we start creating tasks, and I definitely can use your advice on that

### 15. Security & privacy

- For auth (if in scope): session cookie policy, token storage location, logout invalidation expectations? --> session cookie for auth should be removed once we start using Google auth; tokens are stored in localStorage I believe; logout invalidation - yes
- Any privacy constraints (PII, analytics configuration)? --> not at the moment but feel free to mention this as your advice in the Notes/Ideas section at the end of the PRD document

### 16. Risks & mitigation

- Top 2–3 technical risks + mitigation? --> here I know too little about, need your advice, at least mention what people on internet see as major technical risks
- Top 1–2 business risks + mitigation? --> here I know too little about, need your advice, at least mention what people on internet see as major technical risks

### 17. Timeline & release

- Target timeline or phase breakdown (Phase 1/2 with durations)?
- Release gating: feature flag/config switch? Rollback plan? --> no feature flags for now (but it is a good quesion - I have added To Research section); rollback plan is just deployment of the previous version

### 18. Links

Any ADRs/tasks to reference now? --> not yet

### 19. To Research

How much effort would it take to migrate this project from github to gitlab? What would I loose? The motivation is the built-in feature-flags gitlab feature which is not available on github.

---

## Forgotten Stuff

### General Remarks

- Why some bullets are simple bullets and others are checkmarks? Please use checkmarks everywhere where we should keep track of our implementation progress

### 9. Scope table

- Nice-to-have
  - cookie acceptance
  - install PWA on (mobile) desktop
  - needs a feedback loop feature to collect user feedback
