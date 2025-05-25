import { type LoaderFunctionArgs, type MetaFunction, redirect } from "react-router";
import { Header } from "~/components/header";
import { StatusBar } from "~/components/status-bar";
import { Todos } from "~/components/todos";
import { checkAuth } from "~/lib/check-auth";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	let user: Awaited<ReturnType<typeof checkAuth>>;

	try {
		user = await checkAuth(request);
	} catch (error) {
		return redirect("/login");
	}

	const users = await prisma.user.findMany({ omit: { password: true } });

	const [{ total, done }] = (await prisma.$queryRaw`
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'done' THEN 1 END) as done
		FROM "Task"
	`) satisfies { total: bigint; done: bigint }[];

	const unreadNotifications = await prisma.notification.count({
		where: {
			userId: user.id,
			read: false,
		},
	});

	return {
		done: Number(done),
		total: Number(total),
		user,
		users,
		unreadNotifications,
	};
};

export const meta: MetaFunction = () => {
	return [
		{ title: "Get stuff done | Todo List" },
		{ name: "description", content: "Just do it!" },
	];
};

export default function Index() {
	return (
		<div className="flex flex-col h-screen">
			<Header />

			<div className="flex-1 h-0">
				<Todos />
			</div>

			<StatusBar />
		</div>
	);
}
