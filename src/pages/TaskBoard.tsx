import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { TaskCard } from '../components/TaskCard'
import { TaskModal } from '../components/TaskModal'
import type { Status, Task } from '../types'

export default function TaskBoard() {
  const { tasks, people, meta } = useStore()
  const categories = meta?.categories ?? []
  const statuses = (meta?.statuses ?? []) as Status[]

  const [categoryFilter, setCategoryFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined)

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
        if (assigneeFilter !== 'all' && t.assigneeId !== assigneeFilter) return false
        return true
      }),
    [tasks, categoryFilter, assigneeFilter],
  )

  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id
  const personById = (id: string | null) => (id ? people.find((p) => p.id === id) : undefined)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-stone-900">Task Board</h2>
        <button
          onClick={() => setEditingTask(null)}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          + Add task
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All assignees</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statuses.map((status) => {
          const columnTasks = filtered.filter((t) => t.status === status)
          return (
            <div key={status} className="rounded-lg bg-stone-100 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-stone-700">{status}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-stone-500">
                  {columnTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assignee={personById(task.assigneeId)}
                    categoryLabel={categoryLabel(task.category)}
                    onClick={() => setEditingTask(task)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-stone-400">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {editingTask !== undefined && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(undefined)} />
      )}
    </div>
  )
}
