import {
	fetchInstallationDetails,
	getInstallationRepositories,
} from "@/lib/services/github-api";
import {
	createInstallation,
	getInstallationByInstallationId,
	updateInstallation,
} from "@/lib/services/github-installation";
import { createRepository } from "@/lib/services/repository";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const installationId = url.searchParams.get("installation_id");
		const setupAction = url.searchParams.get("setup_action");

		// Handle different setup actions
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
					console.log(
						`Unknown setup action: ${setupAction} for installation: ${installationIdNum}`,
					);
					break;
			}
		}

		// Redirect to the main application dashboard
		return NextResponse.redirect(new URL("/", request.url));
	} catch (error) {
		console.error("Setup endpoint error:", error);
		return NextResponse.redirect(new URL("/", request.url));
	}
}

async function handleInstallation(installationId: number) {
	try {
		// Check if installation already exists
		const existingInstallation =
			await getInstallationByInstallationId(installationId);
		if (existingInstallation) {
			console.log(
				`Installation ${installationId} already exists, skipping creation`,
			);
			return;
		}

		console.log(`Fetching installation details for ${installationId}...`);

		// Fetch complete installation details from GitHub API
		// We need a repository to make the API call, so we'll use a dummy one
		// The actual account login will be determined from the API response
		const installationDetails = await fetchInstallationDetails(
			installationId,
			"dummy-owner", // This will be overridden by the API response
			"dummy-repo",
		);

		if (!installationDetails) {
			console.error(
				`Failed to fetch installation details for ${installationId}`,
			);
			return;
		}

		// Create installation in database with complete details
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

		// Fetch and store all repositories for this installation
		const repositories = await getInstallationRepositories(
			installationId,
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
				installationId: installationId.toString(),
			});
		}

		console.log(
			`Successfully created installation ${installationId} for ${installationDetails.accountLogin} with ${repositories.length} repositories`,
		);
	} catch (error) {
		console.error(`Error handling installation ${installationId}:`, error);
		throw error;
	}
}

async function handleInstallationUpdate(installationId: number) {
	try {
		// Check if installation exists
		const existingInstallation =
			await getInstallationByInstallationId(installationId);
		if (!existingInstallation) {
			console.log(
				`Installation ${installationId} not found, creating new installation`,
			);
			await handleInstallation(installationId);
			return;
		}

		console.log(`Updating installation ${installationId}...`);

		// Fetch updated installation details from GitHub API
		const installationDetails = await fetchInstallationDetails(
			installationId,
			existingInstallation.accountLogin,
			"dummy-repo",
		);

		if (!installationDetails) {
			console.error(
				`Failed to fetch updated installation details for ${installationId}`,
			);
			return;
		}

		// Update installation with latest details
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

		// Fetch and update all repositories for this installation
		const repositories = await getInstallationRepositories(
			installationId,
			installationDetails.accountLogin,
			"dummy-repo",
		);

		// Update existing repositories and add new ones
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
			} catch (error) {
				// Repository might already exist, which is fine
				console.log(
					`Repository ${repo.fullName} already exists, skipping creation`,
				);
			}
		}

		console.log(
			`Successfully updated installation ${installationId} for ${installationDetails.accountLogin} with ${repositories.length} repositories`,
		);
	} catch (error) {
		console.error(
			`Error handling installation update ${installationId}:`,
			error,
		);
		throw error;
	}
}

export async function POST(request: NextRequest) {
	// Handle POST requests (webhook events might POST here)
	return GET(request);
}
