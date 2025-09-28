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
		async jwt({ token, account, profile }) {
			// Store GitHub username in token for later use
			if (account?.provider === "github" && profile) {
				token.githubUsername = profile.login;
			}
			return token;
		},
		async session({ session, token }) {
			// Pass GitHub username to session
			if (token.githubUsername) {
				session.user.githubUsername = token.githubUsername as string;
			}
			return session;
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
