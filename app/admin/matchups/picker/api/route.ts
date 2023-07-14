import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentWeekDates } from "@/lib/dateTime.ts/dateFormatter";
import { IAdminGamePickerCard } from "@/components/ui/Cards/AdminGamePickerCard";

// TODO - add admin auth check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  try {
    const weekDates = getCurrentWeekDates(date);

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
