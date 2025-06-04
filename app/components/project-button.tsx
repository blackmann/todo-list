import clsx from "clsx";
import React, { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { ProjectWithTaskCount } from "~/lib/types";
import { useProjects } from "~/lib/use-projects";
import type { loader } from "~/routes/$project";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	usePopoverContext,
} from "./popover";
import { ProjectDeleteForm } from "./project-delete-form";
import { ProjectForm } from "./project-form";

export function ProjectButton() {
	const { project } = useLoaderData<typeof loader>();

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger className="text-start dark:bg-neutral-800/30 rounded-s-full">
				<div className="min-w-10rem p-1 pl-2 gap-2 flex items-center font-mono">
					<div className="i-solar-layers-minimalistic-line-duotone text-xl" />
					<div className="flex-1">
						<p>{project.name}</p>
					</div>
					<div className="i-solar-alt-arrow-down-linear size-5" />
				</div>
			</PopoverTrigger>

			<PopoverContent className="z-100">
				<Content />
			</PopoverContent>
		</Popover>
	);
}

type View =
	| "list"
	| "new-project-form"
	| "edit-project-form"
	| "delete-project-form";
function Content() {
	const [view, setView] = useState<View>("list");

	const { user, project: activeProject } = useLoaderData<typeof loader>();
	const { query } = useProjects();
	const { data: projects } = query;

	const popover = usePopoverContext();

	const edit = React.useRef<ProjectWithTaskCount>();

	const isOnly = projects?.length === 1;

	if (view === "new-project-form") {
		return (
			<Container className="!w-17rem">
				<ProjectForm onClose={() => setView("list")} />
			</Container>
		);
	}

	if (view === "edit-project-form") {
		return (
			<Container className="!w-17rem">
				<ProjectForm onClose={() => setView("list")} project={edit.current} />
			</Container>
		);
	}

	if (view === "delete-project-form") {
		return (
			<Container className="!w-17rem">
				<ProjectDeleteForm
					project={edit.current!}
					onClose={() => setView("list")}
				/>
			</Container>
		);
	}

	return (
		<Container>
			<div>
				<ul className="p-1">
					<li>
						{projects?.map((project) => (
							<div
								className={clsx(
									"group w-full flex gap-2 items-center py-1.5 px-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-lg",
									{
										"bg-neutral-200/50 dark:bg-neutral-800/50":
											project.id === activeProject.id,
									},
								)}
								key={project.id}
							>
								<Link
									className="flex-1 gap-2 items-center flex"
									to={`/${project.slug}`}
									onClick={() => popover.setOpen(false)}
								>
									<div className="i-solar-layers-minimalistic-line-duotone text-xl opacity-50" />
									{project.name}
								</Link>

								{user.superUser && (
									<div className="flex items-center gap-2">
										<button
											type="button"
											className="i-solar-pen-2-line-duotone text-xl text-secondary opacity-0 group-hover:opacity-100 focus:opacity-100"
											onClick={() => {
												edit.current = project;
												setView("edit-project-form");
											}}
										/>

										<button
											type="button"
											className="i-solar-trash-bin-trash-linear text-xl text-secondary opacity-0 group-hover:opacity-100"
											disabled={isOnly}
											hidden={isOnly}
											onClick={() => {
												edit.current = project;
												setView("delete-project-form");
											}}
										/>
									</div>
								)}

								<div className="text-sm font-mono bg-stone-300/50 dark:bg-neutral-800 px-1 leading-tight rounded-full">
									{project._count.Task}
								</div>
							</div>
						))}
					</li>
				</ul>

				{user.superUser && (
					<div className="border-t border-neutral-300 dark:border-neutral-800 p-1">
						<button
							type="button"
							className="bg-transparent w-full flex gap-2 items-center py-1.5 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg font-medium"
							onClick={() => setView("new-project-form")}
						>
							<div className="i-solar-arrow-to-top-right-bold-duotone text-xl" />
							New project
						</button>
					</div>
				)}
			</div>
		</Container>
	);
}

function Container({
	children,
	className,
}: { children: React.ReactNode; className?: string }) {
	return (
		<div
			className={clsx(
				"w-16rem divide-y divide-neutral-5/50 transition-[width,min-width] duration-300 ease-in-out will-change-width bg-stone-100 dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-lg mt-1.5 animate-fade-in animate-duration-200",
				className,
			)}
		>
			{children}
		</div>
	);
}
