import type { Octokit } from "@octokit/rest";

export type { Octokit };

export interface GitHubTreeItem {
  type: "blob" | "tree";
  path: string;
  mode: string;
  sha: string;
  size?: number;
  url?: string;
}
