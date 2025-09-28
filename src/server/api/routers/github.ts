import { getInstallationUrl, isAppInstalled } from "@/lib/github";
import { findUserInstallation } from "@/lib/github-installations";
import {
	getFileContent,
	getRepositoryInfo,
	getRepositoryStructure,
	getRepositoryTree,
} from "@/lib/repository";
import { getRepositoriesByUserId } from "@/lib/services/repository";
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const githubRouter = createTRPCRouter({
	checkInstallation: publicProcedure
		.input(
			z.object({
				owner: z.string(),
				repo: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const installed = await isAppInstalled(input.owner, input.repo);
			const installationUrl = await getInstallationUrl(input.owner);

			return {
				installed,
				installationUrl,
				repository: `${input.owner}/${input.repo}`,
			};
		}),
	checkUserInstallation: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) {
			throw new Error("User ID not found in session");
		}

		// First check if we have repositories in our database
		const repositories = await getRepositoriesByUserId(userId);
		if (repositories.length > 0) {
			const installationUrl = await getInstallationUrl("");
			return {
				installed: true,
				installationUrl,
				repositoryCount: repositories.length,
				source: "database",
			};
		}

		// If no repositories in database, check GitHub directly
		try {
			const githubInstallation = await findUserInstallation(userId);
			if (githubInstallation) {
				const installationUrl = await getInstallationUrl("");
				return {
					installed: true,
					installationUrl,
					repositoryCount: 0,
					source: "github",
					installationId: githubInstallation.id,
					accountLogin: githubInstallation.account.login,
					needsSync: true,
				};
			}
		} catch (error) {
			console.error("Failed to check GitHub installations:", error);
		}

		// No installation found
		const installationUrl = await getInstallationUrl("");
		return {
			installed: false,
			installationUrl,
			repositoryCount: 0,
			source: "none",
		};
	}),
	getRepositoryInfo: publicProcedure
		.input(
			z.object({
				owner: z.string(),
				repo: z.string(),
			}),
		)
		.query(async ({ input }) => {
			return await getRepositoryInfo(input.owner, input.repo);
		}),
	getRepositoryTree: publicProcedure
		.input(
			z.object({
				owner: z.string(),
				repo: z.string(),
				branch: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			return await getRepositoryTree(input.owner, input.repo, input.branch);
		}),
	getFileContent: publicProcedure
		.input(
			z.object({
				owner: z.string(),
				repo: z.string(),
				path: z.string(),
				branch: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			return await getFileContent(
				input.owner,
				input.repo,
				input.path,
				input.branch,
			);
		}),
	getRepositoryStructure: publicProcedure
		.input(
			z.object({
				owner: z.string(),
				repo: z.string(),
			}),
		)
		.query(async ({ input }) => {
			return await getRepositoryStructure(input.owner, input.repo);
		}),
	getInstallationUrl: publicProcedure
		.input(
			z.object({
				owner: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			return getInstallationUrl(input.owner);
		}),
	getUserRepositories: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) {
			throw new Error("User ID not found in session");
		}
		return await getRepositoriesByUserId(userId);
	}),
	syncInstallation: protectedProcedure
		.input(
			z.object({
				installationId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const userId = ctx.session.user.id;
			if (!userId) {
				throw new Error("User ID not found in session");
			}

			// Call the sync API endpoint
			const response = await fetch(
				`${
					process.env.NEXTAUTH_URL || "http://localhost:3000"
				}/api/github/sync`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ installationId: input.installationId }),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to sync installation");
			}

			return await response.json();
		}),
});
