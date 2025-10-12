-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserAuditLog_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserAuditLog" ("action", "createdAt", "id", "newValue", "performedBy", "previousValue", "reason", "userId") SELECT "action", "createdAt", "id", "newValue", "performedBy", "previousValue", "reason", "userId" FROM "UserAuditLog";
DROP TABLE "UserAuditLog";
ALTER TABLE "new_UserAuditLog" RENAME TO "UserAuditLog";
CREATE INDEX "UserAuditLog_userId_idx" ON "UserAuditLog"("userId");
CREATE INDEX "UserAuditLog_performedBy_idx" ON "UserAuditLog"("performedBy");
CREATE INDEX "UserAuditLog_createdAt_idx" ON "UserAuditLog"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
