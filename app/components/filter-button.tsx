import clsx from "clsx";
import { useAtom } from "jotai";
import { filterStatusAtom } from "~/lib/store";
import { FilterMenu } from "./filter-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

function FilterButton() {
	const [activeFilter] = useAtom(filterStatusAtom);

	return (
		<Popover placement="bottom-start">
			<PopoverTrigger
				asChild
				onClick={(e) => e.stopPropagation()}
				className="bg-transparent"
			>
				<div
					className={clsx(
						"flex gap-2 items-center rounded-lg py-1.5 px-2 font-medium border dark:border-neutral-700 text-sm bg-neutral-100 dark:bg-neutral-800",
						{
							"bg-neutral-200 dark:bg-neutral-700": !!activeFilter,
						},
					)}
				>
					<div className="i-solar-sort-linear" />
				</div>
			</PopoverTrigger>

			<PopoverContent className="z-50 animate-fade-in animate-duration-200">
				<FilterMenu />
			</PopoverContent>
		</Popover>
	);
}

export { FilterButton };
