import React from "react";

interface EditInputProps {
	value: string;
	onChange: (value: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
}

function EditCommentInput({
	value,
	onChange,
	onConfirm,
	onCancel,
}: EditInputProps) {
	const inputRef = React.useRef<HTMLTextAreaElement>(null);

	const handleResize = React.useCallback(() => {
		const textarea = inputRef.current;

		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	}, []);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			inputRef.current?.focus();
			handleResize();
		}, 100);

		return () => clearTimeout(timeout);
	}, []);

	React.useEffect(() => {
		handleResize();
	}, [value, handleResize]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			onConfirm();
		} else if (e.key === "Escape") {
			onCancel();
		}
	};

	return (
		<div className="flex items-center gap-2 mt-1">
			<textarea
				ref={inputRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={handleKeyDown}
				className="px-2 py-1 border-b rounded-t-xl border-0 border-stone-300 dark:border-neutral-700 dark:bg-neutral-800 w-full bg-stone-200/40 focus:outline-none focus:ring-0 max-h-18rem"
			/>

			<button
				type="button"
				onClick={onConfirm}
				className="i-lucide-check text-secondary w-5 h-5"
				aria-label="Confirm"
			/>

			<button
				type="button"
				onClick={onCancel}
				className="i-lucide-x text-secondary w-5 h-5"
				aria-label="Cancel"
			/>
		</div>
	);
}

export { EditCommentInput };
