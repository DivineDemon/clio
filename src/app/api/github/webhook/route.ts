import { type NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/github";
import { logger } from "@/lib/logger";
import {
  fetchInstallationDetails,
  fetchRepositoryDetails,
  getInstallationRepositories,
  isRepositoryManaged,
} from "@/lib/services/github-api";
import { createInstallation, deleteInstallation, updateInstallation } from "@/lib/services/github-installation";
import { createRepository, deleteRepository, updateRepository } from "@/lib/services/repository";
import type {
  GitHubInstallationEventPayload,
  GitHubInstallationRepositoriesEventPayload,
  GitHubRepositoryEventPayload,
} from "@/lib/types/github-webhooks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const event = request.headers.get("x-github-event");

    switch (event) {
      case "installation":
        await handleInstallationEvent(payload as GitHubInstallationEventPayload);
        break;
      case "installation_repositories":
        await handleInstallationRepositoriesEvent(payload as GitHubInstallationRepositoriesEventPayload);
        break;
      case "repository":
        await handleRepositoryEvent(payload as GitHubRepositoryEventPayload);
        break;
      default:
        logger.warn("Unhandled webhook event", { event });
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    logger.error("Error processing webhook", error as Error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

async function handleInstallationEvent(payload: GitHubInstallationEventPayload) {
  const { action, installation } = payload;

  try {
    const installationDetails = await fetchInstallationDetails(
      installation.id,
      installation.account.login,
      "dummy-repo",
    );

    if (!installationDetails) {
      logger.error("Failed to fetch installation details", undefined, {
        installationId: installation.id,
      });
      return;
    }

    switch (action) {
      case "created": {
        await createInstallation({
          installationId: installation.id,
          accountId: installationDetails.accountId,
          accountLogin: installationDetails.accountLogin,
          accountType: installationDetails.accountType,
          targetType: installationDetails.targetType,
          permissions: installationDetails.permissions,
          events: installationDetails.events,
          userId: installationDetails.accountId.toString(),
        });

        const repositories = await getInstallationRepositories(
          installation.id,
          installationDetails.accountLogin,
          "dummy-repo",
        );

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
            installationId: installation.id.toString(),
          });
        }

        logger.info("Created installation", {
          installationId: installation.id,
          accountLogin: installationDetails.accountLogin,
          repositoryCount: repositories.length,
        });
        break;
      }

      case "deleted":
        await deleteInstallation(installation.id);
        logger.info("Deleted installation", {
          installationId: installation.id,
        });
        break;

      case "suspend":
        await updateInstallation(installation.id, {
          suspendedAt: installationDetails.suspendedAt,
          suspendedBy: installationDetails.suspendedBy,
          suspendedByLogin: installationDetails.suspendedByLogin,
        });
        logger.info("Suspended installation", {
          installationId: installation.id,
        });
        break;

      case "unsuspend":
        await updateInstallation(installation.id, {
          suspendedAt: null,
          suspendedBy: null,
          suspendedByLogin: null,
        });
        logger.info("Unsuspended installation", {
          installationId: installation.id,
        });
        break;

      case "new_permissions_accepted":
        await updateInstallation(installation.id, {
          permissions: installationDetails.permissions,
          events: installationDetails.events,
        });
        logger.info("Updated permissions for installation", {
          installationId: installation.id,
        });
        break;
    }
  } catch (error) {
    logger.error("Error handling installation event", error as Error, {
      action,
    });
    throw error;
  }
}

