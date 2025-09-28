import JobDetailsPage from "@/components/jobs/job-details-page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface JobPageProps {
	params: {
		id: string;
	};
}

export default async function JobPage({ params }: JobPageProps) {
	const session = await auth();

	if (!session) {
		redirect("/");
	}

	return <JobDetailsPage jobId={params.id} user={session.user || {}} />;
}
