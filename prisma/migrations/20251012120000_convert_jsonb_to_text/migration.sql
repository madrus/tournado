/*
  Warnings:

  - You are about to alter the column `divisions` on the `Tournament` table. The data in that column will be converted to TEXT with JSON validation.
  - You are about to alter the column `categories` on the `Tournament` table. The data in that column will be converted to TEXT with JSON validation.
  - You are about to alter the column `categories` on the `GroupSet` table. The data in that column will be converted to TEXT with JSON validation.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Redefine Tournament table
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "divisions" TEXT NOT NULL CHECK(json_valid("divisions")),
    "categories" TEXT NOT NULL CHECK(json_valid("categories")),
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tournament" ("categories", "createdAt", "divisions", "endDate", "id", "location", "name", "startDate", "updatedAt") SELECT "categories", "createdAt", "divisions", "endDate", "id", "location", "name", "startDate", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";

-- Redefine GroupSet table
CREATE TABLE "new_GroupSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT NOT NULL CHECK(json_valid("categories")),
    "configGroups" INTEGER NOT NULL,
    "configSlots" INTEGER NOT NULL,
    "autoFill" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroupSet_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroupSet" ("autoFill", "categories", "configGroups", "configSlots", "createdAt", "id", "name", "tournamentId", "updatedAt") SELECT "autoFill", "categories", "configGroups", "configSlots", "createdAt", "id", "name", "tournamentId", "updatedAt" FROM "GroupSet";
DROP TABLE "GroupSet";
ALTER TABLE "new_GroupSet" RENAME TO "GroupSet";
CREATE UNIQUE INDEX "GroupSet_tournamentId_name_key" ON "GroupSet"("tournamentId", "name");
CREATE INDEX "GroupSet_tournamentId_idx" ON "GroupSet"("tournamentId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

