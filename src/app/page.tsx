import LandingPage from "@/components/landing/landing-page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
	const session = await auth();

	console.log(
		"Main page - session:",
		session?.user?.id,
		"githubUsername:",
		session?.user?.githubUsername,
	);

	// If user is authenticated, redirect to dashboard
	if (session) {
		redirect("/dashboard");
	}

	return <LandingPage />;
};

export default Page;
