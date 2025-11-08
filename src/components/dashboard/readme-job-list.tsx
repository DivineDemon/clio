import { formatDistanceToNow } from "date-fns";
import { Clock, Folder, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import { cn } from "@/lib/utils";
import EmptyState from "../empty-state";

interface ReadmeJobListProps {
  jobs: ReadmeJobWithRelations[];
}

export default function ReadmeJobList({ jobs }: ReadmeJobListProps) {
  if (jobs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex w-full flex-col items-start justify-start gap-5">
      {jobs.map((job) => {
        const repoName = job.repository?.name ?? "Unknown repository";
        const statusBadge = getStatusBadge(job.status, job.progress);

        return (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="flex w-full flex-col items-center justify-center gap-5 rounded-lg border border-gray-200 p-5 transition-all duration-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-slate-700"
          >
            <div className="flex w-full items-start justify-start">
              <div className="flex flex-1 items-center justify-center gap-5">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted-foreground p-3">
                  <Folder className="size-full text-muted" />
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <span className="w-full text-left font-medium text-[24px] leading-[24px]">{repoName}</span>
                  <span className="w-full text-left text-[12px] text-muted-foreground leading-[12px]">
                    {job.repository?.fullName}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-end gap-2">
                <span
                  className={cn(
                    "inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 font-medium text-xs",
                    statusBadge.className,
                  )}
                >
                  {statusBadge.icon}
                  {statusBadge.label}
                </span>
                <div className="flex w-full items-center justify-start gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="mt-0.5 text-[14px] text-muted-foreground leading-[14px]">
                    Created&nbsp;
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function getStatusBadge(
  status: ReadmeJobWithRelations["status"],
  progress: number,
): { label: string; className: string; icon?: React.ReactNode } {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      };
    case "PROCESSING":
      return {
        label: `Processing • ${progress}%`,
        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      };
    case "QUEUED":
      return { label: "Queued", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
    case "FAILED":
      return { label: "Failed", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground" };
  }
}
