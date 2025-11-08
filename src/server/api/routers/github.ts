import { z } from "zod";
import { getInstallationUrl, isAppInstalled } from "@/lib/github";
import { findUserInstallation } from "@/lib/github-installations";
import { logger } from "@/lib/logger";
import { getFileContent, getRepositoryInfo, getRepositoryStructure, getRepositoryTree } from "@/lib/repository";
import { syncInstallationRepositories } from "@/lib/services/github-sync";
import { getRepositoriesByUserId } from "@/lib/services/repository";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

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

    const repositories = await getRepositoriesByUserId(userId);
    if (repositories.length > 0) {
      const installationUrl = await getInstallationUrl("");

      const installationId = repositories[0]?.installation?.installationId;
      return {
        installed: true,
        installationUrl,
        repositoryCount: repositories.length,
        source: "database",
        installationId,
      };
    }

    const { getInstallationsByUserId } = await import("@/lib/services/github-installation");
    const existingInstallations = await getInstallationsByUserId(userId);
    if (existingInstallations.length > 0) {
      const installationUrl = await getInstallationUrl("");
      return {
        installed: true,
        installationUrl,
        repositoryCount: repositories.length,
        source: "database",
        hasInstallation: true,
        needsSync: repositories.length === 0,
        installationId: existingInstallations[0]?.installationId,
        accountLogin: existingInstallations[0]?.accountLogin,
      };
    }

    try {
      logger.debug("Checking GitHub installations", { userId });
      const githubInstallation = await findUserInstallation(userId);
      if (githubInstallation) {
        logger.info("Auto-syncing installation to database", {
          installationId: githubInstallation.id,
        });
        try {
          const { fetchInstallationDetails, getInstallationRepositories } = await import("@/lib/services/github-api");
          const { createInstallation } = await import("@/lib/services/github-installation");
          const { createRepository } = await import("@/lib/services/repository");

          const installationDetails = await fetchInstallationDetails(
            githubInstallation.id,
            "dummy-owner",
            "dummy-repo",
          );

          if (installationDetails) {
            const createdInstallation = await createInstallation({
              installationId: installationDetails.id,
              accountId: installationDetails.accountId,
              accountLogin: installationDetails.accountLogin,
              accountType: installationDetails.accountType,
              targetType: installationDetails.targetType,
              permissions: installationDetails.permissions,
              events: installationDetails.events,
              userId: userId,
            });

            const repositories = await getInstallationRepositories(githubInstallation.id, "dummy-owner", "dummy-repo");

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
                  installationId: createdInstallation.id,
                });
                createdRepos++;
              } catch (error) {
                logger.debug(`Repository already exists, skipping: ${(error as Error).message}`, {
                  repository: repo.fullName,
                });
              }
            }

            logger.info("Successfully auto-synced installation", {
              installationId: githubInstallation.id,
              repositoryCount: createdRepos,
            });

            const installationUrl = await getInstallationUrl("");
            return {
              installed: true,
              installationUrl,
              repositoryCount: createdRepos,
              source: "database",
              hasInstallation: true,
              needsSync: false,
            };
          }
        } catch (syncError) {
          logger.error("Failed to auto-sync installation", syncError as Error, {
            installationId: githubInstallation.id,
          });

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
      }
    } catch (error) {
      logger.error("Failed to check GitHub installations", error as Error, {
        userId,
      });
    }

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
      return await getFileContent(input.owner, input.repo, input.path, input.branch);
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

      const installationIdNum = Number.parseInt(input.installationId, 10);
      const result = await syncInstallationRepositories(userId, installationIdNum);
      return result;
    }),
});
