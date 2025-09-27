import { env } from "@/env";
import { db } from "@/server/db";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
	providers: [
		GitHubProvider({
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			console.log("🔐 SignIn callback triggered:", {
				user: { id: user.id, email: user.email, name: user.name },
				account: { provider: account?.provider, type: account?.type },
				profile: profile
					? {
							id: (profile as { id?: number }).id,
							login: (profile as { login?: string }).login,
						}
					: null,
			});

			// Allow all sign-ins, user creation is handled in JWT callback
			return true;
		},
		async jwt({ token, user, account, profile }) {
			console.log("🔑 JWT callback triggered:", {
				token: { email: token.email, name: token.name },
				user: user ? { id: user.id, email: user.email, name: user.name } : null,
				account: { provider: account?.provider, type: account?.type },
				profile: profile
					? {
							id: (profile as { id?: number }).id,
							login: (profile as { login?: string }).login,
						}
					: null,
			});

			if (account?.provider === "github" && profile && user?.email) {
				const githubProfile = profile as {
					id?: number;
					login?: string;
					avatar_url?: string;
					name?: string;
				};

				try {
					const upsertedUser = await db.user.upsert({
						where: { email: user.email },
						update: {
							githubId: githubProfile.id?.toString(),
							username: githubProfile.login,
							avatarUrl: githubProfile.avatar_url,
							name: githubProfile.name || githubProfile.login,
						},
						create: {
							email: user.email,
							name: githubProfile.name || githubProfile.login,
							githubId: githubProfile.id?.toString(),
							username: githubProfile.login,
							avatarUrl: githubProfile.avatar_url,
						},
					});
					console.log(
						"✅ User upserted successfully in JWT callback:",
						upsertedUser,
					);

					// Add user data to token
					token.id = upsertedUser.id;
					token.githubId = upsertedUser.githubId;
					token.username = upsertedUser.username;
					token.avatarUrl = upsertedUser.avatarUrl;
				} catch (error) {
					console.error("❌ Error upserting user in JWT callback:", error);
					throw error;
				}
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user && token) {
				const extendedUser = session.user as typeof session.user & {
					id: string;
					githubId: string | null;
					username: string | null;
					avatarUrl: string | null;
				};
				extendedUser.id = token.id as string;
				extendedUser.githubId = token.githubId as string | null;
				extendedUser.username = token.username as string | null;
				extendedUser.avatarUrl = token.avatarUrl as string | null;
			}

			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
	session: {
		strategy: "jwt",
	},
	debug: env.NODE_ENV === "development",
};
