import { Link, useLoaderData, useNavigate } from "react-router";
import type { loader } from "~/routes/_index";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function UserButton() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger className="bg-stone-200/50 dark:bg-neutral-800/50 px-2 py-1 rounded-full">
				<div className="flex gap-2">
					<img
						src={`https://api.dicebear.com/9.x/dylan/svg?seed=${user.username}`}
						className="size-6 rounded-full bg-amber-500"
						alt="blackmann"
					/>
					<div className="font-mono">{user.username}</div>
				</div>
			</PopoverTrigger>
			<PopoverContent className="z-100">
				<UserMenu />
			</PopoverContent>
		</Popover>
	);
}

function UserMenu() {
	const { user } = useLoaderData<typeof loader>();
	const navigate = useNavigate();

	const handleLogout = () => {
		const confirmed = window.confirm("Are you sure you want to logout?");
		if (confirmed) {
			navigate("/logout");
		}
	};

	return (
		<div className="bg-stone-50 dark:(bg-neutral-900 border-neutral-800) min-w-12rem rounded-lg overflow-hidden border shadow-lg">
			{user.superUser && (
				<header className="text-sm flex gap-2 items-center px-2 py-1 border-b border-stone-200/50 text-secondary dark:border-neutral-800">
					<div className="i-lucide-crown text-amber-500" /> Super User
				</header>
			)}

			<ul className="divide-y divide-stone-200/50 dark:divide-neutral-800">
				{user.superUser && (
					<li>
						<Link className="block px-2 py-1" to="/new-user">
							Invite user
						</Link>
					</li>
				)}

				<li>
					<Link className="block px-2 py-1" to="/change-password">
						Change Password
					</Link>
				</li>

				<li>
					<button
						type="button"
						onClick={handleLogout}
						className="block w-full px-2 py-1 text-left flex gap-2 items-center text-red-600 dark:bg-neutral-900 bg-stone-50"
					>
						<div className="i-solar-logout-2-outline" />
						Logout
					</button>
				</li>
			</ul>
		</div>
	);
}
