import { login } from "@/lib/server-actions/auth";
import React from "react";
import { Button } from "../ui/button";

const GithubLoginButton = () => {
	return (
		<Button type="button" onClick={login}>
			Sign in with GitHub
		</Button>
	);
};

export default GithubLoginButton;
