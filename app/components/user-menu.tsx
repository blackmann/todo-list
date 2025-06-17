import clsx from "clsx";
import React from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import type { loader } from "~/routes/$project";
import { GitHubCard } from "./github-card";
import { InviteCard } from "./invite-card";

type View = "default" | "github";

function UserMenu() {
	const { user, installation } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const [showInvite, setShowInvite] = React.useState(false);
	const [view, setView] = React.useState<View>("default");

	function handleLogout() {
		const confirmed = window.confirm("Are you sure you want to logout?");
		if (confirmed) {
			navigate("/logout");
		}
	}

	if (view === "github") {
		return (
			<Container className="!w-17rem text-center p-2">
				<GitHubCard onBack={() => setView("default")} />
			</Container>
		);
	}

	return (
		<Container
			className={clsx({ "!w-14rem": !showInvite, "!w-17rem": showInvite })}
		>
			{!showInvite ? (
				<>
					{user.superUser && (
						<div>
							<header className="p-2 flex text-sm items-center justify-start">
								<div className="bg-stone-200 dark:bg-neutral-800 px-2 rounded-lg flex gap-2 items-center text-secondary">
									<div className="i-lucide-crown text-amber-500" />
									Super User
								</div>
							</header>

							<hr className="dark:border-neutral-800" />
						</div>
					)}

					<ul className="font-medium p-1">
						{user.superUser && (
							<li>
								<button
									type="button"
									onClick={() => setShowInvite(true)}
									className="bg-transparent w-full flex gap-2 items-center py-1.5 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg"
								>
									<div className="i-solar-users-group-rounded-linear opacity-50" />
									Invite a Teammate
								</button>
							</li>
						)}

						{user.superUser && (
							<li>
								<button
									type="button"
									onClick={() => setView("github")}
									className={clsx(
										"bg-transparent w-full flex gap-2 items-center py-1.5 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg",
										installation && "opacity-70",
									)}
								>
									<div className="i-mdi-github opacity-50" />
									GitHub Integration{" "}
									{installation && (
										<div
											className={clsx(
												"size-2 rounded-full",
												installation.active
													? "bg-green-600 dark:bg-green-500"
													: "bg-amber-500",
											)}
										/>
									)}
								</button>
							</li>
						)}

						<li>
							<Link
								to="/change-password"
								className="w-full flex gap-2 items-center py-1.5 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg"
							>
								<div className="i-solar-lock-password-linear opacity-50" />
								Change Password
							</Link>
						</li>

						<li>
							<button
								type="button"
								onClick={handleLogout}
								className="bg-transparent w-full flex gap-2 items-center py-1.5 px-2 text-red-500 hover:bg-red-600/5 rounded-lg"
							>
								<div className="i-solar-logout-2-outline" />
								Logout
							</button>
						</li>
					</ul>
				</>
			) : (
				<InviteCard onClose={() => setShowInvite(false)} />
			)}
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
				"transition-width duration-300 ease-in-out will-change-width bg-stone-100 dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-lg mt-1.5 animate-fade-in animate-duration-200",
				className,
			)}
		>
			{children}
		</div>
	);
}

export { UserMenu };
