import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  dayRangeLaTimezone,
  getCurrentWeekDates,
  getYesterdayTodayTomorrow,
} from "@/lib/dateTime.ts/dateFormatter";
import moment from "moment";
import { MatchupWithOdds } from "@/components/ui/Cards/MatchupCard";

export async function GET() {
  try {
    const now = moment().format("YYYYMMDD");
    const weekDates = getCurrentWeekDates(now);
    const today = dayRangeLaTimezone(now);
    const nextDay = dayRangeLaTimezone(moment(now).add(1, "days").format("YYYYMMDD"));
    const yesterdayTodayTomorrow = getYesterdayTodayTomorrow("America/Los_Angeles");
    const displayDates: Record<string, string> = {};

    Object.entries(weekDates).forEach(([day, date]) => {
      if (yesterdayTodayTomorrow.includes(day)) {
        displayDates[day] = date;
      }
    });

    const matchups: MatchupWithOdds[] = await prisma.matchups.findMany({
      where: {
        OR: [today, nextDay].map(dateRange => ({ strTimestamp: dateRange })),
        used: true,
      },
      include: { Odds: true },
      orderBy: [
        {
          strTimestamp: "asc",
        },
        {
          id: "asc",
        },
      ],
    });

    return NextResponse.json({ matchups, displayDates }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
