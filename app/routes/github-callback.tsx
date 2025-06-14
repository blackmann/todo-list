import { tryit } from "radashi";
import { redirect } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";
import { badRequest } from "~/lib/responses";

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const installationId = url.searchParams.get("installation_id");

	if (!code || !installationId) throw badRequest("Missing required parameters");

	const res = await fetch("https://github.com/login/oauth/access_token", {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
		body: new URLSearchParams({
			client_id: process.env.GITHUB_CLIENT_ID!,
			client_secret: process.env.GITHUB_CLIENT_SECRET!,
			code,
		}),
	});

	const data = await res.json();

	if (!data.access_token) throw badRequest();

	const [_, user] = await tryit(checkAuth)(request);

	if (user) {
		await prisma.installation.create({
			data: {
				githubInstallationId: Number.parseInt(installationId),
				userId: user.id,
				active: true,
			},
		});
	}

	return redirect("/");
}
