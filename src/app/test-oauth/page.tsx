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
          
          {/* Method 3: Manual GitHub OAuth URL */}
          <Button asChild className="w-full">
            <a href="https://github.com/login/oauth/authorize?client_id=Ov23li5WHx2ycTK3myKK&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgithub&scope=read:user%20user:email&state=test">
              Method 3: Direct GitHub OAuth URL
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
