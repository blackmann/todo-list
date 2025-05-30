import type { Prisma, Status } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { cleanUpdate } from "~/lib/clean-update";
import { TASK_ID_REGEX } from "~/lib/constants";
import { prisma } from "~/lib/prisma.server";
import { badRequest, notFound } from "~/lib/responses";
import { triggerWebhook } from "~/lib/webhook";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	const page = Number(searchParams.get("page")) || 0;
	const assigneeId = searchParams.get("assigneeId") || undefined;
	const status = searchParams.get("status") || undefined;

	const search = searchParams.get("search") || "";

	const where: Prisma.TaskWhereInput = { OR: [] };

	where.OR!.push({
		title: {
			contains: search,
			mode: "insensitive",
		},
	});

	const match = search.match(TASK_ID_REGEX);
	if (match) {
		where.OR!.push({ id: Number(match[1]) });
	}

	if (assigneeId) {
		where.assigneeId = Number(assigneeId);
	}

	if (status) {
		where.status = status as Status;
	}

	const tasks = await prisma.task.findMany({
		where,
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

		const taskToDelete = await prisma.task.findUnique({
			where: { id },
			include: { assignee: true },
		});

		const result = await prisma.task.delete({
			where: { id },
		});

		if (taskToDelete) {
			triggerWebhook("task.deleted", {
				task: taskToDelete,
				user,
			});
		}

		return result;
	}

	if (request.method === "PATCH") {
		const { id, updates } = cleanUpdate(await request.json());

		const previous = await prisma.task.findUnique({
			where: { id },
			include: { assignee: true },
		});

		if (!previous) throw notFound();

		const previousAssigneeId = previous.assigneeId;
		const previousStatus = previous.status;

		const task = await prisma.task.update({
			where: { id },
			data: updates,
			include: { assignee: true },
		});

		if (updates.status && previousStatus !== updates.status) {
			triggerWebhook("task.status_changed", {
				task,
				user,
				previousStatus,
			});
		}

		if (updates.assigneeId && previousAssigneeId !== updates.assigneeId) {
			if (updates.assigneeId !== user.id) {
				// don't notify self
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

			triggerWebhook("task.assigned", {
				task,
				user,
			});
		}

		if (updates.title && previous.title !== updates.title) {
			triggerWebhook("task.updated", {
				task,
				user,
				updatedFields: ["title"],
			});
		}

		return { task };
	}

	if (request.method === "POST") {
		const data = await request.json();

		const task = await prisma.task.create({
			data,
			include: {
				assignee: true,
			},
		});

		triggerWebhook("task.created", {
			task,
			user:
				(await prisma.user.findUnique({ where: { id: data.authorId } })) ||
				undefined,
		});

		return { task };
	}
};
