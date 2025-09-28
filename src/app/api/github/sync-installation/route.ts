import { auth } from "@/lib/auth";
import { findUserInstallation } from "@/lib/github-installations";
import {
	fetchInstallationDetails,
	getInstallationRepositories,
} from "@/lib/services/github-api";
import {
	createInstallation,
	getInstallationByInstallationId,
} from "@/lib/services/github-installation";
import { createRepository } from "@/lib/services/repository";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Find the user's GitHub installation
		const githubInstallation = await findUserInstallation(session.user.id);
		if (!githubInstallation) {
			return NextResponse.json(
				{ error: "No GitHub App installation found" },
				{ status: 404 },
			);
		}

		const installationId = githubInstallation.id;

		// Check if installation already exists in our database
		const existingInstallation =
			await getInstallationByInstallationId(installationId);

		if (existingInstallation) {
			return NextResponse.json({
				message: "Installation already exists in database",
				installationId: existingInstallation.installationId,
				accountLogin: existingInstallation.accountLogin,
			});
		}

		// Fetch installation details from GitHub
		console.log(
			`Syncing installation ${installationId} for user ${session.user.id}...`,
		);
		const installationDetails = await fetchInstallationDetails(
			installationId,
			"dummy-owner",
			"dummy-repo",
		);

		if (!installationDetails) {
			return NextResponse.json(
				{ error: "Failed to fetch installation details from GitHub" },
				{ status: 404 },
			);
		}

		// Create installation in our database
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

		// Fetch and create repositories
		console.log(`Fetching repositories for installation ${installationId}...`);
		const repositories = await getInstallationRepositories(
			installationId,
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
					installationId: installationId.toString(),
				});
				createdRepos++;
			} catch (error) {
				console.log(`Repository ${repo.fullName} already exists, skipping`);
			}
		}

		console.log(
			`Successfully synced installation ${installationId} for ${installationDetails.accountLogin} with ${createdRepos} repositories`,
		);

		return NextResponse.json({
			message: "Installation synced successfully",
			installationId: installationDetails.id,
			accountLogin: installationDetails.accountLogin,
			repositoryCount: createdRepos,
		});
	} catch (error) {
		console.error("Error syncing installation:", error);
		return NextResponse.json(
			{ error: "Failed to sync installation" },
			{ status: 500 },
		);
	}
}
