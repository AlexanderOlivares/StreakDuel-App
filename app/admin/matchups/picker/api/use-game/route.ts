import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

/*
Update zod version and chain uuid() to validate id field when this
open issue is resolved https://github.com/colinhacks/zod/issues/2468
*/
const updateAdminUseGameSchema = z.object({
  id: z.string(), //.uuid(),
  adminUseGame: z.boolean().nullable(),
});

export async function PUT(req: NextRequest) {
  try {
    const validation = updateAdminUseGameSchema.safeParse(await req.json());

    if (!validation.success) {
      console.log(validation.error);
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const { id, adminUseGame } = validation.data;

    await prisma.potentialMatchup.update({
      where: {
        id: id,
      },
      data: {
        adminUseGame: !adminUseGame,
      },
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
