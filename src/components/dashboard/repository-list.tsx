"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import {
	Calendar,
	Clock,
	ExternalLink,
	Eye,
	Filter,
	GitBranch,
	GitFork,
	RefreshCw,
	Search,
	Star,
	Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RepositoryList() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const [filters, setFilters] = useState({
		language: "all",
		privacy: "all",
		sortBy: "name",
	});
	const [selectedRepo, setSelectedRepo] = useState<{
		id: string;
		name: string;
		fullName: string;
		owner: string;
		description?: string | null;
		isPrivate: boolean;
		language?: string | null;
		topics: string[];
		stargazersCount: number;
		forksCount: number;
		watchersCount: number;
		openIssuesCount: number;
		size: number;
		defaultBranch: string;
		pushedAt?: Date | null;
		githubCreatedAt: Date;
		githubUpdatedAt: Date;
	} | null>(null);

	// Check if GitHub App is installed
	const {
		data: installationStatus,
		isLoading: isCheckingInstallation,
		refetch: refetchInstallation,
	} = api.github.checkUserInstallation.useQuery();

	// Get user's repositories
	const {
		data: repositories,
		isLoading: isLoadingRepos,
		refetch: refetchRepos,
	} = api.github.getUserRepositories.useQuery(undefined, {
		enabled: installationStatus?.installed ?? false,
	});

	// Sync installation mutation
	const syncInstallation = api.github.syncInstallation.useMutation({
		onSuccess: (data) => {
			toast.success("Sync successful");
			refetchInstallation();
			refetchRepos();
		},
		onError: (error) => {
			console.error("Sync failed:", error);
			alert(`Sync failed: ${error.message}`);
		},
	});

	// Generate README mutation
	const generateReadme = api.readme.generate.useMutation({
		onSuccess: (data) => {
			toast.success("README generation started!", {
				description: `Job ID: ${data.jobId}`,
			});
		},
		onError: (error) => {
			toast.error("Failed to start README generation", {
				description: error.message,
			});
		},
	});

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refetchRepos();
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleSyncInstallation = async () => {
		if (!installationStatus?.installationId) {
			alert("No installation ID found");
			return;
		}

		console.log(
			"Starting sync for installation ID:",
			installationStatus.installationId,
		);
		setIsSyncing(true);
		try {
			const result = await syncInstallation.mutateAsync({
				installationId: installationStatus.installationId.toString(),
			});
			console.log("Sync completed successfully:", result);
		} catch (error) {
			console.error("Sync error:", error);
		} finally {
			setIsSyncing(false);
		}
	};

	const handleGenerateReadme = async (repositoryId: string) => {
		try {
			await generateReadme.mutateAsync({
				repositoryId,
			});
		} catch (error) {
			console.error("Generate README error:", error);
		}
	};

	const filteredRepositories =
		repositories
			?.filter((repo) => {
				// Search filter
				const matchesSearch =
					repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					repo.description?.toLowerCase().includes(searchQuery.toLowerCase());

				// Language filter
				const matchesLanguage =
					filters.language === "all" || repo.language === filters.language;

				// Privacy filter
				const matchesPrivacy =
					filters.privacy === "all" ||
					(filters.privacy === "public" && !repo.isPrivate) ||
					(filters.privacy === "private" && repo.isPrivate);

				return matchesSearch && matchesLanguage && matchesPrivacy;
			})
			?.sort((a, b) => {
				switch (filters.sortBy) {
					case "name":
						return a.name.localeCompare(b.name);
					case "stars":
						return b.stargazersCount - a.stargazersCount;
					case "forks":
						return b.forksCount - a.forksCount;
					case "updated":
						return (
							new Date(b.githubUpdatedAt).getTime() -
							new Date(a.githubUpdatedAt).getTime()
						);
					case "created":
						return (
							new Date(b.githubCreatedAt).getTime() -
							new Date(a.githubCreatedAt).getTime()
						);
					default:
						return 0;
				}
			}) ?? [];

	if (isCheckingInstallation) {
		return (
			<div className="rounded-lg bg-white shadow dark:bg-slate-800">
				<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
					<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
						Your Repositories
					</h2>
				</div>
				<div className="p-6">
					<div className="py-12 text-center">
						<RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
						<p className="mt-4 text-gray-600 dark:text-gray-300">
							Checking GitHub App installation...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!installationStatus?.installed) {
		return (
			<div className="rounded-lg bg-white shadow dark:bg-slate-800">
				<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
					<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
						Your Repositories
					</h2>
				</div>
				<div className="p-6">
					<div className="py-12 text-center">
						<GitBranch className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
							GitHub App Not Installed
						</h3>
						<p className="mt-2 text-gray-600 dark:text-gray-300">
							Install the Clio GitHub App to access your repositories and start
							generating READMEs.
						</p>
						<div className="mt-6">
							<Button asChild>
								<a
									href="/api/github/install"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center"
								>
									<GitBranch className="mr-2 h-4 w-4" />
									Install GitHub App
									<ExternalLink className="ml-2 h-4 w-4" />
								</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show sync button if installation is detected but not synced
	if (installationStatus?.needsSync) {
		return (
			<div className="rounded-lg bg-white shadow dark:bg-slate-800">
				<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
					<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
						Your Repositories
					</h2>
				</div>
				<div className="p-6">
					<div className="py-12 text-center">
						<GitBranch className="mx-auto h-12 w-12 text-green-500" />
						<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
							{installationStatus.source === "github"
								? "GitHub App Detected!"
								: "Sync Required"}
						</h3>
						<p className="mt-2 text-gray-600 dark:text-gray-300">
							{installationStatus.source === "github"
								? `We found your GitHub App installation for ${installationStatus.accountLogin}. Click below to sync your repositories.`
								: "Your GitHub App is installed but repositories need to be synced. Click below to fetch your repositories."}
						</p>
						<div className="mt-6">
							<Button
								onClick={handleSyncInstallation}
								disabled={isSyncing}
								className="inline-flex items-center"
							>
								<RefreshCw
									className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
								/>
								{isSyncing ? "Syncing..." : "Sync Repositories"}
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg bg-white shadow dark:bg-slate-800">
			<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
						Your Repositories
					</h2>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={isRefreshing}
						>
							<RefreshCw
								className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					</div>
				</div>
			</div>

			<div className="p-6">
				{/* Search and Filter */}
				<div className="mb-6 flex items-center space-x-4">
					<div className="flex-1">
						<div className="relative">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search repositories..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full rounded-md border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-slate-700 dark:text-white"
							/>
						</div>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-4 w-4" />
								Filter
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>Filter by Language</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuCheckboxItem
								checked={filters.language === "all"}
								onCheckedChange={() =>
									setFilters({ ...filters, language: "all" })
								}
							>
								All Languages
							</DropdownMenuCheckboxItem>
							{Array.from(
								new Set(
									repositories?.map((repo) => repo.language).filter(Boolean),
								),
							).map((language) => (
								<DropdownMenuCheckboxItem
									key={language}
									checked={filters.language === language}
									onCheckedChange={() =>
										setFilters({ ...filters, language: language || "all" })
									}
								>
									{language}
								</DropdownMenuCheckboxItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Filter by Privacy</DropdownMenuLabel>
							<DropdownMenuCheckboxItem
								checked={filters.privacy === "all"}
								onCheckedChange={() =>
									setFilters({ ...filters, privacy: "all" })
								}
							>
								All Repositories
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={filters.privacy === "public"}
								onCheckedChange={() =>
									setFilters({ ...filters, privacy: "public" })
								}
							>
								Public Only
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={filters.privacy === "private"}
								onCheckedChange={() =>
									setFilters({ ...filters, privacy: "private" })
								}
							>
								Private Only
							</DropdownMenuCheckboxItem>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Sort by</DropdownMenuLabel>
							<DropdownMenuCheckboxItem
								checked={filters.sortBy === "name"}
								onCheckedChange={() =>
									setFilters({ ...filters, sortBy: "name" })
								}
							>
								Name
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={filters.sortBy === "stars"}
								onCheckedChange={() =>
									setFilters({ ...filters, sortBy: "stars" })
								}
							>
								Stars
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={filters.sortBy === "forks"}
								onCheckedChange={() =>
									setFilters({ ...filters, sortBy: "forks" })
								}
							>
								Forks
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={filters.sortBy === "updated"}
								onCheckedChange={() =>
									setFilters({ ...filters, sortBy: "updated" })
								}
							>
								Last Updated
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={filters.sortBy === "created"}
								onCheckedChange={() =>
									setFilters({ ...filters, sortBy: "created" })
								}
							>
								Date Created
							</DropdownMenuCheckboxItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Repository List */}
				{isLoadingRepos ? (
					<div className="py-12 text-center">
						<RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
						<p className="mt-4 text-gray-600 dark:text-gray-300">
							Loading repositories...
						</p>
					</div>
				) : filteredRepositories.length === 0 ? (
					<div className="py-12 text-center">
						<GitBranch className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
							{searchQuery
								? "No repositories found"
								: "No repositories available"}
						</h3>
						<p className="mt-2 text-gray-600 dark:text-gray-300">
							{searchQuery
								? "Try adjusting your search terms"
								: "No repositories are accessible through the GitHub App"}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredRepositories.map((repo) => (
							<div
								key={repo.id}
								className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-700"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center space-x-2">
											<h3 className="font-semibold text-gray-900 dark:text-white">
												{repo.name}
											</h3>
											{repo.isPrivate && (
												<span className="rounded-full bg-gray-100 px-2 py-1 text-gray-600 text-xs dark:bg-gray-700 dark:text-gray-300">
													Private
												</span>
											)}
										</div>
										{repo.description && (
											<p className="mt-1 text-gray-600 text-sm dark:text-gray-300">
												{repo.description}
											</p>
										)}
										<div className="mt-2 flex items-center space-x-4 text-gray-500 text-sm dark:text-gray-400">
											{repo.language && (
												<span className="flex items-center">
													<div className="mr-1 h-3 w-3 rounded-full bg-blue-500" />
													{repo.language}
												</span>
											)}
											<span className="flex items-center">
												<Star className="mr-1 h-4 w-4" />
												{repo.stargazersCount}
											</span>
											<span className="flex items-center">
												<GitFork className="mr-1 h-4 w-4" />
												{repo.forksCount}
											</span>
											<span className="flex items-center">
												<Eye className="mr-1 h-4 w-4" />
												{repo.watchersCount}
											</span>
											<span className="flex items-center">
												<Clock className="mr-1 h-4 w-4" />
												{repo.pushedAt
													? new Date(repo.pushedAt).toLocaleDateString()
													: "Never"}
											</span>
										</div>
									</div>
									<div className="ml-4 flex space-x-2">
										<Dialog>
											<DialogTrigger asChild>
												<Button
													size="sm"
													variant="outline"
													onClick={() => setSelectedRepo(repo)}
												>
													View Details
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-2xl">
												<DialogHeader>
													<DialogTitle className="flex items-center space-x-2">
														<GitBranch className="h-5 w-5" />
														<span>{repo.name}</span>
														{repo.isPrivate ? (
															<span className="rounded-full bg-red-100 px-2 py-1 text-red-800 text-xs dark:bg-red-900 dark:text-red-300">
																Private
															</span>
														) : (
															<span className="rounded-full bg-green-100 px-2 py-1 text-green-800 text-xs dark:bg-green-900 dark:text-green-300">
																Public
															</span>
														)}
													</DialogTitle>
													<DialogDescription>
														{repo.fullName} • {repo.owner}
													</DialogDescription>
												</DialogHeader>
												<div className="space-y-4">
													{repo.description && (
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Description
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{repo.description}
															</p>
														</div>
													)}

													<div className="grid grid-cols-2 gap-4">
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Language
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{repo.language || "Not specified"}
															</p>
														</div>
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Default Branch
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{repo.defaultBranch}
															</p>
														</div>
													</div>

													<div className="grid grid-cols-2 gap-4">
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Size
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{Math.round(repo.size / 1024)} MB
															</p>
														</div>
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Open Issues
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{repo.openIssuesCount}
															</p>
														</div>
													</div>

													<div className="grid grid-cols-2 gap-4">
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Created
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{new Date(
																	repo.githubCreatedAt,
																).toLocaleDateString()}
															</p>
														</div>
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Last Updated
															</h4>
															<p className="text-gray-600 text-sm dark:text-gray-300">
																{new Date(
																	repo.githubUpdatedAt,
																).toLocaleDateString()}
															</p>
														</div>
													</div>

													{repo.topics && repo.topics.length > 0 && (
														<div>
															<h4 className="font-medium text-gray-900 text-sm dark:text-white">
																Topics
															</h4>
															<div className="mt-2 flex flex-wrap gap-2">
																{repo.topics.map((topic: string) => (
																	<span
																		key={topic}
																		className="rounded-full bg-blue-100 px-2 py-1 text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-300"
																	>
																		{topic}
																	</span>
																))}
															</div>
														</div>
													)}

													<div className="flex items-center justify-between pt-4">
														<div className="flex items-center space-x-6 text-gray-500 text-sm dark:text-gray-400">
															<span className="flex items-center">
																<Star className="mr-1 h-4 w-4" />
																{repo.stargazersCount} stars
															</span>
															<span className="flex items-center">
																<GitFork className="mr-1 h-4 w-4" />
																{repo.forksCount} forks
															</span>
															<span className="flex items-center">
																<Eye className="mr-1 h-4 w-4" />
																{repo.watchersCount} watchers
															</span>
														</div>
														<Button
															size="sm"
															onClick={() => {
																window.open(
																	`https://github.com/${repo.fullName}`,
																	"_blank",
																);
															}}
														>
															<ExternalLink className="mr-2 h-4 w-4" />
															View on GitHub
														</Button>
													</div>
												</div>
											</DialogContent>
										</Dialog>
										<Button
											size="sm"
											onClick={() => handleGenerateReadme(repo.id)}
											disabled={generateReadme.isPending}
										>
											{generateReadme.isPending
												? "Generating..."
												: "Generate README"}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
