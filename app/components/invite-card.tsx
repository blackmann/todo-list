import React from "react";
import { useFetcher } from "react-router";
import { CopyButton } from "./copy-button";
import { Input } from "./input";

type InviteCardProps = {
	onClose: () => void;
};

function InviteCard({ onClose }: InviteCardProps) {
	const fetcher = useFetcher();

	const fetched = React.useRef(false);

	React.useEffect(() => {
		if (!fetched.current && fetcher.state === "idle") {
			fetcher.load("/invite");
			fetched.current = true;
		}
	}, [fetcher.state, fetcher.load]);

	const token = fetcher.data?.token;
	const inviteLink = token ? `${window.location.origin}/invite/${token}` : "";

	return (
		<div className="text-sm">
			<div className="p-3 space-y-3">
				<div className="flex justify-between gap-2 items-center">
					<div className="font-medium text-base">Invite a Teammate</div>
					<button
						type="button"
						className="bg-transparent cursor-pointer"
						onClick={onClose}
					>
						<div className="i-lucide-x size-5" />
					</button>
				</div>

				<Input
					readOnly
					value={token ? inviteLink : "Loading..."}
					className="w-full rounded-lg font-mono border border-neutral-300 dark:border-neutral-700 bg-stone-200 dark:bg-neutral-800 px-2 py-1.5 text-sm truncate"
				/>

				<div className="flex flex-col gap-0">
					<CopyButton
						text={inviteLink}
						disabled={fetcher.state !== "idle" || !token}
					/>
					<span className="text-secondary font-mono ms-1 text-.65rem">
						Single-use link, expires in 12hrs
					</span>
				</div>
			</div>
			<div className="w-full bg-stone-200 dark:bg-neutral-800 p-2">
				<p className="text-xs leading-none font-mono text-neutral-700 dark:text-stone-200">
					This link allows one person to join the project
				</p>
			</div>
		</div>
	);
}

export { InviteCard };
