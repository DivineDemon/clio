import { env } from "@/env";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

const octokitApp = new Octokit({
	authStrategy: createAppAuth,
	auth: {
		appId: env.GITHUB_APP_ID,
		privateKey: env.GITHUB_PRIVATE_KEY,
	},
});

export async function getRepoInstallation(owner: string, repo: string) {
	try {
		const { data } = await octokitApp.rest.apps.getRepoInstallation({
			owner,
			repo,
		});
		return data.id;
	} catch (error) {
		console.error(`Failed to get installation for ${owner}/${repo}:`, error);
		return null;
	}
}

export async function getInstallationToken(installationId: number) {
	try {
		const auth = createAppAuth({
			appId: env.GITHUB_APP_ID,
			privateKey: env.GITHUB_PRIVATE_KEY,
		});

		const installationAuth = await auth({
			type: "installation",
			installationId,
		});

		return installationAuth.token;
	} catch (error) {
		console.error(
			`Failed to get installation token for ${installationId}:`,
			error,
		);
		return null;
	}
}

export function createAuthenticatedOctokit(token: string) {
	return new Octokit({ auth: token });
}

export async function fetchRepoTree(
	owner: string,
	repo: string,
	token: string,
) {
	try {
		const octokit = createAuthenticatedOctokit(token);
		const { data: repoMeta } = await octokit.rest.repos.get({
			owner,
			repo,
		});

		const defaultBranch = repoMeta.default_branch;
		const { data: branch } = await octokit.rest.repos.getBranch({
			owner,
			repo,
			branch: defaultBranch,
		});

		const treeSha = branch.commit.commit.tree.sha;
		const { data: tree } = await octokit.rest.git.getTree({
			owner,
			repo,
			tree_sha: treeSha,
			recursive: "1",
		});

		return tree.tree;
	} catch (error) {
		console.error(`Failed to fetch tree for ${owner}/${repo}:`, error);
		throw error;
	}
}

export async function fetchFileContent(
	owner: string,
	repo: string,
	path: string,
	token: string,
) {
	try {
		const octokit = createAuthenticatedOctokit(token);

		const { data } = await octokit.rest.repos.getContent({
			owner,
			repo,
			path,
		});

		if ("content" in data && data.content) {
			const contentStr = Buffer.from(data.content, "base64").toString("utf8");
			return contentStr;
		}

		return null;
	} catch (error) {
		console.error(`Failed to fetch file ${path} from ${owner}/${repo}:`, error);
		return null;
	}
}

export async function getUserRepositories(token: string) {
	try {
		const octokit = createAuthenticatedOctokit(token);

		const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
			per_page: 100,
			sort: "updated",
		});

		return repos;
	} catch (error) {
		console.error("Failed to fetch user repositories:", error);
		throw error;
	}
}

export async function isAppInstalled(owner: string, repo: string) {
	const installationId = await getRepoInstallation(owner, repo);
	return installationId !== null;
}
