import { verifyWebhookSignature } from "@/lib/github";
import {
	fetchInstallationDetails,
	fetchRepositoryDetails,
	getInstallationRepositories,
	isRepositoryManaged,
	parseRepositoryFullName,
} from "@/lib/services/github-api";
import {
	createInstallation,
	deleteInstallation,
	updateInstallation,
} from "@/lib/services/github-installation";
import {
	createRepository,
	deleteRepository,
	updateRepository,
} from "@/lib/services/repository";
import type {
	GitHubInstallationEventPayload,
	GitHubInstallationRepositoriesEventPayload,
	GitHubRepositoryEventPayload,
} from "@/lib/types/github-webhooks";
import { type NextRequest, NextResponse } from "next/server";

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

		// Process webhook event
		switch (event) {
			case "installation":
				await handleInstallationEvent(
					payload as GitHubInstallationEventPayload,
				);
				break;
			case "installation_repositories":
				await handleInstallationRepositoriesEvent(
					payload as GitHubInstallationRepositoriesEventPayload,
				);
				break;
			case "repository":
				await handleRepositoryEvent(payload as GitHubRepositoryEventPayload);
				break;
			default:
				console.log(`Unhandled webhook event: ${event}`);
		}

		return NextResponse.json({ message: "Webhook processed successfully" });
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Failed to process webhook" },
			{ status: 500 },
		);
	}
}

async function handleInstallationEvent(
	payload: GitHubInstallationEventPayload,
) {
	const { action, installation } = payload;

	try {
		// Fetch complete installation details from GitHub API
		const installationDetails = await fetchInstallationDetails(
			installation.id,
			installation.account.login,
			"dummy-repo", // We need a repo for the API call, but we'll get the full details
		);

		if (!installationDetails) {
			console.error(
				`Failed to fetch installation details for ${installation.id}`,
			);
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

				// Fetch and store all repositories for this installation
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

				console.log(
					`Created installation ${installation.id} for ${installationDetails.accountLogin} with ${repositories.length} repositories`,
				);
				break;
			}

			case "deleted":
				await deleteInstallation(installation.id);
				console.log(`Deleted installation ${installation.id}`);
				break;

			case "suspend":
				await updateInstallation(installation.id, {
					suspendedAt: installationDetails.suspendedAt,
					suspendedBy: installationDetails.suspendedBy,
					suspendedByLogin: installationDetails.suspendedByLogin,
				});
				console.log(`Suspended installation ${installation.id}`);
				break;

			case "unsuspend":
				await updateInstallation(installation.id, {
					suspendedAt: null,
					suspendedBy: null,
					suspendedByLogin: null,
				});
				console.log(`Unsuspended installation ${installation.id}`);
				break;

			case "new_permissions_accepted":
				await updateInstallation(installation.id, {
					permissions: installationDetails.permissions,
					events: installationDetails.events,
				});
				console.log(`Updated permissions for installation ${installation.id}`);
				break;
		}
	} catch (error) {
		console.error(`Error handling installation event ${action}:`, error);
		throw error;
	}
}

async function handleInstallationRepositoriesEvent(
	payload: GitHubInstallationRepositoriesEventPayload,
) {
	const { action, installation, repositories_added, repositories_removed } =
		payload;

	try {
		// Get installation details to find the account login
		const installationDetails = await fetchInstallationDetails(
			installation.id,
			installation.account.login,
			"dummy-repo",
		);

		if (!installationDetails) {
			console.error(
				`Failed to fetch installation details for ${installation.id}`,
			);
			return;
		}

		if (repositories_added && repositories_added.length > 0) {
			// Fetch complete repository details and add to database
			for (const repo of repositories_added) {
				const repoDetails = await fetchRepositoryDetails(
					installationDetails.accountLogin,
					repo.name,
				);

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
			console.log(
				`Added ${repositories_added.length} repositories to installation ${installation.id}`,
			);
		}

		if (repositories_removed && repositories_removed.length > 0) {
			// Remove repositories from database
			for (const repo of repositories_removed) {
				await deleteRepository(repo.id);
			}
			console.log(
				`Removed ${repositories_removed.length} repositories from installation ${installation.id}`,
			);
		}
	} catch (error) {
		console.error("Error handling installation repositories event:", error);
		throw error;
	}
}

async function handleRepositoryEvent(payload: GitHubRepositoryEventPayload) {
	const { action, repository } = payload;

	try {
		// Check if this repository belongs to an installation we manage
		const { isManaged, installationId } = await isRepositoryManaged(
			repository.owner.login,
			repository.name,
		);

		if (!isManaged || !installationId) {
			console.log(
				`Repository ${repository.full_name} is not managed by our app, skipping ${action} event`,
			);
			return;
		}

		// Fetch complete repository details from GitHub API
		const repositoryDetails = await fetchRepositoryDetails(
			repository.owner.login,
			repository.name,
		);

		if (!repositoryDetails) {
			console.error(
				`Failed to fetch repository details for ${repository.full_name}`,
			);
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
				console.log(`Created repository ${repository.full_name}`);
				break;

			case "deleted":
				await deleteRepository(repository.id);
				console.log(`Deleted repository ${repository.full_name}`);
				break;

			case "publicized":
			case "privatized":
				await updateRepository(repository.id, {
					isPrivate: action === "privatized",
					githubUpdatedAt: new Date(),
				});
				console.log(
					`Updated repository ${repository.full_name} visibility: ${action}`,
				);
				break;

			case "edited":
				// Update repository with latest details
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
				console.log(`Updated repository ${repository.full_name} details`);
				break;

			case "renamed":
				// Update repository name and full name
				await updateRepository(repository.id, {
					name: repositoryDetails.name,
					fullName: repositoryDetails.fullName,
					githubUpdatedAt: repositoryDetails.githubUpdatedAt,
				});
				console.log(`Renamed repository to ${repository.full_name}`);
				break;

			case "archived":
			case "unarchived":
				// Update archived status
				await updateRepository(repository.id, {
					githubUpdatedAt: repositoryDetails.githubUpdatedAt,
				});
				console.log(`Repository ${repository.full_name} ${action}`);
				break;
		}
	} catch (error) {
		console.error(`Error handling repository event ${action}:`, error);
		throw error;
	}
}
