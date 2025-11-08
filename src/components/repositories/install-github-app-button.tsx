"use client";

import { ExternalLink, GitBranch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function InstallGithubAppButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    setIsLoading(true);
    try {
      window.open("/api/github/install", "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("Failed to open installation page", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleInstall} disabled={isLoading} className="inline-flex items-center">
      <GitBranch className="mr-2 h-4 w-4" />
      {isLoading ? "Opening..." : "Install GitHub App"}
      <ExternalLink className="ml-2 h-4 w-4" />
    </Button>
  );
}
