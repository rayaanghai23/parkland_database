import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from './api'
import type { Meta, Person, Settings, Task } from './types'

interface Store {
  loading: boolean
  people: Person[]
  tasks: Task[]
  meta: Meta | null
  settings: Settings | null
  /** Count of open (non-Done) tasks per assignee id. */
  workloadByPerson: Record<string, number>
  addTask: (data: Partial<Task>) => Promise<void>
  editTask: (id: string, data: Partial<Task>) => Promise<void>
  removeTask: (id: string) => Promise<void>
  editPerson: (id: string, data: Partial<Person>) => Promise<void>
  editSettings: (data: Partial<Settings>) => Promise<void>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState<Person[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    Promise.all([api.getPeople(), api.getTasks(), api.getMeta(), api.getSettings()]).then(
      ([p, t, m, s]) => {
        setPeople(p)
        setTasks(t)
        setMeta(m)
        setSettings(s)
        setLoading(false)
      },
    )
  }, [])

  const addTask = useCallback(async (data: Partial<Task>) => {
    const task = await api.createTask(data)
    setTasks((prev) => [...prev, task])
  }, [])

  const editTask = useCallback(async (id: string, data: Partial<Task>) => {
    const task = await api.updateTask(id, data)
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)))
  }, [])

  const removeTask = useCallback(async (id: string) => {
    await api.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const editPerson = useCallback(async (id: string, data: Partial<Person>) => {
    const person = await api.updatePerson(id, data)
    setPeople((prev) => prev.map((p) => (p.id === id ? person : p)))
  }, [])

  const editSettings = useCallback(async (data: Partial<Settings>) => {
    const s = await api.updateSettings(data)
    setSettings(s)
  }, [])

  const workloadByPerson = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of tasks) {
      if (t.assigneeId && t.status !== 'Done') {
        map[t.assigneeId] = (map[t.assigneeId] || 0) + 1
      }
    }
    return map
  }, [tasks])

  const value: Store = {
    loading,
    people,
    tasks,
    meta,
    settings,
    workloadByPerson,
    addTask,
    editTask,
    removeTask,
    editPerson,
    editSettings,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
