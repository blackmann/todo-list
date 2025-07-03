interface ProfileProps {
	username: string;
}

function Profile({ username }: ProfileProps) {
	return (
		<div className="flex gap-2 border w-fit dark:border-neutral-700 bg-stone-200/70 dark:bg-neutral-800 rounded-lg px-2 py-0.5 font-mono items-center ">
			<img
				src={`https://api.dicebear.com/9.x/dylan/svg?seed=${username}`}
				className="size-6 rounded-full bg-amber-500"
				alt={`${username}'s avatar`}
			/>
			<div className="font-mono opacity-70">{username}</div>
		</div>
	);
}

export { Profile };
