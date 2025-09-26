import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/session";
import { FileText, Github, History, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/signin");
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="font-bold text-3xl text-foreground">
						Welcome back, {user.name || user.username}!
					</h1>
					<p className="mt-2 text-muted-foreground">
						Ready to generate beautiful READMEs for your repositories?
					</p>
				</div>
				<div className="mb-8 rounded-lg border bg-card p-6">
					<div className="mb-4 flex items-center gap-3">
						<Github className="h-6 w-6 text-primary" />
						<h2 className="font-semibold text-xl">GitHub App Status</h2>
					</div>
					<p className="mb-4 text-muted-foreground">
						Install the Clio GitHub App to access your repositories and generate
						READMEs.
					</p>
					<Button asChild>
						<Link href="/repositories">Install GitHub App</Link>
					</Button>
				</div>
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="rounded-lg border bg-card p-6">
						<div className="mb-4 flex items-center gap-3">
							<FileText className="h-6 w-6 text-primary" />
							<h3 className="font-semibold text-lg">Generate README</h3>
						</div>
						<p className="mb-4 text-muted-foreground">
							Create a beautiful README for any of your repositories.
						</p>
						<Button asChild className="w-full">
							<Link href="/generate">Start Generating</Link>
						</Button>
					</div>
					<div className="rounded-lg border bg-card p-6">
						<div className="mb-4 flex items-center gap-3">
							<History className="h-6 w-6 text-primary" />
							<h3 className="font-semibold text-lg">View History</h3>
						</div>
						<p className="mb-4 text-muted-foreground">
							See all your previously generated READMEs.
						</p>
						<Button asChild variant="outline" className="w-full">
							<Link href="/history">View History</Link>
						</Button>
					</div>
					<div className="rounded-lg border bg-card p-6">
						<div className="mb-4 flex items-center gap-3">
							<Settings className="h-6 w-6 text-primary" />
							<h3 className="font-semibold text-lg">Settings</h3>
						</div>
						<p className="mb-4 text-muted-foreground">
							Manage your account and preferences.
						</p>
						<Button asChild variant="outline" className="w-full">
							<Link href="/settings">Go to Settings</Link>
						</Button>
					</div>
				</div>
				<div className="rounded-lg border bg-card p-6">
					<h2 className="mb-4 font-semibold text-xl">Recent Activity</h2>
					<div className="py-8 text-center text-muted-foreground">
						<FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>
							No recent activity yet. Generate your first README to get started!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
