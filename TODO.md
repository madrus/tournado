# What to do next

## Knip related actions

- `app/components/RouteTransition.tsx` provides several React components for
  animating transitions between routes, such as fades and slides, but none of them is used. I'd rather we use these animations. **Research**!
   - next up is `app/hooks/useIntersectionScrollDirection.ts`. This file contains two custom React hooks, `useIntersectionScrollDirection` and `useEnhancedIntersectionScrollDirection`, which are designed to efficiently detect the user's scroll direction (up or down). This is typically used to show or hide a header as the user scrolls. **Research** if we should use them!
   - next up is `app/hooks/useReducedMotion.ts`. This file provides two custom hooks, `useReducedMotion` and `useMotionSafeClass`, which allow the application to respect a user's operating system setting for reduced motion. This is an important accessibility feature for users who are sensitive to animations. I'd rather we use them. **Research**!
   - The next file is `app/singleton.server.ts`. This file contains a utility function named `singleton.` Its purpose is to create a single, persistent instance of an object on the server, which is a common need in server-side rendering during development to prevent memory leaks across hot reloads. **Research** if we should use it!

## To show a block with 2 teams that are going to play a match, you need:

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
