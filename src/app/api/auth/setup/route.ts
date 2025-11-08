import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { fetchInstallationDetails, getInstallationRepositories } from "@/lib/services/github-api";
import {
  createInstallation,
  getInstallationByInstallationId,
  updateInstallation,
} from "@/lib/services/github-installation";
import { createRepository } from "@/lib/services/repository";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const installationId = url.searchParams.get("installation_id");
    const setupAction = url.searchParams.get("setup_action");

    if (installationId) {
      const installationIdNum = Number.parseInt(installationId);

      switch (setupAction) {
        case "install":
          await handleInstallation(installationIdNum);
          break;
        case "update":
          await handleInstallationUpdate(installationIdNum);
          break;
        default:
          logger.warn("Unknown setup action", {
            action: setupAction,
            installationId: installationIdNum,
          });
          break;
      }
    }

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    logger.error("Setup endpoint error", error as Error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

async function handleInstallation(installationId: number) {
  try {
    const existingInstallation = await getInstallationByInstallationId(installationId);
    if (existingInstallation) {
      logger.info("Installation already exists, skipping creation", {
        installationId,
      });
      return;
    }

    logger.info("Fetching installation details", { installationId });

    const installationDetails = await fetchInstallationDetails(installationId);

    if (!installationDetails) {
      logger.error("Failed to fetch installation details", undefined, {
        installationId,
      });
      return;
    }

    await createInstallation({
      installationId: installationDetails.id,
      accountId: installationDetails.accountId,
      accountLogin: installationDetails.accountLogin,
      accountType: installationDetails.accountType,
      targetType: installationDetails.targetType,
      permissions: installationDetails.permissions,
      events: installationDetails.events,
      userId: installationDetails.accountId.toString(),
    });

    const repositories = await getInstallationRepositories(installationId);

    for (const repo of repositories) {
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
        userId: installationDetails.accountId.toString(),
        installationId: installationId.toString(),
      });
    }

    logger.info("Successfully created installation", {
      installationId,
      accountLogin: installationDetails.accountLogin,
      repositoryCount: repositories.length,
    });
  } catch (error) {
    logger.error("Error handling installation", error as Error, {
      installationId,
    });
    throw error;
  }
}

async function handleInstallationUpdate(installationId: number) {
  try {
    const existingInstallation = await getInstallationByInstallationId(installationId);
    if (!existingInstallation) {
      logger.info("Installation not found, creating new installation", {
        installationId,
      });
      await handleInstallation(installationId);
      return;
    }

    logger.info("Updating installation", { installationId });

    const installationDetails = await fetchInstallationDetails(installationId);

    if (!installationDetails) {
      logger.error("Failed to fetch updated installation details", undefined, {
        installationId,
      });
      return;
    }

    await updateInstallation(installationId, {
      accountLogin: installationDetails.accountLogin,
      accountType: installationDetails.accountType,
      targetType: installationDetails.targetType,
      permissions: installationDetails.permissions,
      events: installationDetails.events,
      suspendedAt: installationDetails.suspendedAt,
      suspendedBy: installationDetails.suspendedBy,
      suspendedByLogin: installationDetails.suspendedByLogin,
    });

    const repositories = await getInstallationRepositories(installationId);

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
          userId: installationDetails.accountId.toString(),
          installationId: installationId.toString(),
        });
      } catch {
        logger.debug("Repository already exists, skipping creation", {
          repository: repo.fullName,
        });
      }
    }

    logger.info("Successfully updated installation", {
      installationId,
      accountLogin: installationDetails.accountLogin,
      repositoryCount: repositories.length,
    });
  } catch (error) {
    logger.error("Error handling installation update", error as Error, {
      installationId,
    });
    throw error;
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
