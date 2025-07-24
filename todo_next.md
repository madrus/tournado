# What to do next

##

**Q**: looking at @prisma/schema.prisma can you figure out what data is necessary to show a block with 2 teams
that are going to play a match?
⎿  Read prisma/schema.prisma (148 lines)

**A**: To show a block with 2 teams that are going to play a match, you need:

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
