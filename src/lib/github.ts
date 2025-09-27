import { env } from "@/env";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

const APP_ID = Number(env.GITHUB_APP_ID);

let PRIVATE_KEY: string;
try {
  // Log the raw private key for debugging (first 100 chars only)
  console.log(
    "Raw private key (first 100 chars):",
    env.GITHUB_PRIVATE_KEY.substring(0, 100)
  );
  console.log(
    "Raw private key contains \\n:",
    env.GITHUB_PRIVATE_KEY.includes("\\n")
  );

  // Try multiple formatting approaches
  let formattedKey = env.GITHUB_PRIVATE_KEY;

  // Approach 1: Replace literal \n with actual newlines
  formattedKey = formattedKey.replace(/\\n/g, "\n");

  // Approach 2: If that didn't work, try replacing with actual line breaks
  if (!formattedKey.includes("\n")) {
    formattedKey = env.GITHUB_PRIVATE_KEY.replace(/\\\\n/g, "\n");
  }

  // Approach 3: If still no newlines, add them manually based on typical RSA key structure
  if (!formattedKey.includes("\n")) {
    // This is a fallback - manually format a typical RSA private key
    const keyContent = env.GITHUB_PRIVATE_KEY.replace(
      /-----BEGIN RSA PRIVATE KEY-----/,
      ""
    )
      .replace(/-----END RSA PRIVATE KEY-----/, "")
      .replace(/\s/g, "");

    // Split into 64-character lines (typical RSA key format)
    const lines = [];
    for (let i = 0; i < keyContent.length; i += 64) {
      lines.push(keyContent.substring(i, i + 64));
    }

    formattedKey = `-----BEGIN RSA PRIVATE KEY-----\n${lines.join(
      "\n"
    )}\n-----END RSA PRIVATE KEY-----`;
  }

  PRIVATE_KEY = formattedKey;

  console.log(
    "Formatted private key (first 100 chars):",
    PRIVATE_KEY.substring(0, 100)
  );
  console.log(
    "Formatted private key contains actual newlines:",
    PRIVATE_KEY.includes("\n")
  );

  if (!PRIVATE_KEY.includes("BEGIN") || !PRIVATE_KEY.includes("END")) {
    throw new Error("Invalid private key format - missing BEGIN/END markers");
  }
} catch (error) {
  console.error("Private key formatting error:", error);
  throw new Error(
    `Failed to format GitHub private key: ${
      error instanceof Error ? error.message : "Unknown error"
    }`
  );
}

if (env.NODE_ENV === "development") {
  console.log("GitHub App ID:", APP_ID);
  console.log("Private key starts with:", `${PRIVATE_KEY.substring(0, 50)}...`);
  console.log(
    "Private key ends with:",
    `...${PRIVATE_KEY.substring(PRIVATE_KEY.length - 50)}`
  );
}

// Create Octokit instance with multiple fallback approaches
let octokitApp: Octokit;
let lastError: Error | null = null;

// Approach 1: Try with the formatted key
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

  // Approach 2: Try with the raw key
  try {
    console.log("Attempting to create Octokit with raw key...");
    octokitApp = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: APP_ID,
        privateKey: env.GITHUB_PRIVATE_KEY,
      },
    });
    console.log("✅ Octokit created successfully with raw key");
  } catch (error2) {
    console.error("❌ Failed with raw key:", (error2 as Error).message);

    // Approach 3: Try with a minimal test
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
    } catch (error3) {
      console.error("❌ All approaches failed. Last error:", lastError.message);
      console.error("Private key length:", PRIVATE_KEY.length);
      console.error("App ID:", APP_ID);
      console.error("Environment check:", {
        hasPrivateKey: !!env.GITHUB_PRIVATE_KEY,
        privateKeyLength: env.GITHUB_PRIVATE_KEY?.length,
        appId: env.GITHUB_APP_ID,
      });

      throw new Error(
        `Failed to initialize GitHub App after trying multiple approaches. Last error: ${
          lastError?.message || "Unknown error"
        }`
      );
    }
  }
}

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
	// TODO: Implement webhook signature verification
	// For now, return true (implement proper verification later)
	return true;
}
