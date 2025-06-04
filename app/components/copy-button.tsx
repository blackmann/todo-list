import clsx from "clsx";
import React from "react";
import { Button } from "./button";

function CopyButton({
	text,
	className,
	disabled,
}: {
	text: string;
	className?: string;
	disabled?: boolean;
}) {
	const [copyStatus, setCopyStatus] = React.useState<"failed" | "copied">();

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopyStatus("copied");
		} catch {
			setCopyStatus("failed");
		}

		setTimeout(() => {
			setCopyStatus(undefined);
		}, 1000);
	};

	return (
		<Button
			onClick={handleCopy}
			className={clsx(
				"w-full text-sm font-medium flex items-center justify-center bg-neutral-700 text-white dark:bg-white dark:text-neutral-900 px-3 !py-1 gap-1",
				className,
			)}
			disabled={disabled}
		>
			{copyStatus === "copied" ? "Copied" : "Copy"}{" "}
			<div
				className={clsx(
					copyStatus === "copied"
						? "i-solar-copy-bold-duotone animate-zoom-in animate-duration-200"
						: "i-solar-copy-linear",
				)}
			/>
		</Button>
	);
}

export { CopyButton };
