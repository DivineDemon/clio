"use client";

import { ExternalLink, Eye, GitBranch, GitFork, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RepositoryWithRelations } from "@/lib/types/repository";

interface RepositoryDetailsDialogProps {
  repo: RepositoryWithRelations;
}

export default function RepositoryDetailsDialog({ repo }: RepositoryDetailsDialogProps) {
  return (
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
            {repo.isPrivate ? <Badge variant="destructive">Private</Badge> : <Badge variant="secondary">Public</Badge>}
          </DialogTitle>
          <DialogDescription>
            {repo.fullName} • {repo.owner}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {repo.description && (
            <section>
              <h4 className="font-medium text-foreground text-sm">Description</h4>
              <p className="text-muted-foreground text-sm">{repo.description}</p>
            </section>
          )}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground text-sm">Language</h4>
              <p className="text-muted-foreground text-sm">{repo.language || "Not specified"}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Default Branch</h4>
              <p className="text-muted-foreground text-sm">{repo.defaultBranch}</p>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground text-sm">Size</h4>
              <p className="text-muted-foreground text-sm">{Math.round(repo.size / 1024)} MB</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Open Issues</h4>
              <p className="text-muted-foreground text-sm">{repo.openIssuesCount}</p>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground text-sm">Created</h4>
              <p className="text-muted-foreground text-sm">{new Date(repo.githubCreatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm">Last Updated</h4>
              <p className="text-muted-foreground text-sm">{new Date(repo.githubUpdatedAt).toLocaleDateString()}</p>
            </div>
          </section>
          {repo.topics && repo.topics.length > 0 && (
            <section>
              <h4 className="font-medium text-foreground text-sm">Topics</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {repo.topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </section>
          )}
          <footer className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-6 text-muted-foreground text-sm">
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
                window.open(`https://github.com/${repo.fullName}`, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
