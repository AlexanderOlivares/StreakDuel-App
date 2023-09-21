/*
  Warnings:

  - Made the column `pointsAwarded` on table `Pick` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Parlay" ALTER COLUMN "locked" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Pick" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userUpdatedAt" TIMESTAMP(3),
ALTER COLUMN "result" SET DEFAULT 'TBD',
ALTER COLUMN "pointsAwarded" SET NOT NULL,
ALTER COLUMN "pointsAwarded" SET DEFAULT 0;
