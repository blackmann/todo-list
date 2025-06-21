import type { Media } from "@prisma/client";
import clsx from "clsx";
import React from "react";
import { magicInput } from "~/lib/magic-input";
import { MediaSelectItem } from "./media-select-item";

interface EditInputProps {
	value: string;
	onChange: (value: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	media?: Media[];
	onRemoveMedia?: (mediaIds: number[]) => void;
}

function EditCommentInput({
	value,
	onChange,
	onConfirm,
	onCancel,
	media,
	onRemoveMedia,
}: EditInputProps) {
	const inputRef = React.useRef<HTMLTextAreaElement>(null);
	const [discardedMedia, setDiscardedMedia] = React.useState<number[]>([]);

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

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			handleConfirm();
			return;
		}

		if (e.key === "Escape") {
			handleCancel();
			return;
		}

		const textarea = inputRef.current;
		if (!textarea) return;

		const oldSelectionStart = textarea.selectionStart;

		if (
			magicInput(e, value, (newValue) => {
				onChange(newValue);

				handleResize();

				requestAnimationFrame(() => {
					if (!inputRef.current) return;

					const offset = newValue.length - value.length;
					const newPos = oldSelectionStart + offset;

					inputRef.current.setSelectionRange(newPos, newPos);

					const { scrollHeight, clientHeight } = inputRef.current;
					if (scrollHeight > clientHeight) {
						inputRef.current.scrollTop = scrollHeight;
					}
				});
			})
		) {
			e.preventDefault();
			return;
		}
	}

	function handleCancel() {
		setDiscardedMedia([]);
		onCancel();
	}

	function handleConfirm() {
		const hasContent = value.trim().length > 0;
		const hasMedia = attached.length > 0;

		if (!hasContent && !hasMedia) {
			return;
		}

		if (discardedMedia.length > 0) {
			onRemoveMedia?.(discardedMedia);
		}

		setDiscardedMedia([]);
		onConfirm();
	}

	function handleRemoveMedia(mediaId: number) {
		setDiscardedMedia((prev) => [...prev, mediaId]);
	}

	const attached = media?.filter((it) => !discardedMedia.includes(it.id)) || [];

	return (
		<div>
			<div className="flex items-center gap-2 mt-1">
				<textarea
					ref={inputRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					className={clsx(
						"px-2 py-1 border-b rounded-t-xl border-0 w-full max-h-18rem bg-stone-200/40 dark:bg-neutral-800 focus:outline-none focus:ring-0",
						{
							"border-red-500 focus:border-red-500":
								value.trim().length === 0 && attached.length === 0,
							"border-stone-300 dark:border-neutral-700":
								value.trim().length > 0 || attached.length > 0,
						},
					)}
				/>

				<button
					type="button"
					onClick={handleConfirm}
					className="i-lucide-check text-secondary w-5 h-5"
					aria-label="Confirm"
				/>

				<button
					type="button"
					onClick={handleCancel}
					className="i-lucide-x text-secondary w-5 h-5"
					aria-label="Cancel"
				/>
			</div>

			{attached.length > 0 && (
				<div className="flex gap-2 mt-2">
					{attached.map((it) => (
						<MediaSelectItem
							key={it.id}
							media={it}
							onRemove={() => handleRemoveMedia(it.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export { EditCommentInput };
