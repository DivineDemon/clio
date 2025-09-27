import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test basic environment variables
    const env = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: !!process.env.GITHUB_CLIENT_SECRET,
    };

    // Test if we can construct the GitHub OAuth URL manually
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.NEXTAUTH_URL + '/api/auth/callback/github')}&scope=read:user user:email&state=test`;

    return NextResponse.json({
      status: "success",
      environment: env,
      githubOAuthUrl,
      nextAuthUrl: `${env.NEXTAUTH_URL}/api/auth/signin/github`,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
