"use client";

import GithubLogoutButton from "@/components/auth/github-logout-button";
import { Button } from "@/components/ui/button";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import { api } from "@/trpc/react";
import {
	ArrowLeft,
	BookOpen,
	CheckCircle,
	Clock,
	Copy,
	Download,
	RefreshCw,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface JobDetailsPageProps {
	jobId: string;
	user: {
		id?: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
	};
}

export default function JobDetailsPage({ jobId, user }: JobDetailsPageProps) {
	const {
		data: job,
		isLoading,
		error,
	} = api.readme.getJob.useQuery({ jobId }) as {
		data: ReadmeJobWithRelations | undefined;
		isLoading: boolean;
		error: Error | null;
	};
	const { data: latestVersion } = api.readme.getLatestVersion.useQuery({
		jobId,
	});

	const copyToClipboard = async (content: string) => {
		try {
			await navigator.clipboard.writeText(content);
			toast.success("README copied to clipboard!");
		} catch (error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const downloadReadme = (content: string, filename: string) => {
		const blob = new Blob([content], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${filename}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("README downloaded!");
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return <CheckCircle className="h-5 w-5 text-green-500" />;
			case "PROCESSING":
			case "QUEUED":
				return <Clock className="h-5 w-5 text-yellow-500" />;
			case "FAILED":
				return <XCircle className="h-5 w-5 text-red-500" />;
			default:
				return <Clock className="h-5 w-5 text-gray-500" />;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "Completed";
			case "PROCESSING":
				return "Processing";
			case "QUEUED":
				return "Queued";
			case "FAILED":
				return "Failed";
			default:
				return "Unknown";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "text-green-600 dark:text-green-400";
			case "PROCESSING":
			case "QUEUED":
				return "text-yellow-600 dark:text-yellow-400";
			case "FAILED":
				return "text-red-600 dark:text-red-400";
			default:
				return "text-gray-600 dark:text-gray-400";
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-slate-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="animate-pulse">
						<div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
						<div className="mt-4 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
						<div className="mt-8 h-96 rounded bg-gray-200 dark:bg-gray-700" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !job) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-slate-900">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="text-center">
						<XCircle className="mx-auto h-12 w-12 text-red-500" />
						<h1 className="mt-4 font-bold text-2xl text-gray-900 dark:text-white">
							Job Not Found
						</h1>
						<p className="mt-2 text-gray-600 dark:text-gray-300">
							The job you're looking for doesn't exist or you don't have access
							to it.
						</p>
						<Link href="/history">
							<Button className="mt-4">Back to History</Button>
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-slate-900">
			{/* Header */}
			<header className="border-b bg-white dark:bg-slate-800">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link href="/history">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to History
								</Button>
							</Link>
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
								<BookOpen className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="font-bold text-xl">Job Details</span>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<Image
									alt="User"
									width={32}
									height={32}
									src={user.image || ""}
									className="size-8 rounded-full"
								/>
								<span className="font-medium text-sm">
									{user.name?.split(" ")[0] || "Developer"}
								</span>
							</div>
							<GithubLogoutButton />
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Job Header */}
				<div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-slate-800">
					<div className="flex items-start justify-between">
						<div className="flex items-start space-x-4">
							{getStatusIcon(job.status)}
							<div>
								<h1 className="font-bold text-2xl text-gray-900 dark:text-white">
									{job.repository?.name || "Unknown Repository"}
								</h1>
								<p className="mt-1 text-gray-600 dark:text-gray-300">
									{job.repository?.description || "No description"}
								</p>
								<div className="mt-4 flex items-center space-x-6 text-gray-500 text-sm dark:text-gray-400">
									<span className={`font-medium ${getStatusColor(job.status)}`}>
										Status: {getStatusText(job.status)}
									</span>
									{job.progress !== null && (
										<span>Progress: {job.progress}%</span>
									)}
									<span>
										Created: {new Date(job.createdAt).toLocaleString()}
									</span>
									{job.completedAt && (
										<span>
											Completed: {new Date(job.completedAt).toLocaleString()}
										</span>
									)}
								</div>
							</div>
						</div>
						{job.status === "COMPLETED" && latestVersion && (
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => copyToClipboard(latestVersion.content)}
								>
									<Copy className="mr-2 h-4 w-4" />
									Copy
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										downloadReadme(
											latestVersion.content,
											`${job.repository?.name || "readme"}-${job.id}`,
										)
									}
								>
									<Download className="mr-2 h-4 w-4" />
									Download
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Job Details */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					{/* Job Information */}
					<div className="lg:col-span-1">
						<div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
							<h2 className="mb-4 font-semibold text-gray-900 text-lg dark:text-white">
								Job Information
							</h2>
							<div className="space-y-4">
								<div>
									<div className="font-medium text-gray-500 text-sm dark:text-gray-400">
										Job ID
									</div>
									<p className="mt-1 font-mono text-gray-900 text-sm dark:text-white">
										{job.id}
									</p>
								</div>
								<div>
									<div className="font-medium text-gray-500 text-sm dark:text-gray-400">
										Repository
									</div>
									<p className="mt-1 text-gray-900 text-sm dark:text-white">
										{job.repository?.name || "Unknown"}
									</p>
								</div>
								<div>
									<div className="font-medium text-gray-500 text-sm dark:text-gray-400">
										Style
									</div>
									<p className="mt-1 text-gray-900 text-sm capitalize dark:text-white">
										{job.style}
									</p>
								</div>
								<div>
									<div className="font-medium text-gray-500 text-sm dark:text-gray-400">
										Features
									</div>
									<div className="mt-1 flex flex-wrap gap-2">
										{job.includeImages && (
											<span className="rounded bg-blue-100 px-2 py-1 text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200">
												Images
											</span>
										)}
										{job.includeBadges && (
											<span className="rounded bg-green-100 px-2 py-1 text-green-800 text-xs dark:bg-green-900 dark:text-green-200">
												Badges
											</span>
										)}
										{job.includeToc && (
											<span className="rounded bg-purple-100 px-2 py-1 text-purple-800 text-xs dark:bg-purple-900 dark:text-purple-200">
												TOC
											</span>
										)}
									</div>
								</div>
								{job.customPrompt && (
									<div>
										<div className="font-medium text-gray-500 text-sm dark:text-gray-400">
											Custom Prompt
										</div>
										<p className="mt-1 text-gray-900 text-sm dark:text-white">
											{job.customPrompt}
										</p>
									</div>
								)}
								{latestVersion && (
									<div>
										<div className="font-medium text-gray-500 text-sm dark:text-gray-400">
											Content Stats
										</div>
										<div className="mt-1 text-gray-900 text-sm dark:text-white">
											<p>Words: {latestVersion.wordCount}</p>
											<p>Characters: {latestVersion.characterCount}</p>
											{latestVersion.modelUsed && (
												<p>Model: {latestVersion.modelUsed}</p>
											)}
											{latestVersion.tokensUsed && (
												<p>Tokens: {latestVersion.tokensUsed}</p>
											)}
											{latestVersion.generationTime && (
												<p>Time: {latestVersion.generationTime}ms</p>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* README Content */}
					<div className="lg:col-span-2">
						<div className="rounded-lg bg-white shadow dark:bg-slate-800">
							<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
								<div className="flex items-center justify-between">
									<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
										Generated README
									</h2>
									{job.status === "PROCESSING" || job.status === "QUEUED" ? (
										<Button variant="ghost" size="sm" disabled>
											<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
											Processing...
										</Button>
									) : job.status === "COMPLETED" && latestVersion ? (
										<div className="flex items-center space-x-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => copyToClipboard(latestVersion.content)}
											>
												<Copy className="mr-2 h-4 w-4" />
												Copy
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													downloadReadme(
														latestVersion.content,
														`${job.repository?.name || "readme"}-${job.id}`,
													)
												}
											>
												<Download className="mr-2 h-4 w-4" />
												Download
											</Button>
										</div>
									) : job.status === "FAILED" ? (
										<div className="text-red-600 dark:text-red-400">
											<p className="font-medium text-sm">Generation Failed</p>
											{job.errorMessage && (
												<p className="text-red-500 text-xs dark:text-red-400">
													{job.errorMessage}
												</p>
											)}
										</div>
									) : null}
								</div>
							</div>
							<div className="p-6">
								{job.status === "COMPLETED" && latestVersion ? (
									<div className="prose prose-sm dark:prose-invert max-w-none">
										<pre className="whitespace-pre-wrap text-gray-900 text-sm dark:text-white">
											{latestVersion.content}
										</pre>
									</div>
								) : job.status === "FAILED" ? (
									<div className="py-12 text-center">
										<XCircle className="mx-auto h-12 w-12 text-red-500" />
										<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
											Generation Failed
										</h3>
										<p className="mt-2 text-gray-600 dark:text-gray-300">
											{job.errorMessage ||
												"An unknown error occurred during generation."}
										</p>
									</div>
								) : (
									<div className="py-12 text-center">
										<Clock className="mx-auto h-12 w-12 text-yellow-500" />
										<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
											{job.status === "PROCESSING" ? "Processing..." : "Queued"}
										</h3>
										<p className="mt-2 text-gray-600 dark:text-gray-300">
											{job.status === "PROCESSING"
												? "Your README is being generated. This may take a few minutes."
												: "Your README is queued for generation."}
										</p>
										{job.progress !== null && (
											<div className="mt-4">
												<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
													<div
														className="h-2 rounded-full bg-primary transition-all duration-300"
														style={{ width: `${job.progress}%` }}
													/>
												</div>
												<p className="mt-2 text-gray-500 text-sm dark:text-gray-400">
													{job.progress}% complete
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
