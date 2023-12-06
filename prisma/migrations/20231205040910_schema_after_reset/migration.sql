-- CreateTable
CREATE TABLE "Matchups" (
    "id" TEXT NOT NULL,
    "drawEligible" BOOLEAN NOT NULL,
    "idEvent" TEXT NOT NULL,
    "idHomeTeam" TEXT NOT NULL,
    "idAwayTeam" TEXT NOT NULL,
    "idLeague" TEXT NOT NULL,
    "strEvent" TEXT NOT NULL,
    "strLeague" TEXT NOT NULL,
    "strHomeTeam" TEXT NOT NULL,
    "strAwayTeam" TEXT NOT NULL,
    "strTimestamp" TEXT NOT NULL,
    "strThumb" TEXT NOT NULL,
    "oddsType" TEXT NOT NULL,
    "oddsScope" TEXT NOT NULL,
    "drawTeam" TEXT,
    "adminSelected" BOOLEAN NOT NULL,
    "used" BOOLEAN NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "adminUnlocked" BOOLEAN NOT NULL,
    "adminCorrected" BOOLEAN NOT NULL,
    "awayScore" INTEGER,
    "homeScore" INTEGER,
    "pointsTotal" INTEGER,
    "status" TEXT NOT NULL,
    "awayBadgeId" TEXT NOT NULL,
    "homeBadgeId" TEXT NOT NULL,

    CONSTRAINT "Matchups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odds" (
    "id" TEXT NOT NULL,
    "matchupId" TEXT NOT NULL,
    "oddsGameId" INTEGER NOT NULL,
    "sportsbook" TEXT NOT NULL,
    "homeOdds" INTEGER,
    "awayOdds" INTEGER,
    "homeSpread" DOUBLE PRECISION,
    "awaySpread" DOUBLE PRECISION,
    "total" DOUBLE PRECISION,
    "drawOdds" INTEGER,
    "overOdds" INTEGER,
    "underOdds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Odds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parlayId" TEXT NOT NULL,
    "oddsId" TEXT NOT NULL,
    "matchupId" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "useLatestOdds" BOOLEAN NOT NULL,
    "pick" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'TBD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parlay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pointsAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pointsWagered" DOUBLE PRECISION NOT NULL DEFAULT 100,

    CONSTRAINT "Parlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "logoId" TEXT,
    "jerseyId" TEXT,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("teamId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matchups_id_key" ON "Matchups"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Odds_id_key" ON "Odds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Pick_id_key" ON "Pick"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Parlay_id_key" ON "Parlay"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Media_teamId_key" ON "Media"("teamId");

-- AddForeignKey
ALTER TABLE "Odds" ADD CONSTRAINT "Odds_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "Matchups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "Matchups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_oddsId_fkey" FOREIGN KEY ("oddsId") REFERENCES "Odds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_parlayId_fkey" FOREIGN KEY ("parlayId") REFERENCES "Parlay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parlay" ADD CONSTRAINT "Parlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
