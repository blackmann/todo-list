import React from "react";
import { useLoaderData } from "react-router";
import { magicInput } from "~/lib/magic-input";
import { uploadMedia } from "~/lib/upload-media";
import { useComments } from "~/lib/use-comments";
import type { loader } from "~/routes/_index";
import { FileInput } from "./file-input";
import { FileSelectItem } from "./file-select-item";

interface Props {
	taskId: number;
}

export interface Media {
	url: string;
	filename: string;
	size: number;
	contentType: string;
	thumbnail?: string;
}

export function CommentComposer({ taskId }: Props) {
	const { user } = useLoaderData<typeof loader>();
	const { create } = useComments(taskId);
	const inputRef = React.useRef<HTMLTextAreaElement>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [files, setFiles] = React.useState<File[]>([]);
	const [isUploading, setIsUploading] = React.useState(false);

	const isFileUploadEnabled =
		import.meta.env.VITE_ENABLE_FILE_UPLOAD === "true";

	const handleResize = React.useRef(() => {
		const textarea = inputRef.current;

		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	});

	React.useEffect(() => {
		handleResize.current();
	}, []);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const content = formData.get("content") as string;

		if (!content.trim() && files.length === 0) return;

		try {
			setIsUploading(true);

			let media: Media[] = [];

			if (files.length > 0) {
				const uploads = await Promise.all(
					files.map((file) => uploadMedia(file)),
				);

				media = uploads.map((res) => ({
					url: res.url,
					filename: res.filename,
					size: res.size,
					contentType: res.contentType,
					thumbnail: res.thumbnail,
				}));
			}

			create.mutate(
				{
					taskId,
					content: content.trim(),
					authorId: user.id,
					media,
				},
				{
					onSuccess: () => {
						form.reset();
						setFiles([]);
						setIsUploading(false);

						if (inputRef.current) {
							inputRef.current.style.height = "auto";
						}
						setTimeout(() => inputRef.current?.focus(), 100);
					},
					onError: () => {
						setIsUploading(false);
					},
				},
			);
		} catch (error) {
			setIsUploading(false);
		}
	}

	function handleFilesSelect(e: React.ChangeEvent<HTMLInputElement>) {
		if (!e.target.files?.length) return;

		const newFiles = Array.from(e.target.files);

		const ATTACHMENT_LIMIT = 5 * 1024 * 1024; // 5MB
		const oversizedFiles = newFiles.filter(
			(file) => file.size > ATTACHMENT_LIMIT,
		);

		if (oversizedFiles.length > 0) {
			alert(
				`Some files are too large. Maximum 5MB per file. Oversized files: ${oversizedFiles.map((f) => f.name).join(", ")}`,
			);
			return;
		}

		setFiles((prev) => [...prev, ...newFiles].slice(0, 3));
	}

	function handleDrop(e: React.DragEvent) {
		e.preventDefault();
		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles.length > 0) {
			const newFiles = Array.from(droppedFiles);

			const ATTACHMENT_LIMIT = 5 * 1024 * 1024; // 5MB
			const oversizedFiles = newFiles.filter(
				(file) => file.size > ATTACHMENT_LIMIT,
			);

			if (oversizedFiles.length > 0) {
				alert(
					`Some files are too large. Maximum 5MB per file. Oversized files: ${oversizedFiles.map((f) => f.name).join(", ")}`,
				);
				return;
			}

			setFiles((prev) => [...prev, ...newFiles].slice(0, 3));
		}
	}

	function handleDragOver(e: React.DragEvent) {
		e.preventDefault();
	}

	function removeFile(index: number) {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}

	const isProcessing = create.isPending || isUploading;

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.form?.requestSubmit();
			return;
		}

		if (
			magicInput(e, inputRef.current?.value || "", (newValue) => {
				if (inputRef.current) {
					inputRef.current.value = newValue;

					handleResize.current();

					const { selectionStart } = inputRef.current;
					inputRef.current.setSelectionRange(selectionStart, selectionStart);
					inputRef.current.scrollTop = inputRef.current.scrollHeight;
				}
			})
		) {
			e.preventDefault();
			return;
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="relative"
			onDrop={!isFileUploadEnabled ? undefined : handleDrop}
			onDragOver={!isFileUploadEnabled ? undefined : handleDragOver}
		>
			{isProcessing && (
				<div className="absolute top-2 right-2 i-svg-spinners-270-ring text-secondary" />
			)}

			<div className="flex w-full items-center">
				<textarea
					className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 overflow-y-auto overflow-x-hidden max-h-18rem"
					placeholder="Add a comment"
					name="content"
					rows={3}
					ref={inputRef}
					disabled={isProcessing}
					onChange={handleResize.current}
					onInput={handleResize.current}
					onKeyDown={handleKeyDown}
				/>
			</div>

			<div className="text-sm text-secondary flex justify-between gap-4">
				<div className="flex items-center gap-2">
					<FileInput
						multiple
						accept="image/png,image/jpeg,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
						onChange={handleFilesSelect}
						disabled={!isFileUploadEnabled || isProcessing || files.length >= 3}
						ref={fileInputRef}
					>
						<div className="i-solar-link-round-angle-bold-duotone" />{" "}
						{isUploading && files.length ? "Uploading..." : "Drop files here"}{" "}
						{files.length > 0 && !isUploading && (
							<span className="animate-fade-in animate-duration-150">
								( 3 files max. 5MB limit per file. )
							</span>
						)}
					</FileInput>
				</div>

				<button
					type="submit"
					className="flex gap-2 items-center bg-stone-300/60 dark:bg-neutral-700 px-2 rounded-full"
				>
					<div className="i-solar-command-linear" /> + Enter to send
				</button>
			</div>

			{isFileUploadEnabled && files.length > 0 && (
				<div className="flex gap-2 mt-2">
					{files.map((file, i) => (
						<FileSelectItem
							key={`${file.name}-${i}`}
							file={file}
							onRemove={() => !isProcessing && removeFile(i)}
						/>
					))}
				</div>
			)}
		</form>
	);
}
