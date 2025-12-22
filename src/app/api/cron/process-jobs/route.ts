import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { readmeGenerator } from "@/lib/services/readme-generator";
import { db } from "@/server/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queuedJobs = await db.readmeJob.findMany({
      where: {
        status: {
          in: ["QUEUED", "PENDING"],
        },
      },
      include: {
        repository: {
          include: {
            installation: true,
          },
        },
      },
      take: 3, // Process 3 jobs per run to stay within time limits
      orderBy: {
        createdAt: "asc",
      },
    });

    if (queuedJobs.length === 0) {
      return NextResponse.json({ message: "No jobs to process" });
    }

    logger.info(`Processing ${queuedJobs.length} jobs via cron`, {
      jobIds: queuedJobs.map((j) => j.id),
    });

    // Process jobs sequentially to avoid overwhelming the system
    const results = [];
    for (const job of queuedJobs) {
      try {
        if (!job.repository?.installation) {
          await db.readmeJob.update({
            where: { id: job.id },
            data: {
              status: "FAILED",
              errorMessage: "Repository or installation not found",
              completedAt: new Date(),
            },
          });
          results.push({ jobId: job.id, status: "failed", reason: "missing_repo_or_installation" });
          continue;
        }

        await readmeGenerator.processReadmeJob(
          job.id,
          job.repository,
          job.repository.installation.installationId.toString(),
          {
            style: (job.style as "professional" | "casual" | "minimal" | "detailed") ?? "professional",
            includeImages: job.includeImages,
            includeBadges: job.includeBadges,
            includeToc: job.includeToc,
            customPrompt: job.customPrompt,
          },
        );

        results.push({ jobId: job.id, status: "processed" });
      } catch (error) {
        logger.error(`Failed to process job ${job.id}`, error as Error);
        results.push({
          jobId: job.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} jobs`,
      results,
    });
  } catch (error) {
    logger.error("Cron job processing failed", error as Error);
    return NextResponse.json({ error: "Failed to process jobs" }, { status: 500 });
  }
}
