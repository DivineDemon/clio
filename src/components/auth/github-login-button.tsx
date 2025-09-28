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
		// The login function will handle the redirect automatically
		await login();
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
