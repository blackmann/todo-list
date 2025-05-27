import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { type EditMentionOpts, updateMentions } from "~/lib/mentions.server";
import { prisma } from "~/lib/prisma.server";
import { render } from "~/lib/render.server";
import { badRequest, methodNotAllowed, notFound } from "~/lib/responses";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const commentId = url.searchParams.get("id");

	if (!commentId) {
		throw badRequest({ error: "commentId is required" });
	}

	const comment = await prisma.comment.findFirst({
		where: {
			id: Number(commentId),
		},
	});

	if (!comment) {
		throw notFound();
	}

	if (comment.deletedAt) {
		throw badRequest();
	}

	return { content: comment.content };
}

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "PATCH") throw methodNotAllowed();

	const { id, content, authorId } = await request.json();

	const originalComment = await prisma.comment.findUnique({
		where: { id },
		select: { content: true },
	});

	if (!originalComment) {
		throw notFound();
	}

	const comment = await prisma.comment.update({
		where: {
			id,
			authorId,
		},
		data: {
			content,
			editedAt: new Date(),
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

	const opts: EditMentionOpts = {
		content: comment.content,
		originalContent: originalComment.content,
		taskId: comment.taskId,
		authorId: comment.authorId,
		authorUsername: comment.author.username,
	};

	await updateMentions(opts);

	comment.content = await render(comment.content);

	return { comment };
}
