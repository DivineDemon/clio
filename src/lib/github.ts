import { readFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "@/env";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

const APP_ID = Number(env.GITHUB_APP_ID);
let PRIVATE_KEY: string;

try {
	const privateKeyPath = join(
		process.cwd(),
		"src",
		"lib",
		"github-private-key.pem",
	);
	PRIVATE_KEY = readFileSync(privateKeyPath, "utf8").trim();

	// Validate the private key format
	if (!PRIVATE_KEY.includes("-----BEGIN RSA PRIVATE KEY-----")) {
		throw new Error("Invalid private key format - missing BEGIN header");
	}
	if (!PRIVATE_KEY.includes("-----END RSA PRIVATE KEY-----")) {
		throw new Error("Invalid private key format - missing END header");
	}
	if (!PRIVATE_KEY.includes("\n")) {
		throw new Error("Invalid private key format - no newlines found");
	}
} catch (error) {
	throw new Error(
		`Failed to load GitHub private key: ${
			error instanceof Error ? error.message : "Unknown error"
		}`,
	);
}

export const octokitApp = new Octokit({
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

export async function getInstallationUrl(owner?: string) {
	try {
		const { data: app } = await octokitApp.rest.apps.getAuthenticated();

		const appSlug = app?.slug;
		if (!appSlug) {
			throw new Error("Could not get app slug from GitHub API");
		}
		const baseUrl = `https://github.com/apps/${appSlug}/installations/new`;

		return owner ? `${baseUrl}?target=${owner}` : baseUrl;
	} catch (error) {
		console.error("Failed to get GitHub App info:", error);
		const fallbackUrl =
			"https://github.com/apps/clio-muse-of-history/installations/new";
		return owner ? `${fallbackUrl}?target=${owner}` : fallbackUrl;
	}
}

export function verifyWebhookSignature(
	payload: string,
	signature: string,
): boolean {
	try {
		const secret = env.GITHUB_WEBHOOK_SECRET;
		if (!secret) {
			console.warn(
				"GITHUB_WEBHOOK_SECRET not configured, skipping verification",
			);
			return true; // Allow in development if secret not set
		}

		// GitHub sends the signature as "sha256=<hash>"
		const expectedSignature = signature.replace("sha256=", "");

		// Create HMAC hash
		const crypto = require("node:crypto");
		const hmac = crypto.createHmac("sha256", secret);
		hmac.update(payload, "utf8");
		const calculatedSignature = hmac.digest("hex");

		// Compare signatures using timing-safe comparison
		return crypto.timingSafeEqual(
			Buffer.from(expectedSignature, "hex"),
			Buffer.from(calculatedSignature, "hex"),
		);
	} catch (error) {
		console.error("Error verifying webhook signature:", error);
		return false;
	}
}
