import { octokitApp } from "@/lib/github";

export interface GitHubInstallation {
	id: number;
	account: {
		id: number;
		login: string;
		type: "User" | "Organization";
	};
	target_type: "User" | "Organization";
	permissions: Record<string, string>;
	events: string[];
	created_at: string;
	updated_at: string;
}

export async function getAppInstallations(): Promise<GitHubInstallation[]> {
	try {
		console.log("Fetching app installations from GitHub...");
		const { data: installations } =
			await octokitApp.rest.apps.listInstallations();
		console.log(
			`Found ${installations.length} installations:`,
			installations.map((i) => ({ id: i.id, account: i.account?.login })),
		);
		return installations as GitHubInstallation[];
	} catch (error) {
		console.error("Failed to fetch app installations:", error);
		if (error instanceof Error) {
			console.error("Error details:", error.message);
		}
		throw new Error(
			`Failed to fetch GitHub App installations: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		);
	}
}

export async function findUserInstallation(
	userId: string,
	githubUsername?: string,
): Promise<GitHubInstallation | null> {
	try {
		const installations = await getAppInstallations();

		// If we have the GitHub username, match by account login
		if (githubUsername) {
			const userInstallation = installations.find(
				(installation) => installation.account.login === githubUsername,
			);
			if (userInstallation) {
				console.log(
					`Found installation for user ${githubUsername}:`,
					userInstallation.id,
				);
				return userInstallation;
			}
		}

		// Fallback: return the first installation if no username match
		// This handles cases where the user might have multiple accounts
		console.log(
			`No specific installation found for ${githubUsername}, using first available`,
		);
		return installations.length > 0 ? (installations[0] ?? null) : null;
	} catch (error) {
		console.error("Failed to find user installation:", error);
		return null;
	}
}
