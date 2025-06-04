import clsx from "clsx";
import parse from "html-react-parser";
import { getPriority } from "~/lib/get-priority";
import type { Task } from "~/lib/types";

interface Props {
	task: Task;
}

export function TaskTitle({ task }: Props) {
	const priority = getPriority(task.title);
	const displayTitle = task.title.replace(/^!+/, "").trim();

	return (
		<div className="font-medium flex items-center gap-2">
			{priority && (
				<span
					className={clsx(
						"rounded p-0.5 text-xs font-semibold",
						priority.color,
						{
							"bg-stone-400 dark:bg-neutral-700": task.status === "done",
						},
					)}
				>
					{priority.label}
				</span>
			)}

			<div>
				<span
					className={clsx({
						"line-through font-normal text-secondary": task.status === "done",
					})}
				>
					{parse(renderTitle(displayTitle, task.status === "done"))}
				</span>
				<span className="text-secondary ms-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					#{task.id}
				</span>
			</div>
		</div>
	);
}

const TAG_REGEX = /#([a-zA-Z][a-zA-Z0-9-_]*[a-zA-Z0-9])/g;
function renderTitle(title: string, done: boolean) {
	const style = clsx("px-2 rounded-lg font-mono text-sm", {
		"bg-green-500 text-white dark:text-green-500 dark:bg-green-500/10": !done,
		"bg-stone-400 text-white dark:bg-neutral-800 dark:text-neutral-300": done,
	});

	return title.replace(TAG_REGEX, (match, p1) => {
		return `<span class="${style}">${match}</span>`;
	});
}
