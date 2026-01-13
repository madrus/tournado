# Notes

## My First Prompt to Create the Templates

I'm trying to rethink my whole project by adding project documentation that can guide me and the AI agents.
We start with three template documents that are in the templates folder. Were are the links:
@/templates/PRD-template.mdc, @/templates/ARD-Template.mdc, @/templates/Task-Template.mdc.
We will be working on these templates. As background information, I give you two files, @/PRD.mdc, @/EXTRA.md,
and the whole @docs folder. Your task is to look through all these files, take the templates as base,
keeping in mind that these templates are partially copied from another project which was based on Next.js and Python
and it was backend and frontend whereas my project is only frontend with React, React Router 7, TypeScript, Vite, and Zustand.
So some things in the templates that you see now do not fit my project, so I need you to go through them to change
anything that relates to the Python Next.js project and make it fit this project.

If necessary, you can go through the codebase; if necessary, you can ask me questions. But I need to have these templates
in order to create the real documents. But that will be the next step. For now, I need only the templates that are general enough.
And keep also in mind that I'm going to add authentication via Google authentication in Firestore. In the real documents,
I will go into more details. Look at the referenced old PRD that I had for this projecеt. It has a lot of information there.
You can get through it a better insight in what kind of template questions we will be answering later.
You don't have to use that text, only its ideas for now. Eliminate all references to Python, Next.js and mono-repo
as I have no back-end and do not use those tools.

## Create PRD

Ask me question until you have enough information to fill in @PRD.mdc based on background information from
the old @PRD.mdc and @EXTRA.md, also you can read documentation in the docs folder. Feel free to analyse the existing
codebase to learn what has already been done and use that, e.g., for the list of Implemented Features.
No matter what you find in the background information, stick to the PRD structure unless you come up with ideas to change it.

## Create ADR

Now that you understand better this project, let us work on the @.cursor/rules/ADR.mdc document. It is a template at the moment,
which we need to rework in the real document. As background information, I give you @/PRD.mdc and the whole @docs folder.
Your task is to look through all these files, and keep in mind that @.cursor/rules/ADR.mdc is partially copied
from another project which was based on Next.js and Python and it had backend and frontend in a mono-repo
whereas my project is only frontend with React, React Router 7, TypeScript, Vite, and Zustand.
So some things in the template that you see now do not fit my project, so I need you to go through them
to change anything that relates to the Python and Next.js project and make it fit the current stack
which you can find in the @.cursor/rules/PRD.mdc. Please go through the ADR.mdc, fill it up with what you have found
and ask me questions about things you are missing.

## Extra formatting

Scan the ENTIRE document systematically from top to bottom. Find every instance where a markdown heading
(any line starting with #, ##, ###, ####, etc.) OR plain text is immediately followed by a bullet list
(lines starting with - or a number) without an empty line in between. Add exactly one empty line between them.
After making changes, verify you found ALL instances by doing a final systematic check.

## Questions To Confirm (Asked by AI Agent)

- Architecture scope: Keep SSR + Prisma/SQLite as in PRD, or strictly “frontend-only”? ADR-0001/0002 currently reflect SSR + Prisma (as your docs do).
- Firebase modes: Confirm we support both Google SSO and Firebase email/password (and that legacy cookie auth is transitional only).
- Admin Panel scope: Confirm staff access (ADMIN, MANAGER, REFEREE) is correct and that REFEREE panel usage is intended to be narrowly scoped.
- EDITOR/BILLING: Should they have Admin Panel sections in the future (content/billing only), or be limited to separate UIs?
- PWA: Keep minimal SW (logging toggle only) for now, and plan offline caching later?
- CI/CD: GitHub Actions + Slack notifications are active on main and dev per docs - any additional environments or secrets to capture in a future ADR?
- i18n: Confirm centralized language enum location (one source of truth) and final language set: nl, en, fr, ar, tr, de.

Here’s a pragmatic way to handle ADR naming, placement, and future items in this repo.

### Naming

Pattern: ADR-XXXX-short-kebab-title.mdc (4-digit ID + concise slug).

Examples:

- ADR-0001-react-router-frontend-architecture.mdc
- ADR-0004-auth-firebase-session-bridge.mdc
- ADR-0006-design-system-semantic-tokens-dark-mode.mdc

### Placement

- Recommended now: Keep a single catalog file /.cursor/rules/ADR.mdc (what you have).
  - Pros: Simple, one place to read/search; Cursor picks it up automatically; low overhead.
  - When to split: If ADRs grow past ~20–30 or merge conflicts become frequent.
- If/when splitting: Create /.cursor/rules/adrs/ and keep /.cursor/rules/ADR.mdc as the index.
  - Files: /.cursor/rules/adrs/ADR-0001-….mdc, etc.
  - Index: /.cursor/rules/ADR.mdc keeps the table linking to anchors in each ADR file.

### Remembering Future ADRs

- Best practice in your current single-file setup: Add minimal “Proposed” ADR entries with IDs reserved and basic context (these live in ADR.mdc, appear in the Index, and keep numbering contiguous).
  - Example placeholders to add:
    - ADR-0010 - CI/CD and Fly.io Deployment (Proposed)
    - ADR-0011 - Security Headers and CSP Baseline (Proposed)
    - ADR-0012 - Analytics and Privacy (GA4 scope) (Proposed)
- Alternative (if you don’t want placeholders yet):
  - Add GitHub issues titled “ADR: CI/CD and Fly.io Deployment”, etc.
  - Or add a short “ADR Backlog” note at the end of ADR.mdc (but placeholders are cleaner and conform to your protocol).

### Recommendation

- Short term: Keep /.cursor/rules/ADR.mdc as the single source. I can add 2–3 Proposed entries (IDs 0010–0012) to hold the space and remind us.
- Later (if ADR count grows): We split into /.cursor/rules/adrs/ and keep the index in ADR.mdc.
