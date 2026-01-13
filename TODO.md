# What to do next

## Audit

Add auditing of mutations - user, what, when

## QC Remarks

- [ ] continued use of non-semantic Tailwind colors (e.g. text-slate-_, bg-red-50, text-blue-_) which may conflict with your “semantic color tokens” guideline
- [ ] move all messages to the `messages` namespace and add hardcoded messages to it
- [ ] Competition feature
  - [ ] Create feature
  - [ ] The selectedCategories and summary are derived from actionData?.fieldValues, which only contains values from the most recent POST attempt. On initial page load and while the user is interacting with the form, selectedCategories remains empty (line 303), so the summary section doesn't display. As users change checkbox selections in the form, the summary doesn't update because the form inputs are uncontrolled (using defaultValue/defaultChecked) without any client-side state to track current values.</br>If the intent is a live preview of the summary, implement a Zustand store or local state with onChange handlers for form inputs.

## 1. Checks

- [ ] non-test environment: replace inline imports like `const { addEmailToOutbox } = await import('test/mocks/handlers/emails.js')`
- [ ] do we have direct DOM manipulations in our Playwright tests instead of Page Object Model usage?
- [ ] add getServerT() to all modules that deal with server-side errors (see `users._index.tsx`)
  - [ ] **Server-Side Translations**: Use `getServerT(request)` in all server
    - [ ] actions/loaders for localized error messages and server-generated content;
    - [ ] respects user's language preference from cookie
          (see `.cursor/rules/PRD.mdc` around line 643)
- [ ] check all translation strings in t() function calls in the codebase for existence. make a list of missing/wrong. use MCP servers for that
- [ ] check code duplication
- [ ] check LTR/RTL support completeness including left/right mirroring of all design elements

## 2. To show a block with 2 teams that are going to play a match, you need:

- From Match model (schema.prisma:121-137):
  - id, date, time, location, status
  - homeTeamId, awayTeamId

- From Team model (schema.prisma:91-105):
  - id, name, clubName, category, division

- Optional from MatchScore model (schema.prisma:139-147):
  - homeTeamScore, awayTeamScore (if match is played)

So the essential data structure would be:

```ts
{
   match: {
   id: string,
   date: DateTime,
   time: DateTime,
   location: string,
   status: MatchStatus,
   homeTeam: { name: string, clubName: string },
   awayTeam: { name: string, clubName: string }
   }
}
```

## 3. Losse Flodders

- add devtools panel behind a permanent action button at the bottom left of the screen
- add feature flags middleware like I did at Conclusion that I can set in the devtools panel
