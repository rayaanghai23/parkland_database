import 'dotenv/config'
import pg from 'pg'
import { nanoid } from 'nanoid'
import { PEOPLE_SEED } from './constants.js'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it to server/.env (see .env.example) or your host\'s environment variables.',
  )
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS people (
      id text PRIMARY KEY,
      name text NOT NULL,
      role text NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id text PRIMARY KEY,
      title text NOT NULL,
      description text NOT NULL DEFAULT '',
      category text NOT NULL,
      assignee_id text REFERENCES people(id) ON DELETE SET NULL,
      status text NOT NULL,
      priority text NOT NULL,
      due_date text,
      blocker_note text NOT NULL DEFAULT '',
      created_at text NOT NULL,
      updated_at text NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id int PRIMARY KEY DEFAULT 1,
      target_launch_date text,
      CONSTRAINT single_row CHECK (id = 1)
    )
  `)

  const { rows: peopleCount } = await pool.query('SELECT count(*)::int FROM people')
  if (peopleCount[0].count === 0) {
    for (const person of PEOPLE_SEED) {
      await pool.query('INSERT INTO people (id, name, role) VALUES ($1, $2, $3)', [
        nanoid(8),
        person.name,
        person.role,
      ])
    }
  }

  await pool.query(
    `INSERT INTO settings (id, target_launch_date) VALUES (1, NULL)
     ON CONFLICT (id) DO NOTHING`,
  )
}
