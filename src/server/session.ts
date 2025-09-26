import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { getServerSession } from "next-auth";

export async function getCurrentUser() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return null;
	}

	const user = await db.user.findUnique({
		where: { email: session.user.email },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			githubId: true,
			username: true,
			avatarUrl: true,
			createdAt: true,
		},
	});

	return user;
}

export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Authentication required");
	}

	return user;
}
