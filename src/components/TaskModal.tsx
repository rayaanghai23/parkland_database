import { useEffect, useState } from 'react'
import { useStore } from '../store'
import type { Priority, Status, Task } from '../types'

interface Props {
  task: Task | null
  defaultCategory?: string
  onClose: () => void
}

export function TaskModal({ task, defaultCategory, onClose }: Props) {
  const { meta, people, workloadByPerson, addTask, editTask, removeTask } = useStore()
  const categories = meta?.categories ?? []
  const statuses = (meta?.statuses ?? []) as Status[]
  const priorities = (meta?.priorities ?? []) as Priority[]

  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [category, setCategory] = useState(task?.category ?? defaultCategory ?? categories[0]?.id ?? '')
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId ?? '')
  const [assigneeTouched, setAssigneeTouched] = useState(Boolean(task?.assigneeId))
  const [status, setStatus] = useState<Status>(task?.status ?? statuses[0] ?? 'Not Started')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [blockerNote, setBlockerNote] = useState(task?.blockerNote ?? '')
  const [saving, setSaving] = useState(false)

  const activeCategory = categories.find((c) => c.id === category)

  // Auto-suggest an assignee from the category's suggested roles, unless the
  // user has already picked one themselves.
  useEffect(() => {
    if (assigneeTouched || !activeCategory) return
    const suggested = people.find((p) => activeCategory.suggestedRoles.includes(p.role))
    if (suggested) setAssigneeId(suggested.id)
  }, [activeCategory, assigneeTouched, people])

  const sortedPeople = [...people].sort((a, b) => {
    const aSuggested = activeCategory?.suggestedRoles.includes(a.role) ? 0 : 1
    const bSuggested = activeCategory?.suggestedRoles.includes(b.role) ? 0 : 1
    return aSuggested - bSuggested
  })

  async function handleSave() {
    setSaving(true)
    const payload = {
      title,
      description,
      category,
      assigneeId: assigneeId || null,
      status,
      priority,
      dueDate: dueDate || null,
      blockerNote,
    }
    try {
      if (task) {
        await editTask(task.id, payload)
      } else {
        await addTask(payload)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    setSaving(true)
    try {
      await removeTask(task.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-stone-900">{task ? 'Edit task' : 'New task'}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              placeholder="e.g. Finalize layout approval with DTCP"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value)
                  setAssigneeTouched(true)
                }}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {sortedPeople.map((p) => {
                  const suggested = activeCategory?.suggestedRoles.includes(p.role)
                  const openCount = workloadByPerson[p.id] || 0
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.role} ({openCount} open){suggested ? ' — suggested' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">Due date</label>
              <input
                type="date"
                value={dueDate ?? ''}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {status === 'Blocked – Needs Decision' && (
            <div>
              <label className="text-sm font-medium text-stone-700">
                What decision is needed from the partners?
              </label>
              <textarea
                value={blockerNote}
                onChange={(e) => setBlockerNote(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none"
                placeholder="e.g. Need sign-off on final plot pricing before we can print brochures"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {task && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="text-sm font-medium text-rose-600 hover:text-rose-800"
              >
                Delete task
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-md px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {task ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
