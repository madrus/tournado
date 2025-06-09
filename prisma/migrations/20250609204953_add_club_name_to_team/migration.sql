/*
  Warnings:

  - Added the required column `clubName` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clubName" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamClass" TEXT NOT NULL,
    "teamLeaderId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "TeamLeader" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("createdAt", "id", "teamClass", "teamLeaderId", "teamName", "tournamentId", "updatedAt", "clubName") SELECT "createdAt", "id", "teamClass", "teamLeaderId", "teamName", "tournamentId", "updatedAt", "sv DIO" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
