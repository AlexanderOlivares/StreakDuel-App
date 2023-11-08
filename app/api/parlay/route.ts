import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { options } from "../auth/[...nextauth]/options";

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

    const parlays = await prisma.parlay.findMany({
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
          include: {
            odds: true,
          },
        },
      },
    });

    // TODO tidy up and test this logic
    const firstParlay = parlays[0] ?? [];
    const firstParlayIsActive = firstParlay?.picks?.every(
      pick => pick?.result === "TBD" && pick?.locked === false
    );
    const sliceIndex = firstParlayIsActive ? 1 : 0;
    const pickHistory = parlays.slice(sliceIndex).flatMap(parlay => parlay.picks) ?? [];
    const activePoints = parlays[0]?.pointsAwarded ?? 100;
    const locked = parlays[0]?.locked ?? true;
    const activePicks = firstParlayIsActive ? parlays[0].picks ?? [] : [];

    console.log({
      // pickHistory,
      // activePoints,
      // locked,
      // activePicks,
    });

    const activeMatchups = await prisma.matchups.findMany({
      where: {
        id: {
          in: activePicks.map(({ matchupId }) => matchupId),
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

    console.log({ activeMatchups });

    // TODO map active picks to format needed for context:
    // {
    //   matchupId: id,
    //   oddsId,
    //   pick,
    //   pickOdds: Number(pickOdds), // get from Matchups
    //   badge, // get from Matchups
    //   oddsType,// get from Matchups
    // },

    return NextResponse.json(
      { parlays, pickHistory, activePoints, locked, activePicks },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

const PostPickSchema = z.object({
  parlays: z.array(z.any()),
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

    // console.log({ session });
    const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } });

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 401 });
    }

    let parlayId: string;
    const latestParlay = await prisma.parlay.findFirst({
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

    if (latestParlay?.locked) {
      return NextResponse.json({ error: "You have a locked pick" }, { status: 403 });
    }

    const noParlayGamesStarted =
      !!latestParlay && latestParlay?.picks.every(pick => pick.result === "TBD");

    // existing parlay but no games have started yet
    if (!latestParlay?.locked && noParlayGamesStarted) {
      parlayId = latestParlay.id;
    } else {
      // Coming off of a parlay win, loss, or user's first ever parlay
      const DEFAULT_POINTS_WAGERED = 100;
      const pointsWagered =
        latestParlay && latestParlay.pointsAwarded > 100
          ? latestParlay.pointsAwarded
          : DEFAULT_POINTS_WAGERED;
      console.log({ pointsWagered });

      // const { id } = await prisma.parlay.create({
      //   data: {
      //     userId: user.id,
      //     // TODO if coming off win, update pointsWagered here
      //     pointsWagered,
      //   },
      // });
      // parlayId = id;
    }

    const { parlays } = validation.data;
    console.log({
      parlays,
      noParlayGamesStarted,
      latestParlay,
    });

    // /**
    //  * Still need to check for updates
    //  * 1. changing pick to other team
    //  * 2. updating the acceptance of latest odds
    //  * 3. removing pick prior to parlay locking
    //  */

    // const matchup = await prisma.matchups.findUnique({
    //   where: { id: matchupId },
    //   include: { Odds: { orderBy: { createdAt: "desc" } } },
    // });

    // if (!matchup?.Odds?.length) {
    //   return NextResponse.json({ error: "No odds found for matchup" }, { status: 500 });
    // }

    // if (matchup.locked) {
    //   return NextResponse.json(
    //     { error: "Game has already started. Matchup is locked" },
    //     { status: 403 }
    //   );
    // }
    // const odds = matchup.Odds;

    // console.log(JSON.stringify(odds, null, 2));

    // const selectedPick = await prisma.pick.create({
    //   data: {
    //     userId: user.id,
    //     parlayId,
    //     useLatestOdds,
    //     oddsId: odds[0].id,
    //     matchupId,
    //     locked: false,
    //     pick,
    //   },
    // });

    return NextResponse.json({ success: true }, { status: 200 });
    // return NextResponse.json({ selectedPick }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
