import { createInstallationOctokit, getRepoInstallation } from "@/lib/github";

export interface GitHubInstallationDetails {
  id: number;
  accountId: number;
  accountLogin: string;
  accountType: "User" | "Organization";
  targetType: "User" | "Organization";
  permissions: Record<string, string>;
  events: string[];
  suspendedAt: Date | null;
  suspendedBy: number | null;
  suspendedByLogin: string | null;
}

export interface GitHubRepositoryDetails {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  topics: string[];
  size: number;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  watchersCount: number;
  pushedAt: Date | null;
  githubCreatedAt: Date;
  githubUpdatedAt: Date;
}

export async function fetchInstallationDetails(installationId: number): Promise<GitHubInstallationDetails | null> {
  try {
    const { octokitApp } = await import("@/lib/github");

    const { data: installation } = await octokitApp.rest.apps.getInstallation({
      installation_id: installationId,
    });

    if (!installation.account) {
      throw new Error("Installation account is null");
    }

    return {
      id: installation.id,
      accountId: installation.account.id,
      accountLogin:
        "login" in installation.account ? installation.account.login : installation.account.name || "unknown",
      accountType:
        "type" in installation.account ? (installation.account.type as "User" | "Organization") : "Organization",
      targetType: installation.target_type as "User" | "Organization",
      permissions: installation.permissions || {},
      events: installation.events || [],
      suspendedAt: installation.suspended_at ? new Date(installation.suspended_at) : null,
      suspendedBy: installation.suspended_by?.id || null,
      suspendedByLogin: installation.suspended_by?.login || null,
    };
  } catch {
    return null;
  }
}

export async function fetchRepositoryDetails(owner: string, repo: string): Promise<GitHubRepositoryDetails | null> {
  try {
    const octokit = await createInstallationOctokit(owner, repo);
    if (!octokit) {
      return null;
    }

    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      owner: repository.owner.login,
      description: repository.description,
      isPrivate: repository.private,
      defaultBranch: repository.default_branch,
      language: repository.language,
      topics: repository.topics || [],
      size: repository.size,
      stargazersCount: repository.stargazers_count,
      forksCount: repository.forks_count,
      openIssuesCount: repository.open_issues_count,
      watchersCount: repository.watchers_count,
      pushedAt: repository.pushed_at ? new Date(repository.pushed_at) : null,
      githubCreatedAt: new Date(repository.created_at),
      githubUpdatedAt: new Date(repository.updated_at),
    };
  } catch {
    return null;
  }
}

export async function isRepositoryManaged(
  owner: string,
  repo: string,
): Promise<{ isManaged: boolean; installationId?: number }> {
  try {
    const installationId = await getRepoInstallation(owner, repo);
    return {
      isManaged: installationId !== null,
      installationId: installationId || undefined,
    };
  } catch {
    return { isManaged: false };
  }
}

export async function getInstallationRepositories(installationId: number): Promise<GitHubRepositoryDetails[]> {
  try {
    const { getInstallationToken } = await import("@/lib/github");
    const token = await getInstallationToken(installationId);

    if (!token) {
      throw new Error(`Failed to get access token for installation ${installationId}`);
    }

    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: token });

    const { data: repositories } = await octokit.rest.apps.listReposAccessibleToInstallation({
      installation_id: installationId,
    });

    return repositories.repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      language: repo.language,
      topics: repo.topics || [],
      size: repo.size,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      watchersCount: repo.watchers_count,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      githubCreatedAt: new Date(repo.created_at || new Date()),
      githubUpdatedAt: new Date(repo.updated_at || new Date()),
    }));
  } catch {
    return [];
  }
}

export function parseRepositoryFullName(fullName: string): { owner: string; repo: string } | null {
  const parts = fullName.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }
  return {
    owner: parts[0],
    repo: parts[1],
  };
}
