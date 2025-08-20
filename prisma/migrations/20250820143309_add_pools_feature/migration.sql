-- CreateTable
CREATE TABLE "PoolSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "configPools" INTEGER NOT NULL,
    "configSlots" INTEGER NOT NULL,
    "autoFill" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PoolSet_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolSetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pool_poolSetId_fkey" FOREIGN KEY ("poolSetId") REFERENCES "PoolSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PoolSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poolSetId" TEXT NOT NULL,
    "poolId" TEXT,
    "slotIndex" INTEGER NOT NULL,
    "teamId" TEXT,
    CONSTRAINT "PoolSlot_poolSetId_fkey" FOREIGN KEY ("poolSetId") REFERENCES "PoolSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PoolSlot_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PoolSlot_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PoolSet_tournamentId_idx" ON "PoolSet"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolSet_tournamentId_name_key" ON "PoolSet"("tournamentId", "name");

-- CreateIndex
CREATE INDEX "Pool_poolSetId_idx" ON "Pool"("poolSetId");

-- CreateIndex
CREATE UNIQUE INDEX "Pool_poolSetId_name_key" ON "Pool"("poolSetId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Pool_poolSetId_order_key" ON "Pool"("poolSetId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "PoolSlot_teamId_key" ON "PoolSlot"("teamId");

-- CreateIndex
CREATE INDEX "PoolSlot_poolSetId_idx" ON "PoolSlot"("poolSetId");

-- CreateIndex
CREATE INDEX "PoolSlot_teamId_idx" ON "PoolSlot"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PoolSlot_poolId_slotIndex_key" ON "PoolSlot"("poolId", "slotIndex");

-- CreateIndex
CREATE UNIQUE INDEX "PoolSlot_poolSetId_teamId_key" ON "PoolSlot"("poolSetId", "teamId");
