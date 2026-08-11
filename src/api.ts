import type { Meta, Person, Settings, Task } from './types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  getMeta: () => request<Meta>('/meta'),

  getSettings: () => request<Settings>('/settings'),
  updateSettings: (data: Partial<Settings>) =>
    request<Settings>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  getPeople: () => request<Person[]>('/people'),
  updatePerson: (id: string, data: Partial<Person>) =>
    request<Person>(`/people/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getTasks: () => request<Task[]>('/tasks'),
  createTask: (data: Partial<Task>) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
