import type { Task } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRevalidator } from "react-router";

export function useTaskPin(task: Task) {
    const queryClient = useQueryClient();
    const { revalidate } = useRevalidator();

    const pin = useMutation({
        mutationKey: ["pin", task.id],
        mutationFn: async () => {
            return await pinTaskRequest({ taskId: task.id, pinned: !task.pinned });
        },
        onSuccess: async () => {
            return await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["tasks"] }),
                revalidate(),
            ]);
        },
    });

    return pin;
}

export async function pinTaskRequest({
    taskId,
    pinned,
}: {
    taskId: number;
    pinned: boolean;
}): Promise<Task> {
    const res = await fetch("/list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, pinned }),
    });

    const data = await res.json();

    return data.task;
}