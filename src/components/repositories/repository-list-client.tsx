"use client";

import { Clock, Eye, GitBranch, GitFork, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ReadmeGenerationDialog from "@/components/repositories/readme-generation-dialog";
import RepositoryDetailsDialog from "@/components/repositories/repository-details-dialog";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import type { RepositoryWithRelations } from "@/lib/types/repository";
import { api } from "@/trpc/react";

interface RepositoryListClientProps {
  repositories: RepositoryWithRelations[];
  jobs: ReadmeJobWithRelations[];
}

export type ReadmeSettings = {
  style: "professional" | "casual" | "minimal" | "detailed";
  includeImages: boolean;
  includeBadges: boolean;
  includeToc: boolean;
  customPrompt: string;
  model: "gemini-2.5-flash" | "gemini-2.5-pro";
};

export default function RepositoryListClient({ repositories, jobs }: RepositoryListClientProps) {
  const [selectedRepoForReadme, setSelectedRepoForReadme] = useState<string | null>(null);
  const [readmeSettings, setReadmeSettings] = useState<ReadmeSettings>({
    style: "professional",
    includeImages: true,
    includeBadges: true,
    includeToc: true,
    customPrompt: "",
    model: "gemini-2.5-flash",
  });

  const generateReadme = api.readme.generate.useMutation({
    onSuccess: (data) => {
      toast.success("README generation queued!", {
        description: `Job ID: ${data.jobId}`,
      });
    },
    onError: (error) => {
      toast.error("Failed to start README generation", {
        description: error.message,
      });
    },
  });

  const jobsByRepository = useMemo(() => {
    const mapping = new Map<string, ReadmeJobWithRelations>();
    for (const job of jobs) {
      if (!mapping.has(job.repositoryId) || mapping.get(job.repositoryId)!.createdAt < job.createdAt) {
        mapping.set(job.repositoryId, job);
      }
    }
    return mapping;
  }, [jobs]);

  const handleConfirmGenerateReadme = async () => {
    if (!selectedRepoForReadme) return;

    try {
      await generateReadme.mutateAsync({
        repositoryId: selectedRepoForReadme,
        ...readmeSettings,
      });
      setSelectedRepoForReadme(null);
    } catch (error) {
      toast.error("Generate README error", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] w-full space-y-5 overflow-y-auto">
      {repositories.map((repo) => {
        const latestJob = repo.readmeJobs?.[0] ?? jobsByRepository.get(repo.id) ?? null;
        const isGenerating = latestJob ? ["PENDING", "QUEUED", "PROCESSING"].includes(latestJob.status) : false;

        return (
          <div
            key={repo.id}
            className="rounded-lg border border-gray-200 p-4 transition-all duration-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{repo.name}</h3>
                  {repo.isPrivate && (
                    <span className="rounded-full bg-secondary px-2 py-1 text-gray-600 text-xs">Private</span>
                  )}
                </div>
                {repo.description && (
                  <p className="mt-2 text-gray-600 text-sm dark:text-gray-300">{repo.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-500 text-sm dark:text-gray-400">
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
                    {repo.pushedAt ? new Date(repo.pushedAt).toLocaleDateString() : "Never"}
                  </span>
                  {latestJob && (
                    <span className="flex items-center">
                      <GitBranch className="mr-1 h-4 w-4" />
                      Last job: {latestJob.status.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex space-x-2">
                <RepositoryDetailsDialog repo={repo} />
                <ReadmeGenerationDialog
                  repo={repo}
                  open={selectedRepoForReadme === repo.id}
                  onOpen={() => setSelectedRepoForReadme(repo.id)}
                  onOpenChange={(open) => {
                    if (!open) {
                      setSelectedRepoForReadme(null);
                    }
                  }}
                  readmeSettings={readmeSettings}
                  setReadmeSettings={setReadmeSettings}
                  onConfirm={handleConfirmGenerateReadme}
                  isPending={generateReadme.isPending}
                  isGenerating={isGenerating}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
