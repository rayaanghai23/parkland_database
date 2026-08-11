import type { Person, Task } from '../types'
import { PriorityBadge } from './badges'

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000)
  const label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  if (diffDays < 0) return { label: `${label} (overdue)`, overdue: true }
  if (diffDays === 0) return { label: `${label} (today)`, overdue: false }
  return { label, overdue: false }
}

export function TaskCard({
  task,
  assignee,
  categoryLabel,
  onClick,
}: {
  task: Task
  assignee: Person | undefined
  categoryLabel: string
  onClick: () => void
}) {
  const due = formatDueDate(task.dueDate)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-stone-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-stone-900">{task.title}</p>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="mt-1 text-xs text-stone-500">{categoryLabel}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
        <span className="truncate">{assignee ? assignee.name : 'Unassigned'}</span>
        {due && (
          <span className={due.overdue ? 'font-medium text-rose-600' : ''}>{due.label}</span>
        )}
      </div>
      {task.status === 'Blocked – Needs Decision' && task.blockerNote && (
        <p className="mt-2 line-clamp-2 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">
          {task.blockerNote}
        </p>
      )}
    </button>
  )
}
