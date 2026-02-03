import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@repo/database";
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(), // שימושי אם אתה מתכנן לקרוא את הקוקיז ב-Next.js
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3030",
});
