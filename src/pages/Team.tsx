import { useState } from 'react'
import { useStore } from '../store'
import type { Person } from '../types'

function PersonRow({ person, openCount }: { person: Person; openCount: number }) {
  const { editPerson } = useStore()
  const [name, setName] = useState(person.name)
  const [role, setRole] = useState(person.role)

  function saveName() {
    if (name.trim() && name !== person.name) editPerson(person.id, { name: name.trim() })
  }

  function saveRole() {
    if (role.trim() && role !== person.role) editPerson(person.id, { role: role.trim() })
  }

  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-2 pl-6 pr-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          className="w-full rounded-md border border-transparent px-2 py-1 text-sm font-medium text-stone-900 hover:border-stone-200 focus:border-emerald-600 focus:outline-none"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onBlur={saveRole}
          className="w-full rounded-md border border-transparent px-2 py-1 text-sm text-stone-600 hover:border-stone-200 focus:border-emerald-600 focus:outline-none"
        />
      </td>
      <td className="py-2 pr-6 text-right">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            openCount >= 4
              ? 'bg-rose-100 text-rose-700'
              : openCount >= 2
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
          }`}
        >
          {openCount} open task{openCount === 1 ? '' : 's'}
        </span>
      </td>
    </tr>
  )
}

export default function Team() {
  const { people, workloadByPerson } = useStore()

  return (
    <div>
      <h2 className="text-xl font-semibold text-stone-900">Team</h2>
      <p className="mt-1 text-sm text-stone-500">
        Click a name or role to rename it. Open task counts update live as work is assigned on
        the board.
      </p>

      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs font-medium uppercase tracking-wide text-stone-500">
              <th className="px-6 py-3">Name</th>
              <th className="px-2 py-3">Role</th>
              <th className="px-6 py-3 text-right">Workload</th>
            </tr>
          </thead>
          <tbody className="px-6">
            {people.map((p) => (
              <PersonRow key={p.id} person={p} openCount={workloadByPerson[p.id] || 0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
