import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        // Check if user is suspended
        if (user.isSuspended) {
          throw new Error(`Account suspended${user.suspendReason ? `: ${user.suspendReason}` : ""}`);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          trialStartDate: user.trialStartDate.toISOString(),
          trialDays: user.trialDays,
          isSubscribed: user.isSubscribed,
          subscriptionEnd: user.subscriptionEnd ? user.subscriptionEnd.toISOString() : null,
          isSuspended: user.isSuspended,
          suspendReason: user.suspendReason,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.trialStartDate = user.trialStartDate;
        token.trialDays = user.trialDays;
        token.isSubscribed = user.isSubscribed;
        token.subscriptionEnd = user.subscriptionEnd;
        token.isSuspended = user.isSuspended;
        token.suspendReason = user.suspendReason;
      }
      
      // Refresh user data on every request to get latest suspension/subscription status
      if (trigger === "update" || token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
          });
          if (dbUser) {
            token.trialDays = dbUser.trialDays;
            token.isSubscribed = dbUser.isSubscribed;
            token.subscriptionEnd = dbUser.subscriptionEnd ? dbUser.subscriptionEnd.toISOString() : null;
            token.isSuspended = dbUser.isSuspended;
            token.suspendReason = dbUser.suspendReason;
          }
        } catch {
          // If DB query fails, continue with existing token data
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.trialStartDate = token.trialStartDate as string;
        session.user.trialDays = token.trialDays as number;
        session.user.isSubscribed = token.isSubscribed as boolean;
        session.user.subscriptionEnd = token.subscriptionEnd as string | null;
        session.user.isSuspended = token.isSuspended as boolean;
        session.user.suspendReason = token.suspendReason as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
