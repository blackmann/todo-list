import { tryit } from "radashi";
import {
	type LoaderFunctionArgs,
	type MetaFunction,
	redirect,
	data
} from "react-router";
import { BabyGlinConfetti } from "~/components/baby-glin-confetti";
import { Header } from "~/components/header";
import { StatusBar } from "~/components/status-bar";
import { Todos } from "~/components/todos";
import { checkAccess } from "~/lib/check-auth";
import { userPrefs } from "~/lib/cookies.server";
import { prisma } from "~/lib/prisma.server";
import { notFound } from "~/lib/responses";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const project = await prisma.project.findFirst({
		where: { slug: params.project },
	});

	if (!project) {
		throw notFound("Project not found");
	}

	const [err, access] = await tryit(checkAccess)(request, params.project!);

	if (err) {
		if (err instanceof Response) throw err;

		throw redirect("/auth");
	}

	const users = await prisma.user.findMany({
		where: {
			ProjectAccess: {
				some: {
					projectId: project.id,
				},
			},
		},
		omit: { password: true },
	});

	const [{ total, done }] = (await prisma.$queryRaw`
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'done' THEN 1 END) as done
		FROM "Task"
		WHERE "projectId" = ${project.id}
	`) satisfies { total: bigint; done: bigint }[];

	const unreadNotifications = await prisma.notification.count({
		where: {
			userId: access.user.id,
			read: false,
			projectId: project.id,
		},
	});

	const cookieHeader = request.headers.get("Cookie");
	const currentPrefs = (await userPrefs.parse(cookieHeader)) || {};
	const updatedPrefs = { ...currentPrefs, lastProject: params.project };

	return data({
		done: Number(done),
		total: Number(total),
		user: access.user,
		users,
		project: access.project!,
		unreadNotifications,
	}, {
		headers: {
			"Set-Cookie": await userPrefs.serialize(updatedPrefs),
		},
	});
};

export const meta: MetaFunction = () => {
	return [
		{ title: "Get stuff done | Todo List" },
		{ name: "description", content: "Just do it!" },
	];
};

export default function Project() {
	return (
		<div className="flex flex-col h-dvh">
			<Header />

			<div className="flex-1 h-0">
				<Todos />
			</div>

			<BabyGlinConfetti />

			<StatusBar />
		</div>
	);
}
