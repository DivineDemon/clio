import { Check, CircleX, Filter, RefreshCcw, Search } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import InstallGithubAppButton from "@/components/repositories/install-github-app-button";
import RepositoryListClient from "@/components/repositories/repository-list-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { getInstallationsByUserId } from "@/lib/services/github-installation";
import { syncInstallationRepositories } from "@/lib/services/github-sync";
import { getReadmeJobsByUserId } from "@/lib/services/readme-job";
import {
  getRepositoriesForUser,
  type RepositoryPrivacyFilter,
  type RepositoryQueryResult,
  type RepositorySortOption,
} from "@/lib/services/repository";
import type { ReadmeJobWithRelations } from "@/lib/types/readme-job";
import type { RepositoryWithRelations } from "@/lib/types/repository";
import { cn } from "@/lib/utils";

interface RepositoriesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function refreshRepositoriesAction() {
  "use server";
  revalidatePath("/repositories");
}

async function syncRepositoriesAction(formData: FormData) {
  "use server";
  const installationIdValue = formData.get("installationId");
  if (!installationIdValue) {
    throw new Error("Installation ID is required");
  }

  const installationId = Number.parseInt(String(installationIdValue), 10);
  if (Number.isNaN(installationId)) {
    throw new Error("Invalid installation ID");
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  await syncInstallationRepositories(session.user.id, installationId);
  revalidatePath("/repositories");
}

export default async function RepositoriesPage({ searchParams }: RepositoriesPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const userId = session.user?.id;

  if (!userId) {
    redirect("/");
  }

  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : "";
  const languageParam = typeof params.language === "string" ? params.language : "all";
  const privacyParam =
    typeof params.privacy === "string" && ["all", "public", "private"].includes(params.privacy)
      ? (params.privacy as RepositoryPrivacyFilter)
      : "all";
  const sortParam =
    typeof params.sort === "string" && ["name", "stars", "forks", "updated", "created"].includes(params.sort)
      ? (params.sort as RepositorySortOption)
      : "name";
  const errorParam = typeof params.error === "string" ? params.error : undefined;
  const errorMessage =
    errorParam === "installation-failed"
      ? "We couldn't verify your GitHub App installation. Please try again."
      : errorParam;

  const [jobs, repositoryResult, installations] = await Promise.all([
    getReadmeJobsByUserId(userId) as Promise<ReadmeJobWithRelations[]>,
    getRepositoriesForUser(userId, {
      search,
      language: languageParam,
      privacy: privacyParam,
      sortBy: sortParam,
    }) as Promise<RepositoryQueryResult>,
    getInstallationsByUserId(userId),
  ]);

  const repositories = repositoryResult.repositories as RepositoryWithRelations[];
  const availableLanguages = repositoryResult.availableLanguages;
  const primaryInstallation = installations[0] ?? null;
  const hasActiveFilters =
    search.trim().length > 0 || languageParam !== "all" || privacyParam !== "all" || sortParam !== "name";

  const baseParams = new URLSearchParams();
  if (search.trim().length > 0) baseParams.set("search", search.trim());
  if (languageParam !== "all") baseParams.set("language", languageParam);
  if (privacyParam !== "all") baseParams.set("privacy", privacyParam);
  if (sortParam !== "name") baseParams.set("sort", sortParam);

  const buildQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(baseParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    return query ? `/repositories?${query}` : "/repositories";
  };

  const languageOptions = ["all", ...Array.from(new Set(availableLanguages.filter(Boolean)))];

  const privacyOptions: { label: string; value: RepositoryPrivacyFilter }[] = [
    { label: "All repositories", value: "all" },
    { label: "Public only", value: "public" },
    { label: "Private only", value: "private" },
  ];

  const sortOptions: { label: string; value: RepositorySortOption }[] = [
    { label: "Name", value: "name" },
    { label: "Stars", value: "stars" },
    { label: "Forks", value: "forks" },
    { label: "Last updated", value: "updated" },
    { label: "Date created", value: "created" },
  ];

  if (!primaryInstallation) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        {errorMessage && (
          <div className="mb-4 w-full max-w-md rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            {errorMessage}
          </div>
        )}
        <h1 className="font-semibold text-2xl">Connect your GitHub account</h1>
        <p className="mt-2.5 mb-5 text-muted-foreground text-sm">
          Install the Clio GitHub App to sync your repositories
          <br />
          and start generating READMEs directly from the dashboard.
        </p>
        <InstallGithubAppButton />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-5">
      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive text-sm">
          {errorMessage}
        </div>
      )}
      <div className="flex w-full flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <form className="flex w-full flex-col gap-3 md:flex-row md:items-center" method="get">
          <Input name="search" className="flex-1" placeholder="Search repositories..." defaultValue={search} />
          <Button type="submit" variant="secondary" size="icon">
            <Search />
          </Button>
        </form>
        <div className="flex items-center gap-2.5 border-primary border-l pl-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Filter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 space-y-2">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languageOptions.map((language) => (
                <DropdownMenuItem key={language} asChild>
                  <Link
                    href={buildQuery({
                      language: language === "all" ? undefined : language,
                    })}
                    className="flex w-full items-center justify-between text-sm"
                  >
                    <span>{language === "all" ? "All languages" : language}</span>
                    {languageParam === language ? <Check className="h-4 w-4" /> : null}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Privacy</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {privacyOptions.map((option) => (
                <DropdownMenuItem key={option.value} asChild>
                  <Link
                    href={buildQuery({
                      privacy: option.value === "all" ? undefined : option.value,
                    })}
                    className="flex w-full items-center justify-between text-sm"
                  >
                    <span>{option.label}</span>
                    {privacyParam === option.value ? <Check className="h-4 w-4" /> : null}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem key={option.value} asChild>
                  <Link
                    href={buildQuery({
                      sort: option.value === "name" ? undefined : option.value,
                    })}
                    className="flex w-full items-center justify-between text-sm"
                  >
                    <span>{option.label}</span>
                    {sortParam === option.value ? <Check className="h-4 w-4" /> : null}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && (
            <Link
              href="/repositories"
              className={cn(
                buttonVariants({
                  variant: "destructive",
                  size: "icon",
                }),
              )}
            >
              <CircleX />
            </Link>
          )}
          <form action={refreshRepositoriesAction}>
            <Button type="submit" variant="outline" size="icon">
              <RefreshCcw />
            </Button>
          </form>
          <form action={syncRepositoriesAction}>
            <input type="hidden" name="installationId" value={primaryInstallation?.installationId ?? ""} />
            <Button type="submit" variant="default" disabled={!primaryInstallation}>
              Re-sync Repos
            </Button>
          </form>
        </div>
      </div>
      {repositories.length === 0 ? (
        <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-gray-300 border-dashed text-center dark:border-gray-700">
          <h3 className="font-semibold text-lg">No repositories match your filters</h3>
          <p className="mt-2 text-muted-foreground text-sm">
            {hasActiveFilters
              ? "Try adjusting your search or filter criteria."
              : "Sync your GitHub installation to fetch repositories."}
          </p>
        </div>
      ) : (
        <RepositoryListClient repositories={repositories} jobs={jobs} />
      )}
    </div>
  );
}
