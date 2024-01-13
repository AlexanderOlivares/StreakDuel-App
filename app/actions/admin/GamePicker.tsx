"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateAdminSelectedSchema = z.object({
  id: z.string().uuid(),
  adminSelected: z.string().nullable(),
});

export async function adminUseGame(formData: FormData) {
  try {
    const validation = updateAdminSelectedSchema.safeParse({
      id: formData.get("id"),
      adminSelected: formData.get("adminSelected"),
    });

    if (!validation.success) {
      console.log(validation.error);
      return { message: "Validation error" };
    }

    const { id, adminSelected } = validation.data;

    await prisma.matchups.update({
      where: {
        id: id,
      },
      data: {
        adminSelected: !!adminSelected,
      },
    });

    console.log({ id, adminSelected: !!adminSelected });
    revalidatePath("/admin/matchups/picker");
    return { message: "Success. Matchup added" };
  } catch (error) {
    console.log(error);
    return { message: "Error selecting matchup" };
  }
}
