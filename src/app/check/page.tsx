import RepositoryChecker from "@/components/github/repository-checker";

const Page = () => {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center">
			<RepositoryChecker owner="DivineDemon" repo="clio-muse-of-history" />
		</div>
	);
};

export default Page;
