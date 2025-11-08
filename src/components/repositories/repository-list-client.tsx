"use client";

import { Clock, ExternalLink, Eye, GitBranch, GitFork, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import type { RepositoryWithRelations } from "@/lib/types/repository";
import { api } from "@/trpc/react";

interface RepositoryListClientProps {
  repositories: RepositoryWithRelations[];
  jobs: ReadmeJobWithRelations[];
}

export default function RepositoryListClient({ repositories, jobs }: RepositoryListClientProps) {
  const [selectedRepoForReadme, setSelectedRepoForReadme] = useState<string | null>(null);
  const [readmeSettings, setReadmeSettings] = useState({
    style: "professional" as "professional" | "casual" | "minimal" | "detailed",
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
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
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Description</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">{repo.description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Language</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">{repo.language || "Not specified"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Default Branch</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">{repo.defaultBranch}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Size</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">{Math.round(repo.size / 1024)} MB</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Open Issues</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">{repo.openIssuesCount}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Created</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">
                            {new Date(repo.githubCreatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Last Updated</h4>
                          <p className="text-gray-600 text-sm dark:text-gray-300">
                            {new Date(repo.githubUpdatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {repo.topics && repo.topics.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm dark:text-white">Topics</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {repo.topics.map((topic) => (
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
                            window.open(`https://github.com/${repo.fullName}`, "_blank");
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on GitHub
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={selectedRepoForReadme === repo.id}
                  onOpenChange={(open) => !open && setSelectedRepoForReadme(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setSelectedRepoForReadme(repo.id)}
                      disabled={generateReadme.isPending || isGenerating}
                    >
                      {isGenerating ? "Processing..." : "Generate README"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl">
                    <DialogHeader>
                      <DialogTitle>README Generation Settings</DialogTitle>
                      <DialogDescription>
                        Configure how your README should be generated for this repository.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="style">Writing Style</Label>
                        <Select
                          value={readmeSettings.style}
                          onValueChange={(value) =>
                            setReadmeSettings((prev) => ({
                              ...prev,
                              style: value as "professional" | "casual" | "minimal" | "detailed",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="model">AI Model</Label>
                        <Select
                          value={readmeSettings.model}
                          onValueChange={(value) => setReadmeSettings((prev) => ({ ...prev, model: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Efficient)</SelectItem>
                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced Reasoning)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label>Include Features</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="include-images">Images & Screenshots</Label>
                              <p className="text-muted-foreground text-sm">Include relevant images and screenshots</p>
                            </div>
                            <Switch
                              id="include-images"
                              checked={readmeSettings.includeImages}
                              onCheckedChange={(checked) =>
                                setReadmeSettings((prev) => ({
                                  ...prev,
                                  includeImages: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="include-badges">Badges & Shields</Label>
                              <p className="text-muted-foreground text-sm">Add status badges and shields</p>
                            </div>
                            <Switch
                              id="include-badges"
                              checked={readmeSettings.includeBadges}
                              onCheckedChange={(checked) =>
                                setReadmeSettings((prev) => ({
                                  ...prev,
                                  includeBadges: checked,
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="include-toc">Table of Contents</Label>
                              <p className="text-muted-foreground text-sm">Generate a table of contents</p>
                            </div>
                            <Switch
                              id="include-toc"
                              checked={readmeSettings.includeToc}
                              onCheckedChange={(checked) =>
                                setReadmeSettings((prev) => ({
                                  ...prev,
                                  includeToc: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
                        <Textarea
                          id="custom-prompt"
                          placeholder="Add any specific instructions for the README generation..."
                          value={readmeSettings.customPrompt}
                          onChange={(e) =>
                            setReadmeSettings((prev) => ({
                              ...prev,
                              customPrompt: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                        <p className="text-muted-foreground text-sm">
                          Provide specific instructions or requirements for your README
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setSelectedRepoForReadme(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleConfirmGenerateReadme} disabled={generateReadme.isPending}>
                        {generateReadme.isPending ? "Generating..." : "Generate README"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
