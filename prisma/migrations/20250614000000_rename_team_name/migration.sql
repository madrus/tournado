-- Rename teamName to name in Team table
PRAGMA foreign_keys=OFF;

-- Create new table with desired schema
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "clubName" TEXT NOT NULL,
    "teamLeaderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "TeamLeader" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table to new table
INSERT INTO "new_Team" ("id", "name", "tournamentId", "category", "division", "clubName", "teamLeaderId",  "createdAt", "updatedAt")
SELECT "id", "teamName", "tournamentId", "category", "division", "clubName", "teamLeaderId",  "createdAt", "updatedAt"
FROM "Team";

-- Drop old table
DROP TABLE "Team";

-- Rename new table to original name
ALTER TABLE "new_Team" RENAME TO "Team";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
