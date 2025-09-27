import RepositoryChecker from "@/components/github/repository-checker";

const Page = () => {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center">
			<RepositoryChecker owner="divinedemon" repo="clio" />
		</div>
	);
};

export default Page;
