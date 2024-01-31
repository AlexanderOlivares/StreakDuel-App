"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { Session } from "@/@types/next-auth";

export const updateUsername = async (formData: FormData) => {
  const schema = z
    .string()
    .min(5)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]*$/);

  const emailSchema = z.string().email();

  const rawUsername = formData.get("username");
  const rawEmail = formData.get("email");
  const validation = schema.safeParse(rawUsername);
  const emailValidation = emailSchema.safeParse(rawEmail);

  const session: Session = await getServerSession(options);

  const BLOCKED_WORDS = process.env.BLOCKED_WORDS;

  if (!validation.success) {
    console.log(validation.error);
    return { error: "Username must be between 5 and 20 characters" };
  }

  if (!emailValidation.success) {
    console.log(emailValidation.error);
    return { error: "email format is incorrect" };
  }

  const username = validation.data;
  const email = emailValidation.data;

  if (email !== session?.user?.email) {
    // is this needed?
    return { error: "emails don't match" };
  }

  for (const blockedWord of BLOCKED_WORDS?.split(",") ?? []) {
    const regex = new RegExp(`${blockedWord}`, "i");
    if (regex.test(username)) {
      console.log("using blocked words");
      return { error: "Chosen username is unavailable" };
    }
  }

  try {
    const usernameIsTaken = await prisma.user.findMany({ where: { name: username } });

    if (usernameIsTaken?.length > 0) {
      return { error: "Chosen username is unavailable" };
    }

    await prisma.user.update({
      where: { email },
      data: { name: username },
    });
  } catch (error) {
    return { error: "error saving username" };
  }
};
