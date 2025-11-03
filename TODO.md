# What to do next

## 1. Checks

- non-test environment: replace inline imports like `const { addEmailToOutbox } = await import('test/mocks/handlers/emails.js')`
- do we have direct DOM manipulations in our Playwright tests instead of Page Object Model usage?
- add getServerT() to all modules that deal with server side errors (see `users._index.tsx`)
   - **Server-Side Translations**: Use `getServerT(request)` in all server
      - actions/loaders for localized error messages and server-generated content;
      - respects user's language preference from cookie
        (see `.cursor/rules/PRD.mdc` around line 643)
- check all translation strings in t() function calls in the codebase for existence. make a list of missing/wrong. use MCP servers for that

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

3. Color System

**Q.** I have decided to use CVA-variants and those use mostly hardcoded colors for simplicity. Otherwise, I would need to create hundreds upon hundreds semantic colors for each color tweak. Or am I wrong?

**A.** Totally get why CVA makes hard-coded Tailwind colors tempting—especially when you support lots of hues. The snag is that our design system treats those utilities as implementation details. When colors change (theme refresh, dark mode tweak, brand update), anything locked to the literal bg-sky-700/10 string needs a sweep.

Two lightweight alternatives that avoid minting hundreds of tokens:

Keep CVA, but have each variant emit a semantic hook (class like info-banner--warning or data-variant="warning"). Then use a shared stylesheet or CSS variables (var(--banner-warning-bg)) to define the palette in one spot. Updating the palette becomes a single change, and tests can just check the hook.
If the banner variants are few, declare a single semantic utility per variant (e.g., .info-banner--warning { background: … }). That’s still only 3–4 definitions instead of hundreds, yet the component no longer cares about the exact colors.
So you don’t need thousands of custom tokens—just a thin semantic layer between variants and their actual colors. It keeps things flexible without exploding maintenance.
