-- CreateTable
CREATE TABLE "PotentialMatchup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "gameDate" TEXT NOT NULL,
    "gameTime" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "league" TEXT NOT NULL,
    "gameStatus" TEXT NOT NULL,
    "adminUseGame" BOOLEAN NOT NULL,
    "adminUseMoneyline" BOOLEAN NOT NULL,
    "adminUseOverUnder" BOOLEAN NOT NULL,
    "drawEligible" BOOLEAN NOT NULL,
    "adminUseHomeDraw" BOOLEAN NOT NULL,
    "adminUseAwayDraw" BOOLEAN NOT NULL,

    CONSTRAINT "PotentialMatchup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PotentialMatchup_id_key" ON "PotentialMatchup"("id");
