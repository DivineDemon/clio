import { BookOpen, CheckCircle, Clock, GitBranch, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GithubLogoutButton from "@/components/auth/github-logout-button";
import RecentActivity from "@/components/dashboard/recent-activity";
import RepositoryList from "@/components/dashboard/repository-list";

interface DashboardProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">Clio Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image alt="User" width={32} height={32} src={user.image || ""} className="size-8 rounded-full" />
                <span className="font-medium text-sm">{user.name?.split(" ")[0] || "Developer"}</span>
              </div>
              <GithubLogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-gray-900 dark:text-white">
            Welcome back, {user.name?.split(" ")[0] || "Developer"}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your repositories and generate beautiful READMEs with AI.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="#repositories"
            className="rounded-lg bg-white p-6 shadow transition-colors hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 text-lg dark:text-white">Generate README</h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">Create a new README</p>
              </div>
            </div>
          </Link>

          <Link
            href="#repositories"
            className="rounded-lg bg-white p-6 shadow transition-colors hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 text-lg dark:text-white">My Repositories</h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">View all repositories</p>
              </div>
            </div>
          </Link>

          <Link
            href="/history"
            className="rounded-lg bg-white p-6 shadow transition-colors hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 text-lg dark:text-white">Generation History</h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">View all jobs</p>
              </div>
            </div>
          </Link>

          <Link
            href="/history?status=COMPLETED"
            className="rounded-lg bg-white p-6 shadow transition-colors hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900 text-lg dark:text-white">Completed READMEs</h3>
                <p className="text-gray-600 text-sm dark:text-gray-300">View completed jobs</p>
              </div>
            </div>
          </Link>
        </div>

        <div id="repositories">
          <RepositoryList />
        </div>

        <RecentActivity />
      </main>
    </div>
  );
}
