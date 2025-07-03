import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "./types";

export function useCommentEdit(taskId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateCommentRequest,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
}

async function updateCommentRequest({
	id,
	content,
	authorId,
}: {
	id: number;
	content: string;
	authorId: number;
}): Promise<Comment> {
	const res = await fetch("/edit-comment", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id, content, authorId }),
	});

	if (!res.ok) throw new Error("Failed to update comment");
	const data = await res.json();

	return data.comment;
}

export async function removeMedia(ids: number[]): Promise<void> {
	const res = await fetch("/media", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ids }),
	});

	if (!res.ok) throw new Error("Failed to remove media");
}

export function useRemoveMedia(taskId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: removeMedia,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
			queryClient.invalidateQueries({ queryKey: ["comment-content"] });
		},
	});
}
