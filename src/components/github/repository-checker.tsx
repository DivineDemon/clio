"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";

interface RepositoryCheckerProps {
	owner: string;
	repo: string;
}

export default function RepositoryChecker({
	owner,
	repo,
}: RepositoryCheckerProps) {
	const [isLoading, setIsLoading] = useState(false);

	const { data: installationStatus, refetch } =
		api.github.checkInstallation.useQuery(
			{ owner, repo },
			{
				enabled: false,
			},
		);

	const handleCheckInstallation = async () => {
		setIsLoading(true);
		try {
			await refetch();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<h3 className="font-semibold text-lg">
					{owner}/{repo}
				</h3>
				<Button
					onClick={handleCheckInstallation}
					disabled={isLoading}
					variant="outline"
				>
					{isLoading ? "Checking..." : "Check Installation"}
				</Button>
			</div>
			{installationStatus && (
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<span className="font-medium">Status:</span>
						<span
							className={`rounded px-2 py-1 text-sm ${
								installationStatus.installed
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{installationStatus.installed ? "Installed" : "Not Installed"}
						</span>
					</div>
					{!installationStatus.installed && (
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">
								The Clio GitHub App is not installed on this repository.
							</p>
							<Button asChild>
								<a
									href={installationStatus.installationUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									Install Clio App
								</a>
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
