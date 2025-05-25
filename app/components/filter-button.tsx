import clsx from "clsx";
import { useAtom } from "jotai";
import { statuses } from "~/lib/statuses";
import { filterStatusAtom } from "~/lib/store";
import { FilterMenu } from "./filter-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function FilterButton() {
	const [activeFilter] = useAtom(filterStatusAtom);

	const activeIcon = statuses.find((s) => s.id === activeFilter)?.icon || "";

	return (
		<Popover placement="bottom-start">
			<PopoverTrigger
				asChild
				onClick={(e) => e.stopPropagation()}
				className="bg-transparent"
			>
				<div
					className={clsx(
						"flex gap-2 items-center px-2 font-medium text-sm bg-stone-200/30 dark:bg-neutral-800",
					)}
				>
					<div
						className={clsx("text-xl", {
							"i-solar-list-bold-duotone": !activeFilter,
							[activeIcon]: activeFilter,
						})}
					/>
				</div>
			</PopoverTrigger>

			<PopoverContent className="z-50 animate-fade-in animate-duration-200">
				<FilterMenu />
			</PopoverContent>
		</Popover>
	);
}

export { FilterButton };
