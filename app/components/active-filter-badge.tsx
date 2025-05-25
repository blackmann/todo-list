import clsx from "clsx";
import { useAtom } from "jotai";
import { filterStatusAtom } from "~/lib/store";

export function ActiveFilterBadge() {
	const [filterStatus, setFilterStatus] = useAtom(filterStatusAtom);

	if (!filterStatus) return null;

	const iconMap = {
		pending: "i-lucide-circle text-secondary",
		inProgress: "i-lucide-loader-circle text-amber-500",
		done: "i-solar-check-circle-bold text-indigo-500",
	} as const;

	return (
		<div className="flex items-center gap-2 px-3 py-1 rounded-full border dark:border-neutral-700 text-sm bg-neutral-100 dark:bg-neutral-800 animate-fade-in animate-duration-200">
			<div className={clsx("size-4", iconMap[filterStatus])} />
			<button
				type="button"
				onClick={() => setFilterStatus(undefined)}
				className="i-lucide-x text-secondary size-4"
			/>
		</div>
	);
}
