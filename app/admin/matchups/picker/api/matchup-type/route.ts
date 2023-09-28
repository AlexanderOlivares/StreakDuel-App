import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const OddsTypeEnum = z.enum(["money-line", "totals", "pointspread"]);

const oddsTypeSchema = z.object({
  id: z.string().uuid(),
  oddsType: OddsTypeEnum.optional(),
  drawTeam: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const validation = oddsTypeSchema.safeParse(await req.json());

    if (!validation.success) {
      console.log(validation.error);
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const { id, oddsType, drawTeam } = validation.data;

    const data = {
      ...(oddsType ? { oddsType } : null),
      ...(drawTeam ? { drawTeam } : null),
    };

    await prisma.matchups.update({
      where: {
        id: id,
      },
      data,
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
