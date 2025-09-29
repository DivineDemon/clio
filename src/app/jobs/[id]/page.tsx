import { redirect } from "next/navigation";
import JobDetailsPage from "@/components/jobs/job-details-page";
import { auth } from "@/lib/auth";

interface JobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobPage({ params }: JobPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { id } = await params;
  return <JobDetailsPage jobId={id} user={session.user || {}} />;
}
