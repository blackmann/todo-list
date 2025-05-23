import clsx from "clsx";
import type { Task } from "~/lib/types";
import { useTaskDelete } from "~/lib/use-task-delete";
import { useTaskUpdate } from "~/lib/use-task-update";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { StatusMenu } from "./status-menu";

interface StatusProps {
	task: Task;
}

const StatusIcons: Record<Task["status"], string> = {
	pending: "i-lucide-circle text-secondary",
	inProgress: "i-lucide-loader-circle text-amber-500",
	done: "i-solar-check-circle-linear text-stone-400 dark:text-neutral-700",
};

function Status({ task }: StatusProps) {
	const update = useTaskUpdate(task);
	const remove = useTaskDelete(task);

	return (
		<Popover placement="bottom-start">
			<PopoverTrigger className="bg-transparent">
				<div
					data-status-button
					className={clsx(
						"rounded-full bg-transparent flex items-center justify-center",
					)}
				>
					<div
						className={clsx(StatusIcons[task.status], "size-5", {
							"i-svg-spinners-270-ring": update.status === "pending",
						})}
					/>
				</div>
			</PopoverTrigger>
			<PopoverContent className="z-50 popover-content animate-fade-in animate-duration-200">
				<StatusMenu
					task={task}
					onStatusUpdate={(status) => update.mutate({ status })}
					onDelete={() => remove.mutate()}
				/>
			</PopoverContent>
		</Popover>
	);
}

export { Status };
