import { createInstallationOctokit } from "./github";

export interface RepositoryInfo {
	owner: string;
	name: string;
	description: string | null;
	language: string | null;
	stars: number;
	forks: number;
	defaultBranch: string;
	private: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface FileTreeItem {
	path: string;
	type: "file" | "dir";
	size: number;
	sha: string;
	url: string;
}

export interface FileContent {
	path: string;
	content: string;
	size: number;
	sha: string;
	encoding: string;
}

export async function getRepositoryInfo(
	owner: string,
	repo: string,
): Promise<RepositoryInfo | null> {
	try {
		const octokit = await createInstallationOctokit(owner, repo);
		const { data } = await octokit.rest.repos.get({ owner, repo });

		return {
			owner: data.owner.login,
			name: data.name,
			description: data.description,
			language: data.language,
			stars: data.stargazers_count,
			forks: data.forks_count,
			defaultBranch: data.default_branch,
			private: data.private,
			createdAt: data.created_at,
			updatedAt: data.updated_at,
		};
	} catch (error) {
		console.error(`Failed to get repository info for ${owner}/${repo}:`, error);
		return null;
	}
}

export async function getRepositoryTree(
	owner: string,
	repo: string,
	branch?: string,
): Promise<FileTreeItem[] | null> {
	try {
		const octokit = await createInstallationOctokit(owner, repo);

		let targetBranch = branch;
		if (!targetBranch) {
			const repoInfo = await getRepositoryInfo(owner, repo);
			if (!repoInfo) return null;
			targetBranch = repoInfo.defaultBranch;
		}

		const { data: branchData } = await octokit.rest.repos.getBranch({
			owner,
			repo,
			branch: targetBranch,
		});

		const treeSha = branchData.commit.commit.tree.sha;

		const { data: treeData } = await octokit.rest.git.getTree({
			owner,
			repo,
			tree_sha: treeSha,
			recursive: "1",
		});

		return treeData.tree.map((item) => ({
			path: item.path || "",
			type: item.type === "blob" ? "file" : "dir",
			size: item.size || 0,
			sha: item.sha || "",
			url: item.url || "",
		}));
	} catch (error) {
		console.error(`Failed to get repository tree for ${owner}/${repo}:`, error);
		return null;
	}
}

export async function getFileContent(
	owner: string,
	repo: string,
	path: string,
	branch?: string,
): Promise<FileContent | null> {
	try {
		const octokit = await createInstallationOctokit(owner, repo);

		const { data } = await octokit.rest.repos.getContent({
			owner,
			repo,
			path,
			...(branch && { ref: branch }),
		});

		if (Array.isArray(data)) {
			throw new Error(`Path ${path} is a directory, not a file`);
		}

		if (data.type !== "file" || !data.content) {
			throw new Error(`Path ${path} is not a file or has no content`);
		}

		const content = Buffer.from(data.content, "base64").toString("utf-8");

		return {
			path: data.path,
			content,
			size: data.size,
			sha: data.sha,
			encoding: data.encoding,
		};
	} catch (error) {
		console.error(
			`Failed to get file content for ${owner}/${repo}/${path}:`,
			error,
		);
		return null;
	}
}

export async function getMultipleFileContents(
	owner: string,
	repo: string,
	paths: string[],
	branch?: string,
): Promise<FileContent[]> {
	const results: FileContent[] = [];

	for (const path of paths) {
		const content = await getFileContent(owner, repo, path, branch);
		if (content) {
			results.push(content);
		}
	}

	return results;
}

export async function getRepositoryStructure(
	owner: string,
	repo: string,
): Promise<{
	info: RepositoryInfo | null;
	tree: FileTreeItem[] | null;
	keyFiles: FileContent[];
}> {
	const [info, tree] = await Promise.all([
		getRepositoryInfo(owner, repo),
		getRepositoryTree(owner, repo),
	]);

	let keyFiles: FileContent[] = [];
	if (tree) {
		const keyFilePaths = tree
			.filter((item) => item.type === "file")
			.map((item) => item.path)
			.filter((path) => {
				const fileName = path.split("/").pop()?.toLowerCase() || "";
				return (
					fileName === "readme.md" ||
					fileName === "package.json" ||
					fileName === "requirements.txt" ||
					fileName === "cargo.toml" ||
					fileName === "go.mod" ||
					fileName === "pom.xml" ||
					fileName === "composer.json" ||
					fileName === "gemfile" ||
					fileName === "dockerfile" ||
					fileName === "docker-compose.yml"
				);
			})
			.slice(0, 10);

		keyFiles = await getMultipleFileContents(owner, repo, keyFilePaths);
	}

	return {
		info,
		tree,
		keyFiles,
	};
}
