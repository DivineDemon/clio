import { db } from "@/server/db";
import type { Repository } from "@prisma/client";

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

export async function createRepository(
	data: CreateRepositoryData,
): Promise<Repository> {
	return await db.repository.create({
		data: {
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

export async function getRepositoryByGithubId(
	githubId: number,
): Promise<Repository | null> {
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

export async function getRepositoriesByUserId(
	userId: string,
): Promise<Repository[]> {
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

export async function getRepositoriesByInstallationId(
	installationId: string,
): Promise<Repository[]> {
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

export async function updateRepository(
	githubId: number,
	data: UpdateRepositoryData,
): Promise<Repository> {
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

export async function searchRepositories(
	userId: string,
	query: string,
	language?: string,
): Promise<Repository[]> {
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
