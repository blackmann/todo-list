import React from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { useTasks } from "~/lib/use-tasks";
import type { loader } from "~/routes/_index";

export function TaskComposer() {
	const { user } = useLoaderData<typeof loader>();

	const formRef = React.useRef<HTMLFormElement>(null);
	const inputRef = React.useRef<HTMLInputElement>(null);

	const { create } = useTasks();
	const { revalidate } = useRevalidator();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const title = formData.get("title") as string;

		if (!title.trim()) return;

		create.mutate(
			{ title: title.trim(), assigneeId: user.id, authorId: user.id },
			{
				onSuccess: () => {
					formRef.current?.reset();
					// wait enough for the disabled prop to be removed
					setTimeout(() => inputRef.current?.focus(), 100);

					// notify status bar
					revalidate();
				},
			},
		);
	}

	return (
		<form
			className="flex gap-4 p-2 bg-stone-200 dark:bg-neutral-800 relative"
			onSubmit={handleSubmit}
			ref={formRef}
		>
			<div className="p-0.5">
				<div className="i-solar-inbox-line-line-duotone text-xl opacity-40" />
			</div>

			<div className="flex w-full items-center">
				<input
					type="text"
					placeholder="What needs done?"
					name="title"
					className="flex-1 font-medium bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0"
					disabled={create.isPending}
					ref={inputRef}
				/>

				{create.isPending && (
					<div className="i-svg-spinners-270-ring text-secondary" />
				)}
			</div>
		</form>
	);
}
