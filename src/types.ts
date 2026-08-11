export interface Person {
  id: string
  name: string
  role: string
}

export interface Category {
  id: string
  label: string
  suggestedRoles: string[]
}

export type Status = 'Not Started' | 'In Progress' | 'Blocked – Needs Decision' | 'Done'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Task {
  id: string
  title: string
  description: string
  category: string
  assigneeId: string | null
  status: Status
  priority: Priority
  dueDate: string | null
  blockerNote: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  targetLaunchDate: string | null
}

export interface Meta {
  categories: Category[]
  statuses: Status[]
  priorities: Priority[]
}
