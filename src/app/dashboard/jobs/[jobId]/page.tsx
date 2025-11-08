import { createHash } from "node:crypto";
import { formatDistanceToNow } from "date-fns";
import { Trash } from "lucide-react";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import ReadmeEditor from "@/components/jobs/readme-editor";
import ReadmeInfoSheet from "@/components/jobs/readme-info-sheet";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { createReadmeVersion, deleteReadmeJob, getReadmeJobById } from "@/lib/services/readme-job";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";

interface JobPageProps {
  params: Promise<{ jobId: string }>;
}

interface SaveResult {
  success: boolean;
  message?: string;
}

async function saveReadmeContent(jobId: string, content: string): Promise<SaveResult> {
  "use server";

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const job = (await getReadmeJobById(jobId)) as ReadmeJobWithRelations | null;
  if (!job || job.userId !== session.user.id) {
    throw new Error("Unauthorized request");
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return { success: false, message: "README content cannot be empty." };
  }

  const latestVersion = job.versions?.[0];
  if (latestVersion && latestVersion.content === content) {
    return { success: true, message: "No changes detected." };
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const characterCount = content.length;
  const contentHash = createHash("sha256").update(content).digest("hex");

  await createReadmeVersion({
    jobId,
    content,
    contentHash,
    wordCount,
    characterCount,
    modelUsed: latestVersion?.modelUsed ?? null,
    tokensUsed: latestVersion?.tokensUsed ?? null,
    generationTime: null,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/jobs/${jobId}`);

  return { success: true, message: "README saved successfully." };
}

export default async function JobPage({ params }: JobPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const { jobId } = await params;
  if (!jobId) {
    notFound();
  }

  const job = (await getReadmeJobById(jobId)) as ReadmeJobWithRelations | null;
  if (!job || job.userId !== session.user.id) {
    notFound();
  }

  const latestVersion = job.versions?.[0] ?? null;
  const initialContent = latestVersion?.content ?? "# README\n\nStart documenting your project...";
  const lastSavedLabel = latestVersion
    ? formatDistanceToNow(new Date(latestVersion.updatedAt), { addSuffix: true })
    : null;

  const createdLabel = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });
  const completedLabel = job.completedAt ? formatDistanceToNow(new Date(job.completedAt), { addSuffix: true }) : null;
  const latestMetrics = latestVersion
    ? {
        wordCount: latestVersion.wordCount,
        characterCount: latestVersion.characterCount,
        updatedLabel: formatDistanceToNow(new Date(latestVersion.updatedAt), { addSuffix: true }),
      }
    : null;

  const featureFlags = [
    { label: "Images", enabled: job.includeImages },
    { label: "Badges", enabled: job.includeBadges },
    { label: "Table of contents", enabled: job.includeToc },
  ];

  const saveAction = saveReadmeContent.bind(null, job.id);
  const deleteAction = async () => {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      redirect("/");
    }

    const existing = (await getReadmeJobById(job.id)) as ReadmeJobWithRelations | null;
    if (!existing || existing.userId !== session.user.id) {
      throw new Error("Unauthorized request");
    }

    await deleteReadmeJob(job.id);
    revalidatePath("/dashboard");
    redirect("/dashboard");
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-5">
      <div className="flex w-full items-center gap-2.5">
        <span className="flex-1 truncate text-left font-bold text-xl capitalize">
          {job.repository?.name ?? "Unknown repository"}
        </span>
        <ReadmeInfoSheet
          repository={{
            name: job.repository?.name ?? "Unknown repository",
            fullName: job.repository?.fullName ?? "—",
            language: job.repository?.language ?? "Unknown",
            createdLabel,
            completedLabel,
          }}
          job={{
            status: job.status,
            progress: job.progress,
            errorMessage: job.errorMessage,
            style: job.style,
            features: featureFlags,
          }}
          customPrompt={job.customPrompt}
          latestVersion={latestMetrics}
        />
        <form action={deleteAction}>
          <Button type="submit" variant="destructive" size="icon" aria-label="Delete README job">
            <Trash className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <div className="h-[calc(100vh-124px)] w-full overflow-hidden">
        <ReadmeEditor initialContent={initialContent} lastSavedLabel={lastSavedLabel} saveReadme={saveAction} />
      </div>
    </div>
  );
}
