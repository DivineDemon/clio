import "@/assets/css/globals.css";

import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";

import Providers from "@/components/providers";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "Clio",
	description: "Clio - The Muse of History",
	icons: [{ rel: "icon", url: "/clio.png" }],
};

const libre_baskerville = Libre_Baskerville({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-libre-baskerville",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${libre_baskerville.variable}`}
		>
			<body>
				<Providers>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</Providers>
			</body>
		</html>
	);
}
