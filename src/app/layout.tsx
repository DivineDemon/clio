import "@/assets/css/globals.css";

import type { Metadata } from "next";
import { Libre_Baskerville } from "next/font/google";

import ThemeProvider from "@/components/theme-provider";
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
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
