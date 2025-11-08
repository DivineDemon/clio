import { redirect } from "next/navigation";
import CTA from "@/components/landing/cta";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";
import Navbar from "@/components/landing/navbar";
import Pricing from "@/components/landing/pricing";
import Testimonials from "@/components/landing/testimonials";
import { auth } from "@/lib/auth";

const Page = async () => {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-start bg-background">
      <Navbar />
      <Header />
      <Testimonials />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Page;
