import { redirect } from "next/navigation";
import LandingPage from "@/components/landing/landing-page";
import { auth } from "@/lib/auth";

const Page = async () => {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
};

export default Page;
