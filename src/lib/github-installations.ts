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
		const { data: installations } =
			await octokitApp.rest.apps.listInstallations();
		return installations as GitHubInstallation[];
	} catch (error) {
		console.error("Failed to fetch app installations:", error);
		throw new Error("Failed to fetch GitHub App installations");
	}
}

export async function findUserInstallation(
	userId: string,
): Promise<GitHubInstallation | null> {
	try {
		const installations = await getAppInstallations();

		// For now, we'll return the first installation
		// In a more sophisticated implementation, we'd match by user ID
		// This would require additional GitHub API calls to get user details
		return installations.length > 0 ? (installations[0] ?? null) : null;
	} catch (error) {
		console.error("Failed to find user installation:", error);
		return null;
	}
}
