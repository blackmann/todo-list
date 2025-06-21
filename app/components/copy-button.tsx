import clsx from "clsx";
import React from "react";
import { Button } from "./button";

function CopyButton({
	text,
	className,
	disabled,
	children,
}: {
	text: string;
	className?: string;
	disabled?: boolean;
	children?: React.ReactNode;
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
			className={clsx("text-sm font-medium", className)}
			disabled={disabled}
		>
			{children || (copyStatus === "copied" ? "Copied" : "Copy")}{" "}
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
