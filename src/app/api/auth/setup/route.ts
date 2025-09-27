import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const installationId = url.searchParams.get("installation_id");
		const setupAction = url.searchParams.get("setup_action");

		console.log("GitHub App setup:", {
			installationId,
			setupAction,
			url: request.url,
		});

		switch (setupAction) {
			case "install":
				console.log(`GitHub App installed with ID: ${installationId}`);
				break;
			case "update":
				console.log(`GitHub App updated with ID: ${installationId}`);
				break;
			default:
				console.log(`Unknown setup action: ${setupAction}`);
		}

		// TODO: Store installation ID in database
		// For now, just redirect to the main app
		return NextResponse.redirect(new URL("/", request.url));
	} catch (error) {
		console.error("Setup endpoint error:", error);
		return NextResponse.redirect(new URL("/", request.url));
	}
}

export async function POST(request: NextRequest) {
	// Handle POST requests (webhook events might POST here)
	return GET(request);
}
