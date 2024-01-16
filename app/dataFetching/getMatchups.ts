import {
  dayRangeLaTimezone,
  getYesterdayTodayTomorrowDisplayDates,
} from "@/lib/dateTime.ts/dateFormatter";
import prisma from "@/lib/prisma";
import { MatchupWithOdds } from "@/lib/types/interfaces";
import moment from "moment";

export interface GetMatchups {
  matchups: MatchupWithOdds[];
  displayDates: Record<string, string>;
  error?: string;
}

export const getMatchups = async () => {
  const now = moment().format("YYYYMMDD");
  const today = dayRangeLaTimezone(now);
  const yesterday = dayRangeLaTimezone(moment(now).subtract(1, "days").format("YYYYMMDD"));
  const nextDay = dayRangeLaTimezone(moment(now).add(1, "days").format("YYYYMMDD"));
  const displayDates = getYesterdayTodayTomorrowDisplayDates("America/Los_Angeles");

  try {
    const matchups: MatchupWithOdds[] = await prisma.matchups.findMany({
      where: {
        OR: [yesterday, today, nextDay].map(dateRange => ({ strTimestamp: dateRange })),
        used: true,
      },
      include: { odds: true },
      orderBy: [
        {
          strTimestamp: "asc",
        },
        {
          id: "asc",
        },
      ],
    });
    return { matchups, displayDates };
  } catch (error) {
    console.log(error);
    return { matchups: [], displayDates, error: "error fetching matchups" };
  }
};
