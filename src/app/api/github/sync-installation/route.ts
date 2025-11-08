import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findUserInstallation } from "@/lib/github-installations";
import { logger } from "@/lib/logger";
import { fetchInstallationDetails, getInstallationRepositories } from "@/lib/services/github-api";
import { createInstallation, getInstallationByInstallationId } from "@/lib/services/github-installation";
import { createRepository } from "@/lib/services/repository";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const githubInstallation = await findUserInstallation(session.user.id);
    if (!githubInstallation) {
      return NextResponse.json({ error: "No GitHub App installation found" }, { status: 404 });
    }

    const installationId = githubInstallation.id;

    const existingInstallation = await getInstallationByInstallationId(installationId);

    if (existingInstallation) {
      return NextResponse.json({
        message: "Installation already exists in database",
        installationId: existingInstallation.installationId,
        accountLogin: existingInstallation.accountLogin,
      });
    }

    logger.info("Syncing installation for user", {
      installationId,
      userId: session.user.id,
    });
    const installationDetails = await fetchInstallationDetails(installationId);

    if (!installationDetails) {
      return NextResponse.json({ error: "Failed to fetch installation details from GitHub" }, { status: 404 });
    }

    await createInstallation({
      installationId: installationDetails.id,
      accountId: installationDetails.accountId,
      accountLogin: installationDetails.accountLogin,
      accountType: installationDetails.accountType,
      targetType: installationDetails.targetType,
      permissions: installationDetails.permissions,
      events: installationDetails.events,
      userId: session.user.id,
    });

    logger.info("Fetching repositories for installation", { installationId });
    const repositories = await getInstallationRepositories(installationId);

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
          userId: session.user.id,
          installationId: installationId.toString(),
        });
        createdRepos++;
      } catch {
        logger.debug("Repository already exists, skipping", {
          repository: repo.fullName,
        });
      }
    }

    logger.info("Successfully synced installation", {
      installationId,
      accountLogin: installationDetails.accountLogin,
      repositoryCount: createdRepos,
    });

    return NextResponse.json({
      message: "Installation synced successfully",
      installationId: installationDetails.id,
      accountLogin: installationDetails.accountLogin,
      repositoryCount: createdRepos,
    });
  } catch (error) {
    logger.error("Error syncing installation", error as Error);
    return NextResponse.json({ error: "Failed to sync installation" }, { status: 500 });
  }
}
