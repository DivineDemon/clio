import AppSidebar from "./app-sidebar";
import Navbar from "./navbar";

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full items-start justify-start overflow-hidden">
      <AppSidebar />
      <div className="flex w-[calc(100vw-256px)] flex-col items-start justify-start">
        <Navbar />
        <div className="h-[calc(100vh-64px)] w-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default GlobalLayout;
