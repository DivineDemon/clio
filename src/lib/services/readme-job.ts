import { type JobStatus, Prisma, type ReadmeJob, type ReadmeVersion } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/logger";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import { db } from "@/server/db";

export interface CreateReadmeJobData {
  repositoryId: string;
  userId: string;
  includeImages?: boolean;
  includeBadges?: boolean;
  includeToc?: boolean;
  style?: string;
  customPrompt?: string | null;
}

export interface UpdateReadmeJobData {
  status?: JobStatus;
  progress?: number;
  errorMessage?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  processingTime?: number | null;
  retryCount?: number;
}

export interface CreateReadmeVersionData {
  jobId: string;
  content: string;
  contentHash: string;
  wordCount: number;
  characterCount: number;
  modelUsed?: string | null;
  tokensUsed?: number | null;
  generationTime?: number | null;
}

export async function createReadmeJob(data: CreateReadmeJobData): Promise<ReadmeJob> {
  return await db.readmeJob.create({
    data: {
      repositoryId: data.repositoryId,
      userId: data.userId,
      includeImages: data.includeImages ?? true,
      includeBadges: data.includeBadges ?? true,
      includeToc: data.includeToc ?? true,
      style: data.style ?? "professional",
      customPrompt: data.customPrompt,
    },
  });
}

export async function getReadmeJobById(id: string): Promise<ReadmeJob | null> {
  return await db.readmeJob.findUnique({
    where: { id },
    include: {
      repository: {
        include: {
          installation: true,
        },
      },
      user: true,
      versions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getReadmeJobsByUserId(userId: string, status?: JobStatus): Promise<ReadmeJob[]> {
  return await db.readmeJob.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    include: {
      repository: {
        include: {
          installation: true,
        },
      },
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateReadmeJob(id: string, data: UpdateReadmeJobData): Promise<ReadmeJob | null> {
  try {
    return await db.readmeJob.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      logger.warn("Attempted to update non-existent ReadmeJob", {
        jobId: id,
        dataKeys: Object.keys(data),
      });
      return null;
    }
    throw error;
  }
}

export async function deleteReadmeJob(id: string): Promise<void> {
  await db.readmeJob.delete({
    where: { id },
  });
}

export async function createReadmeVersion(data: CreateReadmeVersionData): Promise<ReadmeVersion> {
  return await db.readmeVersion.create({
    data: {
      jobId: data.jobId,
      content: data.content,
      contentHash: data.contentHash,
      wordCount: data.wordCount,
      characterCount: data.characterCount,
      modelUsed: data.modelUsed,
      tokensUsed: data.tokensUsed,
      generationTime: data.generationTime,
    },
  });
}

export async function getLatestReadmeVersion(jobId: string): Promise<ReadmeVersion | null> {
  return await db.readmeVersion.findFirst({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          repository: true,
          user: true,
        },
      },
    },
  });
}

export interface ReadmeJobFilters {
  query?: string;
  status?: string;
  sortBy?: string;
}

export interface ReadmeJobSummary {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  lastCompletedAt?: string;
}

export interface DashboardJobsResult {
  jobs: ReadmeJobWithRelations[];
  summary: ReadmeJobSummary;
  availableStatuses: string[];
}

export async function getReadmeJobsForDashboard(
  userId: string,
  filters: ReadmeJobFilters,
): Promise<DashboardJobsResult> {
  const where: Record<string, unknown> = {
    userId,
    ...(filters.query && {
      OR: [
        {
          repository: {
            name: { contains: filters.query, mode: "insensitive" },
          },
        },
        {
          repository: {
            fullName: { contains: filters.query, mode: "insensitive" },
          },
        },
      ],
    }),
    ...(filters.status && filters.status !== "all"
      ? {
          status: filters.status,
        }
      : {}),
  };

  let orderBy: Prisma.ReadmeJobOrderByWithRelationInput = { createdAt: "desc" };

  if (filters.sortBy === "createdAsc") {
    orderBy = { createdAt: "asc" };
  } else if (filters.sortBy === "updatedDesc") {
    orderBy = { updatedAt: "desc" };
  }

  const jobs = (await db.readmeJob.findMany({
    where,
    include: {
      repository: true,
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy,
  })) as ReadmeJobWithRelations[];

  const summaryAggregate = await db.readmeJob.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  });

  const total = jobs.length;
  const completed = summaryAggregate.find((item) => item.status === "COMPLETED")?._count ?? 0;
  const processing = summaryAggregate.find((item) => item.status === "PROCESSING")?._count ?? 0;
  const failed = summaryAggregate.find((item) => item.status === "FAILED")?._count ?? 0;

  const lastCompletedJob = await db.readmeJob.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  const summary: ReadmeJobSummary = {
    total,
    completed,
    processing,
    failed,
    lastCompletedAt: lastCompletedJob?.completedAt
      ? formatDistanceToNow(lastCompletedJob.completedAt, { addSuffix: true })
      : undefined,
  };

  const availableStatuses = summaryAggregate.map((item) => item.status);

  return {
    jobs,
    summary,
    availableStatuses,
  };
}
