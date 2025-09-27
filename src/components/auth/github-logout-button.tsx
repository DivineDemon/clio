"use client";

import { logout } from "@/lib/server-actions/auth";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";

interface GithubLogoutButtonProps {
	className?: string;
}

const GithubLogoutButton = ({ className }: GithubLogoutButtonProps) => {
	return (
		<Button type="button" onClick={logout} className={cn("w-full", className)}>
			Logout
		</Button>
	);
};

export default GithubLogoutButton;
