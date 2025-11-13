"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface ReadmeEditorProps {
  initialContent: string;
  lastSavedLabel: string | null;
  saveReadme: (content: string) => Promise<{ success: boolean; message?: string }>;
}

export default function ReadmeEditor({ initialContent, lastSavedLabel, saveReadme }: ReadmeEditorProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [baseline, setBaseline] = useState<string>(initialContent);
  const [lastSaved, setLastSaved] = useState<string>(lastSavedLabel ?? "Never");
  const [isPending, startTransition] = useTransition();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setContent(initialContent);
    setBaseline(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (lastSavedLabel) {
      setLastSaved(lastSavedLabel);
    }
  }, [lastSavedLabel]);

  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [content]);

  const characterCount = content.length;
  const hasChanges = content !== baseline;
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await saveReadme(content);
        if (result.success) {
          toast.success(result.message ?? "README saved.");
          setBaseline(content);
          setLastSaved("Just now");
        } else {
          toast.error(result.message ?? "Failed to save README.");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save README.");
      }
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("README copied to clipboard.");
    } catch {
      toast.error("Unable to copy to clipboard.");
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-5">
      <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 text-muted-foreground text-xs">
          <span>Words: {wordCount}</span>
          <span>Characters: {characterCount}</span>
          <span>Last saved: {lastSaved}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopy}>
            Copy
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isPending || content.trim().length === 0}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
      <div
        data-color-mode={colorMode}
        className="h-[calc(100vh-212px)] w-full overflow-hidden rounded-lg border border-border"
      >
        <MDEditor value={content} onChange={(value = "") => setContent(value)} height={769} preview="live" />
      </div>
    </div>
  );
}
