"use client";

import { useEffect } from "react";
import type { ReadmeSettings } from "@/components/repositories/repository-list-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { RepositoryWithRelations } from "@/lib/types/repository";

interface ReadmeGenerationDialogProps {
  repo: RepositoryWithRelations;
  open: boolean;
  onOpen: () => void;
  onOpenChange: (open: boolean) => void;
  readmeSettings: ReadmeSettings;
  setReadmeSettings: React.Dispatch<React.SetStateAction<ReadmeSettings>>;
  onConfirm: () => void;
  isPending: boolean;
  isGenerating: boolean;
}

export default function ReadmeGenerationDialog({
  repo,
  open,
  onOpen,
  onOpenChange,
  readmeSettings,
  setReadmeSettings,
  onConfirm,
  isPending,
  isGenerating,
}: ReadmeGenerationDialogProps) {
  const isPrivate = repo.isPrivate;

  useEffect(() => {
    if (open && isPrivate && readmeSettings.includeBadges) {
      setReadmeSettings((prev) => ({
        ...prev,
        includeBadges: false,
      }));
    }
  }, [open, isPrivate, readmeSettings.includeBadges, setReadmeSettings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={onOpen} disabled={isPending || isGenerating}>
          {isGenerating ? "Processing..." : "Generate README"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>README Generation Settings</DialogTitle>
          <DialogDescription>
            Configure how the README should be generated for&nbsp;
            <span className="font-semibold">{repo.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="style">Writing Style</Label>
            <Select
              value={readmeSettings.style}
              onValueChange={(value) =>
                setReadmeSettings((prev) => ({
                  ...prev,
                  style: value as ReadmeSettings["style"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="rounded-md border border-blue-300 border-dashed bg-blue-50 px-3 py-2 text-blue-900 text-sm dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
            README generation currently runs on&nbsp;
            <span className="font-semibold">Gemini 2.5 Flash Lite</span> for balanced speed and quality.
          </p>
          <div className="space-y-4">
            <Label>Include Features</Label>
            <div className="space-y-3">
              <ToggleRow
                id="include-images"
                label="Images & Screenshots"
                description="Include relevant images and screenshots"
                checked={readmeSettings.includeImages}
                onCheckedChange={(checked) =>
                  setReadmeSettings((prev) => ({
                    ...prev,
                    includeImages: checked,
                  }))
                }
              />
              <ToggleRow
                id="include-badges"
                label="Badges & Shields"
                description={
                  isPrivate ? "Badges cannot be generated for private repositories." : "Add status badges and shields"
                }
                checked={readmeSettings.includeBadges}
                disabled={isPrivate}
                onCheckedChange={(checked) =>
                  setReadmeSettings((prev) => ({
                    ...prev,
                    includeBadges: checked,
                  }))
                }
              />
              <ToggleRow
                id="include-toc"
                label="Table of Contents"
                description="Generate a table of contents"
                checked={readmeSettings.includeToc}
                onCheckedChange={(checked) =>
                  setReadmeSettings((prev) => ({
                    ...prev,
                    includeToc: checked,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="custom-prompt"
              placeholder="Add any specific instructions for the README generation..."
              value={readmeSettings.customPrompt}
              onChange={(event) =>
                setReadmeSettings((prev) => ({
                  ...prev,
                  customPrompt: event.target.value,
                }))
              }
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? "Generating..." : "Generate README"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ id, label, description, checked, onCheckedChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
