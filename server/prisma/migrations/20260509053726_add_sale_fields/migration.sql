-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" REAL NOT NULL,
    "clientName" TEXT NOT NULL DEFAULT 'Cliente en Tienda',
    "paymentMethod" TEXT NOT NULL DEFAULT 'Efectivo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Sale" ("createdAt", "date", "id", "totalAmount", "updatedAt") SELECT "createdAt", "date", "id", "totalAmount", "updatedAt" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
