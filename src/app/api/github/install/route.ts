import { type NextRequest, NextResponse } from "next/server";
import { getInstallationUrl, isAppInstalled } from "@/lib/github";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      const installationUrl = await getInstallationUrl("");
      return NextResponse.redirect(installationUrl);
    }

    const installed = await isAppInstalled(owner, repo);
    const installationUrl = await getInstallationUrl(owner);

    if (!installed) {
      return NextResponse.redirect(installationUrl);
    }

    return NextResponse.redirect(new URL("/repositories", request.url));
  } catch (error) {
    logger.error("Error checking installation status", error as Error);
    return NextResponse.redirect(new URL("/repositories?error=installation-failed", request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { owner, repo } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
    }

    const installed = await isAppInstalled(owner, repo);

    if (!installed) {
      const installationUrl = await getInstallationUrl(owner);
      return NextResponse.json(
        {
          error: "GitHub App not installed",
          installationUrl,
          message: `Please install the Clio GitHub App for ${owner}/${repo}`,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      message: "GitHub App is installed and ready",
      repository: `${owner}/${repo}`,
    });
  } catch (error) {
    logger.error("Error verifying installation", error as Error);
    return NextResponse.json({ error: "Failed to verify installation" }, { status: 500 });
  }
}
