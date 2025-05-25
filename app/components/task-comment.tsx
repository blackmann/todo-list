import clsx from "clsx";
import React from "react";
import { useFetcher, useLoaderData } from "react-router";
import { authorTime } from "~/lib/dates";
import type { Comment } from "~/lib/types";
import { useCommentDelete } from "~/lib/use-comment-delete";
import { useCommentEdit } from "~/lib/use-comments-edit";
import type { loader } from "~/routes/_index";
import { CommentMenu } from "./comment-menu";
import { Content } from "./content";
import { EditCommentInput } from "./edit-comment-input";

interface TaskCommentProps {
	taskId: number;
	comment: Comment;
}

function TaskComment({ comment, taskId }: TaskCommentProps) {
	const [isEditing, setIsEditing] = React.useState(false);
	const [draft, setDraft] = React.useState("");

	const fetcher = useFetcher<{ content: string }>();
	const { user } = useLoaderData<typeof loader>();

	const edit = useCommentEdit(taskId);
	const remove = useCommentDelete(taskId);

	React.useEffect(() => {
		if (isEditing) {
			fetcher.load(`/edit-comment?id=${comment.id}`);
		}
	}, [isEditing, comment.id, fetcher.load]);

	React.useEffect(() => {
		if (fetcher.data?.content && isEditing) {
			setDraft(fetcher.data.content);
		}
	}, [fetcher.data, isEditing]);

	function handleEdit() {
		if (!draft.trim()) return;

		edit.mutate({
			id: comment.id,
			content: draft.trim(),
			authorId: user.id,
		});

		setIsEditing(false);
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
						) : isEditing && fetcher.data ? (
							<EditCommentInput
								value={draft}
								onChange={setDraft}
								onConfirm={handleEdit}
								onCancel={() => {
									setIsEditing(false);
									setDraft("");
								}}
							/>
						) : (
							<Content content={comment.content} />
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
