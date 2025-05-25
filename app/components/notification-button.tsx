import { useLoaderData } from "react-router";
import clsx from "clsx";
import parse from "html-react-parser";
import { TASK_MENTION_REGEX, USER_MENTION_REGEX } from "~/lib/constants";
import { authorTime } from "~/lib/dates";
import { useNotifications } from "~/lib/use-notifications";
import type { loader as indexLoader } from "~/routes/_index";
import type { loader } from "~/routes/notifications";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
	usePopoverContext,
} from "./popover";

export function NotificationsButton() {
	const { unreadNotifications } = useLoaderData<typeof indexLoader>();

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger className="bg-transparent">
				<div
					className={clsx(
						"bg-stone-200 dark:bg-neutral-800 flex items-center justify-center rounded-full px-2 font-mono flex items-center gap-2 text-secondary",
						{ "!bg-orange-500 !text-white": unreadNotifications },
					)}
				>
					<div className="i-solar-bell-linear text-lg" /> {unreadNotifications}
				</div>
			</PopoverTrigger>

			<PopoverContent className="z-100 animate-fade-in animate-duration-200">
				<NotificationsList />
			</PopoverContent>
		</Popover>
	);
}

function NotificationsList() {
	const { query } = useNotifications();
	const { unreadNotifications } = useLoaderData<typeof indexLoader>();

	return (
		<div className="w-24rem border rounded-xl bg-stone-50 dark:(bg-neutral-900 border-neutral-800) max-h-24rem overflow-y-auto shadow-lg">
			<header className="font-medium text-secondary text-sm p-2 pb-0">
				Notifications ({unreadNotifications})
			</header>

			<ul className="divide-y divide-stone-200/50 dark:divide-neutral-800">
				{query.data?.pages.flat().map((it) => {
					return (
						<li key={it.id}>
							<NotificationItem notification={it} />
						</li>
					);
				})}
			</ul>
		</div>
	);
}

type Notification = Awaited<ReturnType<typeof loader>>["notifications"][number];
function NotificationItem({ notification }: { notification: Notification }) {
	const { read } = useNotifications();
	const popover = usePopoverContext();

	function readNotification() {
		if (!notification.read) {
			read.mutate(notification.id);
		}

		popover.setOpen(false);
	}

	return (
		<button
			className={clsx(
				"bg-transparent text-start p-2 w-full hover:bg-stone-100 dark:hover:bg-neutral-800",
				{
					"opacity-50": notification.read,
				},
			)}
			type="button"
			onClick={readNotification}
		>
			<header className="text-xs text-secondary ms-6 font-mono">
				{authorTime(notification.createdAt)}
			</header>
			<div className="text-start flex gap-2">
				<div className="pt-1">
					<div className="i-solar-user-hands-line-duotone text-secondary" />
				</div>
				<div className="flex-1">{parse(convert(notification))}</div>
			</div>
		</button>
	);
}

function convert(notification: Notification) {
	const { message, tasks, users } = notification;

	return message
		.replace(TASK_MENTION_REGEX, (_, taskId) => {
			const task = tasks.find((it) => it?.id === Number(taskId));
			const color = task ? "text-blue-500" : "text-secondary";
			return `<span href="/tasks/${taskId}" class="${color} font-medium">#${taskId}: ${shorten(task?.title || "&lt;deleted task&gt;")}</span>`;
		})
		.replace(USER_MENTION_REGEX, (_, userId) => {
			const user = users.find((it) => it?.id === Number(userId))!;
			return `<span class="text-orange-500 font-medium font-mono">@${user?.username || "&lt;deleted user&gt;"}</span>`;
		});
}

function shorten(text: string) {
	if (text.length > 20) {
		return `${text.substring(0, 20)}…`;
	}

	return text;
}
