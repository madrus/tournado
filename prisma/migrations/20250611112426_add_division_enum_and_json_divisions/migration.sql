/*
  Warnings:

  - Added the required column `divisions` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "divisions" JSONB NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME
);
INSERT INTO "new_Tournament" ("createdAt", "endDate", "id", "location", "name", "startDate", "updatedAt") SELECT "createdAt", "endDate", "id", "location", "name", "startDate", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
