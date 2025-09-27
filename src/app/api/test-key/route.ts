import { NextResponse } from "next/server";
import { createAppAuth } from "@octokit/auth-app";

export async function GET() {
  try {
    const APP_ID = process.env.GITHUB_APP_ID;
    const PRIVATE_KEY = process.env.GITHUB_PRIVATE_KEY;

    if (!APP_ID || !PRIVATE_KEY) {
      return NextResponse.json({
        status: "error",
        message: "Missing APP_ID or PRIVATE_KEY",
        hasAppId: !!APP_ID,
        hasPrivateKey: !!PRIVATE_KEY,
      });
    }

    // Test if we can create the auth instance
    const auth = createAppAuth({
      appId: Number(APP_ID),
      privateKey: PRIVATE_KEY,
    });

    return NextResponse.json({
      status: "success",
      message: "Private key format is correct",
      appId: APP_ID,
      privateKeyLength: PRIVATE_KEY.length,
      privateKeyStart: PRIVATE_KEY.substring(0, 50) + "...",
      privateKeyEnd: "..." + PRIVATE_KEY.substring(PRIVATE_KEY.length - 50),
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Private key format is incorrect",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
