import { redirect } from "next/navigation";
import Dashboard from "@/components/dashboard/dashboard";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <Dashboard user={session.user || {}} />;
}
