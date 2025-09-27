"use client";

import { Button } from "@/components/ui/button";

export default function TestOAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="font-bold text-3xl text-foreground">
            OAuth Test Page
          </h1>
          <p className="mt-2 text-muted-foreground">
            Testing different OAuth methods
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Method 1: Form submission */}
          <form action="/api/auth/signin/github" method="post">
            <Button type="submit" className="w-full">
              Method 1: Form POST to /api/auth/signin/github
            </Button>
          </form>
          
          {/* Method 2: Direct link */}
          <Button asChild className="w-full">
            <a href="/api/auth/signin/github">
              Method 2: Direct GET to /api/auth/signin/github
            </a>
          </Button>
          
          {/* Method 3: NextAuth OAuth URL */}
          <Button asChild className="w-full">
            <a href="/api/auth/signin/github?callbackUrl=http://localhost:3000/dashboard">
              Method 3: NextAuth OAuth URL with callback
            </a>
          </Button>
          
          {/* Method 4: NextAuth signIn function */}
          <Button 
            onClick={() => {
              window.location.href = '/api/auth/signin/github';
            }}
            className="w-full"
          >
            Method 4: JavaScript redirect
          </Button>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Check the browser console and network tab for errors</p>
        </div>
      </div>
    </div>
  );
}
