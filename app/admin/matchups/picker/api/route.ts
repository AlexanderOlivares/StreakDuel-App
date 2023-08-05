import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dayRangeLaTimezone, getCurrentWeekDates } from "@/lib/dateTime.ts/dateFormatter";
import moment from "moment";
import { Matchup } from "@/components/ui/Cards/AdminGamePickerCard";

// TODO - add admin auth check
export async function GET() {
  try {
    const now = moment().format("YYYYMMDD");
    const weekDates = getCurrentWeekDates(now);

    const dateRanges = Object.values(weekDates).map(date => {
      const range = dayRangeLaTimezone(date);
      return {
        strTimestamp: range,
      };
    });

    const matchups: Matchup[] = await prisma.matchups.findMany({
      where: {
        OR: dateRanges,
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

    // Next Tuesday is not part of the current week's cycle of games so safe to omit it. It's only used
    // above to get Next Monday's game times that officially start on next Tuesday in UTC time.
    // eslint-disable-next-line
    const { "Next Tuesday": _, ...relevantDays } = weekDates;

    return NextResponse.json({ matchups, weekDates: relevantDays }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
