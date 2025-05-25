import clsx from "clsx";
import { useAtom } from "jotai";
import { statuses } from "~/lib/statuses";
import { filterStatusAtom } from "~/lib/store";
import { usePopoverContext } from "./popover";

function FilterMenu() {
	const popover = usePopoverContext();
	const [filterStatus, setFilterStatus] = useAtom(filterStatusAtom);

	return (
		<div className="bg-neutral-100 text-sm dark:bg-neutral-900 rounded-lg w-12.5rem border dark:border-neutral-800 overflow-hidden shadow-lg mt-1.5">
			<header className="px-2 py-2.5 flex items-center justify-start">
				<div className="font-medium ms-2 text-secondary">Filter by status</div>
			</header>
			<hr className="dark:border-neutral-800" />

			<ul className="p-1">
				{statuses.map((s) => (
					<li
						key={s.id}
						className={clsx(
							"flex items-center pl-3 rounded-lg hover:bg-neutral-200/80 dark:hover:bg-neutral-800/20",
							{
								"!bg-neutral-200 !dark:bg-neutral-800": s.id === filterStatus,
							},
						)}
					>
						<div className={clsx("size-5", s.icon)} />

						<button
							type="button"
							className="w-full flex items-center justify-between py-2 px-3 bg-transparent font-mono"
							onClick={() => {
								if (s.id === filterStatus) {
									setFilterStatus(undefined);
								} else {
									setFilterStatus(s.id);
								}

								popover.setOpen(false);
							}}
						>
							<span>{s.label}</span>
							{s.id === filterStatus && (
								<div className="i-lucide-x text-secondary" />
							)}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export { FilterMenu };
