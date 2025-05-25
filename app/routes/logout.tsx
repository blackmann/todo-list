import { type LoaderFunctionArgs, redirect } from "react-router";
import { authCookie } from "~/lib/cookies.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize("auth", {
				maxAge: 0,
			}),
		},
	});
};
