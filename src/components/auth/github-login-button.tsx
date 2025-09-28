"use client";

import { login } from "@/lib/server-actions/auth";
import { cn } from "@/lib/utils";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface GithubLoginButtonProps {
	className?: string;
}

const GithubLoginButton = ({ className }: GithubLoginButtonProps) => {
	const handleLogin = async () => {
		try {
			toast.loading("Signing in with GitHub...", {
				id: "github-login",
			});
			await login();
			toast.dismiss("github-login");
			toast.success("Successfully signed in!");
		} catch (error) {
			toast.dismiss("github-login");
			toast.error("Failed to sign in. Please try again.");
			console.error("Login error:", error);
		}
	};

	return (
		<Button
			type="button"
			onClick={handleLogin}
			className={cn("w-auto", className)}
		>
			Sign in with GitHub
		</Button>
	);
};

export { GithubLoginButton };
export default GithubLoginButton;
