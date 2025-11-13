import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import type { z } from "zod";
import { env } from "@/env";
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
}

export const AVAILABLE_MODELS: LLMModel[] = [
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    description: "Balanced speed and quality for README generation",
    maxTokens: 8192,
    contextWindow: 1000000,
  },
];

export class LLMService {
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    this.defaultModel = env.GEMINI_MODEL;

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = this.apiKey;
  }

  async getAvailableModels(): Promise<LLMModel[]> {
    return AVAILABLE_MODELS;
  }

  async generateContent(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const model = request.model || this.defaultModel;

    try {
      const result = await generateText({
        model: google(model),
        prompt: request.prompt,
      });

      const generationTime = Date.now() - startTime;

      return {
        content: result.text,
        model: model,
        tokensUsed: result.usage?.totalTokens,
        generationTime,
        finishReason: result.finishReason,
      };
    } catch (error) {
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

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
      maxTokens: 8192,
      temperature: 0.7,
    });
  }

  async generateStructuredContent<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options: {
      model?: string;
      temperature?: number;
    } = {},
  ): Promise<T> {
    const { model = this.defaultModel, temperature = 0.7 } = options;

    try {
      const result = await generateObject({
        model: google(model),
        prompt,
        schema,
        temperature,
      });

      return result.object;
    } catch (error) {
      throw new Error(
        `Failed to generate structured content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

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
    const { name, description, language, topics, structure, files } = repositoryData;
    const { style, includeImages, includeBadges, includeToc, customPrompt } = options;

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
}

export const llmService = new LLMService();
