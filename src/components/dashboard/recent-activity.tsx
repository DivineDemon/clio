"use client";

import { Button } from "@/components/ui/button";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import { api } from "@/trpc/react";
import {
	CheckCircle,
	Clock,
	Copy,
	Download,
	Eye,
	RefreshCw,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RecentActivity() {
	const {
		data: recentJobs,
		isLoading,
		refetch,
	} = api.readme.getUserJobs.useQuery({
		limit: 5,
	}) as {
		data: ReadmeJobWithRelations[] | undefined;
		isLoading: boolean;
		refetch: () => void;
	};

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
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "PROCESSING":
			case "QUEUED":
				return <Clock className="h-4 w-4 text-yellow-500" />;
			case "FAILED":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Clock className="h-4 w-4 text-gray-500" />;
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
			<div className="rounded-lg bg-white shadow dark:bg-slate-800">
				<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
					<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
						Recent Activity
					</h2>
				</div>
				<div className="p-6">
					<div className="space-y-4">
						<div className="animate-pulse">
							<div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
							<div className="mt-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
						</div>
						<div className="animate-pulse">
							<div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
							<div className="mt-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
						</div>
						<div className="animate-pulse">
							<div className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
							<div className="mt-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!recentJobs || recentJobs.length === 0) {
		return (
			<div className="rounded-lg bg-white shadow dark:bg-slate-800">
				<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
							Recent Activity
						</h2>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => refetch()}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							<RefreshCw className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div className="p-6">
					<div className="py-12 text-center">
						<Clock className="mx-auto h-12 w-12 text-gray-400" />
						<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
							No recent activity
						</h3>
						<p className="mt-2 text-gray-600 dark:text-gray-300">
							Your README generation jobs will appear here.
						</p>
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
						Recent Activity
					</h2>
					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => refetch()}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							<RefreshCw className="h-4 w-4" />
						</Button>
						<Link href="/history">
							<Button variant="outline" size="sm">
								View All
							</Button>
						</Link>
					</div>
				</div>
			</div>
			<div className="divide-y divide-gray-200 dark:divide-gray-700">
				{recentJobs.map((job) => (
					<div key={job.id} className="p-6">
						<div className="flex items-start justify-between">
							<div className="flex items-start space-x-3">
								{getStatusIcon(job.status)}
								<div className="min-w-0 flex-1">
									<div className="flex items-center space-x-2">
										<h3 className="font-medium text-gray-900 text-sm dark:text-white">
											{job.repository?.name || "Unknown Repository"}
										</h3>
										<span
											className={`font-medium text-xs ${getStatusColor(job.status)}`}
										>
											{getStatusText(job.status)}
										</span>
									</div>
									<p className="mt-1 text-gray-600 text-sm dark:text-gray-300">
										{job.repository?.description || "No description"}
									</p>
									<div className="mt-2 flex items-center space-x-4 text-gray-500 text-xs dark:text-gray-400">
										<span>
											Created: {new Date(job.createdAt).toLocaleDateString()}
										</span>
										{job.completedAt && (
											<span>
												Completed:{" "}
												{new Date(job.completedAt).toLocaleDateString()}
											</span>
										)}
										{job.progress !== null && (
											<span>Progress: {job.progress}%</span>
										)}
									</div>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								{job.status === "COMPLETED" && job.versions?.[0] && (
									<>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												copyToClipboard(job.versions?.[0]?.content ?? "")
											}
											className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
										>
											<Copy className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												downloadReadme(
													job.versions?.[0]?.content ?? "",
													`${job.repository?.name || "readme"}-${job.id}`,
												)
											}
											className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
										>
											<Download className="h-4 w-4" />
										</Button>
										<Link href={`/jobs/${job.id}`}>
											<Button
												variant="ghost"
												size="sm"
												className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
											>
												<Eye className="h-4 w-4" />
											</Button>
										</Link>
									</>
								)}
								<Link href={`/jobs/${job.id}`}>
									<Button variant="outline" size="sm">
										View Details
									</Button>
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
