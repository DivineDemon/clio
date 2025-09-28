import { db } from "@/server/db";
import type { GitHubInstallation } from "@prisma/client";

export interface CreateInstallationData {
	installationId: number;
	accountId: number;
	accountLogin: string;
	accountType: string;
	targetType: string;
	permissions: Record<string, string>;
	events: string[];
	userId: string;
}

export interface UpdateInstallationData {
	permissions?: Record<string, string>;
	events?: string[];
	suspendedAt?: Date | null;
	suspendedBy?: number | null;
	suspendedByLogin?: string | null;
}

export async function createInstallation(
	data: CreateInstallationData,
): Promise<GitHubInstallation> {
	return await db.gitHubInstallation.create({
		data: {
			installationId: data.installationId,
			accountId: data.accountId,
			accountLogin: data.accountLogin,
			accountType: data.accountType,
			targetType: data.targetType,
			permissions: data.permissions,
			events: data.events,
			userId: data.userId,
		},
	});
}

export async function getInstallationByInstallationId(
	installationId: number,
): Promise<GitHubInstallation | null> {
	return await db.gitHubInstallation.findUnique({
		where: { installationId },
		include: {
			user: true,
			repositories: true,
		},
	});
}

export async function getInstallationsByUserId(
	userId: string,
): Promise<GitHubInstallation[]> {
	return await db.gitHubInstallation.findMany({
		where: { userId },
		include: {
			repositories: true,
		},
		orderBy: { createdAt: "desc" },
	});
}

export async function updateInstallation(
	installationId: number,
	data: UpdateInstallationData,
): Promise<GitHubInstallation> {
	return await db.gitHubInstallation.update({
		where: { installationId },
		data,
	});
}

export async function deleteInstallation(
	installationId: number,
): Promise<void> {
	await db.gitHubInstallation.delete({
		where: { installationId },
	});
}

export async function isInstallationActive(
	installationId: number,
): Promise<boolean> {
	const installation = await db.gitHubInstallation.findUnique({
		where: { installationId },
		select: { suspendedAt: true },
	});

	return installation !== null && installation.suspendedAt === null;
}
