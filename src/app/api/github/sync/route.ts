import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { fetchInstallationDetails, getInstallationRepositories } from "@/lib/services/github-api";
import { createInstallation, getInstallationByInstallationId } from "@/lib/services/github-installation";
import { createRepository } from "@/lib/services/repository";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { installationId } = await request.json();
    if (!installationId) {
      return NextResponse.json({ error: "Installation ID is required" }, { status: 400 });
    }

    const existingInstallation = await getInstallationByInstallationId(Number.parseInt(installationId));

    if (existingInstallation) {
      return NextResponse.json({
        message: "Installation already synced",
        installationId: existingInstallation.installationId,
        accountLogin: existingInstallation.accountLogin,
      });
    }

    logger.info("Fetching installation details", { installationId });
    const installationDetails = await fetchInstallationDetails(
      Number.parseInt(installationId),
      "dummy-owner",
      "dummy-repo",
    );

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
    const repositories = await getInstallationRepositories(
      Number.parseInt(installationId),
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
          userId: session.user.id,
          installationId: installationId,
        });
        createdRepos++;
      } catch (_error) {
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
