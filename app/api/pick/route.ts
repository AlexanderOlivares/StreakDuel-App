import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";

const PostPickSchema = z.object({
  matchupId: z.string().uuid(),
  useLatestOdds: z.boolean(),
  pick: z.string(),
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

    console.log({ session });
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

    if (!latestParlay) {
      const { id } = await prisma.parlay.create({
        data: {
          userId: user.id,
        },
      });
      parlayId = id;
    } else {
      parlayId = latestParlay.id;
    }

    //  const latestPick = await prisma.pick.findFirst({
    //    where: {
    //      userId: user.id,
    //    },
    //    orderBy: {
    //      createdAt: "desc",
    //    },
    //  });

    const { matchupId, useLatestOdds, pick } = validation.data;

    const matchup = await prisma.matchups.findUnique({
      where: { id: matchupId },
      include: { Odds: { orderBy: { createdAt: "desc" } } },
    });

    if (!matchup?.Odds?.length) {
      return NextResponse.json({ error: "No odds found for matchup" }, { status: 500 });
    }

    const locked = false; // TODO check if were past game start time here

    if (locked) {
      return NextResponse.json(
        { error: "Game has already started. Matchup is locked" },
        { status: 403 }
      );
    }
    const odds = matchup.Odds;

    console.log(JSON.stringify(odds, null, 2));

    const selectedPick = await prisma.pick.create({
      data: {
        userId: user.id,
        parlayId,
        useLatestOdds,
        oddsId: odds[0].id,
        matchupId,
        locked,
        pick,
      },
    });

    return NextResponse.json({ selectedPick }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
