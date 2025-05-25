import { redirect } from "@remix-run/node";
import { authCookie } from "./cookies.server";

async function logout(request: Request) {
	return redirect("/", {
		headers: {
			"Set-Cookie": await authCookie.serialize("auth", {
				maxAge: 0,
			}),
		},
	});
}

export { logout };
