import { logout } from "@/lib/server-actions/auth";
import React from "react";
import { Button } from "../ui/button";

const GithubLogoutButton = () => {
	return (
		<Button type="button" onClick={logout} className="w-full">
			Logout
		</Button>
	);
};

export default GithubLogoutButton;
