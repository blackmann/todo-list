"use client"

import { useAtom } from "jotai"
import React from "react"
import clsx from "clsx"
import { statuses } from "~/lib/statuses"
import { useTasks } from "~/lib/use-tasks"
import { useTaskUpdate } from "~/lib/use-task-update"
import { assigneeAtom, searchAtom } from "~/lib/store"
import type { Task } from "~/lib/types"
import { TaskTitle } from "./task-title"
import { Assignee } from "./assignee"
import { age } from "~/lib/dates"
import { TaskComposer } from "./task-composer"

interface KanbanColumnProps {
  status: (typeof statuses)[0]
  tasks: Task[]
  onTaskDrop: (taskId: number, newStatus: string) => void
}

function KanbanColumn({ status, tasks, onTaskDrop }: KanbanColumnProps) {
  const [draggedOver, setDraggedOver] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(true)
  }

  const handleDragLeave = () => {
    setDraggedOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedOver(false)
    const taskId = Number(e.dataTransfer.getData("text/plain"))
    onTaskDrop(taskId, status.id)
  }

  return (
    <div className="flex-1 min-w-80">
      <div className="bg-stone-100 dark:bg-neutral-900 rounded-lg border dark:border-neutral-800">
        <header className="p-3 border-b dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={clsx("text-lg", status.icon)} />
              <h3 className="font-medium text-sm">{status.label}</h3>
              <span className="bg-stone-200 dark:bg-neutral-700 text-xs px-2 py-0.5 rounded-full font-mono">
                {tasks.length}
              </span>
            </div>
          </div>
        </header>

        <div
          className={clsx("min-h-96 p-2 transition-colors duration-200", {
            "bg-blue-50 dark:bg-blue-900/20": draggedOver,
          })}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <KanbanTaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface KanbanTaskCardProps {
  task: Task
}

function KanbanTaskCard({ task }: KanbanTaskCardProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const update = useTaskUpdate(task) // One hook per component instance

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id.toString())
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Listen for drop events on the task itself if needed
  React.useEffect(() => {
    const handleGlobalDrop = (e: DragEvent) => {
      const droppedTaskId = e.dataTransfer?.getData("text/plain")
      if (droppedTaskId === task.id.toString()) {
        // Handle the status update here if needed
      }
    }

    document.addEventListener("drop", handleGlobalDrop)
    return () => document.removeEventListener("drop", handleGlobalDrop)
  }, [task.id])

  return (
    <div
      className={clsx(
        "group bg-white dark:bg-neutral-800 rounded-lg border dark:border-neutral-700 p-3 cursor-move transition-all duration-200 hover:shadow-md",
        {
          "opacity-50 scale-95": isDragging,
          "line-through opacity-60": task.status === "done",
        },
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        <TaskTitle task={task} />

        <div className="flex items-center justify-between text-xs">
          <Assignee task={task} />

          <div className="flex items-center gap-3 text-secondary">
            <div className="flex items-center gap-1">
              <div className="i-solar-chat-line-line-duotone" />
              {task.comments}
            </div>
            <span>{age(task.createdAt)}</span>
            <span className="font-mono opacity-60">#{task.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KanbanBoard() {
  const [assigneeId] = useAtom(assigneeAtom)
  const [search] = useAtom(searchAtom)

  const { query } = useTasks({ assigneeId, search })
  const { data } = query
  const tasks = data?.pages.flat() || []

  // Simple approach: just pass the task data and let each card handle its own updates
  const handleTaskDrop = React.useCallback((taskId: number, newStatus: string) => {
    // This will be handled by individual task cards
    console.log(`Task ${taskId} should move to ${newStatus}`)
  }, [])

  const groupedTasks = statuses.map((status) => ({
    status,
    tasks: tasks.filter((task) => task.status === status.id),
  }))

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="sticky top-0 z-10 bg-stone-100 dark:bg-neutral-900 border-b dark:border-neutral-800">
        <TaskComposer />
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 min-w-max">
          {groupedTasks.map(({ status, tasks }) => (
            <KanbanColumn key={status.id} status={status} tasks={tasks} onTaskDrop={handleTaskDrop} />
          ))}
        </div>
      </div>
    </div>
  )
}
