export const PEOPLE_SEED = [
  { name: 'Managing Partner 1', role: 'Managing Partner' },
  { name: 'Managing Partner 2', role: 'Managing Partner' },
  { name: 'Architect', role: 'Architect' },
  { name: 'Land & Materials Contractor', role: 'Land Filling & Building Materials Contractor' },
  { name: 'Construction Contractor', role: 'Construction Contractor' },
  { name: 'Senior Advisor', role: 'Senior Advisor' },
  { name: 'Graphic Designer', role: 'Graphic Designer' },
]

export const CATEGORIES = [
  {
    id: 'land-legal',
    label: 'Land & Legal / Approvals',
    suggestedRoles: ['Senior Advisor', 'Managing Partner'],
  },
  {
    id: 'construction-site',
    label: 'Construction & Site Development',
    suggestedRoles: ['Construction Contractor', 'Land Filling & Building Materials Contractor'],
  },
  {
    id: 'architecture-design',
    label: 'Architecture & Design',
    suggestedRoles: ['Architect'],
  },
  {
    id: 'marketing-branding',
    label: 'Marketing & Branding',
    suggestedRoles: ['Graphic Designer'],
  },
  {
    id: 'sales-prep',
    label: 'Sales Prep',
    suggestedRoles: ['Managing Partner', 'Senior Advisor'],
  },
  {
    id: 'partner-decisions',
    label: 'Partner Decisions',
    suggestedRoles: ['Managing Partner', 'Senior Advisor'],
  },
]

export const STATUSES = ['Not Started', 'In Progress', 'Blocked – Needs Decision', 'Done']

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
