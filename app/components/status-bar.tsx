import { useLoaderData } from "react-router";
import { useAtom } from "jotai";
import { authorTime } from "~/lib/dates";
import { hoveredTask } from "~/lib/store";
import type { loader } from "~/routes/_index";

export function StatusBar() {
	const { done, total } = useLoaderData<typeof loader>();
	const [task] = useAtom(hoveredTask);

	const percentage = total === 0 ? 0 : Math.round((done / total) * 100);

	return (
		<div className="flex w-full bg-blue-500 px-4 font-mono text-sm text-white py-1 justify-between">
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2">
					<div className="i-solar-archive-minimalistic-broken opacity-80" />
					{total} tasks. {percentage}% done
				</div>
			</div>

			<div>
				{task && (
					<span>
						#{task.id} Created by @{task.author.username} &bull;{" "}
						{authorTime(task.createdAt)}
					</span>
				)}
			</div>
		</div>
	);
}
