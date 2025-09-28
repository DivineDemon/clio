import { getInstallationUrl, isAppInstalled } from "@/lib/github";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const owner = searchParams.get("owner");
		const repo = searchParams.get("repo");

		// If no owner/repo provided, redirect to general GitHub App installation
		if (!owner || !repo) {
			const installationUrl = await getInstallationUrl(""); // Get general installation URL
			return NextResponse.redirect(installationUrl);
		}

		const installed = await isAppInstalled(owner, repo);
		const installationUrl = await getInstallationUrl(owner);

		// If not installed, redirect to installation page
		if (!installed) {
			return NextResponse.redirect(installationUrl);
		}

		// If already installed, redirect back to dashboard
		return NextResponse.redirect(new URL("/dashboard", request.url));
	} catch (error) {
		console.error("Error checking installation status:", error);
		return NextResponse.redirect(
			new URL("/dashboard?error=installation-failed", request.url),
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { owner, repo } = await request.json();

		if (!owner || !repo) {
			return NextResponse.json(
				{ error: "Owner and repo are required" },
				{ status: 400 },
			);
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
		console.error("Error verifying installation:", error);
		return NextResponse.json(
			{ error: "Failed to verify installation" },
			{ status: 500 },
		);
	}
}
