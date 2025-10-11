import { createHash } from "node:crypto";
import type { ReadmeJob, Repository } from "@prisma/client";
import type { RepositoryAnalysis } from "./content-analyzer";
import { contentAnalyzer } from "./content-analyzer";
import { llmService } from "./llm";
import { createReadmeJob, createReadmeVersion, updateReadmeJob } from "./readme-job";

export interface ReadmeGenerationOptions {
  style?: "professional" | "casual" | "minimal" | "detailed";
  includeImages?: boolean;
  includeBadges?: boolean;
  includeToc?: boolean;
  customPrompt?: string | null;
  model?: string;
}

export interface ReadmeGenerationResult {
  job: ReadmeJob;
  content: string;
  metadata: {
    wordCount: number;
    characterCount: number;
    modelUsed: string;
    tokensUsed?: number;
    generationTime?: number;
  };
}

export class ReadmeGenerator {
  async queueReadmeGeneration(
    repository: Repository,
    installationId: string,
    userId: string,
    options: ReadmeGenerationOptions = {},
  ): Promise<{ jobId: string; status: string }> {
    const job = await createReadmeJob({
      repositoryId: repository.id,
      userId,
      includeImages: options.includeImages ?? true,
      includeBadges: options.includeBadges ?? true,
      includeToc: options.includeToc ?? true,
      style: options.style ?? "professional",
      customPrompt: options.customPrompt,
    });

    await updateReadmeJob(job.id, {
      status: "QUEUED",
      progress: 0,
    });

    Promise.resolve().then(async () => {
      try {
        await this.processReadmeJob(job.id, repository, installationId, options);
      } catch (error) {
        await updateReadmeJob(job.id, {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    return {
      jobId: job.id,
      status: "QUEUED",
    };
  }

  async processReadmeJob(
    jobId: string,
    repository: Repository,
    installationId: string,
    options: ReadmeGenerationOptions,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      await updateReadmeJob(jobId, {
        status: "PROCESSING",
        progress: 10,
        startedAt: new Date(),
      });

      await updateReadmeJob(jobId, { progress: 30 });
      const analysis = await contentAnalyzer.analyzeRepository(repository, installationId);

      await updateReadmeJob(jobId, { progress: 50 });
      const repositoryData = {
        name: repository.name,
        description: repository.description,
        language: repository.language,
        topics: repository.topics,
        structure: analysis.structure,
        files: analysis.keyFiles,
      };

      await updateReadmeJob(jobId, { progress: 70 });
      const llmResponse = await llmService.generateReadme(repositoryData, {
        style: options.style,
        includeImages: options.includeImages,
        includeBadges: options.includeBadges,
        includeToc: options.includeToc,
        customPrompt: options.customPrompt,
        model: options.model,
      });

      await updateReadmeJob(jobId, { progress: 85 });
      const processedContent = this.processReadmeContent(llmResponse.content, analysis);

      const wordCount = this.countWords(processedContent);
      const characterCount = processedContent.length;
      const contentHash = this.generateContentHash(processedContent);

      await updateReadmeJob(jobId, { progress: 90 });
      await createReadmeVersion({
        jobId,
        content: processedContent,
        contentHash,
        wordCount,
        characterCount,
        modelUsed: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        generationTime: llmResponse.generationTime,
      });

      const processingTime = Date.now() - startTime;
      await updateReadmeJob(jobId, {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        processingTime,
      });
    } catch (error) {
      await updateReadmeJob(jobId, {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      });
    }
  }

  async generateReadme(
    repository: Repository,
    installationId: string,
    userId: string,
    options: ReadmeGenerationOptions = {},
  ): Promise<ReadmeGenerationResult> {
    const startTime = Date.now();

    const job = await createReadmeJob({
      repositoryId: repository.id,
      userId,
      includeImages: options.includeImages ?? true,
      includeBadges: options.includeBadges ?? true,
      includeToc: options.includeToc ?? true,
      style: options.style ?? "professional",
      customPrompt: options.customPrompt,
    });

    try {
      await updateReadmeJob(job.id, {
        status: "PROCESSING",
        progress: 10,
        startedAt: new Date(),
      });

      await updateReadmeJob(job.id, { progress: 30 });
      const analysis = await contentAnalyzer.analyzeRepository(repository, installationId);

      await updateReadmeJob(job.id, { progress: 50 });
      const repositoryData = {
        name: repository.name,
        description: repository.description,
        language: repository.language,
        topics: repository.topics,
        structure: analysis.structure,
        files: analysis.keyFiles,
      };

      await updateReadmeJob(job.id, { progress: 70 });
      const llmResponse = await llmService.generateReadme(repositoryData, {
        style: options.style,
        includeImages: options.includeImages,
        includeBadges: options.includeBadges,
        includeToc: options.includeToc,
        customPrompt: options.customPrompt,
        model: options.model,
      });

      await updateReadmeJob(job.id, { progress: 85 });
      const processedContent = this.processReadmeContent(llmResponse.content, analysis);

      const wordCount = this.countWords(processedContent);
      const characterCount = processedContent.length;
      const contentHash = this.generateContentHash(processedContent);

      await updateReadmeJob(job.id, { progress: 90 });
      await createReadmeVersion({
        jobId: job.id,
        content: processedContent,
        contentHash,
        wordCount,
        characterCount,
        modelUsed: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        generationTime: llmResponse.generationTime,
      });

      const processingTime = Date.now() - startTime;
      await updateReadmeJob(job.id, {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        processingTime,
      });

      return {
        job,
        content: processedContent,
        metadata: {
          wordCount,
          characterCount,
          modelUsed: llmResponse.model,
          tokensUsed: llmResponse.tokensUsed,
          generationTime: llmResponse.generationTime,
        },
      };
    } catch (error) {
      await updateReadmeJob(job.id, {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      });

      throw error;
    }
  }

  private processReadmeContent(content: string, analysis: RepositoryAnalysis): string {
    let processed = content;

    processed = this.fixMarkdownFormatting(processed);

    processed = this.addRepositoryEnhancements(processed, analysis);

    processed = this.removeDuplicateSections(processed);

    processed = processed.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    return processed;
  }

  private fixMarkdownFormatting(content: string): string {
    let fixed = content.replace(/^#{4,}/gm, "###");

    fixed = fixed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const trimmedCode = code.trim();
      return `\`\`\`${lang || ""}\n${trimmedCode}\n\`\`\``;
    });

    fixed = fixed.replace(/^\s*[-*+]\s+/gm, "- ");

    fixed = fixed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      if (!url.startsWith("http") && !url.startsWith("#") && !url.startsWith("/")) {
        return `[${text}](#${url.toLowerCase().replace(/\s+/g, "-")})`;
      }
      return match;
    });

    return fixed;
  }

  private addRepositoryEnhancements(content: string, analysis: RepositoryAnalysis): string {
    let enhanced = content;

    if (analysis.buildTool && !enhanced.includes("## Installation")) {
      const installationSection = this.generateInstallationSection(analysis);
      enhanced = this.insertSection(enhanced, "## Installation", installationSection);
    }

    if (analysis.hasTests && !enhanced.includes("## Development")) {
      const developmentSection = this.generateDevelopmentSection(analysis);
      enhanced = this.insertSection(enhanced, "## Development", developmentSection);
    }

    if (analysis.hasDocker && !enhanced.includes("## Docker")) {
      const dockerSection = this.generateDockerSection();
      enhanced = this.insertSection(enhanced, "## Docker", dockerSection);
    }

    return enhanced;
  }

  private generateInstallationSection(analysis: RepositoryAnalysis): string {
    const { buildTool, packageInfo } = analysis;

    if (buildTool === "Cargo") {
      return `\n\`\`\`bash
cargo build
cargo run
\`\`\`\n`;
    }

    if (buildTool === "Go Modules") {
      return `\n\`\`\`bash
go mod download
go build
go run main.go
\`\`\`\n`;
    }

    if (packageInfo?.scripts?.install) {
      return `\n\`\`\`bash
npm install
\`\`\`\n`;
    }

    return `\n\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${analysis.name || "project"}

# Install dependencies
# Add installation instructions here
\`\`\`\n`;
  }

  private generateDevelopmentSection(analysis: RepositoryAnalysis): string {
    const { testFramework, packageInfo } = analysis;

    let section = "\n## Development\n\n";

    if (testFramework) {
      section += "### Running Tests\n\n```bash\n";
      if (testFramework === "Jest") {
        section += "npm test\n";
      } else if (testFramework === "pytest") {
        section += "pytest\n";
      } else if (testFramework === "Go Test") {
        section += "go test ./...\n";
      }
      section += "```\n\n";
    }

    if (packageInfo?.scripts) {
      const devScripts = Object.entries(packageInfo.scripts)
        .filter(([key]) => key.includes("dev") || key.includes("start"))
        .map(([key, value]) => `- \`${key}\`: ${value}`)
        .join("\n");

      if (devScripts) {
        section += `### Available Scripts\n\n${devScripts}\n\n`;
      }
    }

    return section;
  }

  private generateDockerSection(): string {
    return `\n## Docker\n\n\`\`\`bash
# Build the Docker image
docker build -t project-name .

# Run the container
docker run -p 3000:3000 project-name
\`\`\`\n`;
  }

  private insertSection(content: string, sectionTitle: string, sectionContent: string): string {
    const lines = content.split("\n");
    const insertIndex = lines.findIndex((line) => line.startsWith("#"));

    if (insertIndex === -1) {
      return `${content}\n${sectionTitle}${sectionContent}`;
    }

    lines.splice(insertIndex, 0, sectionTitle + sectionContent);
    return lines.join("\n");
  }

  private removeDuplicateSections(content: string): string {
    const sections = content.split(/(?=^#)/m);
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const section of sections) {
      const title = section.split("\n")[0];
      if (title && !seen.has(title)) {
        seen.add(title);
        unique.push(section);
      }
    }

    return unique.join("\n");
  }

  private countWords(content: string): number {
    return content
      .replace(/#{1,6}\s+/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private generateContentHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }
}

export const readmeGenerator = new ReadmeGenerator();
