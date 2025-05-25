import type { Status } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { cleanUpdate } from "~/lib/clean-update";
import { prisma } from "~/lib/prisma.server";
import { badRequest, notFound } from "~/lib/responses";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	const page = Number(searchParams.get("page")) || 0;
	const search = searchParams.get("search") || "";
	const assigneeId = searchParams.get("assigneeId") || undefined;
	const status = searchParams.get("status") || undefined;

	const tasks = await prisma.task.findMany({
		where: {
			title: {
				contains: search,
				mode: "insensitive",
			},
			...(assigneeId && { assigneeId: Number(assigneeId) }),
			...(status && { status: status as Status }),
		},
		orderBy: {
			createdAt: "desc",
		},
		include: {
			_count: { select: { Comment: true } },
			assignee: { select: { username: true, id: true } },
			author: { select: { username: true, id: true } },
		},
		take: 100,
		skip: page * 100,
	});

	const withComments = tasks.map((task) => ({
		...task,
		comments: task._count.Comment,
		_count: undefined,
	}));

	return { tasks: withComments };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await checkAuth(request);
	if (request.method === "DELETE") {
		const { taskId: id } = await request.json();

		if (!id) throw badRequest({ error: "taskId is required" });

		return await prisma.task.delete({
			where: {
				id,
			},
		});
	}

	if (request.method === "PATCH") {
		const { id, updates } = cleanUpdate(await request.json());

		let previousAssigneeId = 0;
		if (updates.assigneeId) {
			const previous = await prisma.task.findUnique({
				where: { id },
				select: { assigneeId: true },
			});

			if (!previous) throw notFound();

			previousAssigneeId = previous?.assigneeId;
		}

		const task = await prisma.task.update({
			where: { id },
			data: updates,
		});

		if (
			updates.assigneeId &&
			previousAssigneeId !== updates.assigneeId &&
			updates.assigneeId !== user.id // don't notify self
		) {
			await prisma.notification.create({
				data: {
					message: `You have been assigned to task @[task/${id}] by @[user/${user.id}]`,
					userId: task.assigneeId,
					type: "assignment",
					meta: {
						taskId: id,
						previousAssigneeId,
						newAssigneeId: updates.assigneeId,
					},
				},
			});
		}

		return { task };
	}

	if (request.method === "POST") {
		const data = await request.json();

		const task = await prisma.task.create({ data });

		return { task };
	}
};
