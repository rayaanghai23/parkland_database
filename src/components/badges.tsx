import type { Priority, Status } from '../types'

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-stone-100 text-stone-600',
  Medium: 'bg-sky-100 text-sky-700',
  High: 'bg-amber-100 text-amber-800',
  Critical: 'bg-rose-100 text-rose-700',
}

const statusStyles: Record<Status, string> = {
  'Not Started': 'bg-stone-100 text-stone-600',
  'In Progress': 'bg-sky-100 text-sky-700',
  'Blocked – Needs Decision': 'bg-rose-100 text-rose-700',
  Done: 'bg-emerald-100 text-emerald-700',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[priority]}`}>
      {priority}
    </span>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  )
}
