/*
  Warnings:

  - You are about to drop the column `lastUpdate` on the `Odds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Odds" DROP COLUMN "lastUpdate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Parlay" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
