import type { JobStatus, ReadmeJob, ReadmeVersion } from "@prisma/client";
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

export async function getReadmeJobsByRepositoryId(repositoryId: string): Promise<ReadmeJob[]> {
  return await db.readmeJob.findMany({
    where: { repositoryId },
    include: {
      user: true,
      versions: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateReadmeJob(id: string, data: UpdateReadmeJobData): Promise<ReadmeJob> {
  return await db.readmeJob.update({
    where: { id },
    data,
  });
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

export async function getReadmeVersionById(id: string): Promise<ReadmeVersion | null> {
  return await db.readmeVersion.findUnique({
    where: { id },
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

export async function getReadmeVersionsByJobId(jobId: string): Promise<ReadmeVersion[]> {
  return await db.readmeVersion.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingJobs(): Promise<ReadmeJob[]> {
  return await db.readmeJob.findMany({
    where: { status: "PENDING" },
    include: {
      repository: {
        include: {
          installation: true,
        },
      },
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getProcessingJobs(): Promise<ReadmeJob[]> {
  return await db.readmeJob.findMany({
    where: { status: "PROCESSING" },
    include: {
      repository: {
        include: {
          installation: true,
        },
      },
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });
}
