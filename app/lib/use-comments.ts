import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Media } from "~/components/comment-composer";
import type { Comment } from "./types";

export async function fetchComments(taskId: number): Promise<Comment[]> {
	const res = await fetch(`/comments?taskId=${taskId}`);

	if (!res.ok) throw new Error("Failed to fetch comments");
	const data = await res.json();

	return data.comments;
}

type CreatePayload = Pick<Comment, "taskId" | "content" | "authorId"> & {
	media: Media[];
};

export async function createComment(payload: CreatePayload): Promise<Comment> {
	const res = await fetch("/comments", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) throw new Error("Failed to create comment");
	const data = await res.json();

	return data.comment;
}

export function useComments(taskId: number, enabled = false) {
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["comments", taskId],
		queryFn: () => fetchComments(taskId),
		enabled: !!taskId && enabled,
	});

	const create = useMutation({
		mutationFn: createComment,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});

	return { ...query, create };
}
