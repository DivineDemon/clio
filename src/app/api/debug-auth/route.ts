import { NextResponse } from "next/server";
import { authOptions } from "@/server/auth";

export async function GET() {
  try {
    // Check if authOptions is properly configured
    const providers = authOptions.providers;
    const githubProvider = providers.find(p => p.id === "github");
    
    if (!githubProvider) {
      return NextResponse.json({
        status: "error",
        message: "GitHub provider not found in authOptions",
        providers: providers.map(p => ({ id: p.id, name: p.name })),
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Auth configuration looks correct",
      providers: providers.map(p => ({ id: p.id, name: p.name })),
      githubProvider: {
        id: githubProvider.id,
        name: githubProvider.name,
        type: githubProvider.type,
      },
      callbacks: Object.keys(authOptions.callbacks || {}),
      sessionStrategy: authOptions.session?.strategy,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Error checking auth configuration",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
