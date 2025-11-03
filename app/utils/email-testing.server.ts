import fs from 'node:fs'
import path from 'node:path'

const OUTBOX_DIR = path.join(process.cwd(), '.tmp')
const OUTBOX_PATH = path.join(OUTBOX_DIR, 'email-outbox.json')

const ensureOutboxDir = (): void => {
  if (!fs.existsSync(OUTBOX_DIR)) {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true })
  }
}

export type TestEmailOutboxEntry = {
  from: string
  to: string | string[]
  subject: string
  html: string
  id: string
  timestamp: string
}

export const getTestEmailOutbox = (): TestEmailOutboxEntry[] => {
  ensureOutboxDir()
  if (!fs.existsSync(OUTBOX_PATH)) {
    return []
  }
  try {
    const content = fs.readFileSync(OUTBOX_PATH, 'utf-8')
    return JSON.parse(content) as TestEmailOutboxEntry[]
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to read email outbox:', error)
    return []
  }
}

export const clearTestEmailOutbox = (): void => {
  ensureOutboxDir()
  if (fs.existsSync(OUTBOX_PATH)) {
    fs.unlinkSync(OUTBOX_PATH)
  }
}
