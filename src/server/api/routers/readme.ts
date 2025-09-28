import { getInstallationById } from "@/lib/services/github-installation";
import { readmeGenerator } from "@/lib/services/readme-generator";
import {
	getLatestReadmeVersion,
	getReadmeJobById,
	getReadmeJobsByUserId,
} from "@/lib/services/readme-job";
import { getRepositoryById } from "@/lib/services/repository";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { JobStatus } from "@prisma/client";
import { z } from "zod";

export const readmeRouter = createTRPCRouter({
	/**
	 * Generate README for a repository
	 */
	generate: protectedProcedure
		.input(
			z.object({
				repositoryId: z.string(),
				style: z
					.enum(["professional", "casual", "minimal", "detailed"])
					.optional(),
				includeImages: z.boolean().optional(),
				includeBadges: z.boolean().optional(),
				includeToc: z.boolean().optional(),
				customPrompt: z.string().optional(),
				model: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { repositoryId, ...options } = input;

			// Get repository details
			const repository = await getRepositoryById(repositoryId);
			if (!repository) {
				throw new Error("Repository not found");
			}

			// Check if user owns this repository
			if (repository.userId !== ctx.session.user.id) {
				throw new Error("Unauthorized access to repository");
			}

			// Get installation details using the installationId from the repository
			// Note: repository.installationId is the database CUID
			const installation = await getInstallationById(repository.installationId);
			if (!installation) {
				throw new Error("GitHub App installation not found");
			}

			// Queue README generation (immediate return)
			const result = await readmeGenerator.queueReadmeGeneration(
				repository,
				installation.installationId.toString(),
				ctx.session.user.id,
				options,
			);

			return {
				jobId: result.jobId,
				status: result.status,
				message:
					"README generation queued successfully. Check job status for progress.",
			};
		}),

	/**
	 * Get README job status
	 */
	getJob: protectedProcedure
		.input(z.object({ jobId: z.string() }))
		.query(async ({ ctx, input }) => {
			const job = await getReadmeJobById(input.jobId);
			if (!job) {
				throw new Error("Job not found");
			}

			// Check if user owns this job
			if (job.userId !== ctx.session.user.id) {
				throw new Error("Unauthorized access to job");
			}

			return job;
		}),

	/**
	 * Get user's README jobs
	 */
	getUserJobs: protectedProcedure
		.input(
			z.object({
				status: z
					.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
					.optional(),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ ctx, input }) => {
			const status = input.status as JobStatus | undefined;
			const userId = ctx.session.user.id as string;
			const jobs = await getReadmeJobsByUserId(userId, status);
			return jobs.slice(0, input.limit);
		}),

	/**
	 * Get latest README version for a job
	 */
	getLatestVersion: protectedProcedure
		.input(z.object({ jobId: z.string() }))
		.query(async ({ ctx, input }) => {
			const job = await getReadmeJobById(input.jobId);
			if (!job) {
				throw new Error("Job not found");
			}

			// Check if user owns this job
			if (job.userId !== ctx.session.user.id) {
				throw new Error("Unauthorized access to job");
			}

			const version = await getLatestReadmeVersion(input.jobId);
			return version;
		}),

	/**
	 * Get active jobs (QUEUED or PROCESSING) for real-time updates
	 */
	getActiveJobs: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		if (!userId) {
			throw new Error("User not authenticated");
		}

		const queuedJobs = await getReadmeJobsByUserId(
			userId,
			"QUEUED" as JobStatus,
		);
		const processingJobs = await getReadmeJobsByUserId(
			userId,
			"PROCESSING" as JobStatus,
		);

		return [...queuedJobs, ...processingJobs];
	}),

	/**
	 * Test LLM connection
	 */
	testConnection: protectedProcedure.query(async () => {
		const { llmService } = await import("@/lib/services/llm");
		return await llmService.testConnection();
	}),

	/**
	 * Get available LLM models
	 */
	getModels: protectedProcedure.query(async () => {
		const { llmService } = await import("@/lib/services/llm");
		return await llmService.getAvailableModels();
	}),
});
