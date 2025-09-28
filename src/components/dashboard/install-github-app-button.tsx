"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, GitBranch } from "lucide-react";
import { useState } from "react";

export default function InstallGithubAppButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleInstall = async () => {
		setIsLoading(true);
		try {
			// Open the installation URL in a new tab
			window.open("/api/github/install", "_blank", "noopener,noreferrer");
		} catch (error) {
			console.error("Failed to open installation page:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={handleInstall}
			disabled={isLoading}
			className="inline-flex items-center"
		>
			<GitBranch className="mr-2 h-4 w-4" />
			{isLoading ? "Opening..." : "Install GitHub App"}
			<ExternalLink className="ml-2 h-4 w-4" />
		</Button>
	);
}
