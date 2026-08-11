import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { StatCard } from '../components/StatCard'
import { PriorityBadge } from '../components/badges'

export default function Dashboard() {
  const { tasks, people, settings, editSettings, workloadByPerson, meta } = useStore()
  const [editingDate, setEditingDate] = useState(false)
  const [dateDraft, setDateDraft] = useState(settings?.targetLaunchDate ?? '')

  const categories = meta?.categories ?? []
  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'Done').length
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length
    const blocked = tasks.filter((t) => t.status === 'Blocked – Needs Decision')
    return { total, done, inProgress, blocked }
  }, [tasks])

  const daysToLaunch = useMemo(() => {
    if (!settings?.targetLaunchDate) return null
    const target = new Date(settings.targetLaunchDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((target.getTime() - today.getTime()) / 86400000)
  }, [settings])

  async function saveLaunchDate() {
    await editSettings({ targetLaunchDate: dateDraft || null })
    setEditingDate(false)
  }

  const maxWorkload = Math.max(1, ...people.map((p) => workloadByPerson[p.id] || 0))
  const sortedPeople = [...people].sort(
    (a, b) => (workloadByPerson[b.id] || 0) - (workloadByPerson[a.id] || 0),
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Launch target</p>
          {editingDate ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="date"
                value={dateDraft ?? ''}
                onChange={(e) => setDateDraft(e.target.value)}
                className="rounded-md border border-stone-300 px-2 py-1 text-sm"
              />
              <button
                onClick={saveLaunchDate}
                className="rounded-md bg-emerald-700 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-800"
              >
                Save
              </button>
              <button
                onClick={() => setEditingDate(false)}
                className="text-sm text-stone-500 hover:text-stone-700"
              >
                Cancel
              </button>
            </div>
          ) : settings?.targetLaunchDate ? (
            <div className="mt-1 flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-emerald-900">
                {daysToLaunch !== null && daysToLaunch >= 0
                  ? `${daysToLaunch} day${daysToLaunch === 1 ? '' : 's'} to go`
                  : 'Launch date passed'}
              </p>
              <p className="text-sm text-emerald-700">
                {new Date(settings.targetLaunchDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <button
                onClick={() => setEditingDate(true)}
                className="text-sm font-medium text-emerald-700 underline hover:text-emerald-900"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingDate(true)}
              className="mt-1 text-sm font-medium text-emerald-700 underline hover:text-emerald-900"
            >
              Set a target launch date
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total tasks" value={stats.total} />
        <StatCard label="In progress" value={stats.inProgress} accent="text-sky-700" />
        <StatCard label="Needs decision" value={stats.blocked.length} accent="text-rose-700" />
        <StatCard label="Done" value={stats.done} accent="text-emerald-700" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Needs a partner decision</h3>
            <Link to="/board" className="text-xs font-medium text-emerald-700 hover:underline">
              View board →
            </Link>
          </div>
          {stats.blocked.length === 0 ? (
            <p className="mt-4 text-sm text-stone-400">Nothing is blocked right now.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.blocked.map((t) => {
                const assignee = people.find((p) => p.id === t.assigneeId)
                return (
                  <li key={t.id} className="rounded-md bg-rose-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-stone-900">{t.title}</p>
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {categoryLabel(t.category)} · {assignee ? assignee.name : 'Unassigned'}
                    </p>
                    {t.blockerNote && (
                      <p className="mt-1 text-xs text-rose-700">{t.blockerNote}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Team workload</h3>
            <Link to="/team" className="text-xs font-medium text-emerald-700 hover:underline">
              View team →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {sortedPeople.map((p) => {
              const count = workloadByPerson[p.id] || 0
              return (
                <li key={p.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-700">{p.name}</span>
                    <span className="text-stone-500">{count} open</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-stone-100">
                    <div
                      className="h-2 rounded-full bg-emerald-600"
                      style={{ width: `${(count / maxWorkload) * 100}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
