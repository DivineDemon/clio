import GlobalLayout from "@/components/layout/global-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <GlobalLayout>{children}</GlobalLayout>;
};

export default Layout;
