import { env } from "@/env";

export async function GET() {
  // Only allow in development or with a secret key
  if (process.env.NODE_ENV === "production" && !process.env.DEBUG_SECRET) {
    return new Response("Not found", { status: 404 });
  }

  const debugInfo = {
    hasNextAuthSecret: !!env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!env.NEXTAUTH_URL,
    hasGitHubClientId: !!env.GITHUB_CLIENT_ID,
    hasGitHubClientSecret: !!env.GITHUB_CLIENT_SECRET,
    nextAuthUrl: env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  };

  return Response.json(debugInfo);
}
