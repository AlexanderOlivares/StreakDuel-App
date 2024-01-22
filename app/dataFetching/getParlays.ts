import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { IPick, ParlayWithPicksAndOdds, PickHistory } from "@/lib/types/interfaces";
import { getActiveMatchups, getActivePicks, getPickHistory } from "./utils/parlayUtils";

export interface GetParlays {
  parlays: ParlayWithPicksAndOdds[];
  pickHistory: PickHistory[];
  dbPickHistory: PickHistory[];
  activePoints: number;
  activePicks: IPick[];
  dbActivePicks: IPick[];
  locked: boolean;
  error?: string;
}

export const getParlays = async () => {
  const defaultState: GetParlays = {
    parlays: [],
    pickHistory: [],
    dbPickHistory: [],
    activePoints: 100, // decide on default here
    locked: false,
    activePicks: [],
    dbActivePicks: [],
  };

  try {
    const session = await getServerSession(options);

    if (!session) {
      console.log("no session found");
      return defaultState;
    }

    const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } });

    if (!user) {
      return { ...defaultState, error: "Error fetching user account" };
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
    const existingParlay: ParlayWithPicksAndOdds | Record<string, never> = parlays?.[0] ?? {};
    const allParlayPicks = parlays.flatMap(parlay => parlay.picks) ?? [];

    if (!parlays.length && !createdParlay) {
      return { ...defaultState, error: "No parlay found" };
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

    const activeMatchups = await getActiveMatchups(
      allParlayPicks.map(({ matchupId }) => matchupId)
    );

    const activePicks = parlayIsOver ? [] : getActivePicks(existingParlay, activeMatchups);
    const pickHistory = getPickHistory(allParlayPicks, activeMatchups);

    return {
      parlays,
      pickHistory,
      activePoints,
      locked,
      activePicks,
      dbActivePicks: activePicks,
      dbPickHistory: pickHistory,
    };
  } catch (error) {
    console.log(error);
    return { ...defaultState, error: "Error fetching parlays" };
  }
};
