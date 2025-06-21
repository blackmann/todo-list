import type { Media } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { type CreateMentionOpts, createMentions } from "~/lib/mentions.server";
import { prisma } from "~/lib/prisma.server";
import { render } from "~/lib/render.server";
import { badRequest } from "~/lib/responses";
import { sendWebhook } from "~/lib/webhook";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const taskId = url.searchParams.get("taskId");

	if (!taskId) {
		throw badRequest({ error: "taskId is required" });
	}

	const comments = await prisma.comment.findMany({
		where: {
			taskId: Number(taskId),
		},
		orderBy: {
			createdAt: "asc",
		},
		include: {
			Media: true,
			author: {
				select: {
					username: true,
				},
			},
		},
	});

	for (const comment of comments) {
		if (comment.deletedAt) {
			comment.content = "deleted";
		}

		comment.content = await render(comment.content);
	}

	return { comments };
}

export async function action({ request }: ActionFunctionArgs) {
	if (request.method === "DELETE") {
		const { id } = await request.json();

		if (!id) throw badRequest({ error: "id is required" });

		const comment = await prisma.comment.update({
			where: {
				id,
			},
			data: {
				deletedAt: new Date(),
			},
			include: {
				author: {
					select: {
						id: true,
						username: true,
					},
				},
			},
		});

		await prisma.media.deleteMany({
			where: {
				commentId: comment.id,
			},
		});

		comment.content = await render(comment.content);

		return { comment };
	}

	const { media, content, ...data } = await request.json();

	const comment = await prisma.comment.create({
		data: {
			...data,
			content,
		},
		include: {
			author: {
				omit: {
					password: true,
				},
			},
			task: {
				select: {
					projectId: true,
				},
			},
		},
	});

	if (media && media.length > 0) {
		await prisma.media.createMany({
			data: media.map((it: Media) => ({
				url: it.url,
				filename: it.filename,
				size: it.size,
				contentType: it.contentType,
				commentId: comment.id,
				thumbnail: it.thumbnail,
			})),
		});
	}

	const opts: CreateMentionOpts = {
		content: comment.content,
		taskId: comment.taskId,
		authorId: comment.authorId,
		authorUsername: comment.author.username,
		projectId: comment.task.projectId,
	};

	await createMentions(opts);

	const task = await prisma.task.findUnique({
		where: { id: comment.taskId },
		include: { assignee: true },
	});

	if (task) {
		sendWebhook("comment.created", {
			task,
			user: comment.author,
			comment: comment.content,
			projectId: task.projectId,
			mediaCount: media ? media.length : 0,
		});
	}

	comment.content = await render(comment.content);

	return { comment };
}
