import type { Task } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";

export function useTaskDelete(task: Task) {
	const queryClient = useQueryClient();
	const { revalidate } = useRevalidator();

	const remove = useMutation({
		mutationFn: () => deleteTask(task.id),
		onSuccess: async () => {
			return await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["tasks"] }),
				revalidate(),
			]);
		},
	});

	return remove;
}

export async function deleteTask(taskId: number): Promise<void> {
	await fetch("/list", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ taskId }),
	});
}
