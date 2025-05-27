import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { type CreateMentionOpts, createMentions } from "~/lib/mentions.server";
import { prisma } from "~/lib/prisma.server";
import { render } from "~/lib/render.server";
import { badRequest } from "~/lib/responses";

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
			author: {
				select: {
					id: true,
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

		comment.content = await render(comment.content);

		return { comment };
	}

	const data = await request.json();

	const comment = await prisma.comment.create({
		data,
		include: {
			author: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	});

	const opts: CreateMentionOpts = {
		content: comment.content,
		taskId: comment.taskId,
		authorId: comment.authorId,
		authorUsername: comment.author.username,
	};

	await createMentions(opts);

	comment.content = await render(comment.content);

	return { comment };
}
