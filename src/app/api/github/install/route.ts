import { getInstallationUrl, isAppInstalled } from "@/lib/github";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const owner = searchParams.get("owner");
		const repo = searchParams.get("repo");

		if (!owner || !repo) {
			return NextResponse.json(
				{ error: "Owner and repo parameters are required" },
				{ status: 400 },
			);
		}

		const installed = await isAppInstalled(owner, repo);
		const installationUrl = getInstallationUrl(owner);

		return NextResponse.json({
			installed,
			installationUrl,
			repository: `${owner}/${repo}`,
		});
	} catch (error) {
		console.error("Error checking installation status:", error);
		return NextResponse.json(
			{ error: "Failed to check installation status" },
			{ status: 500 },
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
