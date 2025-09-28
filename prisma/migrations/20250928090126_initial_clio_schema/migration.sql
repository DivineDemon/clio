-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "public"."Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "public"."GitHubInstallation" (
    "id" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "events" TEXT[],
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" INTEGER,
    "suspendedByLogin" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Repository" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL,
    "defaultBranch" TEXT NOT NULL,
    "language" TEXT,
    "topics" TEXT[],
    "size" INTEGER NOT NULL,
    "stargazersCount" INTEGER NOT NULL,
    "forksCount" INTEGER NOT NULL,
    "openIssuesCount" INTEGER NOT NULL,
    "watchersCount" INTEGER NOT NULL,
    "pushedAt" TIMESTAMP(3),
    "githubCreatedAt" TIMESTAMP(3) NOT NULL,
    "githubUpdatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadmeJob" (
    "id" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "repositoryId" TEXT NOT NULL,
    "includeImages" BOOLEAN NOT NULL DEFAULT true,
    "includeBadges" BOOLEAN NOT NULL DEFAULT true,
    "includeToc" BOOLEAN NOT NULL DEFAULT true,
    "style" TEXT NOT NULL DEFAULT 'professional',
    "customPrompt" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "processingTime" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadmeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadmeVersion" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "characterCount" INTEGER NOT NULL,
    "modelUsed" TEXT,
    "tokensUsed" INTEGER,
    "generationTime" INTEGER,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadmeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "public"."Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubInstallation_installationId_key" ON "public"."GitHubInstallation"("installationId");

-- CreateIndex
CREATE INDEX "GitHubInstallation_installationId_idx" ON "public"."GitHubInstallation"("installationId");

-- CreateIndex
CREATE INDEX "GitHubInstallation_accountLogin_idx" ON "public"."GitHubInstallation"("accountLogin");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubId_key" ON "public"."Repository"("githubId");

-- CreateIndex
CREATE INDEX "Repository_fullName_idx" ON "public"."Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_owner_idx" ON "public"."Repository"("owner");

-- CreateIndex
CREATE INDEX "Repository_language_idx" ON "public"."Repository"("language");

-- CreateIndex
CREATE INDEX "ReadmeJob_status_idx" ON "public"."ReadmeJob"("status");

-- CreateIndex
CREATE INDEX "ReadmeJob_userId_idx" ON "public"."ReadmeJob"("userId");

-- CreateIndex
CREATE INDEX "ReadmeJob_repositoryId_idx" ON "public"."ReadmeJob"("repositoryId");

-- CreateIndex
CREATE INDEX "ReadmeVersion_jobId_idx" ON "public"."ReadmeVersion"("jobId");

-- CreateIndex
CREATE INDEX "ReadmeVersion_contentHash_idx" ON "public"."ReadmeVersion"("contentHash");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GitHubInstallation" ADD CONSTRAINT "GitHubInstallation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Repository" ADD CONSTRAINT "Repository_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "public"."GitHubInstallation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadmeJob" ADD CONSTRAINT "ReadmeJob_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "public"."Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadmeJob" ADD CONSTRAINT "ReadmeJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadmeVersion" ADD CONSTRAINT "ReadmeVersion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."ReadmeJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
