import { useIsFetching } from "@tanstack/react-query";
import clsx from "clsx";
import { useAtom } from "jotai";
import React from "react";
import { useLoaderData } from "react-router";
import { assigneeAtom, searchAtom } from "~/lib/store";
import type { loader } from "~/routes/_index";
import { FilterButton } from "./filter-button";
import { Input } from "./input";
import { NotificationsButton } from "./notification-button";
import { Select } from "./select";
import { UserButton } from "./user-button";
import { ProjectButton } from "./project-button";

export function Header() {
	const { users } = useLoaderData<typeof loader>();

	const [assignee, setAssignee] = useAtom(assigneeAtom);
	const [, setSearch] = useAtom(searchAtom);
	const [input, setInput] = React.useState("");

	const isFetching = useIsFetching({ queryKey: ["tasks"] });

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			setSearch(input || undefined);
		}, 300);

		return () => clearTimeout(timeout);
	}, [input, setSearch]);

	return (
		<div className="flex justify-between items-center p-2 border-b dark:border-neutral-800">
			<div className="flex gap-4 items-center">
				<div>
					<div className="i-solar-archive-minimalistic-bold-duotone text-rose-500 text-2xl" />
				</div>

				<div className="flex rounded-full divide-x divide-stone-300/50 dark:divide-neutral-700/50 border dark:border-neutral-700/50 overflow-hidden">
					<FilterButton />

					<div>
						<Input
							placeholder="Search for task"
							className="!w-20rem !rounded-0 !border-0 px-4"
							value={input}
							onChange={(e) => setInput(e.target.value)}
						/>
					</div>

					<div>
						<Select
							className="!w-12rem !rounded-0 !border-0 bg-transparent"
							value={assignee ?? ""}
							onChange={(e) => setAssignee(e.target.value)}
						>
							<option value="">Everyone</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.username}
								</option>
							))}
						</Select>
					</div>
				</div>

				<div>
					<div
						className={clsx(
							"i-svg-spinners-270-ring opacity-0 transition-opacity duration-300",
							{
								"opacity-100": isFetching,
							},
						)}
					/>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<NotificationsButton />
				<div className="flex rounded-full text-secondary divide-x divide-stone-300/50 dark:divide-neutral-700/50 border dark:border-neutral-700/50 overflow-hidden">
					<ProjectButton />
					<UserButton />
				</div>
			</div>
		</div>
	);
}
