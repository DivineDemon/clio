import { logger } from "@/lib/logger";
import { fetchInstallationDetails, getInstallationRepositories } from "@/lib/services/github-api";
import { createInstallation, getInstallationByInstallationId } from "@/lib/services/github-installation";
import { createRepository, repositoryExistsByGithubId } from "@/lib/services/repository";

export interface SyncInstallationResult {
  message: string;
  installationId: number;
  accountLogin: string;
  repositoryCount: number;
}

export async function syncInstallationRepositories(
  userId: string,
  installationId: number,
): Promise<SyncInstallationResult> {
  const existingInstallation = await getInstallationByInstallationId(installationId);

  const installationDetails = await fetchInstallationDetails(installationId, "dummy-owner", "dummy-repo");

  if (!installationDetails) {
    throw new Error("Failed to fetch installation details from GitHub");
  }

  let installationRecord = existingInstallation;

  if (!installationRecord) {
    logger.info("Creating new installation record", {
      installationId,
      userId,
    });

    installationRecord = await createInstallation({
      installationId: installationDetails.id,
      accountId: installationDetails.accountId,
      accountLogin: installationDetails.accountLogin,
      accountType: installationDetails.accountType,
      targetType: installationDetails.targetType,
      permissions: installationDetails.permissions,
      events: installationDetails.events,
      userId,
    });
  }

  const accountLogin = installationDetails.accountLogin;

  logger.info("Syncing repositories for installation", {
    installationId,
    accountLogin,
    userId,
  });

  const repositories = await getInstallationRepositories(installationId, accountLogin, "dummy-repo");

  let createdRepos = 0;
  for (const repo of repositories) {
    const exists = await repositoryExistsByGithubId(repo.id);
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
      userId,
      installationId: installationRecord.id,
    });
    if (!exists) {
      createdRepos++;
    }
  }

  return {
    message: "Repositories synced successfully",
    installationId: installationDetails.id,
    accountLogin,
    repositoryCount: createdRepos,
  };
}
