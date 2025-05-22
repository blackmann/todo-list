import clsx from "clsx";
import type { Task } from "~/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface Props {
	task: Task;
}

export function Status({ task }: Props) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={clsx(
						"size-6 rounded-full border-2 border-stone-300 dark:border-neutral-700 flex items-center justify-center",
						{
							"!border-amber-500": task.status === "inProgress",
						},
					)}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					{task.status === "done" && (
						<div className="i-lucide-check opacity-50" />
					)}
				</button>
			</PopoverTrigger>
			<PopoverContent onClick={(e) => e.stopPropagation()}>
				<Menu />
			</PopoverContent>
		</Popover>
	);
}

function Menu() {
	return (
		<div className="animate-fade-in animate-duration-200 rounded-xl bg-stone-50 dark:bg-neutral-900 .shadow w-[12rem] border border-stone-200 dark:border-neutral-700 overflow-hidden">
			<ul className="divide-y divide-stone-100 dark:divide-neutral-700">
				<li>
					<button
						className="px-2 py-1 bg-transparent flex items-center gap-2 text-secondary font-medium w-full hover:bg-stone-100 dark:hover:bg-neutral-800"
						type="button"
					>
						<div className="size-5 rounded-full border-2 border-stone-200" />
						Pending
					</button>
				</li>

				<li>
					<button
						className="px-2 py-1 bg-transparent flex items-center gap-2 text-secondary font-medium w-full hover:bg-stone-100 dark:hover:bg-neutral-800"
						type="button"
					>
						<div className="size-5 rounded-full border-2 border-amber-500" />
						In Progress
					</button>
				</li>

				<li>
					<button
						className="px-2 py-1 bg-transparent flex items-center gap-2 text-secondary font-medium w-full hover:bg-stone-100 dark:hover:bg-neutral-800"
						type="button"
					>
						<div className="ps-0.5">
							<div className="i-solar-check-square-linear text-lg" />
						</div>
						Done
					</button>
				</li>

				<li>
					<button
						className="px-2 py-1 bg-transparent flex items-center gap-2 font-medium text-red-500 .border-t w-full hover:bg-stone-100 dark:hover:bg-neutral-800"
						type="button"
					>
						<div className="p-0.5">
							<div className="i-solar-trash-bin-2-linear" />
						</div>
						Delete
					</button>
				</li>
			</ul>
		</div>
	);
}
