"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface FeatureFlag {
  label: string;
  enabled: boolean;
}

interface RepositoryInfo {
  name: string;
  fullName: string;
  language: string;
  createdLabel: string;
  completedLabel?: string | null;
}

interface JobDetails {
  status: string;
  progress: number;
  errorMessage?: string | null;
  style: string;
  features: FeatureFlag[];
}

interface VersionMetrics {
  wordCount: number;
  characterCount: number;
  updatedLabel: string;
}

interface ReadmeInfoSheetProps {
  repository: RepositoryInfo;
  job: JobDetails;
  customPrompt?: string | null;
  latestVersion?: VersionMetrics | null;
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "capitalize bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  PROCESSING: "capitalize bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  QUEUED: "capitalize bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  FAILED: "capitalize bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  CANCELLED: "capitalize bg-slate-200 text-slate-600 dark:bg-slate-800/40 dark:text-slate-300",
  PENDING: "capitalize bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground",
};

export default function ReadmeInfoSheet({ repository, job, customPrompt, latestVersion }: ReadmeInfoSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="View README metadata">
          <Info />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xl gap-0 space-y-0 overflow-y-auto">
        <SheetHeader className="border-b">
          <SheetTitle>README metadata</SheetTitle>
          <SheetDescription>Review the associated details.</SheetDescription>
        </SheetHeader>
        <div className="flex w-full flex-col items-start justify-start">
          <div className="flex w-full flex-col items-center justify-center gap-3.5 border-b p-5">
            <span className="mb-1.5 w-full text-left font-semibold text-[16px] leading-[16px]">Repository</span>
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Name</p>
              <p className="w-full text-right font-semibold text-[14px] leading-[14px]">{repository.name}</p>
            </div>
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Full name</p>
              <p className="w-full text-right font-semibold text-[14px] leading-[14px]">{repository.fullName}</p>
            </div>
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Primary language</p>
              <Badge variant="outline">{repository.language}</Badge>
            </div>
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Created</p>
              <p className="w-full text-right font-semibold text-[14px] leading-[14px]">{repository.createdLabel}</p>
            </div>
            {repository.completedLabel && (
              <div className="flex w-full items-center justify-center">
                <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Last completed</p>
                <p className="w-full text-right font-semibold text-[14px] leading-[14px]">
                  {repository.completedLabel}
                </p>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-3.5 border-b p-5">
            <span className="mb-1.5 w-full text-left font-semibold text-[16px] leading-[16px]">Job details</span>
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Status</p>
              <Badge variant="default" className={STATUS_STYLES[job.status]}>
                {job.status.toLowerCase()}
              </Badge>
            </div>
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Progress</p>
              <p className="w-full text-right font-semibold text-[14px] leading-[14px]">{job.progress}%</p>
            </div>
            {job.errorMessage && (
              <div className="flex w-full items-center justify-center">
                <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Error message</p>
                <p className="w-full text-right font-semibold text-[14px] leading-[14px]">{job.errorMessage}</p>
              </div>
            )}
            <div className="flex w-full items-center justify-center">
              <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Style</p>
              <p className="w-full text-right font-semibold text-[14px] capitalize leading-[14px]">{job.style}</p>
            </div>
            <div className="flex w-full flex-wrap gap-2">
              {job.features.map((flag) => (
                <Badge key={flag.label} variant="default" className={!flag.enabled ? "opacity-70" : undefined}>
                  {flag.enabled ? flag.label : `${flag.label} (off)`}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-3.5 border-b p-5">
            <span className="mb-1.5 w-full text-left font-semibold text-[16px] leading-[16px]">Custom prompt</span>
            <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">
              {customPrompt ?? "No custom prompt provided for this job."}
            </p>
          </div>
          {latestVersion && (
            <div className="flex w-full flex-col items-center justify-center gap-3.5 border-b p-5">
              <span className="mb-1.5 w-full text-left font-semibold text-[16px] leading-[16px]">
                Latest version metrics
              </span>
              <div className="flex w-full items-center justify-center">
                <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Word count</p>
                <p className="w-full text-right font-semibold text-[14px] leading-[14px]">{latestVersion.wordCount}</p>
              </div>
              <div className="flex w-full items-center justify-center">
                <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Character count</p>
                <p className="w-full text-right font-semibold text-[14px] leading-[14px]">
                  {latestVersion.characterCount}
                </p>
              </div>
              <div className="flex w-full items-center justify-center">
                <p className="w-full text-left text-[14px] text-muted-foreground leading-[14px]">Last updated</p>
                <p className="w-full text-right font-semibold text-[14px] capitalize leading-[14px]">
                  {latestVersion.updatedLabel}
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
