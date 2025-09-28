"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, GitBranch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function InstallGithubAppButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleInstall = async () => {
		setIsLoading(true);
		toast.loading("Opening GitHub App installation...", {
			id: "github-app-install",
		});
		try {
			// Open the installation URL in a new tab
			window.open("/api/github/install", "_blank", "noopener,noreferrer");
			toast.dismiss("github-app-install");
			toast.success(
				"Installation page opened! Complete the installation and return to sync your repositories.",
			);
		} catch (error) {
			console.error("Failed to open installation page:", error);
			toast.dismiss("github-app-install");
			toast.error("Failed to open installation page. Please try again.");
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
