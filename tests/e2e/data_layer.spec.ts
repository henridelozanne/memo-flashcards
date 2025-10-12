import { test, expect } from '@playwright/test'
import { exec } from 'child_process'
import { promisify } from 'util'

const execp = promisify(exec)

test('data layer persistence across reloads', async () => {
  const { stdout } = await execp('node scripts/e2e_db_flow.js', { cwd: process.cwd(), env: process.env })
  const out = JSON.parse(stdout.trim())
  expect(out.cardsCount).toBe(1)
  expect(out.cardsAfterDelete).toBe(0)
})
