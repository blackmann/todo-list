import { useLoaderData } from "react-router";
import type { Task } from "~/lib/types";
import type { loader } from "~/routes/_index";
import { AssigneeMenu } from "./assignee-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import clsx from "clsx";

interface AssigneeProps {
	task: Task;
}

function Assignee({ task }: AssigneeProps) {
	const { user } = useLoaderData<typeof loader>();

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger
				onClick={(e) => e.stopPropagation()}
				className="bg-transparent"
			>
				<div
					data-assignee-button
					className={clsx(
						"flex items-center gap-1 text-sm font-mono text-secondary bg-stone-200/50 hover:bg-stone-200 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 px-1 py-0.5 rounded-full",
						{
							"!bg-orange-500/5 !text-orange-500": task.assignee.id === user.id,
						},
					)}
				>
					<img
						src={`https://api.dicebear.com/9.x/dylan/svg?seed=${task.assignee.username}`}
						className="rounded-full size-5 bg-blue-500"
						alt={task.assignee.username}
					/>{" "}
					@{task.assignee.username}
				</div>
			</PopoverTrigger>

			<PopoverContent
				onClick={(e) => e.stopPropagation()}
				className="z-50 animate-fade-in animate-duration-200"
			>
				<AssigneeMenu task={task} />
			</PopoverContent>
		</Popover>
	);
}

export { Assignee };
