/*
  Warnings:

  - Added the required column `category` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categories` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamLeaderId" TEXT NOT NULL,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "TeamLeader" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("clubName", "createdAt", "division", "id", "teamLeaderId", "teamName", "tournamentId", "updatedAt") SELECT "clubName", "createdAt", "division", "id", "teamLeaderId", "teamName", "tournamentId", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "divisions" JSONB NOT NULL,
    "categories" JSONB NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME
);
INSERT INTO "new_Tournament" ("createdAt", "divisions", "endDate", "id", "location", "name", "startDate", "updatedAt") SELECT "createdAt", "divisions", "endDate", "id", "location", "name", "startDate", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
