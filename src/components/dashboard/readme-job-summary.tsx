import { GitBranch, Loader2, RefreshCw, XCircle } from "lucide-react";
import type { ReadmeJobSummary as Summary } from "@/lib/services/readme-job";

interface ReadmeJobSummaryProps {
  summary: Summary;
}

export default function ReadmeJobSummary({ summary }: ReadmeJobSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="flex w-full items-center justify-center gap-5 rounded-xl bg-card p-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted-foreground p-3">
          <GitBranch className="size-full text-muted" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="w-full text-left text-[24px] leading-[24px]">{summary.total}</span>
          <span className="w-full text-left text-[12px] text-muted-foreground leading-[12px]">
            README.md Generations
          </span>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-5 rounded-xl bg-card p-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/20 p-3">
          <RefreshCw className="size-full text-emerald-500" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="w-full text-left text-[24px] leading-[24px]">{summary.completed}</span>
          <span className="w-full text-left text-[12px] text-muted-foreground leading-[12px]">Completed</span>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-5 rounded-xl bg-card p-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20 p-3">
          <Loader2 className="size-full text-amber-500" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="w-full text-left text-[24px] leading-[24px]">{summary.processing}</span>
          <span className="w-full text-left text-[12px] text-muted-foreground leading-[12px]">Processing</span>
        </div>
      </div>
      <div className="flex w-full items-center justify-center gap-5 rounded-xl bg-card p-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/20 p-3">
          <XCircle className="size-full text-destructive" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="w-full text-left text-[24px] leading-[24px]">{summary.failed}</span>
          <span className="w-full text-left text-[12px] text-muted-foreground leading-[12px]">Failed</span>
        </div>
      </div>
    </div>
  );
}
