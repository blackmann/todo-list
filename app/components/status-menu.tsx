import type { Status, Task } from "@prisma/client";
import clsx from "clsx";
import React from "react";
import { statuses } from "~/lib/statuses";
import { useTaskDelete } from "~/lib/use-task-delete";
import { usePopoverContext } from "./popover";

interface StatusMenuProps {
	task: Task;
	onStatusUpdate: (status: Status) => void;
}

export function StatusMenu({ task, onStatusUpdate }: StatusMenuProps) {
	const [confirmingDelete, setConfirmingDelete] = React.useState(false);
	const remove = useTaskDelete(task);

	const popover = usePopoverContext();

	function handleUpdate(status: Status) {
		popover.setOpen(false);
		onStatusUpdate(status);
	}

	return (
		<div className="bg-neutral-100 text-sm dark:bg-neutral-900 rounded-lg w-12.5rem border dark:border-neutral-800 overflow-hidden shadow-lg mt-1.5">
			<header className="px-2 py-2.5 flex items-center justify-start">
				<div className="font-medium ms-2 text-secondary">Change status...</div>
			</header>

			<hr className="dark:border-neutral-800" />

			<ul className="p-1">
				{statuses.map((s) => (
					<li
						key={s.id}
						className={clsx(
							"flex items-center pl-3 rounded-lg  hover:bg-neutral-200/80 dark:hover:bg-neutral-800/20",
							{
								"bg-neutral-200/80 dark:bg-neutral-800/20": s.id === task.status,
							},
						)}
					>
						<div className="text-xl">{s.icon}</div>

						<button
							type="button"
							className="w-full flex items-center justify-between py-2 px-3 bg-transparent font-mono"
							onClick={() => handleUpdate(s.id)}
						>
							<span>{s.label}</span>
							{s.id === task.status && (
								<div className="i-lucide-check text-lg text-secondary" />
							)}
						</button>
					</li>
				))}
			</ul>

			<div className="font-medium ms-3 px-1.5 text-secondary">Actions</div>

			<ul className="space-y-1 p-1">
				<li className="font-mono">
					{confirmingDelete ? (
						<div className="flex justify-between items-center px-3 py-2 text-red-500 rounded-lg bg-red-100/50 dark:bg-red-800/10">
							<span className="flex items-center gap-2">
								<div className="i-solar-trash-bin-trash-linear " />
								Delete?
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									className="i-lucide-check w-5 h-5 text-red-500 animate-fade-in animate-duration-150"
									onClick={() => remove.mutate()}
								/>
								<button
									type="button"
									className="i-lucide-x w-5 h-5 text-secondary opacity-0 animate-fade-in animate-duration-200 animate-delay-50 animate-forwards"
									onClick={() => setConfirmingDelete(false)}
								/>
							</div>
						</div>
					) : (
						<button
							type="button"
							className="w-full text-red-500 rounded-lg flex gap-2 items-center bg-transparent py-2 px-3 hover:bg-red-600/5"
							onClick={() => setConfirmingDelete(true)}
						>
							<div className="i-solar-trash-bin-trash-linear" />
							Delete
						</button>
					)}
				</li>
			</ul>
		</div>
	);
}
