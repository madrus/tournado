-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GroupSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupStageId" TEXT NOT NULL,
    "groupId" TEXT,
    "slotIndex" INTEGER NOT NULL,
    "teamId" TEXT,
    CONSTRAINT "GroupSlot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GroupSlot_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupSlot_groupStageId_fkey" FOREIGN KEY ("groupStageId") REFERENCES "GroupStage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroupSlot" ("groupId", "groupStageId", "id", "slotIndex", "teamId") SELECT "groupId", "groupStageId", "id", "slotIndex", "teamId" FROM "GroupSlot";
DROP TABLE "GroupSlot";
ALTER TABLE "new_GroupSlot" RENAME TO "GroupSlot";
CREATE UNIQUE INDEX "GroupSlot_teamId_key" ON "GroupSlot"("teamId");
CREATE INDEX "GroupSlot_groupStageId_idx" ON "GroupSlot"("groupStageId");
CREATE INDEX "GroupSlot_teamId_idx" ON "GroupSlot"("teamId");
CREATE UNIQUE INDEX "GroupSlot_groupId_slotIndex_key" ON "GroupSlot"("groupId", "slotIndex");
CREATE UNIQUE INDEX "GroupSlot_groupStageId_teamId_key" ON "GroupSlot"("groupStageId", "teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
