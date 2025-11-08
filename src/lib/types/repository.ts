import type { GitHubInstallation, ReadmeJob, Repository } from "@prisma/client";

export type RepositoryWithRelations = Repository & {
  installation: GitHubInstallation | null;
  readmeJobs: ReadmeJob[];
};
