import { octokitApp } from "@/lib/github";
import { logger } from "@/lib/logger";

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
    logger.debug("Fetching app installations from GitHub");
    const { data: installations } = await octokitApp.rest.apps.listInstallations();
    logger.debug("Found installations", {
      count: installations.length,
      installations: installations.map((i) => ({
        id: i.id,
        account: i.account?.login,
      })),
    });
    return installations as GitHubInstallation[];
  } catch (error) {
    logger.error("Failed to fetch app installations", error as Error);
    throw new Error(
      `Failed to fetch GitHub App installations: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function findUserInstallation(userId: string): Promise<GitHubInstallation | null> {
  try {
    logger.debug("Finding GitHub installation for user", { userId });
    const installations = await getAppInstallations();

    const result = installations.length > 0 ? (installations[0] ?? null) : null;
    logger.debug("Found installation for user", {
      userId,
      installation: result ? { id: result.id, account: result.account.login } : null,
    });
    return result;
  } catch (error) {
    logger.error("Failed to find user installation", error as Error, {
      userId,
    });
    return null;
  }
}
