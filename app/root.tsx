import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";
import "./styles.css";

import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PendingUI } from "./components/pending-ui";

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link
					href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
					rel="stylesheet"
				/>
				<Meta />
				<Links />
			</head>
			<body>
				<PendingUI />
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Outlet />
		</QueryClientProvider>
	);
}
