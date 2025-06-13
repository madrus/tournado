---
description:
globs:
alwaysApply: false
---

We are going to refactor the current Team and Tournament entities.

## Team

Team is beinig refactored from:

```yml
model Team {
  id            String     @id @default(cuid())
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  clubName      String
  teamName      String
  division      Division
  teamLeaderId  String
  teamLeader    TeamLeader @relation(fields: [teamLeaderId], references: [id], onDelete: Cascade)
  tournamentId  String
  tournament    Tournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  // back-relations for Match
  homeMatches   Match[]      @relation("Match_homeTeam")
  awayMatches   Match[]      @relation("Match_awayTeam")
}
```

to:

```yml
model Team {
  id            String     @id @default(cuid())
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  tournamentId  String
  tournament    Tournament  @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  category      Category
  division      Division
  clubName      String
  teamName      String
  teamLeaderId  String
  teamLeader    TeamLeader @relation(fields: [teamLeaderId], references: [id], onDelete: Cascade)
  // back-relations for Match
  homeMatches   Match[]      @relation("Match_homeTeam")
  awayMatches   Match[]      @relation("Match_awayTeam")
}
```

## Tournament

Tournament is being refactored from:

```yaml
model Tournament {
id        String   @id @default(cuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
name      String
location  String      // city
divisions Json        // Array of divisions stored as JSON
startDate DateTime    // first day of tournament
endDate   DateTime?   // optional last day; if null, single-day event
teams     Team[]
matches   Match[]
}
```

to:

```yaml
model Tournament {
id        String   @id @default(cuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
name      String
location  String      // city
divisions Division[]
categories Category[]
startDate DateTime    // first day of tournament
endDate   DateTime?   // optional last day; if null, single-day event
teams     Team[]
matches   Match[]
}
```

Question: can we make divisions to be an array of Division or SHOULD it be Json?
If it should be Json, what about the categories?

## Category

Question: should the Category be an enum or a string?

Category is a string that is built from the following characters:

- optional "J" (boys), "M" (girls), "JM" (boys and girls) followed by "O"
- 1 or 2 digit number
- optional "+"

Examples: JO8, JO11, MO9, JMO7, 35+

---

Give me your idea on how we should go about it to create the corresponding migration
