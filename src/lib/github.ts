import { readFileSync } from "node:fs";
import { join } from "node:path";
import { env } from "@/env";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

const APP_ID = Number(env.GITHUB_APP_ID);
let PRIVATE_KEY: string;

try {
	console.log("📁 Reading private key from file...");
	const privateKeyPath = join(
		process.cwd(),
		"src",
		"lib",
		"github-private-key.pem",
	);
	PRIVATE_KEY = readFileSync(privateKeyPath, "utf8").trim();
	console.log("✅ Private key loaded from file");

	console.log("📁 Private key length:", PRIVATE_KEY.length);
	console.log(
		"📁 Private key starts with:",
		`${PRIVATE_KEY.substring(0, 50)}...`,
	);
	console.log(
		"📁 Private key ends with:",
		`...${PRIVATE_KEY.substring(PRIVATE_KEY.length - 50)}`,
	);

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

	console.log("✅ Private key format validation passed");
} catch (error) {
	console.error("❌ Failed to load private key:", error);
	throw new Error(
		`Failed to load GitHub private key: ${
			error instanceof Error ? error.message : "Unknown error"
		}`,
	);
}

function validatePrivateKey(key: string): boolean {
	try {
		if (!key.includes("-----BEGIN RSA PRIVATE KEY-----")) {
			console.error("❌ Missing BEGIN header");
			return false;
		}
		if (!key.includes("-----END RSA PRIVATE KEY-----")) {
			console.error("❌ Missing END header");
			return false;
		}

		if (!key.includes("\n")) {
			console.error("❌ No newlines found");
			return false;
		}

		if (key.length < 1600) {
			console.error(`❌ Key too short: ${key.length} chars`);
			return false;
		}

		try {
			const testAuth = createAppAuth({
				appId: 12345,
				privateKey: key,
			});
			console.log("✅ Private key format validation passed");
			return true;
		} catch (testError) {
			console.error(
				"❌ Private key format validation failed:",
				(testError as Error).message,
			);
			return false;
		}
	} catch (error) {
		console.error("❌ Private key validation error:", error);
		return false;
	}
}

if (env.NODE_ENV === "development") {
	console.log("GitHub App ID:", APP_ID);
	console.log("Private key starts with:", `${PRIVATE_KEY.substring(0, 50)}...`);
	console.log(
		"Private key ends with:",
		`...${PRIVATE_KEY.substring(PRIVATE_KEY.length - 50)}`,
	);
	console.log(
		"Private key validation:",
		validatePrivateKey(PRIVATE_KEY) ? "✅ PASSED" : "❌ FAILED",
	);
}

let octokitApp: Octokit;
let lastError: Error | null = null;

try {
	console.log("Attempting to create Octokit with formatted key...");
	octokitApp = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: APP_ID,
			privateKey: PRIVATE_KEY,
		},
	});
	console.log("✅ Octokit created successfully with formatted key");
} catch (error) {
	lastError = error as Error;
	console.error("❌ Failed with formatted key:", lastError.message);

	try {
		console.log("Attempting minimal Octokit creation...");
		octokitApp = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: APP_ID,
				privateKey:
					"-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----",
			},
		});
		console.log("✅ Octokit created successfully with test key");
	} catch (error2) {
		console.error("❌ All approaches failed. Last error:", lastError.message);
		console.error("Private key length:", PRIVATE_KEY.length);
		console.error("App ID:", APP_ID);
		console.error("File check:", {
			privateKeyLength: PRIVATE_KEY?.length,
			appId: env.GITHUB_APP_ID,
		});

		throw new Error(
			`Failed to initialize GitHub App after trying multiple approaches. Last error: ${
				lastError?.message || "Unknown error"
			}`,
		);
	}
}

export async function getRepoInstallation(owner: string, repo: string) {
	try {
		console.log(`🔍 Attempting to get installation for ${owner}/${repo}...`);
		console.log(`🔍 Using App ID: ${APP_ID}`);
		console.log(`🔍 Private key length: ${PRIVATE_KEY.length}`);

		const { data } = await octokitApp.rest.apps.getRepoInstallation({
			owner,
			repo,
		});

		console.log(`✅ Successfully got installation ID: ${data.id}`);
		return data.id;
	} catch (error) {
		console.error(`❌ Failed to get installation for ${owner}/${repo}:`, error);
		console.error("❌ Error details:", {
			message: (error as Error).message,
			code: (error as Error & { code?: string }).code,
			status: (error as Error & { status?: number }).status,
		});
		return null;
	}
}

export async function getInstallationToken(installationId: number) {
	try {
		console.log(
			`🔑 Attempting to get installation token for ID: ${installationId}`,
		);
		console.log(`🔑 Using App ID: ${APP_ID}`);
		console.log(`🔑 Private key preview: ${PRIVATE_KEY.substring(0, 50)}...`);

		const auth = createAppAuth({
			appId: APP_ID,
			privateKey: PRIVATE_KEY,
		});

		console.log("🔑 Created auth instance, requesting installation token...");
		const installationAuth = await auth({
			type: "installation",
			installationId,
		});

		console.log(
			`✅ Successfully got installation token (length: ${installationAuth.token?.length})`,
		);
		return installationAuth.token;
	} catch (error) {
		console.error(
			`❌ Failed to get installation token for ${installationId}:`,
			error,
		);
		console.error("❌ Token generation error details:", {
			message: (error as Error).message,
			code: (error as Error & { code?: string }).code,
			opensslError: (error as Error & { opensslErrorStack?: unknown })
				.opensslErrorStack,
		});
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
	// TODO: Implement webhook signature verification
	// For now, return true (implement proper verification later)
	return true;
}
