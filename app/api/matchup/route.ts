import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dayRangeLaTimezone, getCurrentWeekDates } from "@/lib/dateTime.ts/dateFormatter";
import moment from "moment";
import { Matchup } from "@/components/ui/Cards/AdminGamePickerCard";

export async function GET() {
  try {
    const now = moment().format("YYYYMMDD");
    const weekDates = getCurrentWeekDates(now);
    const today = dayRangeLaTimezone(now);
    const nextDay = dayRangeLaTimezone(moment(now).add(1, "days").format("YYYYMMDD"));

    const matchups: Matchup[] = await prisma.matchups.findMany({
      where: {
        OR: [today, nextDay].map(dateRange => ({ strTimestamp: dateRange })),
        used: true,
      },
      orderBy: [
        {
          strTimestamp: "asc",
        },
        {
          id: "asc",
        },
      ],
    });

    return NextResponse.json({ matchups, weekDates }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
