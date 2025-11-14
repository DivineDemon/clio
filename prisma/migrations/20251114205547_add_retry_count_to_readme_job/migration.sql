-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'QUEUED';

-- AlterTable
ALTER TABLE "ReadmeJob" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
