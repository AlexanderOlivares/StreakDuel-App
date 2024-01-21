"use server";

import { options } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { IPick, Matchup, ParlayWithPicks } from "@/lib/types/interfaces";
import { getServerSession } from "next-auth/next";
import { revalidateTag } from "next/cache";
import { z } from "zod";

// const PickHistory = z.object({
//   matchupId: z.string(),
//   pick: z.string(),
//   result: z.string(),
// });
// const ArrayOfPickHistory = z.array(PickHistory).nullable();
// const StringifiedPickHistorySchema = z.string(ArrayOfPickHistory).nullable();

const IPickSchema = z.object({
  pickId: z.string().optional(), // default uuid assigned on pick insertion by prisma
  matchupId: z.string(),
  oddsId: z.string(),
  pick: z.string(),
  pickOdds: z.number(),
  badge: z.string(),
  oddsType: z.string(),
  useLatestOdds: z.boolean(),
  result: z.string(),
});
const UpsertParlaySchema = z.array(IPickSchema).nullable();
const StringifiedSchema = z.string(UpsertParlaySchema).nullable();

export const upsertParlay = async (formData: FormData) => {
  const genericError = { error: "Error saving pick(s)" };

  try {
    const rawPicks = formData.get("picks");
    // if (!rawPicks) return genericError;
    const validation = StringifiedSchema.safeParse(rawPicks);

    if (!validation.success) {
      console.log("RAW PICKS VALIDATION FAILED");
      console.log(validation.error);
      return genericError;
    }

    // if (!pickHistoryValidation.success) {
    //   console.log("PICK HISTORY VALIDATION FAILED");

    //   console.log(pickHistoryValidation.error);
    //   return genericError;
    // }
    // console.log({ picks, pickHistory });

    const session = await getServerSession(options);

    if (!session) {
      console.log("no session found");
      return { error: "Please log in to make picks" };
    }

    const user = await prisma.user.findUnique({ where: { email: session?.user?.email ?? "" } });

    if (!user) {
      return { error: "Please log in to make picks" };
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
      return { error: "You have a locked pick" };
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

    const picks: IPick[] = JSON.parse(validation.data ?? JSON.stringify([]));

    const parlayMatchupsHaveStarted: Matchup[] = await prisma.matchups.findMany({
      where: {
        id: { in: picks.map(({ matchupId }) => matchupId) },
        OR: [{ locked: true }, { status: "FT" }],
      },
    });

    if (parlayMatchupsHaveStarted.length) {
      return { error: "At least 1 matchup has started" };
    }

    // interface UpdateParlayAndDeletedPicks {
    //   updatedParlay: ParlayWithPicksAndOdds;
    //   deletedPickIds: string[];
    // }

    // const updateParlayAndDeletedPicks: UpdateParlayAndDeletedPicks = await prisma.$transaction(
    await prisma.$transaction(async tx => {
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
          await tx.pick.create({
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
        } else {
          const existingPick = existingDbPicks.find(({ id }) => id === pickId);
          if (!existingPick) {
            return { error: "Existing pick not found" };
          }

          const useLatestOddsWasUpdated = existingPick.useLatestOdds !== useLatestOdds;

          if (useLatestOddsWasUpdated) {
            await tx.pick.update({
              where: { id: pickId },
              data: {
                // these are the only 2 pick settings user can update
                ...(useLatestOddsWasUpdated ? { useLatestOdds } : undefined),
                ...(useLatestOdds ? { oddsId } : undefined),
                userUpdatedAt: new Date(),
              },
            });
          }
        }
      }

      // return await tx.pick.findMany({ where: { parlayId }}  );
      // return tx.parlay.findUnique({ where: { id: parlayId }});
      // const updatedParlay = await tx.parlay.findUniqueOrThrow({
      //   where: {
      //     id: parlayId,
      //   },
      //   include: {
      //     picks: {
      //       orderBy: {
      //         createdAt: "desc",
      //       },
      //       include: {
      //         odds: true,
      //       },
      //     },
      //   },
      // });
      // return { updatedParlay, deletedPickIds: pickIdsToDelete ?? [] };
    });

    // interface MatchupAndPickIds {
    //   matchupIds: string[];
    //   pickIds: string[];
    //   activePicksHistory: PickHistory[];
    // }

    // const activeMatchupsMap = updateParlayAndDeletedPicks.updatedParlay.picks.reduce((acc, cv) => {
    //   const { id, matchupId, pick, result } = cv;
    //   acc.set("matchupIds", [...(acc.get("matchupIds") ?? []), matchupId]);
    //   acc.set("pickIds", [...(acc.get("pickIds") ?? []), id]);
    //   acc.set("activePicksHistory", [
    //     ...(acc.get("activePicksHistory") ?? []),
    //     { matchupId, pick, result, pickId: id },
    //   ]);
    //   return acc;
    // }, new Map<MatchupAndPickIds>());

    // const activeMatchups = await getActiveMatchups(
    //   // updatedParlay.picks.map(({ matchupId }) => matchupId)
    //   activeMatchupsMap.get("matchupIds") ?? []
    // );
    // const activePicks = getActivePicks(updateParlayAndDeletedPicks.updatedParlay, activeMatchups);
    // const pickHistory: PickHistory[] = pickHistoryValidation.data
    //   ? JSON.parse(pickHistoryValidation.data)
    //   : [];
    // // const pickHistory: PickHistory[] = pickHistoryValidation.data ?? [];

    // const updatedPickHistory: PickHistory[] = [
    //   ...new Set(...activeMatchupsMap.get("activePicksHistory"), ...pickHistory),
    // ].filter(pick => {
    //   return !updateParlayAndDeletedPicks.deletedPickIds.includes(pick?.pickId);
    // });

    revalidateTag("parlays");

    // return {
    //   activePicks,
    //   pickHistory: updatedPickHistory,
    //   success: true,
    // };
  } catch (error) {
    console.log(error);
    return genericError;
  }
};
