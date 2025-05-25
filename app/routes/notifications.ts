import type { Notification } from "@prisma/client";
import type { LoaderFunctionArgs } from "react-router";
import { checkAuth } from "~/lib/check-auth";
import { TASK_MENTION_REGEX, USER_MENTION_REGEX } from "~/lib/constants";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await checkAuth(request);

	const notifications = await prisma.notification.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
		take: 100,
	});

	const expanded = await expandNotifications(notifications);

	return { notifications: expanded };
};

async function expandNotifications(notifications: Notification[]) {
	const extraction = notifications.map((it) => {
		const taskMatches = [...it.message.matchAll(TASK_MENTION_REGEX)].map(
			(match) => Number(match[1]),
		);
		const userMatches = [...it.message.matchAll(USER_MENTION_REGEX)].map(
			(match) => Number(match[1]),
		);

		return {
			id: it.id,
			tasks: taskMatches,
			users: userMatches,
		};
	});

	const taskIds = new Set(extraction.flatMap((it) => it.tasks));
	const userIds = new Set(extraction.flatMap((it) => it.users));

	const tasks = await prisma.task.findMany({
		where: {
			id: {
				in: Array.from(taskIds),
			},
		},
		select: {
			title: true,
			id: true,
		},
	});

	const users = await prisma.user.findMany({
		where: {
			id: {
				in: Array.from(userIds),
			},
		},
		select: {
			id: true,
			username: true,
		},
	});

	return notifications.map((it) => {
		const { tasks: taskIds, users: userIds } = extraction.find(
			(ext) => it.id === ext.id,
		)!;

		return {
			...it,
			tasks: taskIds.map((id) => tasks.find((t) => t.id === id)),
			users: userIds.map((id) => users.find((u) => u.id === id)),
		};
	});
}
