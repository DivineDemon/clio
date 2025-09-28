import { createHash } from "node:crypto";
import type { ReadmeJob, Repository } from "@prisma/client";
import { contentAnalyzer } from "./content-analyzer";
import type { RepositoryAnalysis } from "./content-analyzer";
import { llmService } from "./llm";
import {
	createReadmeJob,
	createReadmeVersion,
	updateReadmeJob,
} from "./readme-job";

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
	/**
	 * Generate README for a repository
	 */
	async generateReadme(
		repository: Repository,
		installationId: string,
		userId: string,
		options: ReadmeGenerationOptions = {},
	): Promise<ReadmeGenerationResult> {
		const startTime = Date.now();

		// Create README job
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
			// Update job status to processing
			await updateReadmeJob(job.id, {
				status: "PROCESSING",
				progress: 10,
				startedAt: new Date(),
			});

			// Analyze repository content
			await updateReadmeJob(job.id, { progress: 30 });
			const analysis = await contentAnalyzer.analyzeRepository(
				repository,
				installationId,
			);

			// Prepare repository data for LLM
			await updateReadmeJob(job.id, { progress: 50 });
			const repositoryData = {
				name: repository.name,
				description: repository.description,
				language: repository.language,
				topics: repository.topics,
				structure: analysis.structure,
				files: analysis.keyFiles,
			};

			// Generate README content using LLM
			await updateReadmeJob(job.id, { progress: 70 });
			const llmResponse = await llmService.generateReadme(repositoryData, {
				style: options.style,
				includeImages: options.includeImages,
				includeBadges: options.includeBadges,
				includeToc: options.includeToc,
				customPrompt: options.customPrompt,
				model: options.model,
			});

			// Process and clean the generated content
			await updateReadmeJob(job.id, { progress: 85 });
			const processedContent = this.processReadmeContent(
				llmResponse.content,
				analysis,
			);

			// Calculate content metrics
			const wordCount = this.countWords(processedContent);
			const characterCount = processedContent.length;
			const contentHash = this.generateContentHash(processedContent);

			// Create README version
			await updateReadmeJob(job.id, { progress: 90 });
			const version = await createReadmeVersion({
				jobId: job.id,
				content: processedContent,
				contentHash,
				wordCount,
				characterCount,
				modelUsed: llmResponse.model,
				tokensUsed: llmResponse.tokensUsed,
				generationTime: llmResponse.generationTime,
			});

			// Complete the job
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
			// Mark job as failed
			await updateReadmeJob(job.id, {
				status: "FAILED",
				errorMessage: error instanceof Error ? error.message : "Unknown error",
				completedAt: new Date(),
			});

			throw error;
		}
	}

	/**
	 * Process and enhance the generated README content
	 */
	private processReadmeContent(
		content: string,
		analysis: RepositoryAnalysis,
	): string {
		let processed = content;

		// Ensure proper markdown formatting
		processed = this.fixMarkdownFormatting(processed);

		// Add repository-specific enhancements
		processed = this.addRepositoryEnhancements(processed, analysis);

		// Clean up any duplicate sections
		processed = this.removeDuplicateSections(processed);

		// Ensure proper line endings
		processed = processed.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

		return processed;
	}

	/**
	 * Fix common markdown formatting issues
	 */
	private fixMarkdownFormatting(content: string): string {
		// Fix heading levels
		let fixed = content.replace(/^#{4,}/gm, "###");

		// Fix code block formatting
		fixed = fixed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
			const trimmedCode = code.trim();
			return `\`\`\`${lang || ""}\n${trimmedCode}\n\`\`\``;
		});

		// Fix list formatting
		fixed = fixed.replace(/^\s*[-*+]\s+/gm, "- ");

		// Fix link formatting
		fixed = fixed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
			if (
				!url.startsWith("http") &&
				!url.startsWith("#") &&
				!url.startsWith("/")
			) {
				return `[${text}](#${url.toLowerCase().replace(/\s+/g, "-")})`;
			}
			return match;
		});

		return fixed;
	}

	/**
	 * Add repository-specific enhancements
	 */
	private addRepositoryEnhancements(
		content: string,
		analysis: RepositoryAnalysis,
	): string {
		let enhanced = content;

		// Add installation instructions based on detected build tool
		if (analysis.buildTool && !enhanced.includes("## Installation")) {
			const installationSection = this.generateInstallationSection(analysis);
			enhanced = this.insertSection(
				enhanced,
				"## Installation",
				installationSection,
			);
		}

		// Add development setup if tests are detected
		if (analysis.hasTests && !enhanced.includes("## Development")) {
			const developmentSection = this.generateDevelopmentSection(analysis);
			enhanced = this.insertSection(
				enhanced,
				"## Development",
				developmentSection,
			);
		}

		// Add Docker section if Docker files are detected
		if (analysis.hasDocker && !enhanced.includes("## Docker")) {
			const dockerSection = this.generateDockerSection();
			enhanced = this.insertSection(enhanced, "## Docker", dockerSection);
		}

		return enhanced;
	}

	/**
	 * Generate installation section based on build tool
	 */
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

	/**
	 * Generate development section
	 */
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

	/**
	 * Generate Docker section
	 */
	private generateDockerSection(): string {
		return `\n## Docker\n\n\`\`\`bash
# Build the Docker image
docker build -t project-name .

# Run the container
docker run -p 3000:3000 project-name
\`\`\`\n`;
	}

	/**
	 * Insert a section into the README content
	 */
	private insertSection(
		content: string,
		sectionTitle: string,
		sectionContent: string,
	): string {
		const lines = content.split("\n");
		const insertIndex = lines.findIndex((line) => line.startsWith("#"));

		if (insertIndex === -1) {
			return `${content}\n${sectionTitle}${sectionContent}`;
		}

		lines.splice(insertIndex, 0, sectionTitle + sectionContent);
		return lines.join("\n");
	}

	/**
	 * Remove duplicate sections from content
	 */
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

	/**
	 * Count words in content
	 */
	private countWords(content: string): number {
		return content
			.replace(/#{1,6}\s+/g, "") // Remove headers
			.replace(/```[\s\S]*?```/g, "") // Remove code blocks
			.replace(/`[^`]+`/g, "") // Remove inline code
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
			.split(/\s+/)
			.filter((word) => word.length > 0).length;
	}

	/**
	 * Generate content hash for deduplication
	 */
	private generateContentHash(content: string): string {
		return createHash("sha256").update(content).digest("hex");
	}
}

// Export a singleton instance
export const readmeGenerator = new ReadmeGenerator();
