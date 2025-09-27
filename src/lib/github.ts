import { env } from "@/env";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

const APP_ID = Number(env.GITHUB_APP_ID);
const PRIVATE_KEY = env.GITHUB_PRIVATE_KEY;

const octokitApp = new Octokit({
	authStrategy: createAppAuth,
	auth: {
		appId: APP_ID,
		privateKey: PRIVATE_KEY,
	},
});

export async function getRepoInstallation(owner: string, repo: string) {
	try {
		const { data } = await octokitApp.rest.apps.getRepoInstallation({
			owner,
			repo,
		});
		return data.id;
	} catch (error) {
		console.error(`Failed to get installation for ${owner}/${repo}:`, error);
		return null;
	}
}

export async function getInstallationToken(installationId: number) {
	try {
		const auth = createAppAuth({
			appId: APP_ID,
			privateKey: PRIVATE_KEY,
		});

		const installationAuth = await auth({
			type: "installation",
			installationId,
		});

		return installationAuth.token;
	} catch (error) {
		console.error(
			`Failed to get installation token for ${installationId}:`,
			error,
		);
		return null;
	}
}

export async function createInstallationOctokit(owner: string, repo: string) {
	const installationId = await getRepoInstallation(owner, repo);
	if (!installationId) {
		throw new Error(`GitHub App not installed on ${owner}/${repo}`);
	}

	const token = await getInstallationToken(installationId);
	if (!token) {
		throw new Error(`Failed to get access token for ${owner}/${repo}`);
	}

	return new Octokit({ auth: token });
}

export async function isAppInstalled(
	owner: string,
	repo: string,
): Promise<boolean> {
	const installationId = await getRepoInstallation(owner, repo);
	return installationId !== null;
}

export function getInstallationUrl(owner?: string) {
	const baseUrl = "https://github.com/apps/clio/installations/new";
	return owner ? `${baseUrl}?target=${owner}` : baseUrl;
}

export function verifyWebhookSignature(
	payload: string,
	signature: string,
): boolean {
	// TODO: Implement webhook signature verification
	// For now, return true (implement proper verification later)
	return true;
}
