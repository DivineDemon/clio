import { Check, CircleX, Filter, RefreshCcw, Search } from "lucide-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import ReadmeJobList from "@/components/dashboard/readme-job-list";
import ReadmeJobSummary from "@/components/dashboard/readme-job-summary";
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
import type { ReadmeJobFilters } from "@/lib/services/readme-job";
import { getReadmeJobsForDashboard } from "@/lib/services/readme-job";
import { cn } from "@/lib/utils";

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function refreshJobsAction() {
  "use server";
  revalidatePath("/dashboard");
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const params = await searchParams;
  const filters: ReadmeJobFilters = {
    query: typeof params.query === "string" ? params.query : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    sortBy: typeof params.sort === "string" ? params.sort : undefined,
  };

  const { jobs, summary, availableStatuses } = await getReadmeJobsForDashboard(session.user.id, filters);

  const buildQuery = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams();
    if (filters.query) current.set("query", filters.query);
    if (filters.status) current.set("status", filters.status);
    if (filters.sortBy) current.set("sort", filters.sortBy);

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    }

    const query = current.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
  };

  const statusOptions = ["all", ...availableStatuses];
  const sortOptions = [
    { label: "Newest first", value: "createdDesc" },
    { label: "Oldest first", value: "createdAsc" },
    { label: "Recently updated", value: "updatedDesc" },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-5">
      <ReadmeJobSummary summary={summary} />
      <div className="flex w-full flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        <form className="flex w-full flex-col gap-2.5 md:flex-row md:items-center" method="get">
          <Input name="query" className="flex-1" placeholder="Search jobs..." defaultValue={filters.query ?? ""} />
          <Button type="submit" variant="secondary" size="icon">
            <Search />
          </Button>
        </form>
        <div className="flex items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Filter />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 space-y-2">
              <div>
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                  <DropdownMenuItem key={status} asChild>
                    <Link
                      href={buildQuery({
                        status: status === "all" ? undefined : status,
                      })}
                      className="flex w-full items-center justify-between text-sm"
                    >
                      <span>{status === "all" ? "All statuses" : status}</span>
                      {filters.status === status ? <Check className="h-4 w-4" /> : null}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
              <div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Sort</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem key={option.value} asChild>
                    <Link
                      href={buildQuery({
                        sort: option.value === "createdDesc" ? undefined : option.value,
                      })}
                      className="flex w-full items-center justify-between text-sm"
                    >
                      <span>{option.label}</span>
                      {filters.sortBy === option.value || (!filters.sortBy && option.value === "createdDesc") ? (
                        <Check className="h-4 w-4" />
                      ) : null}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {(filters.query || filters.status || filters.sortBy) && (
            <Link
              href="/dashboard"
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
          <form action={refreshJobsAction} className="border-primary border-l pl-2.5">
            <Button type="submit" variant="outline" size="icon">
              <RefreshCcw />
            </Button>
          </form>
        </div>
      </div>
      <ReadmeJobList jobs={jobs} />
    </div>
  );
}
