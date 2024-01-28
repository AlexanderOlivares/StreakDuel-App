import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { DefaultSession } from "@/@types/next-auth";

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session }: { session: DefaultSession }) {
      const user = await prisma.user.findUnique({
        where: { email: session.user?.email ?? "" },
        select: { name: true, sessions: { take: 1, select: { id: true } } },
      });

      if (!user || !session?.user) {
        return session;
      }

      session.user.isInitialLogin = user.sessions.length === 0;
      session.user.name = user.name;
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
