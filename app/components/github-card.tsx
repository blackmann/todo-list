import clsx from "clsx";
import { Link, useLoaderData } from "react-router";
import type { loader } from "~/routes/$project";
import { Button } from "./button";
import { usePopoverContext } from "./popover";

interface GitHubCardProps {
	onBack: () => void;
}

function GitHubCard({ onBack }: GitHubCardProps) {
	const { installation } = useLoaderData<typeof loader>();
	const popover = usePopoverContext();

	function to() {
		if (installation) {
			return `https://github.com/settings/installations/${installation.githubInstallationId}`;
		}

		return "https://github.com/apps/gr-s-todo-list/installations/new";
	}

	return (
		<>
			<div className="flex gap-2 justify-end items-center">
				<button
					type="button"
					className="bg-transparent cursor-pointer"
					onClick={onBack}
				>
					<div className="i-lucide-x size-5 text-secondary" />
				</button>
			</div>

			<div className="flex justify-center mb-2 items-center text-secondary relative">
				<div className="i-solar-archive-minimalistic-bold-duotone size-8 text-rose-500" />
				<div className="i-mdi-github size-8 -ml-2.5 text-neutral-800 dark:text-white" />
			</div>

			<h2 className="mb-2">Github Integration</h2>

			{installation ? (
				<p className="text-.8rem font-mono leading-tight text-secondary mb-4 overflow-hidden !w-16rem">
					GitHub integration is{" "}
					<span
						className={clsx(
							"font-medium",
							installation.active
								? "text-green-600 dark:text-green-500"
								: "text-amber-500",
						)}
					>
						{installation.active ? "active" : "paused"}
					</span>
					. Tasks will {installation.active ? "" : "not "}automatically update
					when you open or merge pull requests.
				</p>
			) : (
				<p className="text-.8rem font-mono leading-tight text-secondary mb-4 overflow-hidden !w-16rem">
					Connect Todo List with your GitHub account to automatically update the
					status of tasks.
				</p>
			)}

			<Link
				target="_blank"
				rel="noreferrer noopener"
				to={to()}
				className="w-full"
			>
				<Button
					type="button"
					onClick={() => popover.setOpen(false)}
					className="w-full text-sm font-medium flex items-center justify-center bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 px-3 !py-1.5 gap-1"
				>
					{installation ? "Manage Integration" : "Connect with GitHub"}
				</Button>
			</Link>
		</>
	);
}

export { GitHubCard };
