import GithubLogoutButton from "@/components/auth/github-logout-button";
import { Button } from "@/components/ui/button";
import {
	AlertCircle,
	BookOpen,
	CheckCircle,
	Clock,
	Filter,
	GitBranch,
	Plus,
	Search,
} from "lucide-react";
import Image from "next/image";

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
			{/* Header */}
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
								<Image
									alt="User"
									width={32}
									height={32}
									src={user.image || ""}
									className="size-8 rounded-full"
								/>
								<span className="font-medium text-sm">{user.name}</span>
							</div>
							<GithubLogoutButton />
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="font-bold text-3xl text-gray-900 dark:text-white">
						Welcome back, {user.name?.split(" ")[0] || "Developer"}!
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-300">
						Manage your repositories and generate beautiful READMEs with AI.
					</p>
				</div>

				{/* Quick Actions */}
				<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
						<div className="flex items-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
								<Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="ml-4">
								<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
									Generate README
								</h3>
								<p className="text-gray-600 text-sm dark:text-gray-300">
									Create a new README
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
						<div className="flex items-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
								<GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div className="ml-4">
								<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
									My Repositories
								</h3>
								<p className="text-gray-600 text-sm dark:text-gray-300">
									View all repositories
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
						<div className="flex items-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
								<Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="ml-4">
								<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
									Recent Jobs
								</h3>
								<p className="text-gray-600 text-sm dark:text-gray-300">
									View job history
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
						<div className="flex items-center">
							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
								<CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
							</div>
							<div className="ml-4">
								<h3 className="font-semibold text-gray-900 text-lg dark:text-white">
									Completed
								</h3>
								<p className="text-gray-600 text-sm dark:text-gray-300">
									View completed READMEs
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Repositories Section */}
				<div className="rounded-lg bg-white shadow dark:bg-slate-800">
					<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
						<div className="flex items-center justify-between">
							<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
								Your Repositories
							</h2>
							<div className="flex items-center space-x-2">
								<Button variant="outline" size="sm">
									<Search className="mr-2 h-4 w-4" />
									Search
								</Button>
								<Button variant="outline" size="sm">
									<Filter className="mr-2 h-4 w-4" />
									Filter
								</Button>
							</div>
						</div>
					</div>

					<div className="p-6">
						<div className="py-12 text-center">
							<GitBranch className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
								No repositories found
							</h3>
							<p className="mt-2 text-gray-600 dark:text-gray-300">
								Install the Clio GitHub App to access your repositories and
								start generating READMEs.
							</p>
							<div className="mt-6">
								<Button>Install GitHub App</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="mt-8 rounded-lg bg-white shadow dark:bg-slate-800">
					<div className="border-gray-200 border-b px-6 py-4 dark:border-gray-700">
						<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
							Recent Activity
						</h2>
					</div>

					<div className="p-6">
						<div className="py-12 text-center">
							<Clock className="mx-auto h-12 w-12 text-gray-400" />
							<h3 className="mt-4 font-semibold text-gray-900 text-lg dark:text-white">
								No recent activity
							</h3>
							<p className="mt-2 text-gray-600 dark:text-gray-300">
								Your README generation jobs will appear here.
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
