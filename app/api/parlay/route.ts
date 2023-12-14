import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { options } from "../auth/[...nextauth]/options";
import { Matchup, IPick, ParlayWithPicksAndOdds, ParlayWithPicks } from "@/lib/types/interfaces";

export async function GET() {
  try {
    const session = await getServerSession(options);

    if (!session) {
      console.log("no session found");
      return NextResponse.json({ message: "No session found", parlays: [] }, { status: 200 });
    }

    console.log({ session });
    const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } });

    if (!user) {
      return NextResponse.json({ message: "No user found", parlays: [] }, { status: 500 });
    }

    const parlays: ParlayWithPicksAndOdds[] = await prisma.parlay.findMany({
      where: {
        userId: user.id,
        // TODO add time based filters to only get parlays from current weekly round
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        picks: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            odds: true,
          },
        },
      },
    });

    let createdParlay;
    if (!parlays.length) {
      // TODO update default points when handling forfeits
      const DEFAULT_POINTS_WAGERED = 100;
      createdParlay = await prisma.parlay.create({
        data: {
          userId: user.id,
          pointsWagered: DEFAULT_POINTS_WAGERED,
        },
      });
    }

    // TODO tidy up and test this logic
    const existingParlay = parlays?.[0] ?? [];
    const allParlayPicks = parlays.map(parlay => parlay.picks) ?? [];

    if (!parlays.length && !createdParlay) {
      throw new Error("No parlay found");
    }

    const locked = createdParlay ? false : existingParlay?.locked;
    const activePicksFromDb = existingParlay?.picks ?? [];
    const parlayIsOver =
      !locked &&
      activePicksFromDb.length > 0 &&
      activePicksFromDb.every(pick => ["win", "loss", "push"].includes(pick.result));

    let activePoints;
    if (createdParlay) {
      activePoints = createdParlay?.pointsWagered;
    } else {
      activePoints = parlayIsOver ? existingParlay.pointsAwarded : existingParlay.pointsWagered;
    }

    const activeMatchups = await prisma.matchups.findMany({
      where: {
        id: {
          in: activePicksFromDb.map(({ matchupId }) => matchupId),
        },
      },
      select: {
        strHomeTeam: true,
        strAwayTeam: true,
        oddsType: true,
        awayBadgeId: true,
        homeBadgeId: true,
      },
    });

    // TODO do this transformation for pickHistory and then copy the picks from first parlay to activePicks
    let activePicks: IPick[] = [];
    let pickHistory: IPick[][] = [];
    if (createdParlay || parlayIsOver) {
      activePicks = [];
    } else {
      pickHistory = allParlayPicks.map(parlay => {
        return parlay.map(pick => {
          const { matchupId, oddsId, odds, id, useLatestOdds } = pick;
          const matchup = activeMatchups.find(({ strHomeTeam, strAwayTeam }) =>
            [strHomeTeam, strAwayTeam].includes(pick.pick)
          );
          if (!matchup) {
            throw new Error("Matchup not found");
          }
          const { strAwayTeam, awayBadgeId, homeBadgeId, oddsType } = matchup;
          const pickIsAwayTeam = strAwayTeam === pick.pick;
          // TODO handle draw odds here
          const pickOdds = pickIsAwayTeam ? odds.awayOdds! : odds.homeOdds!;
          const badge = pickIsAwayTeam ? awayBadgeId : homeBadgeId;

          return {
            pickId: id,
            matchupId,
            oddsId,
            pick: pick.pick,
            pickOdds,
            badge,
            oddsType,
            useLatestOdds,
          };
        });
      });
      activePicks = pickHistory[0];
    }

    return NextResponse.json(
      {
        parlays,
        pickHistory: pickHistory.flat(),
        activePoints,
        locked,
        activePicks,
        dbActivePicks: activePicks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

const PostPickSchema = z.object({
  picks: z.array(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const validation = PostPickSchema.safeParse(await req.json());

    if (!validation.success) {
      console.log(validation.error);
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const session = await getServerSession(options);

    if (!session) {
      console.log("no session found");
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } });

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 401 });
    }

    let parlayId: string;
    const latestParlay: ParlayWithPicks | null = await prisma.parlay.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        picks: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const latestParlayLocked = latestParlay?.locked;

    if (latestParlayLocked) {
      return NextResponse.json({ error: "You have a locked pick" }, { status: 403 });
    }

    const noParlayGamesStarted = latestParlay?.picks.every(pick => pick.result === "TBD");

    // existing parlay but no games have started yet
    if (latestParlay && !latestParlayLocked && noParlayGamesStarted) {
      parlayId = latestParlay.id;
    } else {
      // Coming off of a completed parlay
      const DEFAULT_POINTS_WAGERED = 100;
      const pointsWagered =
        latestParlay && latestParlay.pointsAwarded > 100
          ? latestParlay.pointsAwarded
          : DEFAULT_POINTS_WAGERED;

      const { id } = await prisma.parlay.create({
        data: {
          userId: user.id,
          pointsWagered,
        },
      });
      parlayId = id;
    }

    const { picks }: { picks: IPick[] } = validation.data;

    const parlayMatchupsHaveStarted: Matchup[] = await prisma.matchups.findMany({
      where: {
        id: { in: picks.map(({ matchupId }) => matchupId) },
        OR: [{ locked: true }, { status: "FT" }],
      },
    });

    if (parlayMatchupsHaveStarted.length) {
      return NextResponse.json({ error: "At least 1 matchup has started" }, { status: 403 });
    }

    const updatedPicks = await prisma.$transaction(async tx => {
      const updatedPicks = [];
      const existingDbPicks = parlayId === latestParlay?.id ? latestParlay.picks : [];
      const activePicksIds = picks.map(({ pickId }) => pickId);
      const pickIdsToDelete = existingDbPicks
        .map(({ id }) => id)
        .filter(id => !activePicksIds.includes(id));

      const deletedPicks = await tx.pick.deleteMany({
        where: { id: { in: pickIdsToDelete } },
      });
      console.log(`Deleted ${deletedPicks.count} picks from parlayId ${parlayId}`);

      for (const pick of picks) {
        const { useLatestOdds, oddsId, matchupId, pickId } = pick;
        // New pick. Also handle case were pick was deleted from active picks here
        if (!pickId) {
          const createdPick = await tx.pick.create({
            data: {
              userId: user.id,
              parlayId,
              useLatestOdds,
              oddsId,
              matchupId,
              locked: false,
              pick: pick.pick,
            },
          });
          updatedPicks.push(createdPick);
        } else {
          const existingPick = existingDbPicks.find(({ id }) => id === pickId);
          if (!existingPick) {
            throw new Error("Existing pick not found");
          }

          const useLatestOddsWasUpdated = existingPick.useLatestOdds !== useLatestOdds;

          if (useLatestOddsWasUpdated) {
            const updatedPick = await tx.pick.update({
              where: { id: pickId },
              data: {
                // these are the only 2 pick settings user can update
                ...(useLatestOddsWasUpdated ? { useLatestOdds } : undefined),
                ...(useLatestOdds ? { oddsId } : undefined),
                userUpdatedAt: new Date(),
              },
            });
            updatedPicks.push(updatedPick);
          }
        }
      }
      return updatedPicks;
    });
    return NextResponse.json({ updatedPicks }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
