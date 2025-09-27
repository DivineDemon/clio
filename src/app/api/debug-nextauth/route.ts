import { NextResponse } from "next/server";
import { authOptions } from "@/server/auth";

export async function GET() {
  try {
    // Get the GitHub provider
    const githubProvider = authOptions.providers.find(p => p.id === "github");
    
    if (!githubProvider) {
      return NextResponse.json({
        status: "error",
        message: "GitHub provider not found",
      });
    }

    // Try to get the authorization URL
    const authUrl = await githubProvider.authorization({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`,
      scope: "read:user user:email",
      state: "test-state",
    });

    return NextResponse.json({
      status: "success",
      provider: {
        id: githubProvider.id,
        name: githubProvider.name,
        type: githubProvider.type,
      },
      authUrl,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Error generating auth URL",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
