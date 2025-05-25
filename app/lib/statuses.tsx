import type { Status } from "@prisma/client";

interface StatusProps {
	id: Status;
	label: string;
	icon: React.ReactNode;
}

const statuses: StatusProps[] = [
	{
		id: "pending",
		label: "Pending",
		icon: <div className="i-lucide-circle text-secondary" />,
	},
	{
		id: "inProgress",
		label: "In Progress",
		icon: <div className="i-lucide-loader-circle text-amber-500" />,
	},
	{
		id: "done",
		label: "Done",
		icon: <div className="i-solar-check-circle-bold text-indigo-500" />,
	},
];

export { statuses };
