import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateAdminSelectedSchema = z.object({
  id: z.string().uuid(),
  adminSelected: z.boolean().nullable(),
});

export async function PUT(req: NextRequest) {
  try {
    const validation = updateAdminSelectedSchema.safeParse(await req.json());

    if (!validation.success) {
      console.log(validation.error);
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const { id, adminSelected } = validation.data;

    await prisma.matchups.update({
      where: {
        id: id,
      },
      data: {
        adminSelected: !adminSelected,
      },
    });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
