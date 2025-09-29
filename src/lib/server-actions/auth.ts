"use server";

import { signIn, signOut } from "@/lib/auth";

export const login = async () => {
  await signIn("github", { redirect: true });
};

export const logout = async () => {
  await signOut({ redirect: true });
};
