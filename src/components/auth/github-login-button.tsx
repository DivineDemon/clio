"use client";

import type React from "react";
import { login } from "@/lib/server-actions/auth";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface GithubLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  size?: "sm" | "lg" | "default" | "icon";
}

const GithubLoginButton = ({ size, className, children }: GithubLoginButtonProps) => {
  return (
    <Button size={size} type="button" onClick={login} className={cn("w-auto", className)}>
      {children || "Sign in with GitHub"}
    </Button>
  );
};

export { GithubLoginButton };
export default GithubLoginButton;
