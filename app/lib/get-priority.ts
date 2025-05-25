type Priority = { level: number; label: string; color: string };

const PRIORITIES: Record<string, Priority> = {
	"!!!": { level: 3, label: "P1", color: "bg-red-500 text-white" },
	"!!": { level: 2, label: "P2", color: "bg-orange-400 text-white" },
	"!": { level: 1, label: "P3", color: "bg-stone-400 dark:bg-stone-700 text-white" },
};

const getPriority = (title: string): Priority | null => {
	const match = Object.entries(PRIORITIES).find(([prefix]) =>
		title.startsWith(prefix),
	);
	return match ? match[1] : null;
};

export { getPriority };
