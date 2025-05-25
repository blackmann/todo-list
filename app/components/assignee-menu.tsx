import { useLoaderData } from "react-router";
import clsx from "clsx";
import type { Task } from "~/lib/types";
import type { loader } from "~/routes/_index";
import { usePopoverContext } from "./popover";
import { useTaskUpdate } from "~/lib/use-task-update";

interface AssigneeMenuProps {
	task: Task;
}

function AssigneeMenu({ task }: AssigneeMenuProps) {
	const { users: team } = useLoaderData<typeof loader>();

	const update = useTaskUpdate(task);

	const popover = usePopoverContext();

	function handleUpdate(assignee: number) {
		popover.setOpen(false);
		update.mutate({ assigneeId: assignee });
	}

	const restOfTeam = team.filter((t) => t.id !== task.assigneeId);

	return (
		<div className="bg-neutral-100 text-sm dark:bg-neutral-900 rounded-lg w-12.5rem border dark:border-neutral-800 overflow-hidden shadow-lg mt-1.5">
			<header className="px-2 py-2.5 flex items-center justify-start">
				<div className="font-medium ms-2 text-secondary">Assign to...</div>
			</header>

			<hr className="dark:border-neutral-800" />

			<div className="p-1">
				{" "}
				<div className="w-full rounded-lg flex items-center justify-between py-2 px-3 text-secondary bg-transparent font-mono hover:bg-neutral-200/80 dark:hover:bg-neutral-800/20">
					<div className="flex gap-2">
						<img
							src={`https://api.dicebear.com/9.x/dylan/svg?seed=${task.assignee.username}`}
							className="rounded-full size-5 bg-blue-500"
							alt={task.assignee.username}
						/>
						{task.assignee.username}
					</div>

					<div className="i-lucide-check text-secondary" />
				</div>
			</div>

			{restOfTeam.length > 0 && (
				<div className="font-medium ms-3 px-1 text-secondary">Team members</div>
			)}

			<ul
				className={clsx("space-y-1", {
					"p-1": restOfTeam.length,
				})}
			>
				{restOfTeam.map((t) => (
					<li key={t.id}>
						<button
							type="button"
							className="w-full rounded-lg flex gap-2 items-center bg-transparent py-2 px-3 font-mono hover:bg-neutral-200/80 dark:hover:bg-neutral-800/20"
							onClick={(e) => handleUpdate(t.id)}
						>
							<img
								src={`https://api.dicebear.com/9.x/dylan/svg?seed=${t.username}`}
								className="rounded-full size-5 bg-blue-500"
								alt={t.username}
							/>{" "}
							{t.username}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export { AssigneeMenu };
