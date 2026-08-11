import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'
import { pool, initDb } from './db.js'
import { CATEGORIES, STATUSES, PRIORITIES } from './constants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const indexHtmlExists = fs.existsSync(path.join(distDir, 'index.html'))
console.log(`Looking for built frontend at ${distDir} — index.html found: ${indexHtmlExists}`)

await initDb()

const app = express()
app.use(cors())
app.use(express.json())

function taskRowToJson(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    assigneeId: row.assignee_id,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    blockerNote: row.blocker_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ---- meta ----
app.get('/api/meta', (req, res) => {
  res.json({ categories: CATEGORIES, statuses: STATUSES, priorities: PRIORITIES })
})

// ---- settings ----
app.get('/api/settings', async (req, res) => {
  const { rows } = await pool.query('SELECT target_launch_date FROM settings WHERE id = 1')
  res.json({ targetLaunchDate: rows[0]?.target_launch_date ?? null })
})

app.patch('/api/settings', async (req, res) => {
  const { rows } = await pool.query(
    `UPDATE settings SET target_launch_date = $1 WHERE id = 1 RETURNING target_launch_date`,
    [req.body.targetLaunchDate ?? null],
  )
  res.json({ targetLaunchDate: rows[0].target_launch_date })
})

// ---- people ----
app.get('/api/people', async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, role FROM people ORDER BY name')
  res.json(rows)
})

app.patch('/api/people/:id', async (req, res) => {
  const { name, role } = req.body
  const { rows } = await pool.query(
    `UPDATE people SET
       name = COALESCE($1, name),
       role = COALESCE($2, role)
     WHERE id = $3
     RETURNING id, name, role`,
    [typeof name === 'string' ? name : null, typeof role === 'string' ? role : null, req.params.id],
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Person not found' })
  res.json(rows[0])
})

// ---- tasks ----
app.get('/api/tasks', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at')
  res.json(rows.map(taskRowToJson))
})

app.post('/api/tasks', async (req, res) => {
  const now = new Date().toISOString()
  const task = {
    id: nanoid(8),
    title: req.body.title?.trim() || 'Untitled task',
    description: req.body.description || '',
    category: req.body.category || CATEGORIES[0].id,
    assigneeId: req.body.assigneeId || null,
    status: req.body.status || STATUSES[0],
    priority: req.body.priority || PRIORITIES[1],
    dueDate: req.body.dueDate || null,
    blockerNote: req.body.blockerNote || '',
    createdAt: now,
    updatedAt: now,
  }
  const { rows } = await pool.query(
    `INSERT INTO tasks (id, title, description, category, assignee_id, status, priority, due_date, blocker_note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      task.id,
      task.title,
      task.description,
      task.category,
      task.assigneeId,
      task.status,
      task.priority,
      task.dueDate,
      task.blockerNote,
      task.createdAt,
      task.updatedAt,
    ],
  )
  res.status(201).json(taskRowToJson(rows[0]))
})

const TASK_FIELD_TO_COLUMN = {
  title: 'title',
  description: 'description',
  category: 'category',
  assigneeId: 'assignee_id',
  status: 'status',
  priority: 'priority',
  dueDate: 'due_date',
  blockerNote: 'blocker_note',
}

app.patch('/api/tasks/:id', async (req, res) => {
  const sets = []
  const values = []
  for (const [field, column] of Object.entries(TASK_FIELD_TO_COLUMN)) {
    if (field in req.body) {
      values.push(req.body[field])
      sets.push(`${column} = $${values.length}`)
    }
  }
  if (sets.length === 0) {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' })
    return res.json(taskRowToJson(rows[0]))
  }
  values.push(new Date().toISOString())
  sets.push(`updated_at = $${values.length}`)
  values.push(req.params.id)

  const { rows } = await pool.query(
    `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Task not found' })
  res.json(taskRowToJson(rows[0]))
})

app.delete('/api/tasks/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id])
  if (rowCount === 0) return res.status(404).json({ error: 'Task not found' })
  res.status(204).end()
})

// ---- serve built frontend (production) ----
app.use(express.static(distDir))
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) res.status(404).send('Not built yet — run `npm run build`.')
  })
})

const PORT = process.env.API_PORT || process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Prana Farms API running on http://localhost:${PORT}`)
})
