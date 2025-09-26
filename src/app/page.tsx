import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/session";
import { FileText, Github, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
	const user = await getCurrentUser();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="text-center">
					<h1 className="mb-6 font-bold text-4xl text-foreground md:text-6xl">
						Clio
					</h1>
					<p className="mb-8 text-muted-foreground text-xl md:text-2xl">
						The Muse of History, telling the story of your code
					</p>
					<p className="mx-auto mb-12 max-w-3xl text-lg text-muted-foreground">
						Generate beautiful, comprehensive READMEs for your GitHub
						repositories with the power of AI. No more empty or outdated
						documentation.
					</p>

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button asChild size="lg" className="px-8 py-6 text-lg">
							<Link href="/auth/signin">
								<Github className="mr-2 h-5 w-5" />
								Get Started with GitHub
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="px-8 py-6 text-lg"
						>
							<Link href="/help">Learn More</Link>
						</Button>
					</div>
				</div>
			</div>
			<div className="bg-muted/50 py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl text-foreground">
							Why Choose Clio?
						</h2>
						<p className="text-lg text-muted-foreground">
							Everything you need to create professional READMEs
						</p>
					</div>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div className="p-6 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Zap className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">AI-Powered</h3>
							<p className="text-muted-foreground">
								Advanced AI analyzes your code and generates comprehensive,
								accurate documentation automatically.
							</p>
						</div>
						<div className="p-6 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Github className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">GitHub Integration</h3>
							<p className="text-muted-foreground">
								Seamlessly connect with your GitHub repositories. Works with
								public, private, and organization repos.
							</p>
						</div>
						<div className="p-6 text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Shield className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold text-xl">Secure & Private</h3>
							<p className="text-muted-foreground">
								Your code stays private. We only read your repositories and
								never modify them automatically.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="py-16">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center">
						<h2 className="mb-4 font-bold text-3xl text-foreground">
							How It Works
						</h2>
						<p className="text-lg text-muted-foreground">
							Three simple steps to beautiful documentation
						</p>
					</div>
					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
								1
							</div>
							<h3 className="mb-2 font-semibold text-xl">Connect</h3>
							<p className="text-muted-foreground">
								Sign in with GitHub and install the Clio app on your
								repositories.
							</p>
						</div>
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
								2
							</div>
							<h3 className="mb-2 font-semibold text-xl">Generate</h3>
							<p className="text-muted-foreground">
								Select a repository and let our AI analyze your code to create a
								comprehensive README.
							</p>
						</div>
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl">
								3
							</div>
							<h3 className="mb-2 font-semibold text-xl">Download</h3>
							<p className="text-muted-foreground">
								Review, customize, and download your beautiful README to use in
								your project.
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-primary py-16 text-primary-foreground">
				<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
					<h2 className="mb-4 font-bold text-3xl">
						Ready to Transform Your Documentation?
					</h2>
					<p className="mb-8 text-xl opacity-90">
						Join thousands of developers who trust Clio for their README
						generation.
					</p>
					<Button
						asChild
						size="lg"
						variant="secondary"
						className="px-8 py-6 text-lg"
					>
						<Link href="/auth/signin">
							<Github className="mr-2 h-5 w-5" />
							Get Started Now
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
