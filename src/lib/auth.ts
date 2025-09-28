import { env } from "@/env";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const prisma = new PrismaClient();

const config: NextAuthConfig = {
	providers: [
		GitHubProvider({
			clientId: env.AUTH_GITHUB_ID,
			clientSecret: env.AUTH_GITHUB_SECRET,
		}),
	],
	adapter: PrismaAdapter(prisma),
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
			},
		}),
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
