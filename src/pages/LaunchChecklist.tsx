import { useState } from 'react'
import { useStore } from '../store'
import { PriorityBadge, StatusBadge } from '../components/badges'
import { TaskModal } from '../components/TaskModal'
import type { Task } from '../types'

export default function LaunchChecklist() {
  const { tasks, people, meta, editTask } = useStore()
  const categories = meta?.categories ?? []
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined)
  const [addCategory, setAddCategory] = useState<string | null>(null)

  function toggleDone(task: Task) {
    editTask(task.id, { status: task.status === 'Done' ? 'Not Started' : 'Done' })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-stone-900">Launch Checklist</h2>
      <p className="mt-1 text-sm text-stone-500">
        Every workstream that needs to close out before Prana Farms launches.
      </p>

      <div className="mt-6 space-y-6">
        {categories.map((cat) => {
          const catTasks = tasks.filter((t) => t.category === cat.id)
          const doneCount = catTasks.filter((t) => t.status === 'Done').length

          return (
            <div key={cat.id} className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">{cat.label}</h3>
                  <p className="text-xs text-stone-500">
                    {doneCount} / {catTasks.length} done
                  </p>
                </div>
                <button
                  onClick={() => setAddCategory(cat.id)}
                  className="text-sm font-medium text-emerald-700 hover:underline"
                >
                  + Add task
                </button>
              </div>

              <div className="mt-2 h-1.5 w-full rounded-full bg-stone-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-600"
                  style={{
                    width: catTasks.length ? `${(doneCount / catTasks.length) * 100}%` : '0%',
                  }}
                />
              </div>

              {catTasks.length === 0 ? (
                <p className="mt-4 text-sm text-stone-400">No tasks yet in this workstream.</p>
              ) : (
                <ul className="mt-4 divide-y divide-stone-100">
                  {catTasks.map((task) => {
                    const assignee = people.find((p) => p.id === task.assigneeId)
                    return (
                      <li key={task.id} className="flex items-center gap-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={task.status === 'Done'}
                          onChange={() => toggleDone(task)}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-600"
                        />
                        <button
                          onClick={() => setEditingTask(task)}
                          className={`flex-1 text-left text-sm ${
                            task.status === 'Done'
                              ? 'text-stone-400 line-through'
                              : 'text-stone-900'
                          }`}
                        >
                          {task.title}
                        </button>
                        <span className="text-xs text-stone-500">
                          {assignee ? assignee.name : 'Unassigned'}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        {task.status !== 'Done' && <StatusBadge status={task.status} />}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {editingTask !== undefined && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(undefined)} />
      )}
      {addCategory && (
        <TaskModal task={null} defaultCategory={addCategory} onClose={() => setAddCategory(null)} />
      )}
    </div>
  )
}
