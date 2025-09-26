import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Check environment variables
		const envCheck = {
			NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
			NEXTAUTH_URL: process.env.NEXTAUTH_URL,
			GITHUB_CLIENT_ID: !!process.env.GITHUB_CLIENT_ID,
			GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
			DATABASE_URL: !!process.env.DATABASE_URL,
		};

		// Check database connection and user count
		const userCount = await db.user.count();
		const users = await db.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				githubId: true,
				username: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
			take: 5,
		});

		return NextResponse.json({
			status: "success",
			environment: envCheck,
			database: {
				connected: true,
				userCount,
				recentUsers: users,
			},
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
