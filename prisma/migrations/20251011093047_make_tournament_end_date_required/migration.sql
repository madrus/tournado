/*
  Warnings:

  - Made the column `endDate` on table `Tournament` required. This step will fail if there are existing NULL values in that column.

*/
-- First update NULL endDate values to equal startDate
UPDATE "Tournament" SET "endDate" = "startDate" WHERE "endDate" IS NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
