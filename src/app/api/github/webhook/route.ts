import { verifyWebhookSignature } from "@/lib/github";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const signature = request.headers.get("x-hub-signature-256");

		if (!signature) {
			return NextResponse.json({ error: "Missing signature" }, { status: 401 });
		}

		const isValid = verifyWebhookSignature(body, signature);
		if (!isValid) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		const payload = JSON.parse(body);
		const event = request.headers.get("x-github-event");

		console.log(`Received GitHub webhook: ${event}`, payload);

		switch (event) {
			case "installation":
				await handleInstallationEvent(payload);
				break;
			case "installation_repositories":
				await handleInstallationRepositoriesEvent(payload);
				break;
			case "repository":
				await handleRepositoryEvent(payload);
				break;
			default:
				console.log(`Unhandled webhook event: ${event}`);
		}

		return NextResponse.json({ message: "Webhook processed successfully" });
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Failed to process webhook" },
			{ status: 500 },
		);
	}
}

interface InstallationEventPayload {
	action: string;
	installation: {
		id: number;
		account: {
			login: string;
		};
	};
}

async function handleInstallationEvent(payload: InstallationEventPayload) {
	const { action, installation } = payload;
	console.log(`Installation ${action}:`, installation);

	switch (action) {
		case "created":
			// TODO: Store installation info in database
			console.log("New installation created:", installation.id);
			break;
		case "deleted":
			// TODO: Remove installation from database
			console.log("Installation deleted:", installation.id);
			break;
		case "suspend":
			// TODO: Mark installation as suspended
			console.log("Installation suspended:", installation.id);
			break;
		case "unsuspend":
			// TODO: Mark installation as active
			console.log("Installation unsuspended:", installation.id);
			break;
	}
}

interface InstallationRepositoriesEventPayload {
	action: string;
	installation: {
		id: number;
	};
	repositories_added?: Array<{
		id: number;
		name: string;
		full_name: string;
	}>;
	repositories_removed?: Array<{
		id: number;
		name: string;
		full_name: string;
	}>;
}

async function handleInstallationRepositoriesEvent(
	payload: InstallationRepositoriesEventPayload,
) {
	const { action, installation, repositories_added, repositories_removed } =
		payload;
	console.log(`Installation repositories ${action}:`, {
		installation: installation.id,
		added: repositories_added?.length || 0,
		removed: repositories_removed?.length || 0,
	});

	// TODO: Update repository access in database
}

interface RepositoryEventPayload {
	action: string;
	repository: {
		id: number;
		name: string;
		full_name: string;
		private: boolean;
	};
}

async function handleRepositoryEvent(payload: RepositoryEventPayload) {
	const { action, repository } = payload;
	console.log(`Repository ${action}:`, repository);

	switch (action) {
		case "created":
			// TODO: Add repository to database if app is installed
			break;
		case "deleted":
			// TODO: Remove repository from database
			break;
		case "publicized":
		case "privatized":
			// TODO: Update repository visibility
			break;
	}
}
