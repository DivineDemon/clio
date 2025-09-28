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
		const githubUsername = ctx.session.user.githubUsername;

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
			console.log(
				`Checking GitHub installations for user ${userId} (${githubUsername})...`,
			);
			const githubInstallation = await findUserInstallation(
				userId,
				githubUsername,
			);
			console.log("GitHub installation result:", githubInstallation);

			if (githubInstallation) {
				// Automatically sync the installation if found
				console.log(
					`Auto-syncing installation ${githubInstallation.id} for ${githubUsername}...`,
				);

				try {
					// Import the sync logic directly
					const { fetchInstallationDetails, getInstallationRepositories } =
						await import("@/lib/services/github-api");
					const { createInstallation, getInstallationByInstallationId } =
						await import("@/lib/services/github-installation");
					const { createRepository } = await import(
						"@/lib/services/repository"
					);

					const installationIdNum = githubInstallation.id;

					// Check if installation already exists in our database
					const existingInstallation =
						await getInstallationByInstallationId(installationIdNum);

					if (!existingInstallation) {
						// Fetch installation details from GitHub
						const installationDetails = await fetchInstallationDetails(
							installationIdNum,
							githubUsername || "unknown",
							"dummy-repo",
						);

						if (installationDetails) {
							// Create installation in our database
							await createInstallation({
								installationId: installationDetails.id,
								accountId: installationDetails.accountId,
								accountLogin: installationDetails.accountLogin,
								accountType: installationDetails.accountType,
								targetType: installationDetails.targetType,
								permissions: installationDetails.permissions,
								events: installationDetails.events,
								userId: userId,
							});

							// Fetch and create repositories
							const repositories = await getInstallationRepositories(
								installationIdNum,
								installationDetails.accountLogin,
								"dummy-repo",
							);

							let createdRepos = 0;
							for (const repo of repositories) {
								try {
									await createRepository({
										githubId: repo.id,
										name: repo.name,
										fullName: repo.fullName,
										owner: repo.owner,
										description: repo.description,
										isPrivate: repo.isPrivate,
										defaultBranch: repo.defaultBranch,
										language: repo.language,
										topics: repo.topics,
										size: repo.size,
										stargazersCount: repo.stargazersCount,
										forksCount: repo.forksCount,
										openIssuesCount: repo.openIssuesCount,
										watchersCount: repo.watchersCount,
										pushedAt: repo.pushedAt,
										githubCreatedAt: repo.githubCreatedAt,
										githubUpdatedAt: repo.githubUpdatedAt,
										userId: userId,
										installationId: installationIdNum.toString(),
									});
									createdRepos++;
								} catch (error) {
									console.log(
										`Repository ${repo.fullName} already exists, skipping`,
									);
								}
							}

							console.log(
								`Auto-synced installation ${installationIdNum} for ${githubUsername} with ${createdRepos} repositories`,
							);

							// Return the synced installation
							const installationUrl = await getInstallationUrl("");
							return {
								installed: true,
								installationUrl,
								repositoryCount: createdRepos,
								source: "auto-synced",
								installationId: githubInstallation.id,
								accountLogin: githubInstallation.account.login,
							};
						}
					}
				} catch (syncError) {
					console.error("Failed to auto-sync installation:", syncError);
					// Fall through to manual sync option
				}

				// If auto-sync failed or installation already exists, return needsSync
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

			// Import the sync logic directly instead of making HTTP call
			const { fetchInstallationDetails, getInstallationRepositories } =
				await import("@/lib/services/github-api");
			const { createInstallation, getInstallationByInstallationId } =
				await import("@/lib/services/github-installation");
			const { createRepository } = await import("@/lib/services/repository");

			const installationIdNum = Number.parseInt(input.installationId);

			// Check if installation already exists in our database
			const existingInstallation =
				await getInstallationByInstallationId(installationIdNum);

			if (existingInstallation) {
				return {
					message: "Installation already synced",
					installationId: existingInstallation.installationId,
					accountLogin: existingInstallation.accountLogin,
				};
			}

			// Fetch installation details from GitHub
			console.log(`Fetching installation details for ${installationIdNum}...`);
			const installationDetails = await fetchInstallationDetails(
				installationIdNum,
				"dummy-owner",
				"dummy-repo",
			);

			if (!installationDetails) {
				throw new Error("Failed to fetch installation details from GitHub");
			}

			// Create installation in our database
			await createInstallation({
				installationId: installationDetails.id,
				accountId: installationDetails.accountId,
				accountLogin: installationDetails.accountLogin,
				accountType: installationDetails.accountType,
				targetType: installationDetails.targetType,
				permissions: installationDetails.permissions,
				events: installationDetails.events,
				userId: userId,
			});

			// Fetch and create repositories
			console.log(
				`Fetching repositories for installation ${installationIdNum}...`,
			);
			const repositories = await getInstallationRepositories(
				installationIdNum,
				installationDetails.accountLogin,
				"dummy-repo",
			);

			let createdRepos = 0;
			for (const repo of repositories) {
				try {
					await createRepository({
						githubId: repo.id,
						name: repo.name,
						fullName: repo.fullName,
						owner: repo.owner,
						description: repo.description,
						isPrivate: repo.isPrivate,
						defaultBranch: repo.defaultBranch,
						language: repo.language,
						topics: repo.topics,
						size: repo.size,
						stargazersCount: repo.stargazersCount,
						forksCount: repo.forksCount,
						openIssuesCount: repo.openIssuesCount,
						watchersCount: repo.watchersCount,
						pushedAt: repo.pushedAt,
						githubCreatedAt: repo.githubCreatedAt,
						githubUpdatedAt: repo.githubUpdatedAt,
						userId: userId,
						installationId: input.installationId,
					});
					createdRepos++;
				} catch (error) {
					console.log(`Repository ${repo.fullName} already exists, skipping`);
				}
			}

			console.log(
				`Successfully synced installation ${installationIdNum} for ${installationDetails.accountLogin} with ${createdRepos} repositories`,
			);

			return {
				message: "Installation synced successfully",
				installationId: installationDetails.id,
				accountLogin: installationDetails.accountLogin,
				repositoryCount: createdRepos,
			};
		}),
});
