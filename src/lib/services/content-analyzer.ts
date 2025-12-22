import type { Repository } from "@prisma/client";
import { createInstallationOctokit } from "@/lib/github";
import { logger } from "@/lib/logger";
import type { GitHubTreeItem, Octokit } from "@/lib/types/octokit";

export interface RepositoryAnalysis {
  name: string;
  structure: FileStructure;
  keyFiles: KeyFile[];
  packageInfo?: PackageInfo;
  readmeExists: boolean;
  hasTests: boolean;
  hasDocumentation: boolean;
  hasDocker: boolean;
  hasCI: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  hasChangelog: boolean;
  primaryLanguage: string;
  framework?: string;
  buildTool?: string;
  testFramework?: string;
}

export interface FileStructure {
  [key: string]: FileStructure | FileInfo;
}

export interface FileInfo {
  type: "file";
  path: string;
  size: number;
  language?: string;
}

export interface KeyFile {
  path: string;
  content: string;
  language?: string;
  importance: "high" | "medium" | "low";
}

export interface PackageInfo {
  name?: string;
  version?: string;
  description?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  keywords?: string[];
  license?: string;
  author?: string;
  repository?: string;
  homepage?: string;
}

export class ContentAnalyzer {
  async analyzeRepository(repository: Repository, installationId: string): Promise<RepositoryAnalysis> {
    const nameParts = repository.fullName.split("/");
    const owner = nameParts[0];
    const repo = nameParts[1];

    if (!owner || !repo) {
      throw new Error("Invalid repository full name format");
    }

    const octokit = await createInstallationOctokit(owner, repo);

    try {
      // CRITICAL: Only fetch root tree, not recursive - avoids timeouts on large repos
      const rootTree = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: repository.defaultBranch,
        recursive: "false",
      });

      const treeItems = (rootTree.data.tree || []) as GitHubTreeItem[];
      const structure = this.buildFileStructureFromRoot(treeItems);

      // Fetch key files directly using Contents API (no recursive tree needed)
      const keyFiles = await this.fetchKeyFilesDirectly(octokit, owner, repo);

      const packageInfo = await this.getPackageInfo(octokit, owner, repo, keyFiles);

      const analysis: RepositoryAnalysis = {
        name: repository.name,
        structure,
        keyFiles,
        packageInfo,
        readmeExists: this.hasFile(keyFiles, "README.md"),
        hasTests: this.hasTestFiles(keyFiles),
        hasDocumentation: this.hasDocumentationFiles(keyFiles),
        hasDocker: this.hasDockerFiles(keyFiles),
        hasCI: this.hasCIFiles(keyFiles),
        hasLicense: this.hasLicenseFile(keyFiles),
        hasContributing: this.hasFile(keyFiles, "CONTRIBUTING.md"),
        hasChangelog: this.hasFile(keyFiles, "CHANGELOG.md"),
        primaryLanguage: repository.language || "Unknown",
        framework: this.detectFramework(keyFiles, packageInfo),
        buildTool: this.detectBuildTool(keyFiles, packageInfo),
        testFramework: this.detectTestFramework(packageInfo),
      };

