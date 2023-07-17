import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { MatchupType } from "@/components/ui/Cards/AdminGamePickerCard";

/*
Update zod version and chain uuid() to validate id field when this
open issue is resolved https://github.com/colinhacks/zod/issues/2468
*/
const updateAdminUseGameSchema = z.object({
  id: z.string(), //.uuid(),
  matchupType: z.enum([
    MatchupType.Moneyline,
    MatchupType.OverUnder,
    MatchupType.HomeDraw,
    MatchupType.HomeDraw,
  ]),
});

export async function PUT(req: NextRequest) {
  try {
    const validation = updateAdminUseGameSchema.safeParse(await req.json());

    if (!validation.success) {
      console.log(validation.error);
      const errorMessage = "Validation error";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { id, matchupType } = validation.data;

    const data = falsifyUnusedMatchupTypes(matchupType);

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

export function falsifyUnusedMatchupTypes(selectedMatchupType: MatchupType) {
  const updateBody: Record<string, boolean> = {};

  for (const matchupType of Object.values(MatchupType)) {
    const columnName = `adminUse${matchupType}`;
    if (matchupType === selectedMatchupType) {
      updateBody[columnName] = true;
    } else {
      updateBody[columnName] = false;
    }
  }

  return updateBody;
}
