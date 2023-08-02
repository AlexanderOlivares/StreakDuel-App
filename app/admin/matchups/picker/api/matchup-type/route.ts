import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const OddsTypeEnum = z.enum(["money-line", "totals", "pointspread"]);

/*
Update zod version and chain uuid() to validate id field when this
open issue is resolved https://github.com/colinhacks/zod/issues/2468
*/
const updateAdminUseGameSchema = z.object({
  id: z.string(), //.uuid(),
  oddsType: OddsTypeEnum.optional(),
  drawTeam: z.string().min(6).max(6).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const validation = updateAdminUseGameSchema.safeParse(await req.json());

    if (!validation.success) {
      console.log(validation.error);
      const errorMessage = "Validation error";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { id, oddsType, drawTeam } = validation.data;

    const data = {
      ...(oddsType ? { oddsType } : null),
      ...(drawTeam ? { drawTeam } : null),
    };

    await prisma.potentialMatchup.update({
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
