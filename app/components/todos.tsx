import { useAtom } from "jotai";
import { assigneeAtom, filterStatusAtom, searchAtom } from "~/lib/store";
import { useTasks } from "~/lib/use-tasks";
import { LoadingButton } from "./loading-button";
import { TaskComposer } from "./task-composer";
import { TodoItem } from "./todo-item";

export function Todos() {
	const [assigneeId] = useAtom(assigneeAtom);
	const [search] = useAtom(searchAtom);
	const [status] = useAtom(filterStatusAtom);

	const { query } = useTasks({ assigneeId, search, status });
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

	const tasks = data?.pages.flat();

	return (
		<div className="overflow-y-auto h-full">
			<ul className="divide-y divide-stone-200 dark:divide-neutral-700/50">
				<li className="sticky top-0 z-10">
					<TaskComposer />
				</li>

				{tasks?.map((task) => (
					<li key={task.id} id={task.id.toString()}>
						<TodoItem task={task} />
					</li>
				))}

				<li className="p-4 text-center">
					<LoadingButton
						onClick={() => fetchNextPage()}
						isLoading={isFetchingNextPage}
						done={!hasNextPage && !isFetchingNextPage}
					/>
				</li>
			</ul>
		</div>
	);
}
