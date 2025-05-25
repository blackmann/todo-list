"use client"

import { type LoaderFunctionArgs, type MetaFunction, redirect } from "react-router"
import React from "react"
import clsx from "clsx"
import { Header } from "~/components/header"
import { KanbanBoard } from "~/components/kanban"
import { StatusBar } from "~/components/status-bar"
import { Todos } from "~/components/todos"
import { checkAuth } from "~/lib/check-auth"
import { prisma } from "~/lib/prisma.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
	let user: Awaited<ReturnType<typeof checkAuth>>

	try {
		user = await checkAuth(request)
	} catch (error) {
		return redirect("/login")
	}

	const users = await prisma.user.findMany({ omit: { password: true } })

	const [{ total, done }] = (await prisma.$queryRaw`
		SELECT
			COUNT(*) as total,
			COUNT(CASE WHEN status = 'done' THEN 1 END) as done
		FROM "Task"
	`) satisfies { total: bigint; done: bigint }[]

	const unreadNotifications = await prisma.notification.count({
		where: {
			userId: user.id,
			read: false,
		},
	})

	return {
		done: Number(done),
		total: Number(total),
		user,
		users,
		unreadNotifications,
	}
}

export const meta: MetaFunction = () => {
	return [{ title: "Get stuff done | Todo List" }, { name: "description", content: "Just do it!" }]
}

type ViewMode = "list" | "kanban"

function ViewTabs({ activeView, onViewChange }: { activeView: ViewMode; onViewChange: (view: ViewMode) => void }) {
	return (
		<div className="py-4 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900">
			<div className="flex justify-center gap-2">
				<button
					type="button"
					onClick={() => onViewChange("list")}
					className={clsx(
						"flex rounded-lg items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200",
						{
							"text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-800": activeView === "list",
							"text-white hover:text-stone-700 dark:hover:text-neutral-300 hover:border-stone-300 dark:hover:border-neutral-600":
								activeView !== "list",
						},
					)}
				>
					<div className="i-solar-list-bold-duotone text-lg" />
					List View
				</button>

				<button
					type="button"
					onClick={() => onViewChange("kanban")}
					className={clsx(
						"flex rounded-lg items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-200",
						{
							"text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-800": activeView === "kanban",
							"text-white hover:text-stone-700 dark:hover:text-neutral-300 hover:border-stone-300 dark:hover:border-neutral-600":
								activeView !== "kanban",
						},
					)}
				>
					<div className="i-solar-widget-4-bold-duotone text-lg" />
					Kanban Board
				</button>
			</div>
		</div>
	)
}

export default function Index() {
	const [activeView, setActiveView] = React.useState<ViewMode>("kanban")

	return (
		<div className="flex flex-col h-screen">
			<Header />

			<ViewTabs activeView={activeView} onViewChange={setActiveView} />

			<div className="flex-1 h-0 py-4">{activeView === "list" ? <Todos /> : <KanbanBoard />}</div>

			<StatusBar />
		</div>
	)
}
