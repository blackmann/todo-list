import { tryit } from "radashi";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";
import { unauthorized } from "~/lib/responses";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const [err, user] = await tryit(checkAuth)(request);

	if (err) {
		if (err instanceof Response) throw err;

		throw unauthorized();
	}

	const projects = await prisma.project.findMany({
		where: {
			ProjectAccess: {
				some: {
					userId: user.id,
				},
			},
		},
		include: {
			_count: {
				select: {
					Task: true,
				},
			},
		},
		orderBy: { name: "asc" },
	});

	return { projects };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await checkAuth(request);

	if (!user.superUser) {
		throw unauthorized();
	}

	if (request.method === "POST") {
		const data = await request.json();

		const project = await prisma.project.create({
			data,
		});

		await prisma.projectAccess.create({
			data: { projectId: project.id, userId: user.id },
		});

		return { project };
	}

	if (request.method === "PATCH") {
		const { id, ...data } = await request.json();

		const project = await prisma.project.update({
			where: { id },
			data,
		});

		return { project };
	}

	if (request.method === "DELETE") {
		const { id } = await request.json();

		const project = await prisma.project.delete({
			where: { id },
		});

		return { project };
	}
};
