import type { JobStatus } from "@prisma/client";
import { z } from "zod";
import { getInstallationById } from "@/lib/services/github-installation";
import { readmeGenerator } from "@/lib/services/readme-generator";
import { getLatestReadmeVersion, getReadmeJobById, getReadmeJobsByUserId } from "@/lib/services/readme-job";
import { getRepositoryById } from "@/lib/services/repository";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const readmeRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        repositoryId: z.string(),
        style: z.enum(["professional", "casual", "minimal", "detailed"]).optional(),
        includeImages: z.boolean().optional(),
        includeBadges: z.boolean().optional(),
        includeToc: z.boolean().optional(),
        customPrompt: z.string().optional(),
        model: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { repositoryId, ...options } = input;

      const repository = await getRepositoryById(repositoryId);
      if (!repository) {
        throw new Error("Repository not found");
      }

      if (repository.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized access to repository");
      }

      const installation = await getInstallationById(repository.installationId);
      if (!installation) {
        throw new Error("GitHub App installation not found");
      }

      const result = await readmeGenerator.queueReadmeGeneration(
        repository,
        installation.installationId.toString(),
        ctx.session.user.id,
        options,
      );

      return {
        jobId: result.jobId,
        status: result.status,
        message: "README generation queued successfully. Check job status for progress.",
      };
    }),

  getJob: protectedProcedure.input(z.object({ jobId: z.string() })).query(async ({ ctx, input }) => {
    const job = await getReadmeJobById(input.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== ctx.session.user.id) {
      throw new Error("Unauthorized access to job");
    }

    return job;
  }),

  getUserJobs: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const status = input.status as JobStatus | undefined;
      const userId = ctx.session.user.id as string;
      const jobs = await getReadmeJobsByUserId(userId, status);
      return jobs.slice(0, input.limit);
    }),

  getLatestVersion: protectedProcedure.input(z.object({ jobId: z.string() })).query(async ({ ctx, input }) => {
    const job = await getReadmeJobById(input.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.userId !== ctx.session.user.id) {
      throw new Error("Unauthorized access to job");
    }

    const version = await getLatestReadmeVersion(input.jobId);
    return version;
  }),

  getActiveJobs: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const queuedJobs = await getReadmeJobsByUserId(userId, "QUEUED" as JobStatus);
    const processingJobs = await getReadmeJobsByUserId(userId, "PROCESSING" as JobStatus);

    return [...queuedJobs, ...processingJobs];
  }),
});
