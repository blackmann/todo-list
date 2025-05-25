import clsx from "clsx";
import { useMounted } from "~/lib/use-mounted";
import { Button } from "./button";

interface Props {
	onClick: VoidFunction;
	isLoading: boolean;
	done: boolean;
}

export function LoadingButton({ onClick, isLoading, done }: Props) {
	const mounted = useMounted();

	if (!mounted) {
		return null;
	}

	return (
		<Button
			className="bg-stone-200 light:text-stone-500 dark:bg-neutral-100 dark:bg-neutral-800"
			onClick={onClick}
			disabled={isLoading || done}
		>
			<div
				className={clsx("i-lucide-arrow-down", {
					"i-svg-spinners-270-ring": isLoading,
					"i-lucide-check": done,
				})}
			/>{" "}
			{isLoading ? "Loading…" : done ? "fin" : "Load more"}
		</Button>
	);
}
