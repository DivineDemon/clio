export interface GitHubAccount {
  id: number;
  login: string;
  type: "User" | "Organization";
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  site_admin: boolean;
}

export interface GitHubInstallationPermissions {
  [key: string]: string;
}

export interface GitHubInstallationEventPayload {
  action: "created" | "deleted" | "suspend" | "unsuspend" | "new_permissions_accepted";
  installation: {
    id: number;
    account: GitHubAccount;
    repository_selection: "all" | "selected";
    access_tokens_url: string;
    repositories_url: string;
    html_url: string;
    app_id: number;
    app_slug: string;
    target_id: number;
    target_type: "User" | "Organization";
    permissions: GitHubInstallationPermissions;
    events: string[];
    created_at: string;
    updated_at: string;
    single_file_name: string | null;
    has_multiple_single_files: boolean;
    single_file_paths: string[];
    suspended_by: GitHubAccount | null;
    suspended_at: string | null;
  };
  repositories?: Array<{
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  }>;
  requester?: GitHubAccount;
  sender: GitHubAccount;
}

export interface GitHubInstallationRepositoriesEventPayload {
  action: "added" | "removed";
  installation: {
    id: number;
    account: GitHubAccount;
    repository_selection: "all" | "selected";
    access_tokens_url: string;
    repositories_url: string;
    html_url: string;
    app_id: number;
    app_slug: string;
    target_id: number;
    target_type: "User" | "Organization";
    permissions: GitHubInstallationPermissions;
    events: string[];
    created_at: string;
    updated_at: string;
    single_file_name: string | null;
    has_multiple_single_files: boolean;
    single_file_paths: string[];
    suspended_by: GitHubAccount | null;
    suspended_at: string | null;
  };
  repositories_added?: Array<{
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  }>;
  repositories_removed?: Array<{
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  }>;
  requester?: GitHubAccount;
  sender: GitHubAccount;
}

export interface GitHubRepositoryEventPayload {
  action:
    | "created"
    | "deleted"
    | "archived"
    | "unarchived"
    | "edited"
    | "renamed"
    | "transferred"
    | "publicized"
    | "privatized";
  repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: GitHubAccount;
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    forks_url: string;
    keys_url: string;
    collaborators_url: string;
    teams_url: string;
    hooks_url: string;
    issue_events_url: string;
    events_url: string;
    assignees_url: string;
    branches_url: string;
    tags_url: string;
    blobs_url: string;
    git_tags_url: string;
    git_refs_url: string;
    trees_url: string;
    statuses_url: string;
    languages_url: string;
    stargazers_url: string;
    contributors_url: string;
    subscribers_url: string;
    subscription_url: string;
    commits_url: string;
    git_commits_url: string;
    comments_url: string;
    issue_comment_url: string;
    contents_url: string;
    compare_url: string;
    merges_url: string;
    archive_url: string;
    downloads_url: string;
    issues_url: string;
    pulls_url: string;
    milestones_url: string;
    notifications_url: string;
    labels_url: string;
    releases_url: string;
    deployments_url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string | null;
    git_url: string;
    ssh_url: string;
    clone_url: string;
    svn_url: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    has_discussions: boolean;
    forks_count: number;
    mirror_url: string | null;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: {
      key: string;
      name: string;
      spdx_id: string;
      url: string | null;
      node_id: string;
    } | null;
    allow_forking: boolean;
    is_template: boolean;
    web_commit_signoff_required: boolean;
    topics: string[];
    visibility: "public" | "private" | "internal";
    forks: number;
    open_issues: number;
    watchers: number;
    default_branch: string;
  };
  changes?: {
    name?: {
      from: string;
    };
    description?: {
      from: string | null;
    };
    homepage?: {
      from: string | null;
    };
    default_branch?: {
      from: string;
    };
  };
  requester?: GitHubAccount;
  sender: GitHubAccount;
}
