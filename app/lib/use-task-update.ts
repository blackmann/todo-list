import type { Task } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";

export function useTaskUpdate(task: Task) {
	const queryClient = useQueryClient();
	const { revalidate } = useRevalidator();

	const update = useMutation({
		mutationKey: ["task", task.id],
		mutationFn: async (updates: Partial<Task>) => {
			return await updateTaskRequest({ taskId: task.id, updates });
		},
		onSuccess: async () => {
			return await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["tasks"] }),
				revalidate(),
			]);
		},
	});

	return update;
}

export async function updateTaskRequest({
	taskId,
	updates,
}: {
	taskId: number;
	updates: Partial<Task>;
}): Promise<Task> {
	const res = await fetch("/list", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ taskId, ...updates }),
	});

	const data = await res.json();

	return data.task;
}
