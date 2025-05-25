import { useLoaderData } from "react-router";
import React from "react";
import { useComments } from "~/lib/use-comments";
import type { loader } from "~/routes/_index";

interface Props {
	taskId: number;
}

export function CommentComposer({ taskId }: Props) {
	const { user } = useLoaderData<typeof loader>();
	const { create } = useComments(taskId);
	const inputRef = React.useRef<HTMLTextAreaElement>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget;
		const formData = new FormData(form);
		const content = formData.get("content") as string;

		if (!content.trim()) return;

		create.mutate({ taskId, content: content.trim(), authorId: user.id });
		form.reset();
		inputRef.current?.focus();
	};

	return (
		<form
			onSubmit={handleSubmit}
			onKeyDown={(e) => {
				if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
					e.preventDefault();
					e.currentTarget.requestSubmit();
				}
			}}
		>
			<textarea
				className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0"
				placeholder="Add a comment"
				name="content"
				rows={3}
				ref={inputRef}
			/>

			<div className="text-sm text-secondary flex justify-between gap-4">
				<div className="flex items-center gap-2">
					<div className="i-solar-link-round-angle-bold-duotone" /> Drop files
					here
				</div>

				<button
					type="submit"
					className="flex gap-2 items-center bg-stone-300/60 dark:bg-neutral-700 px-2 rounded-full"
				>
					<div className="i-solar-command-linear" /> + Enter to send
				</button>
			</div>
		</form>
	);
}
