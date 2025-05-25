import { useAtom } from "jotai";
import React from "react";
import { age } from "~/lib/dates";
import { hoveredTask } from "~/lib/store";
import type { Task } from "~/lib/types";
import { useDoubleClick } from "~/lib/use-double-click";
import { useTaskUpdate } from "~/lib/use-task-update";
import { Assignee } from "./assignee";
import { EditTaskInput } from "./edit-task-input";
import { Status } from "./status";
import { TaskComments } from "./task-comments";
import { TaskTitle } from "./task-title";

interface Props {
	task: Task;
}

export function TodoItem({ task }: Props) {
	const [opened, setOpened] = React.useState(false);
	const [isEditing, setIsEditing] = React.useState(false);
	const [draft, setDraft] = React.useState(task.title);

	const [, setHoveredTask] = useAtom(hoveredTask);
	const update = useTaskUpdate(task);

	const handleToggleOpen = () => {
		if (
			document.activeElement instanceof HTMLElement &&
			document.activeElement.closest("[data-edit-task-input]")
		) {
			return;
		}
		setOpened(!opened);
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	function updateTask() {
		if (!draft.trim()) return;

		update.mutate({ title: draft.trim() });
		setIsEditing(false);
	}

	const handleClick = useDoubleClick(handleToggleOpen, handleEdit);

	return (
		<div>
			<div
				className="group flex items-center gap-4 p-2 hover:bg-stone-200/50 dark:hover:bg-neutral-800/50 focus:bg-stone-200/50 dark:focus:bg-neutral-800 cursor-pointer"
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleToggleOpen();
					} else if (e.key === "e" && !isEditing) {
						handleEdit();
					}
				}}
				onMouseEnter={() => {
					setHoveredTask(task);
				}}
				onMouseLeave={() => setHoveredTask(undefined)}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
				tabIndex={0}
			>
				{isEditing ? (
					<div className="i-lucide-pencil text-secondary" />
				) : (
					<Status task={task} />
				)}

				<div className="flex-1">
					<div className="flex items-center justify-between">
						{isEditing ? (
							<EditTaskInput
								value={draft}
								onChange={setDraft}
								onConfirm={updateTask}
								onCancel={() => {
									setDraft(task.title);
									setIsEditing(false);
								}}
							/>
						) : (
							<TaskTitle task={task} />
						)}
					</div>
				</div>

				<div className="flex gap-3 items-center">
					<Assignee task={task} />

					<div className="text-sm text-secondary">{age(task.createdAt)}</div>

					<div className="flex gap-1 text-sm items-center text-secondary">
						<div className="i-solar-chat-line-line-duotone" /> {task.comments}
					</div>
				</div>
			</div>

			<TaskComments opened={opened} taskId={task.id} />
		</div>
	);
}
