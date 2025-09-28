"use client";

import { logout } from "@/lib/server-actions/auth";
import { cn } from "@/lib/utils";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface GithubLogoutButtonProps {
	className?: string;
}

const GithubLogoutButton = ({ className }: GithubLogoutButtonProps) => {
	const handleLogout = async () => {
		try {
			toast.loading("Signing out...", {
				id: "github-logout",
			});
			await logout();
			toast.dismiss("github-logout");
			toast.success("Successfully signed out!");
		} catch (error) {
			toast.dismiss("github-logout");
			toast.error("Failed to sign out. Please try again.");
			console.error("Logout error:", error);
		}
	};

	return (
		<Button
			type="button"
			onClick={handleLogout}
			className={cn("w-auto", className)}
		>
			Logout
		</Button>
	);
};

export default GithubLogoutButton;
