import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentWeekDates } from "@/lib/dateTime.ts/dateFormatter";
import { IAdminGamePickerCard } from "@/components/ui/Cards/AdminGamePickerCard";
import moment from "moment";

// TODO - add admin auth check
export async function GET() {
  try {
    const now = moment().format("YYYYMMDD");
    const weekDates = getCurrentWeekDates(now);

    const matchups: IAdminGamePickerCard[] = await prisma.potentialMatchup.findMany({
      where: {
        gameDate: {
          in: Object.values(weekDates),
        },
      },
      select: {
        gameDate: true,
        gameTime: true,
        id: true,
        league: true,
        name: true,
      },
    });

    return NextResponse.json({ matchups, weekDates }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
