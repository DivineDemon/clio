import type { GitHubInstallation, ReadmeJob, Repository } from "@prisma/client";
import { db } from "@/server/db";

export interface CreateRepositoryData {
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  description?: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  language?: string | null;
  topics: string[];
  size: number;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  watchersCount: number;
  pushedAt?: Date | null;
  githubCreatedAt: Date;
  githubUpdatedAt: Date;
  userId: string;
  installationId: string;
}

export interface UpdateRepositoryData {
  name?: string;
  fullName?: string;
  description?: string | null;
  isPrivate?: boolean;
  defaultBranch?: string;
  language?: string | null;
  topics?: string[];
  size?: number;
  stargazersCount?: number;
  forksCount?: number;
  openIssuesCount?: number;
  watchersCount?: number;
  pushedAt?: Date | null;
  githubUpdatedAt?: Date;
}

export async function createRepository(data: CreateRepositoryData): Promise<Repository> {
  return await db.repository.upsert({
    where: {
      githubId: data.githubId,
    },
    update: {
      name: data.name,
      fullName: data.fullName,
      owner: data.owner,
      description: data.description,
      isPrivate: data.isPrivate,
      defaultBranch: data.defaultBranch,
      language: data.language,
      topics: data.topics,
      size: data.size,
      stargazersCount: data.stargazersCount,
      forksCount: data.forksCount,
      openIssuesCount: data.openIssuesCount,
      watchersCount: data.watchersCount,
      pushedAt: data.pushedAt,
      githubCreatedAt: data.githubCreatedAt,
      githubUpdatedAt: data.githubUpdatedAt,
      userId: data.userId,
      installationId: data.installationId,
    },
    create: {
      githubId: data.githubId,
      name: data.name,
      fullName: data.fullName,
      owner: data.owner,
      description: data.description,
      isPrivate: data.isPrivate,
      defaultBranch: data.defaultBranch,
      language: data.language,
      topics: data.topics,
      size: data.size,
      stargazersCount: data.stargazersCount,
      forksCount: data.forksCount,
      openIssuesCount: data.openIssuesCount,
      watchersCount: data.watchersCount,
      pushedAt: data.pushedAt,
      githubCreatedAt: data.githubCreatedAt,
      githubUpdatedAt: data.githubUpdatedAt,
      userId: data.userId,
      installationId: data.installationId,
    },
  });
}

export async function getRepositoryById(id: string): Promise<Repository | null> {
  return await db.repository.findUnique({
    where: { id },
    include: {
      user: true,
      installation: true,
      readmeJobs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function getRepositoryByGithubId(githubId: number): Promise<Repository | null> {
  return await db.repository.findUnique({
    where: { githubId },
    include: {
      user: true,
      installation: true,
      readmeJobs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
}

export async function repositoryExistsByGithubId(githubId: number): Promise<boolean> {
  const existing = await db.repository.findUnique({
    where: { githubId },
    select: { id: true },
  });
  return existing !== null;
}

export async function getRepositoriesByUserId(userId: string): Promise<
  (Repository & {
    installation: GitHubInstallation | null;
    readmeJobs: ReadmeJob[];
  })[]
> {
  return await db.repository.findMany({
    where: { userId },
    include: {
      installation: true,
      readmeJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export type RepositoryPrivacyFilter = "all" | "public" | "private";
export type RepositorySortOption = "name" | "stars" | "forks" | "updated" | "created";

export interface RepositoryQueryOptions {
  search?: string;
  language?: string;
  privacy?: RepositoryPrivacyFilter;
  sortBy?: RepositorySortOption;
}

export interface RepositoryQueryResult {
  repositories: (Repository & {
    installation: GitHubInstallation | null;
    readmeJobs: ReadmeJob[];
  })[];
  availableLanguages: string[];
  totalCount: number;
}

export async function getRepositoriesForUser(
  userId: string,
  options: RepositoryQueryOptions = {},
): Promise<RepositoryQueryResult> {
  const { search, language, privacy = "all", sortBy = "name" } = options;

  const whereClauses: Record<string, unknown> = {
    userId,
  };

  if (language && language !== "all") {
    whereClauses.language = language;
  }

  if (privacy !== "all") {
    whereClauses.isPrivate = privacy === "private";
  }

  if (search && search.trim() !== "") {
    whereClauses.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, "asc" | "desc"> = { name: "asc" };
  switch (sortBy) {
    case "stars":
      orderBy = { stargazersCount: "desc" };
      break;
    case "forks":
      orderBy = { forksCount: "desc" };
      break;
    case "updated":
      orderBy = { githubUpdatedAt: "desc" };
      break;
    case "created":
      orderBy = { githubCreatedAt: "desc" };
      break;
    default:
      orderBy = { name: "asc" };
      break;
  }

  const [repositories, languageRows, totalCount] = await Promise.all([
    db.repository.findMany({
      where: whereClauses,
      include: {
        installation: true,
        readmeJobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy,
    }),
    db.repository.findMany({
      where: { userId, language: { not: null } },
      distinct: ["language"],
      select: { language: true },
    }),
    db.repository.count({
      where: { userId },
    }),
  ]);

  const availableLanguages = languageRows
    .map((row) => row.language)
    .filter((lang): lang is string => Boolean(lang))
    .sort((a, b) => a.localeCompare(b));

  return {
    repositories,
    availableLanguages,
    totalCount,
  };
}

export async function getRepositoriesByInstallationId(installationId: string): Promise<Repository[]> {
  return await db.repository.findMany({
    where: { installationId },
    include: {
      user: true,
      readmeJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateRepository(githubId: number, data: UpdateRepositoryData): Promise<Repository> {
  return await db.repository.update({
    where: { githubId },
    data,
  });
}

export async function deleteRepository(githubId: number): Promise<void> {
  await db.repository.delete({
    where: { githubId },
  });
}

export async function searchRepositories(userId: string, query: string, language?: string): Promise<Repository[]> {
  return await db.repository.findMany({
    where: {
      userId,
      AND: [
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { fullName: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        language ? { language } : {},
      ],
    },
    include: {
      installation: true,
      readmeJobs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}
