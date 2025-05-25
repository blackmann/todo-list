import type { Status } from "@prisma/client";

interface StatusProps {
	id: Status;
	label: string;
	icon: string;
}

const statuses: StatusProps[] = [
	{
		id: "pending",
		label: "Pending",
		icon: "i-lucide-circle text-secondary",
	},
	{
		id: "inProgress",
		label: "In Progress",
		icon: "i-lucide-loader-circle text-amber-500",
	},
	{
		id: "done",
		label: "Done",
		icon: "i-solar-check-circle-bold text-indigo-500",
	},
];

export { statuses };
