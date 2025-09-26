import { env } from "@/env";
import { db } from "@/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(db),
	providers: [
		GitHubProvider({
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
			authorization: {
				params: {
					scope: "read:user user:email",
				},
			},
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "github" && profile && user.email) {
				const githubProfile = profile as {
					id?: number;
					login?: string;
					avatar_url?: string;
					name?: string;
				};
				await db.user.upsert({
					where: { email: user.email },
					update: {
						githubId: githubProfile.id?.toString(),
						username: githubProfile.login,
						avatarUrl: githubProfile.avatar_url,
						name: githubProfile.name || githubProfile.login,
					},
					create: {
						id: user.id,
						email: user.email,
						name: githubProfile.name || githubProfile.login,
						githubId: githubProfile.id?.toString(),
						username: githubProfile.login,
						avatarUrl: githubProfile.avatar_url,
					},
				});
			}

			return true;
		},
		async session({ session, user }) {
			if (session.user) {
				const dbUser = await db.user.findUnique({
					where: { id: user.id },
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
						githubId: true,
						username: true,
						avatarUrl: true,
					},
				});

				if (dbUser) {
					const extendedUser = session.user as typeof session.user & {
						id: string;
						githubId: string | null;
						username: string | null;
						avatarUrl: string | null;
					};
					extendedUser.id = dbUser.id;
					extendedUser.githubId = dbUser.githubId;
					extendedUser.username = dbUser.username;
					extendedUser.avatarUrl = dbUser.avatarUrl;
				}
			}

			return session;
		},
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
	},
	session: {
		strategy: "database",
	},
	debug: env.NODE_ENV === "development",
};
