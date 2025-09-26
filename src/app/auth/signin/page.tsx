import { Button } from "@/components/ui/button";
import { authOptions } from "@/server/auth";
import { Github } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SignInPage() {
	const session = await getServerSession(authOptions);

	if (session) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="w-full max-w-md space-y-8 p-8">
				<div className="text-center">
					<h1 className="font-bold text-3xl text-foreground">
						Welcome to Clio
					</h1>
					<p className="mt-2 text-muted-foreground">
						The Muse of History, telling the story of your code
					</p>
				</div>
				<div className="mt-8 space-y-6">
					<form action="/api/auth/signin/github" method="post">
						<Button
							type="submit"
							className="flex w-full items-center justify-center gap-2"
							size="lg"
						>
							<Github className="h-5 w-5" />
							Sign in with GitHub
						</Button>
					</form>
					<div className="text-center text-muted-foreground text-sm">
						By signing in, you agree to our&nbsp;
						<Link href="/terms" className="text-primary hover:underline">
							Terms of Service
						</Link>
						&nbsp; and&nbsp;
						<Link href="/privacy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
					</div>
				</div>
				<div className="mt-8 text-center">
					<p className="text-muted-foreground text-sm">
						New to Clio? Sign in to get started with generating beautiful
						READMEs for your repositories.
					</p>
				</div>
			</div>
		</div>
	);
}
