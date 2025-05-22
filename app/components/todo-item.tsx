import clsx from "clsx";
import React from "react";
import { age } from "~/lib/dates";
import type { Task } from "~/lib/types";
import { Status } from "./status";
import { TaskComments } from "./task-comments";

// TODO: on hover the status bar should show who created the task and when

interface Props {
	task: Task;
}

export function TodoItem({ task }: Props) {
	const [opened, setOpened] = React.useState(false);

	return (
		<div>
			<div
				className="flex items-center gap-4 p-2 hover:bg-stone-200 dark:hover:bg-neutral-800 focus:bg-stone-200 dark:focus:bg-neutral-800 cursor-pointer"
				onClick={() => setOpened(!opened)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						setOpened(!opened);
					}
				}}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
				tabIndex={0}
			>
				<Status task={task} />

				<div className="flex-1">
					<div className="flex items-center justify-between">
						<div
							className={clsx("font-medium", {
								"line-through font-normal text-secondary":
									task.status === "done",
							})}
						>
							{task.title}
						</div>
					</div>
				</div>

				<div className="flex gap-3 items-center">
					<div className="flex items-center gap-1 text-sm font-mono text-secondary">
						<img
							src={`https://api.dicebear.com/9.x/dylan/svg?seed=${task.assignee}`}
							className="rounded-full size-5 bg-blue-500"
							alt={task.assignee}
						/>{" "}
						@{task.assignee}
					</div>

					<div className="text-sm text-secondary">{age(task.createdAt)}</div>

					<div className="flex gap-1 text-sm items-center text-secondary">
						<div className="i-solar-chat-line-line-duotone" /> {task.comments || 0}
					</div>
				</div>
			</div>

			<TaskComments opened={opened} taskId={task.id} />
		</div>
	);
}
