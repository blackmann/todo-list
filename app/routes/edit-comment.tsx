import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { TAG_REGEX } from "~/lib/constants";
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

	if (content.includes("@")) {
		const originalComment = await prisma.comment.findUnique({
			where: { id },
			select: { content: true },
		});

		if (!originalComment) {
			throw notFound();
		}

		const previouslyMentionedUsernames = [
			...originalComment.content.matchAll(TAG_REGEX),
		]
			.map((match) => match[1])
			.filter(Boolean);

		const uniquePreviouslyMentioned = [
			...new Set(previouslyMentionedUsernames),
		];

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

		const currentlyMentionedUsernames = [...comment.content.matchAll(TAG_REGEX)]
			.map((match) => match[1])
			.filter(Boolean);

		const uniqueCurrentlyMentioned = [...new Set(currentlyMentionedUsernames)];

		const newlyMentionedUsernames = uniqueCurrentlyMentioned.filter(
			(username) => !uniquePreviouslyMentioned.includes(username),
		);

		if (newlyMentionedUsernames.length > 0) {
			const taskId = comment.taskId;

			for (const username of newlyMentionedUsernames) {
				if (username === comment.author.username) continue;

				const user = await prisma.user.findUnique({
					where: {
						username,
					},
				});

				if (!user) continue;

				await prisma.notification.create({
					data: {
						message: `You were mentioned in a comment under @[task/${taskId}]`,
						userId: user.id,
						type: "mention",
						meta: {
							taskId: taskId,
							mentionedBy: comment.authorId,
						},
					},
				});
			}
		}

		comment.content = await render(comment.content);

		return { comment };
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

	comment.content = await render(comment.content);

	return { comment };
}
