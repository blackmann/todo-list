import type { Prisma } from "@prisma/client";
import clsx from "clsx";
import React from "react";
import { useLoaderData } from "react-router";
import { authorTime } from "~/lib/dates";
import { useCommentDelete } from "~/lib/use-comment-delete";
import { useCommentEdit, useRemoveMedia } from "~/lib/use-comments-edit";
import type { loader } from "~/routes/$project";
import { CommentMenu } from "./comment-menu";
import { Content } from "./content";
import { EditCommentInput } from "./edit-comment-input";

interface TaskCommentProps {
	taskId: number;
	comment: Prisma.CommentGetPayload<{
		include: {
			Media: true;
			author: {
				select: {
					username: true;
				};
			};
		};
	}>;
}

function TaskComment({ comment, taskId }: TaskCommentProps) {
	const [isEditing, setIsEditing] = React.useState(false);
	const [rawContent, setRawContent] = React.useState(comment.rawContent);

	const { user } = useLoaderData<typeof loader>();

	const edit = useCommentEdit(taskId);
	const remove = useCommentDelete(taskId);
	const removeMedia = useRemoveMedia(taskId);

	function handleEdit() {
		const updatedContent = rawContent.trim();
		setRawContent(updatedContent);

		edit.mutate({
			id: comment.id,
			content: updatedContent,
			authorId: user.id,
		});

		setIsEditing(false);
	}

	function handleInlineToggle(updatedContent: string) {
		setRawContent(updatedContent);

		edit.mutate({
			id: comment.id,
			content: updatedContent,
			authorId: user.id,
		});
	}

	return (
		<li>
			<div className="flex flex-col gap-2 p-2 ms-4.3 ps-7 border-s-2 border-stone-200/60 dark:border-neutral-700">
				<div className="flex justify-between gap-4">
					<div
						className={clsx("flex-1 overflow-x-auto", {
							"italic text-secondary": comment.deletedAt,
						})}
					>
						<header className="text-sm font-mono text-secondary">
							@{comment.author.username} • {authorTime(comment.createdAt)}{" "}
							{comment.editedAt && !comment.deletedAt && (
								<span className="text-xs">(edited)</span>
							)}
						</header>

						{comment.deletedAt ? (
							<p className="text-neutral-500 dark:text-neutral-400 italic text-sm">
								This message was deleted
							</p>
						) : isEditing ? (
							<EditCommentInput
								media={comment.Media}
								value={rawContent}
								onChange={setRawContent}
								onConfirm={handleEdit}
								onCancel={() => {
									setIsEditing(false);
									setRawContent(comment.rawContent);
								}}
								onRemoveMedia={(ids) => removeMedia.mutate(ids)}
							/>
						) : (
							<Content
								comment={comment}
								rawContent={rawContent}
								updateComment={handleInlineToggle}
							/>
						)}
					</div>

					{user.id === comment.authorId && !comment.deletedAt && (
						<CommentMenu
							onDelete={() => remove.mutate(comment.id)}
							onEdit={() => setIsEditing(true)}
						/>
					)}
				</div>
			</div>
		</li>
	);
}

export { TaskComment };
