import { auth } from "@/lib/auth";
import AppSidebar from "./app-sidebar";
import Navbar from "./navbar";

const GlobalLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <div className="flex h-screen w-full items-start justify-start overflow-hidden">
      <AppSidebar session={session} />
      <div className="flex w-[calc(100vw-256px)] flex-col items-start justify-start">
        <Navbar />
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default GlobalLayout;
