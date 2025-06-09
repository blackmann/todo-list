import clsx from "clsx";
import React from "react";

interface CheckboxProps
	extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
	checked?: boolean;
	onChange: (checked: boolean) => void;
	className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ checked = false, onChange, className, ...props }, ref) => {
		function handleToggle(e: React.ChangeEvent<HTMLInputElement>) {
			const next = e.target.checked;
			onChange(next);
		}

		return (
			<input
				ref={ref}
				type="checkbox"
				checked={checked}
				onChange={handleToggle}
				className={clsx(
					"rounded-md bg-stone-200 dark:bg-neutral-500 border-2 border-stone-400 dark:border-neutral-700 focus:ring-0 cursor-pointer w-4 h-4 ml-1",
					className,
				)}
				{...props}
			/>
		);
	},
);

export { Checkbox };
