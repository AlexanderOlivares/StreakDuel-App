import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // callbacks: {
  //   async session(session, user) {
  //     // Fetch custom data from your database based on the user's information
  //     const userData = await getUserDataFromDB(user);

  //     // Add the custom data to the session
  //     session.customData = userData;

  //     return session;
  //   },
  //   // Add other callbacks as needed
  // },
  secret: process.env.NEXT_AUTH_SECRET,
};
