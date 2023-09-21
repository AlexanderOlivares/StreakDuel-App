/*
  Warnings:

  - Added the required column `locked` to the `Parlay` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Parlay" ADD COLUMN     "locked" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Pick" ADD COLUMN     "pointsAwarded" DOUBLE PRECISION;
