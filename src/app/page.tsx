import { redirect } from "next/navigation";
import Header from "@/components/landing/header";
import Navbar from "@/components/landing/navbar";
import { auth } from "@/lib/auth";

const Page = async () => {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-start gap-5 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,224,102,0.3),rgba(255,255,255,0))]">
      <Navbar />
      <Header />
    </div>
  );
};

export default Page;
