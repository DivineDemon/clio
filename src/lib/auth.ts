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
		async session({ session, token, user }) {
			// Pass user ID and GitHub username to session
			console.log(
				"Session callback - user:",
				user?.id,
				"token:",
				token.sub,
				"githubUsername:",
				token.githubUsername,
			);
			return {
				...session,
				user: {
					...session.user,
					id: user?.id || token.sub || "",
					githubUsername: token.githubUsername as string,
				},
			};
		},
		async redirect({ url, baseUrl }) {
			// Redirect to dashboard after successful login
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			if (new URL(url).origin === baseUrl) return url;
			return `${baseUrl}/dashboard`;
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
