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

export interface GitHubFileContent {
	type: "file" | "dir" | "symlink" | "submodule";
	content?: string;
	encoding?: string;
	size?: number;
	sha?: string;
	url?: string;
}

export interface GitHubModel {
	id: string;
	object: string;
	created: number;
	owned_by: string;
}

export interface GitHubModelsResponse {
	object: string;
	data: GitHubModel[];
}
