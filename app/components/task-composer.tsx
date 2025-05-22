import type { Task } from "@prisma/client";
import React from "react";

interface Props {
	onNewEntry: (task: Task) => void;
}

export function TaskComposer({ onNewEntry }: Props) {
	const [inProgress, setInProgress] = React.useState(false);

	const formRef = React.useRef<HTMLFormElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setInProgress(true);

		const formData = new FormData(event.currentTarget);
		const title = formData.get("title") as string;

		try {
			const res = await fetch("/list", {
				method: "POST",
				body: JSON.stringify({ title, assignee: "notgr", author: "notgr" }),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!res.ok) {
				console.error(res);
				return;
			}

			const data = await res.json();
			onNewEntry(data.task);

			formRef.current?.reset();
			inputRef.current?.focus();
		} finally {
			setInProgress(false);
		}
	}

	return (
		<form
			className="flex gap-4 p-2 bg-stone-200/60 dark:bg-neutral-800/60 relative"
			onSubmit={handleSubmit}
			ref={formRef}
		>
			<div className="p-0.5">
				<div className="i-solar-inbox-line-line-duotone text-xl opacity-40" />
			</div>

			<input
				type="text"
				placeholder="What needs done?"
				name="title"
				className="w-full .font-medium bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0"
				disabled={inProgress}
				ref={inputRef}
			/>
		</form>
	);
}