async function handleInstallationRepositoriesEvent(payload: GitHubInstallationRepositoriesEventPayload) {
  const { installation, repositories_added, repositories_removed } = payload;

  try {
    const installationDetails = await fetchInstallationDetails(
      installation.id,
      installation.account.login,
      "dummy-repo",
    );

    if (!installationDetails) {
      logger.error("Failed to fetch installation details", undefined, {
        installationId: installation.id,
      });
      return;
    }

    if (repositories_added && repositories_added.length > 0) {
      for (const repo of repositories_added) {
        const repoDetails = await fetchRepositoryDetails(installationDetails.accountLogin, repo.name);

        if (repoDetails) {
          await createRepository({
            githubId: repoDetails.id,
            name: repoDetails.name,
            fullName: repoDetails.fullName,
            owner: repoDetails.owner,
            description: repoDetails.description,
            isPrivate: repoDetails.isPrivate,
            defaultBranch: repoDetails.defaultBranch,
            language: repoDetails.language,
            topics: repoDetails.topics,
            size: repoDetails.size,
            stargazersCount: repoDetails.stargazersCount,
            forksCount: repoDetails.forksCount,
            openIssuesCount: repoDetails.openIssuesCount,
            watchersCount: repoDetails.watchersCount,
            pushedAt: repoDetails.pushedAt,
            githubCreatedAt: repoDetails.githubCreatedAt,
            githubUpdatedAt: repoDetails.githubUpdatedAt,
            userId: installationDetails.accountId.toString(),
            installationId: installation.id.toString(),
          });
        }
      }
      logger.info("Added repositories to installation", {
        installationId: installation.id,
        repositoryCount: repositories_added.length,
      });
    }

    if (repositories_removed && repositories_removed.length > 0) {
      for (const repo of repositories_removed) {
        await deleteRepository(repo.id);
      }
      logger.info("Removed repositories from installation", {
        installationId: installation.id,
        repositoryCount: repositories_removed.length,
      });
    }
  } catch (error) {
    logger.error("Error handling installation repositories event", error as Error);
    throw error;
  }
}

async function handleRepositoryEvent(payload: GitHubRepositoryEventPayload) {
  const { action, repository } = payload;

  try {
    const { isManaged, installationId } = await isRepositoryManaged(repository.owner.login, repository.name);

    if (!isManaged || !installationId) {
      logger.debug("Repository not managed by our app, skipping event", {
        repository: repository.full_name,
        action,
      });
      return;
    }

    const repositoryDetails = await fetchRepositoryDetails(repository.owner.login, repository.name);

    if (!repositoryDetails) {
      logger.error("Failed to fetch repository details", undefined, {
        repository: repository.full_name,
      });
      return;
    }

    switch (action) {
      case "created":
        await createRepository({
          githubId: repositoryDetails.id,
          name: repositoryDetails.name,
          fullName: repositoryDetails.fullName,
          owner: repositoryDetails.owner,
          description: repositoryDetails.description,
          isPrivate: repositoryDetails.isPrivate,
          defaultBranch: repositoryDetails.defaultBranch,
          language: repositoryDetails.language,
          topics: repositoryDetails.topics,
          size: repositoryDetails.size,
          stargazersCount: repositoryDetails.stargazersCount,
          forksCount: repositoryDetails.forksCount,
          openIssuesCount: repositoryDetails.openIssuesCount,
          watchersCount: repositoryDetails.watchersCount,
          pushedAt: repositoryDetails.pushedAt,
          githubCreatedAt: repositoryDetails.githubCreatedAt,
          githubUpdatedAt: repositoryDetails.githubUpdatedAt,
          userId: repository.owner.id.toString(),
          installationId: installationId.toString(),
        });
        logger.info("Created repository", { repository: repository.full_name });
        break;

      case "deleted":
        await deleteRepository(repository.id);
        logger.info("Deleted repository", { repository: repository.full_name });
        break;

      case "publicized":
      case "privatized":
        await updateRepository(repository.id, {
          isPrivate: action === "privatized",
          githubUpdatedAt: new Date(),
        });
        logger.info("Updated repository visibility", {
          repository: repository.full_name,
          action,
        });
        break;

      case "edited":
        await updateRepository(repository.id, {
          description: repositoryDetails.description,
          language: repositoryDetails.language,
          topics: repositoryDetails.topics,
          size: repositoryDetails.size,
          stargazersCount: repositoryDetails.stargazersCount,
          forksCount: repositoryDetails.forksCount,
          openIssuesCount: repositoryDetails.openIssuesCount,
          watchersCount: repositoryDetails.watchersCount,
          pushedAt: repositoryDetails.pushedAt,
          githubUpdatedAt: repositoryDetails.githubUpdatedAt,
        });
        logger.info("Updated repository details", {
          repository: repository.full_name,
        });
        break;

      case "renamed":
        await updateRepository(repository.id, {
          name: repositoryDetails.name,
          fullName: repositoryDetails.fullName,
          githubUpdatedAt: repositoryDetails.githubUpdatedAt,
        });
        logger.info("Renamed repository", { repository: repository.full_name });
        break;

      case "archived":
      case "unarchived":
        await updateRepository(repository.id, {
          githubUpdatedAt: repositoryDetails.githubUpdatedAt,
        });
        logger.info("Repository action", {
          repository: repository.full_name,
          action,
        });
        break;
    }
  } catch (error) {
    logger.error("Error handling repository event", error as Error, { action });
    throw error;
  }
}
