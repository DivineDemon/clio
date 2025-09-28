import { getInstallationUrl, isAppInstalled } from "@/lib/github";
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
		// Check if user has any GitHub installations
		const repositories = await getRepositoriesByUserId(userId);
		const hasInstallation = repositories.length > 0;
		const installationUrl = await getInstallationUrl("");

		return {
			installed: hasInstallation,
			installationUrl,
			repositoryCount: repositories.length,
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
});
