import { getInstallationUrl, isAppInstalled } from "@/lib/github";
import {
	getFileContent,
	getRepositoryInfo,
	getRepositoryStructure,
	getRepositoryTree,
} from "@/lib/repository";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
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
});
