import { TAG_REGEX } from "~/lib/constants";
import { prisma } from "~/lib/prisma.server";

export interface CreateMentionOpts {
	content: string;
	taskId: number;
	authorId: number;
	authorUsername: string;
}

export async function createMentions({
	content,
	taskId,
	authorId,
	authorUsername,
}: CreateMentionOpts) {
	if (!content.includes("@")) {
		return;
	}

	const mentionedUsernames = [...content.matchAll(TAG_REGEX)]
		.map((match) => match[1])
		.filter(Boolean);

	const uniqueUsernames = [...new Set(mentionedUsernames)];

	for (const username of uniqueUsernames) {
		if (username === authorUsername) continue;

		const user = await prisma.user.findUnique({
			where: {
				username,
			},
			select: {
				id: true,
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
					mentionedBy: authorId,
				},
			},
		});
	}
}

export interface EditMentionOpts extends CreateMentionOpts {
	originalContent: string;
}

export async function updateMentions({
	content,
	originalContent,
	taskId,
	authorId,
	authorUsername,
}: EditMentionOpts) {
	if (!content.includes("@")) {
		return;
	}

	const previouslyMentionedUsernames = [...originalContent.matchAll(TAG_REGEX)]
		.map((match) => match[1])
		.filter(Boolean);

	const uniquePreviouslyMentioned = [...new Set(previouslyMentionedUsernames)];

	const currentlyMentionedUsernames = [...content.matchAll(TAG_REGEX)]
		.map((match) => match[1])
		.filter(Boolean);

	const uniqueCurrentlyMentioned = [...new Set(currentlyMentionedUsernames)];

	const newlyMentionedUsernames = uniqueCurrentlyMentioned.filter(
		(username) => !uniquePreviouslyMentioned.includes(username),
	);

	for (const username of newlyMentionedUsernames) {
		if (username === authorUsername) continue;

		const user = await prisma.user.findUnique({
			where: {
				username,
			},
			select: {
				id: true,
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
					mentionedBy: authorId,
				},
			},
		});
	}
}
