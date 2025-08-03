import { tryit } from 'radashi';
import { type LoaderFunctionArgs, redirect } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { userPrefs } from "~/lib/cookies.server";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [err, user] = await tryit(checkAuth)(request);

	if (err) {
		throw redirect("/auth");
	}

	const projects = await prisma.project.findMany({
		where: {
			ProjectAccess: {
				some: { userId: user.id },
			},
		},
		orderBy: {
			name: "asc",
		},
		select: {
			slug: true,
		},
	});

	if (projects.length === 0) {
		throw redirect("/logout");
	}

	const url = new URL(request.url);

	// 🎯 READ: Get the user's last viewed project from cookie
	const cookieHeader = request.headers.get("Cookie");
	const prefs = (await userPrefs.parse(cookieHeader)) || {};
	const lastProjectSlug = prefs.lastProject;

	// Check if the last viewed project still exists and user has access to it
	let targetProject = projects.find(p => p.slug === lastProjectSlug);
	
	// Fall back to first project if last viewed project is not found
	if (!targetProject) {
		targetProject = projects[0];
	}

	const toUrl = new URL(`/${targetProject.slug}`, url);
	const confetti = url.searchParams.get("confetti");

	if (confetti) {
		toUrl.searchParams.set("confetti", confetti);
	}

	return redirect(toUrl.toString());
};
