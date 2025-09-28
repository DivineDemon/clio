"use client";

import { login } from "@/lib/server-actions/auth";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";

interface GithubLoginButtonProps {
	className?: string;
}

const GithubLoginButton = ({ className }: GithubLoginButtonProps) => {
	return (
		<Button type="button" onClick={login} className={cn("w-full", className)}>
			Sign in with GitHub
		</Button>
	);
};

export { GithubLoginButton };
export default GithubLoginButton;
