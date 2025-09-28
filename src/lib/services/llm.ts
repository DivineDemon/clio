import { env } from "@/env";
import type { GitHubModel, GitHubModelsResponse } from "@/lib/types/octokit";
import type { FileStructure, KeyFile } from "./content-analyzer";

export interface LLMModel {
	id: string;
	name: string;
	description?: string;
	maxTokens?: number;
	contextWindow?: number;
}

export interface LLMResponse {
	content: string;
	model: string;
	tokensUsed?: number;
	generationTime?: number;
	finishReason?: string;
}

export interface LLMRequest {
	prompt: string;
	model?: string;
	maxTokens?: number;
	temperature?: number;
	topP?: number;
	stream?: boolean;
}

// Available models from your Open WebUI setup
export const AVAILABLE_MODELS: LLMModel[] = [
	{
		id: "deepseek-r1:14b",
		name: "DeepSeek R1 14B",
		description: "Advanced reasoning model with 14B parameters",
		maxTokens: 4096,
		contextWindow: 128000,
	},
	{
		id: "gpt-oss:latest",
		name: "GPT OSS Latest",
		description: "Open source GPT alternative",
		maxTokens: 4096,
		contextWindow: 128000,
	},
	{
		id: "llama3.2:1b",
		name: "Llama 3.2 1B",
		description: "Lightweight Llama model for fast generation",
		maxTokens: 2048,
		contextWindow: 128000,
	},
];

export class LLMService {
	private baseUrl: string;
	private defaultModel: string;

	constructor() {
		this.baseUrl = env.LLM_API_URL;
		this.defaultModel = "deepseek-r1:14b"; // Default to the most capable model
	}

	/**
	 * Get available models from the LLM service
	 */
	async getAvailableModels(): Promise<LLMModel[]> {
		try {
			const response = await fetch(`${this.baseUrl}/v1/models`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				console.warn("Failed to fetch models from LLM service, using defaults");
				return AVAILABLE_MODELS;
			}

			const data = (await response.json()) as GitHubModelsResponse;
			// Transform the response to match our interface
			return (
				data.data?.map((model: GitHubModel) => ({
					id: model.id,
					name: model.id,
					description: model.id,
				})) || AVAILABLE_MODELS
			);
		} catch (error) {
			console.warn("Error fetching models, using defaults:", error);
			return AVAILABLE_MODELS;
		}
	}

	/**
	 * Generate content using the LLM
	 */
	async generateContent(request: LLMRequest): Promise<LLMResponse> {
		const startTime = Date.now();
		const model = request.model || this.defaultModel;

		try {
			const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model,
					messages: [
						{
							role: "user",
							content: request.prompt,
						},
					],
					max_tokens: request.maxTokens || 4096,
					temperature: request.temperature || 0.7,
					top_p: request.topP || 0.9,
					stream: request.stream || false,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`LLM API error: ${response.status} - ${errorText}`);
			}

			const data = await response.json();
			const generationTime = Date.now() - startTime;

			return {
				content: data.choices?.[0]?.message?.content || "",
				model: data.model || model,
				tokensUsed: data.usage?.total_tokens,
				generationTime,
				finishReason: data.choices?.[0]?.finish_reason,
			};
		} catch (error) {
			console.error("LLM generation error:", error);
			throw new Error(
				`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate README content with repository context
	 */
	async generateReadme(
		repositoryData: {
			name: string;
			description?: string | null;
			language?: string | null;
			topics: string[];
			structure: FileStructure;
			files: KeyFile[];
		},
		options: {
			style?: string;
			includeImages?: boolean;
			includeBadges?: boolean;
			includeToc?: boolean;
			customPrompt?: string | null;
			model?: string;
		} = {},
	): Promise<LLMResponse> {
		const {
			style = "professional",
			includeImages = true,
			includeBadges = true,
			includeToc = true,
			customPrompt,
			model,
		} = options;

		// Build the prompt based on repository data and options
		const prompt = this.buildReadmePrompt(repositoryData, {
			style,
			includeImages,
			includeBadges,
			includeToc,
			customPrompt,
		});

		return await this.generateContent({
			prompt,
			model,
			maxTokens: 4096,
			temperature: 0.7,
		});
	}

	/**
	 * Build a comprehensive prompt for README generation
	 */
	private buildReadmePrompt(
		repositoryData: {
			name: string;
			description?: string | null;
			language?: string | null;
			topics: string[];
			structure: FileStructure;
			files: KeyFile[];
		},
		options: {
			style: string;
			includeImages: boolean;
			includeBadges: boolean;
			includeToc: boolean;
			customPrompt?: string | null;
		},
	): string {
		const { name, description, language, topics, structure, files } =
			repositoryData;
		const { style, includeImages, includeBadges, includeToc, customPrompt } =
			options;

		const prompt = `You are an expert technical writer specializing in creating comprehensive, professional README.md files for GitHub repositories.

REPOSITORY INFORMATION:
- Name: ${name}
- Description: ${description || "No description provided"}
- Primary Language: ${language || "Unknown"}
- Topics: ${topics.join(", ") || "None"}
- File Structure: ${JSON.stringify(structure, null, 2)}
- Key Files: ${files.map((f) => f.path).join(", ")}

STYLE REQUIREMENTS:
- Style: ${style}
- Include Images: ${includeImages ? "Yes" : "No"}
- Include Badges: ${includeBadges ? "Yes" : "No"}
- Include Table of Contents: ${includeToc ? "Yes" : "No"}

${customPrompt ? `CUSTOM INSTRUCTIONS:\n${customPrompt}\n` : ""}

TASK: Generate a comprehensive README.md file that includes:

1. **Project Title & Description** - Clear, engaging title and description
2. **Badges** (if requested) - Build status, version, license, etc.
3. **Table of Contents** (if requested) - Well-organized navigation
4. **Installation** - Clear setup instructions
5. **Usage** - Examples and usage patterns
6. **API Documentation** (if applicable) - Endpoint documentation
7. **Configuration** - Environment variables, config files
8. **Contributing** - Guidelines for contributors
9. **License** - License information
10. **Changelog** (if applicable) - Recent changes
11. **Support** - How to get help

REQUIREMENTS:
- Use proper Markdown formatting
- Include code examples with syntax highlighting
- Make it visually appealing and professional
- Ensure all sections are relevant to the actual codebase
- Use emojis sparingly but effectively
- Include practical examples based on the actual file structure
- Make installation and usage instructions specific to this project

Generate the complete README.md content now:`;

		return prompt;
	}

	/**
	 * Test the LLM connection
	 */
	async testConnection(): Promise<boolean> {
		try {
			const response = await this.generateContent({
				prompt: "Hello, please respond with 'Connection successful'",
				maxTokens: 10,
			});
			return response.content.includes("Connection successful");
		} catch (error) {
			console.error("LLM connection test failed:", error);
			return false;
		}
	}
}

// Export a singleton instance
export const llmService = new LLMService();
