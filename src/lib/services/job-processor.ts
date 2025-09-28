import { createInstallationOctokit } from "@/lib/github";
import type { ReadmeJob, Repository } from "@prisma/client";
import { getInstallationByInstallationId } from "./github-installation";
import { readmeGenerator } from "./readme-generator";
import {
	getPendingJobs,
	getProcessingJobs,
	getReadmeJobById,
	updateReadmeJob,
} from "./readme-job";
import { getRepositoryByGithubId } from "./repository";

type JobWithRepository = ReadmeJob & {
	repository: Repository;
};

export interface JobProcessorConfig {
	maxConcurrentJobs?: number;
	jobTimeout?: number;
	retryAttempts?: number;
	retryDelay?: number;
}

export class JobProcessor {
	private config: Required<JobProcessorConfig>;
	private isProcessing = false;
	private activeJobs = new Set<string>();

	constructor(config: JobProcessorConfig = {}) {
		this.config = {
			maxConcurrentJobs: config.maxConcurrentJobs ?? 3,
			jobTimeout: config.jobTimeout ?? 300000, // 5 minutes
			retryAttempts: config.retryAttempts ?? 3,
			retryDelay: config.retryDelay ?? 5000, // 5 seconds
		};
	}

	/**
	 * Start the job processor
	 */
	async start(): Promise<void> {
		if (this.isProcessing) {
			console.log("Job processor is already running");
			return;
		}

		this.isProcessing = true;
		console.log("Starting job processor...");

		// Process jobs continuously
		while (this.isProcessing) {
			try {
				await this.processJobs();
				// Wait 10 seconds before checking for new jobs
				await this.sleep(10000);
			} catch (error) {
				console.error("Error in job processor:", error);
				await this.sleep(5000); // Wait 5 seconds on error
			}
		}
	}

	/**
	 * Stop the job processor
	 */
	async stop(): Promise<void> {
		console.log("Stopping job processor...");
		this.isProcessing = false;

		// Wait for active jobs to complete
		while (this.activeJobs.size > 0) {
			console.log(
				`Waiting for ${this.activeJobs.size} active jobs to complete...`,
			);
			await this.sleep(1000);
		}

		console.log("Job processor stopped");
	}

	/**
	 * Process pending jobs
	 */
	private async processJobs(): Promise<void> {
		// Check if we can process more jobs
		if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
			return;
		}

		// Get pending jobs
		const pendingJobs = await getPendingJobs();
		const availableSlots = this.config.maxConcurrentJobs - this.activeJobs.size;
		const jobsToProcess = pendingJobs.slice(0, availableSlots);

		// Process jobs concurrently
		const promises = jobsToProcess.map((job) => this.processJob(job.id));
		await Promise.allSettled(promises);
	}

	/**
	 * Process a single job
	 */
	private async processJob(jobId: string): Promise<void> {
		if (this.activeJobs.has(jobId)) {
			return; // Job is already being processed
		}

		this.activeJobs.add(jobId);

		try {
			// Get job details
			const job = await this.getJobWithDetails(jobId);
			if (!job) {
				console.warn(`Job ${jobId} not found`);
				return;
			}

			// Check if job is still pending
			if (job.status !== "PENDING") {
				console.log(
					`Job ${jobId} is no longer pending (status: ${job.status})`,
				);
				return;
			}

			console.log(
				`Processing job ${jobId} for repository ${job.repository.fullName}`,
			);

			// Get installation details
			const installation = await getInstallationByInstallationId(
				Number.parseInt(job.repository.installationId),
			);
			if (!installation) {
				throw new Error(
					`Installation ${job.repository.installationId} not found`,
				);
			}

			// Process the job with timeout
			await this.processWithTimeout(job, installation.installationId);

			console.log(`Job ${jobId} completed successfully`);
		} catch (error) {
			console.error(`Error processing job ${jobId}:`, error);
			await this.handleJobError(jobId, error);
		} finally {
			this.activeJobs.delete(jobId);
		}
	}

	/**
	 * Process job with timeout
	 */
	private async processWithTimeout(
		job: JobWithRepository,
		installationId: number,
	): Promise<void> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						`Job ${job.id} timed out after ${this.config.jobTimeout}ms`,
					),
				);
			}, this.config.jobTimeout);
		});

		const processPromise = readmeGenerator.generateReadme(
			job.repository,
			installationId.toString(),
			job.userId,
			{
				style: job.style as "professional" | "casual" | "minimal" | "detailed",
				includeImages: job.includeImages,
				includeBadges: job.includeBadges,
				includeToc: job.includeToc,
				customPrompt: job.customPrompt,
			},
		);

		await Promise.race([processPromise, timeoutPromise]);
	}

	/**
	 * Handle job processing error
	 */
	private async handleJobError(jobId: string, error: unknown): Promise<void> {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		// Check if this is a retryable error
		const isRetryable = this.isRetryableError(error);
		const currentAttempts = await this.getJobRetryCount(jobId);

		if (isRetryable && currentAttempts < this.config.retryAttempts) {
			// Retry the job
			console.log(
				`Retrying job ${jobId} (attempt ${currentAttempts + 1}/${this.config.retryAttempts})`,
			);

			await updateReadmeJob(jobId, {
				status: "PENDING",
				errorMessage: null,
				retryCount: currentAttempts + 1,
			});

			// Wait before retrying
			await this.sleep(this.config.retryDelay * (currentAttempts + 1));
		} else {
			// Mark job as failed
			await updateReadmeJob(jobId, {
				status: "FAILED",
				errorMessage,
				completedAt: new Date(),
			});
		}
	}

	/**
	 * Check if error is retryable
	 */
	private isRetryableError(error: unknown): boolean {
		if (error instanceof Error) {
			const message = error.message.toLowerCase();
			return (
				message.includes("timeout") ||
				message.includes("network") ||
				message.includes("connection") ||
				message.includes("rate limit") ||
				message.includes("temporary")
			);
		}
		return false;
	}

	/**
	 * Get job retry count from database
	 */
	private async getJobRetryCount(jobId: string): Promise<number> {
		const job = await getReadmeJobById(jobId);
		return job?.retryCount || 0;
	}

	/**
	 * Get job with all necessary details
	 */
	private async getJobWithDetails(
		jobId: string,
	): Promise<JobWithRepository | null> {
		const job = await getReadmeJobById(jobId);
		if (!job) return null;

		// Type assertion for the repository relation
		return job as JobWithRepository;
	}

	/**
	 * Sleep utility
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Get processor status
	 */
	getStatus(): {
		isProcessing: boolean;
		activeJobs: number;
		maxConcurrentJobs: number;
	} {
		return {
			isProcessing: this.isProcessing,
			activeJobs: this.activeJobs.size,
			maxConcurrentJobs: this.config.maxConcurrentJobs,
		};
	}
}

// Export a singleton instance
export const jobProcessor = new JobProcessor();
