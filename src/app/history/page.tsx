import { redirect } from "next/navigation";
import HistoryPage from "@/components/history/history-page";
import { auth } from "@/lib/auth";

export default async function History() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <HistoryPage user={session.user || {}} />;
}
