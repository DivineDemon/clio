"use client";

import { BookOpen, CheckCircle, Clock, Copy, Download, Eye, RefreshCw, Search, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import GithubLogoutButton from "@/components/auth/github-logout-button";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import { api } from "@/trpc/react";

interface HistoryPageProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function HistoryPage({ user }: HistoryPageProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: jobs,
    isLoading,
    refetch,
  } = api.readme.getUserJobs.useQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"),
    limit: 50,
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
      toast.error(`Failed to copy to clipboard. ${(error as Error).message}`);
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

  const filteredJobs = jobs?.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.repository?.name?.toLowerCase().includes(query) ||
      job.repository?.description?.toLowerCase().includes(query) ||
      job.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
              </Link>
              <span className="font-bold text-xl">Generation History</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image alt="User" width={32} height={32} src={user.image || ""} className="size-8 rounded-full" />
                <span className="font-medium text-sm">{user.name?.split(" ")[0] || "Developer"}</span>
              </div>
              <GithubLogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900 dark:text-white">Generation History</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">View and manage all your README generation jobs.</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <div className="relative max-w-md flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="QUEUED">Queued</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="rounded-lg bg-white shadow dark:bg-slate-800">
          {isLoading ? (
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
          ) : !filteredJobs || filteredJobs.length === 0 ? (
            <div className="p-6">
              <div className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">No jobs found</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {searchQuery || statusFilter !== "all"
                    ? "No jobs match your current filters."
                    : "You haven't generated any READMEs yet."}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/dashboard">
                    <Button className="mt-4">Generate Your First README</Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(job.status)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 text-sm dark:text-white">
                            {job.repository?.name || "Unknown Repository"}
                          </h3>
                          <span className={`font-medium text-xs ${getStatusColor(job.status)}`}>
                            {getStatusText(job.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600 text-sm dark:text-gray-300">
                          {job.repository?.description || "No description"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-500 text-xs dark:text-gray-400">
                          <span>
                            Created:&nbsp;
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          {job.completedAt && (
                            <span>
                              Completed:&nbsp;
                              {new Date(job.completedAt).toLocaleDateString()}
                            </span>
                          )}
                          {job.progress !== null && <span>Progress: {job.progress}%</span>}
                          {job.versions?.[0] && <span>Words: {job.versions?.[0]?.wordCount ?? 0}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.status === "COMPLETED" && job.versions?.[0] && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(job.versions?.[0]?.content ?? "")}
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
          )}
        </div>
      </main>
    </div>
  );
}
