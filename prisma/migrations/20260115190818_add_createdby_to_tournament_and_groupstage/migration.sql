/*
  Warnings:

  - Added the required column `createdBy` to the `GroupStage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GroupStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "configGroups" INTEGER NOT NULL,
    "configSlots" INTEGER NOT NULL,
    "autoFill" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroupStage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupStage_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GroupStage" ("autoFill", "categories", "configGroups", "configSlots", "createdAt", "createdBy", "id", "name", "tournamentId", "updatedAt")
SELECT "autoFill", "categories", "configGroups", "configSlots", "createdAt",
  (SELECT "id" FROM "User" WHERE "email" = 'madrus@gmail.com' LIMIT 1),
  "id", "name", "tournamentId", "updatedAt"
FROM "GroupStage";
DROP TABLE "GroupStage";
ALTER TABLE "new_GroupStage" RENAME TO "GroupStage";
CREATE INDEX "GroupStage_tournamentId_idx" ON "GroupStage"("tournamentId");
CREATE UNIQUE INDEX "GroupStage_tournamentId_name_key" ON "GroupStage"("tournamentId", "name");
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "divisions" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tournament_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("categories", "createdAt", "createdBy", "divisions", "endDate", "id", "location", "name", "startDate", "updatedAt")
SELECT "categories", "createdAt",
  (SELECT "id" FROM "User" WHERE "email" = 'madrus@gmail.com' LIMIT 1),
  "divisions", "endDate", "id", "location", "name", "startDate", "updatedAt"
FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
