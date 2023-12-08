import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  dayRangeLaTimezone,
  getYesterdayTodayTomorrowDisplayDates,
} from "@/lib/dateTime.ts/dateFormatter";
import moment from "moment";
import { MatchupWithOdds } from "@/lib/types/interfaces";

export async function GET() {
  try {
    const now = moment().format("YYYYMMDD");
    const today = dayRangeLaTimezone(now);
    const yesterday = dayRangeLaTimezone(moment(now).subtract(1, "days").format("YYYYMMDD"));
    const nextDay = dayRangeLaTimezone(moment(now).add(1, "days").format("YYYYMMDD"));
    const displayDates = getYesterdayTodayTomorrowDisplayDates("America/Los_Angeles");

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

    return NextResponse.json({ matchups, displayDates }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
