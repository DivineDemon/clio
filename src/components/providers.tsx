"use client";

import type { ReactNode } from "react";
import ThemeProvider from "./theme-provider";
import { SidebarProvider } from "./ui/sidebar";
import { Toaster } from "./ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SidebarProvider>
        <Toaster richColors={true} duration={1500} />
        {children}
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Providers;
