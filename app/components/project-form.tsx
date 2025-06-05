import type { Project } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { type FieldValues, useForm } from "react-hook-form";
import { useNavigate, useRevalidator } from "react-router";
import { SLUG_REGEX } from "~/lib/constants";
import { slugify } from "~/lib/slugify";
import { useProjects } from "~/lib/use-projects";
import { Button } from "./button";
import { usePopoverContext } from "./popover";

interface Props {
	onClose: () => void;
	project?: Project;
}

export function ProjectForm({ onClose, project }: Props) {
	const { create, update } = useProjects();

	const { register, handleSubmit, watch } = useForm({
		defaultValues: {
			name: project?.name || "",
			slug: project?.slug || "",
		},
	});

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { revalidate } = useRevalidator();
	const popover = usePopoverContext();

	const $name = watch("name");
	const slugifyName = slugify($name);

	function onSubmit(data: FieldValues) {
		const fn = project ? update : create;
		const slug = data.slug || slugifyName;

		const form = project
			? { id: project.id, name: data.name, slug }
			: { ...data, slug };

		fn.mutate(form, {
			onSuccess: async () => {
				if (project) {
					if (project.slug !== slug) {
						popover.setOpen(false);
						navigate(`/${slug}`);
					} else {
						onClose();
						await Promise.all([
							queryClient.invalidateQueries({ queryKey: ["projects"] }),
							revalidate(),
						]);
					}

					return;
				}

				onClose();

				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["projects"] }),
					revalidate(),
				]);
			},
		});
	}

	const isPending = create.isPending || update.isPending;

	const buttonTitle = project ? "Update Project" : "Create Project";
	const buttonInProgressTitle = project ? "Updating…" : "Creating…";

	return (
		<form className="text-sm" onSubmit={handleSubmit(onSubmit)}>
			<div className="p-3 space-y-3">
				<div className="flex justify-between gap-2 items-center">
					<div className="font-medium text-base">
						{project ? `Edit ${project?.name}` : "Create new project"}
					</div>
					<button
						type="button"
						className="bg-transparent cursor-pointer text-secondary"
						onClick={onClose}
					>
						<div className="i-lucide-x size-5" />
					</button>
				</div>

				<div>
					<input
						placeholder="Project Name"
						className="w-full rounded-t-lg font-mono border border-neutral-300 dark:border-neutral-700 bg-stone-200 dark:bg-neutral-800 px-2 py-1.5 text-sm truncate"
						{...register("name", {
							required: true,
							setValueAs: (value) => value.trim(),
							minLength: 3,
						})}
					/>

					<input
						placeholder={`${slugifyName || "Slug"}`}
						className="w-full rounded-b-lg font-mono border border-t-0 border-neutral-300 dark:border-neutral-700 bg-stone-200 dark:bg-neutral-800 px-2 py-1.5 text-sm truncate"
						{...register("slug", { pattern: SLUG_REGEX })}
					/>
				</div>

				<div className="flex flex-col gap-0">
					<Button
						className="bg-neutral-700 justify-center"
						disabled={isPending}
						type="submit"
					>
						{isPending ? (
							<div className="i-lucide-loader-circle animate-spin" />
						) : (
							<div className="i-lucide-check" />
						)}
						{isPending ? buttonInProgressTitle : buttonTitle}
					</Button>
				</div>
			</div>
			<div className="w-full h-2.5rem bg-stone-200 dark:bg-neutral-800 p-2 overflow-hidden">
				<p className="text-xs leading-none font-mono text-neutral-700 dark:text-stone-200 w-16rem">
					You will have to send invites to teammates to join the project.
				</p>
			</div>
		</form>
	);
}
