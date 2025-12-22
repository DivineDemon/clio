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
      includeImages = false,
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

TASK: Generate a comprehensive, professional README.md file.

STRICT RULES:
1. OUTPUT ONLY THE MARKDOWN CONTENT.
2. DO NOT include any conversational text, introductory phrases, or concluding remarks (e.g., "Here is the README", "Sure", "I hope this helps").
3. DO NOT use placeholders like "[Insert License Here]" unless absolutely necessary; try to infer from context.
4. Ensure the content is structured exactly as a README.md file.

SECTIONS TO INCLUDE (if applicable):
1. **Title & Description** - Clear, engaging title and one-paragraph description.
2. **Badges** - Build status, version, license, etc.
3. **Table of Contents** - Well-organized navigation.
4. **Features** - Key capabilities.
5. **Tech Stack** - Languages, frameworks, tools.
6. **Installation** - Step-by-step setup instructions.
7. **Usage** - Code snippets and usage examples.
8. **Configuration** - Environment variables explanation.
9. **API Documentation** - Endpoints or public methods.
10. **Contributing** - How to contribute.
11. **License** - License type.

REQUIREMENTS:
- Use proper Markdown formatting (headers, lists, code blocks).
- Make it visually appealing (emojis used effectively).
- Use the provided file structure to generate ACCURATE examples.

Generate the content now:`;

    return prompt;
  }
}

export const llmService = new LLMService();
