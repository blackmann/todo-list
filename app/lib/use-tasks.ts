import type { Status } from "@prisma/client";
import {
	type QueryFunctionContext,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useRevalidator } from "react-router";
import type { Task } from "./types";

interface TaskProps {
	assigneeId?: string;
	search?: string;
	status?: Status;
}

export function useTasks({ assigneeId, search, status }: TaskProps = {}) {
	const queryClient = useQueryClient();
	const { revalidate } = useRevalidator();

	const tasksQuery = useInfiniteQuery({
		queryKey: ["tasks", assigneeId, search, status] as const,
		queryFn: fetchTasks,
		getNextPageParam: (lastPage, pages) =>
			lastPage.length === 0 ? undefined : pages.length,
		initialPageParam: 0,
		staleTime: 1000 * 60 * 5,
	});

	const create = useMutation({
		mutationFn: createTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });

			revalidate();
		},
	});

	return { query: tasksQuery, create };
}

export async function fetchTasks({
	pageParam = 0,
	queryKey,
}: QueryFunctionContext<
	readonly [string, assigneeId?: string, search?: string, status?: Status]
>) {
	const [, assigneeId, search, filterStatus] = queryKey;
	const params = new URLSearchParams({ page: String(pageParam) });

	if (assigneeId) params.set("assigneeId", assigneeId);
	if (search) params.set("search", search);
	if (filterStatus) params.set("status", filterStatus);

	const res = await fetch(`/list?${params}`);
	const data = await res.json();

	return data.tasks;
}

export async function createTask(task: Partial<Task>): Promise<Task> {
	const res = await fetch("/list", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(task),
	});

	const data = await res.json();

	return data.task;
}
