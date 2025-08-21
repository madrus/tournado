/*
  Warnings:

  - You are about to drop the `Pool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PoolSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PoolSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Pool";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PoolSet";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PoolSlot";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GroupSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "configGroups" INTEGER NOT NULL,
    "configSlots" INTEGER NOT NULL,
    "autoFill" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroupSet_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Group_groupSetId_fkey" FOREIGN KEY ("groupSetId") REFERENCES "GroupSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroupSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupSetId" TEXT NOT NULL,
    "groupId" TEXT,
    "slotIndex" INTEGER NOT NULL,
    "teamId" TEXT,
    CONSTRAINT "GroupSlot_groupSetId_fkey" FOREIGN KEY ("groupSetId") REFERENCES "GroupSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupSlot_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GroupSlot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GroupSet_tournamentId_idx" ON "GroupSet"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSet_tournamentId_name_key" ON "GroupSet"("tournamentId", "name");

-- CreateIndex
CREATE INDEX "Group_groupSetId_idx" ON "Group"("groupSetId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupSetId_name_key" ON "Group"("groupSetId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupSetId_order_key" ON "Group"("groupSetId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSlot_teamId_key" ON "GroupSlot"("teamId");

-- CreateIndex
CREATE INDEX "GroupSlot_groupSetId_idx" ON "GroupSlot"("groupSetId");

-- CreateIndex
CREATE INDEX "GroupSlot_teamId_idx" ON "GroupSlot"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSlot_groupId_slotIndex_key" ON "GroupSlot"("groupId", "slotIndex");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSlot_groupSetId_teamId_key" ON "GroupSlot"("groupSetId", "teamId");