      return analysis;
    } catch (error) {
      logger.error("Error analyzing repository", error as Error, {
        repositoryId: repository.id,
        repositoryName: repository.fullName,
      });
      throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private buildFileStructureFromRoot(tree: GitHubTreeItem[]): FileStructure {
    const structure: FileStructure = {};

    // Only show top-level directories and files (simplified for performance)
    for (const item of tree) {
      if (item.type === "blob") {
        // Root-level file
        structure[item.path || ""] = {
          type: "file",
          path: item.path || "",
          size: item.size || 0,
          language: this.getLanguageFromExtension(item.path || ""),
        };
      } else if (item.type === "tree") {
        // Root-level directory - just mark it exists
        structure[item.path || ""] = {
          type: "file", // Simplified - just show it exists
          path: item.path || "",
          size: 0,
        };
      }
    }

    return structure;
  }

  // Fetch key files directly using Contents API (no recursive tree needed)
  private async fetchKeyFilesDirectly(octokit: Octokit, owner: string, repo: string): Promise<KeyFile[]> {
    const keyFiles: KeyFile[] = [];

    // List of files to check (root level first, then common locations)
    const filesToCheck = [
      // Root level files
      "package.json",
      "README.md",
      "README",
      "LICENSE",
      "LICENCE",
      "CONTRIBUTING.md",
      "CHANGELOG.md",
      "Dockerfile",
      "docker-compose.yml",
      "docker-compose.yaml",
      "requirements.txt",
      "Pipfile",
      "pyproject.toml",
      "Cargo.toml",
      "go.mod",
      "pom.xml",
      "composer.json",
      "Gemfile",
      "tsconfig.json",
      "next.config.js",
      "next.config.ts",
      "vite.config.js",
      "vite.config.ts",
      "webpack.config.js",
      "Makefile",
      "CMakeLists.txt",
      // Common entry points
      "index.js",
      "index.ts",
      "main.py",
      "main.go",
      "main.rs",
      "app.py",
    ];

    // Fetch files in parallel (they'll fail fast if file doesn't exist)
    const fetchPromises = filesToCheck.map(async (filePath) => {
      try {
        const content = await this.getFileContent(octokit, owner, repo, filePath);
        if (content) {
          return {
            path: filePath,
            content,
            language: this.getLanguageFromExtension(filePath),
            importance: this.getFileImportance(filePath),
          } as KeyFile;
        }
      } catch {
        // File doesn't exist or can't be accessed - ignore
      }
      return null;
    });

    // Wait for all fetches (they'll fail fast if file doesn't exist)
    const results = await Promise.allSettled(fetchPromises);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        keyFiles.push(result.value);
      }
    }

    // Also check common directories for entry points (limited depth)
    const commonDirs = ["src", "app", "lib"];
    for (const dir of commonDirs) {
      try {
        // Check if directory exists and get its contents
        const dirContents = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: dir,
        });

        if (Array.isArray(dirContents.data)) {
          // It's a directory - check for entry points
          for (const item of dirContents.data.slice(0, 10)) {
            // Limit to first 10 items
            if (item.type === "file") {
              const fileName = item.name.toLowerCase();
              if (
                fileName === "index.js" ||
                fileName === "index.ts" ||
                fileName === "main.py" ||
                fileName === "main.go" ||
                fileName === "main.rs" ||
                fileName === "app.tsx" ||
                fileName === "app.jsx"
              ) {
                try {
                  const content = await this.getFileContent(octokit, owner, repo, item.path);
                  if (content) {
                    keyFiles.push({
                      path: item.path,
                      content,
                      language: this.getLanguageFromExtension(item.path),
                      importance: "medium",
                    });
                  }
                } catch {
                  // Ignore errors
                }
              }
            }
          }
        }
      } catch {
        // Directory doesn't exist - ignore
      }
    }

    return keyFiles;
  }

  private async getFileContent(octokit: Octokit, owner: string, repo: string, path: string): Promise<string> {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(response.data)) {
        return "";
      }

      if (response.data.type === "file" && response.data.content) {
        return Buffer.from(response.data.content, "base64").toString("utf-8");
      }

      return "";
    } catch {
      logger.warn("Error getting file content", { filePath: path });
      return "";
    }
  }

  private async getPackageInfo(
    octokit: Octokit,
    owner: string,
    repo: string,
    keyFiles: KeyFile[],
  ): Promise<PackageInfo | undefined> {
    const packageFile = keyFiles.find((file) => file.path.endsWith("package.json"));
    if (!packageFile) return undefined;

    try {
      return JSON.parse(packageFile.content);
    } catch {
      logger.warn("Failed to parse package.json", {
        repository: `${owner}/${repo}`,
      });
      return undefined;
    }
  }

  private getLanguageFromExtension(filename: string): string | undefined {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      ts: "TypeScript",
      py: "Python",
      go: "Go",
      rs: "Rust",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      php: "PHP",
      rb: "Ruby",
      swift: "Swift",
      kt: "Kotlin",
      scala: "Scala",
      clj: "Clojure",
      hs: "Haskell",
      ml: "OCaml",
      fs: "F#",
      erl: "Erlang",
      ex: "Elixir",
      sh: "Shell",
      ps1: "PowerShell",
      bat: "Batch",
      yml: "YAML",
      yaml: "YAML",
      json: "JSON",
      xml: "XML",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      less: "Less",
      md: "Markdown",
      txt: "Text",
    };
    return languageMap[ext || ""];
  }

  private getFileImportance(path: string): "high" | "medium" | "low" {
    const highImportance = ["package.json", "README.md", "LICENSE", "Dockerfile"];
    const mediumImportance = ["CONTRIBUTING.md", "CHANGELOG.md", "docker-compose.yml"];

    if (highImportance.some((file) => path.includes(file))) return "high";
    if (mediumImportance.some((file) => path.includes(file))) return "medium";
    return "low";
  }

  private hasFile(keyFiles: KeyFile[], filename: string): boolean {
    return keyFiles.some((file) => file.path.includes(filename));
  }

  private hasTestFiles(keyFiles: KeyFile[]): boolean {
    // Check if any key file path suggests tests
    const testPatterns = ["test", "spec", "__tests__", "tests", ".test.", ".spec."];
    return keyFiles.some((file) => {
      const path = file.path.toLowerCase();
      return testPatterns.some((pattern) => path.includes(pattern));
    });
  }

  private hasDocumentationFiles(keyFiles: KeyFile[]): boolean {
    const docPatterns = ["docs", "documentation", "doc", ".md"];
    return keyFiles.some((file) => docPatterns.some((pattern) => file.path.includes(pattern)));
  }

  private hasDockerFiles(keyFiles: KeyFile[]): boolean {
    return this.hasFile(keyFiles, "Dockerfile") || this.hasFile(keyFiles, "docker-compose");
  }

  private hasCIFiles(keyFiles: KeyFile[]): boolean {
    // We can check for CI by looking for common CI files
    const ciPatterns = [".github", "workflow", ".gitlab-ci", "circleci", "travis"];
    return keyFiles.some((file) => ciPatterns.some((pattern) => file.path.toLowerCase().includes(pattern)));
  }

  private hasLicenseFile(keyFiles: KeyFile[]): boolean {
    const licensePatterns = ["LICENSE", "LICENCE", "COPYING"];
    return keyFiles.some((file) => licensePatterns.some((pattern) => file.path.includes(pattern)));
  }

  private detectFramework(keyFiles: KeyFile[], packageInfo?: PackageInfo): string | undefined {
    if (packageInfo?.dependencies) {
      const deps = Object.keys(packageInfo.dependencies);
      if (deps.includes("react")) return "React";
      if (deps.includes("vue")) return "Vue.js";
      if (deps.includes("angular")) return "Angular";
      if (deps.includes("next")) return "Next.js";
      if (deps.includes("nuxt")) return "Nuxt.js";
      if (deps.includes("express")) return "Express.js";
      if (deps.includes("fastapi")) return "FastAPI";
      if (deps.includes("django")) return "Django";
      if (deps.includes("flask")) return "Flask";
      if (deps.includes("spring-boot")) return "Spring Boot";
    }

    if (keyFiles.some((f) => f.path.includes("next.config"))) return "Next.js";
    if (keyFiles.some((f) => f.path.includes("nuxt.config"))) return "Nuxt.js";
    if (keyFiles.some((f) => f.path.includes("vite.config"))) return "Vite";
    if (keyFiles.some((f) => f.path.includes("webpack.config"))) return "Webpack";

    return undefined;
  }

  private detectBuildTool(keyFiles: KeyFile[], packageInfo?: PackageInfo): string | undefined {
    if (keyFiles.some((f) => f.path.includes("webpack.config"))) return "Webpack";
    if (keyFiles.some((f) => f.path.includes("vite.config"))) return "Vite";
    if (keyFiles.some((f) => f.path.includes("rollup.config"))) return "Rollup";
    if (keyFiles.some((f) => f.path.includes("esbuild"))) return "esbuild";
    if (keyFiles.some((f) => f.path.includes("Makefile"))) return "Make";
    if (keyFiles.some((f) => f.path.includes("CMakeLists.txt"))) return "CMake";
    if (keyFiles.some((f) => f.path.includes("Cargo.toml"))) return "Cargo";
    if (keyFiles.some((f) => f.path.includes("go.mod"))) return "Go Modules";

    if (packageInfo?.scripts) {
      const scripts = Object.values(packageInfo.scripts).join(" ");
      if (scripts.includes("webpack")) return "Webpack";
      if (scripts.includes("vite")) return "Vite";
      if (scripts.includes("rollup")) return "Rollup";
    }

    return undefined;
  }

  private detectTestFramework(packageInfo?: PackageInfo): string | undefined {
    if (packageInfo?.devDependencies) {
      const deps = Object.keys(packageInfo.devDependencies);
      if (deps.includes("jest")) return "Jest";
      if (deps.includes("mocha")) return "Mocha";
      if (deps.includes("vitest")) return "Vitest";
      if (deps.includes("pytest")) return "pytest";
      if (deps.includes("unittest")) return "unittest";
      if (deps.includes("go test")) return "Go Test";
    }

    return undefined;
  }
}

export const contentAnalyzer = new ContentAnalyzer();
