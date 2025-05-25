import React from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	usePopoverContext,
} from "./popover";

interface Props {
	onDelete: () => void;
	onEdit: () => void;
}

export function CommentMenu({ onDelete, onEdit }: Props) {
	return (
		<Popover placement="bottom-end">
			<PopoverTrigger asChild>
				<div className="flex items-center justify-center size-8 me-2 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 hover:bg-stone-200 rounded-full text-secondary">
					<div className="i-solar-menu-dots-bold" />
				</div>
			</PopoverTrigger>

			<PopoverContent className="z-50 popover-content p-0">
				<Menu onDelete={onDelete} onEdit={onEdit} />
			</PopoverContent>
		</Popover>
	);
}

function Menu({ onDelete, onEdit }: Props) {
	const [confirmingDelete, setConfirmingDelete] = React.useState(false);
	const popover = usePopoverContext();

	return (
		<div className="bg-neutral-100 text-sm font-mono dark:bg-neutral-900 rounded-lg w-12.5rem border dark:border-neutral-800 overflow-hidden shadow-lg mt-1.5">
			<ul className="space-y-1 p-1">
				<li>
					<button
						type="button"
						className="w-full rounded-lg flex gap-2 items-center bg-transparent py-2 px-3 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/20 text-secondary"
						onClick={() => {
							popover.setOpen(false);
							onEdit();
						}}
					>
						<div className="i-lucide-pencil" />
						Edit
					</button>
				</li>
				<li>
					{confirmingDelete ? (
						<div className="flex justify-between items-center px-3 py-2 text-red-500 rounded-lg bg-red-100 dark:bg-red-800/10">
							<span className="flex items-center gap-2">
								<div className="i-solar-trash-bin-trash-linear" />
								Delete?
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									className="i-lucide-check w-5 h-5 text-red-500 animate-zoom-in animate-duration-200"
									onClick={onDelete}
								/>
								<button
									type="button"
									className="i-lucide-x w-5 h-5 text-secondary animate-zoom-in animate-duration-250"
									onClick={() => setConfirmingDelete(false)}
								/>
							</div>
						</div>
					) : (
						<button
							type="button"
							className="w-full text-red-500 rounded-lg flex gap-2 items-center bg-transparent py-2 px-3 hover:bg-red-100 dark:hover:bg-red-800/10"
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
