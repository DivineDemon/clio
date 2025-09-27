import GithubLoginButton from "@/components/auth/github-login-button";
import GithubLogoutButton from "@/components/auth/github-logout-button";
import { auth } from "@/lib/auth";
import Image from "next/image";
import React from "react";

const Page = async () => {
	const session = await auth();

	return (
		<div className="flex h-screen w-full items-center justify-center">
			{session ? (
				<div className="flex flex-col items-center justify-center gap-5">
					<div className="flex items-center justify-center gap-2.5">
						<Image
							alt="User"
							width={32}
							height={32}
							src={session.user?.image || ""}
							className="size-10 rounded-full"
						/>
						<div className="flex flex-1 flex-col items-center justify-center gap-2">
							<span className="w-full text-left font-semibold text-[16px] leading-[16px]">
								{session.user?.name}
							</span>
							<span className="w-full text-left font-normal text-[14px] text-muted-foreground leading-[14px]">
								{session.user?.email}
							</span>
						</div>
					</div>
					<GithubLogoutButton />
				</div>
			) : (
				<GithubLoginButton className="w-auto" />
			)}
		</div>
	);
};

export default Page;
