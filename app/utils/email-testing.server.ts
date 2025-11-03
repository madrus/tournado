import fs from 'node:fs'
import path from 'node:path'

import { z } from 'zod'

import { i18n } from '~/i18n/config'

export const OUTBOX_DIR = path.join(process.cwd(), '.tmp')
export const OUTBOX_PATH = path.join(OUTBOX_DIR, 'email-outbox.json')

export const ensureOutboxDir = (): void => {
  if (!fs.existsSync(OUTBOX_DIR)) {
    fs.mkdirSync(OUTBOX_DIR, { recursive: true })
  }
}

export const ensureOutboxDirAsync = async (): Promise<void> => {
  await fs.promises.mkdir(OUTBOX_DIR, { recursive: true })
}

export type TestEmailOutboxEntry = {
  from: string
  to: string | string[]
  subject: string
  html: string
  id: string
  timestamp: string
}

const testEmailOutboxEntrySchema = z.object({
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  html: z.string(),
  id: z.string(),
  timestamp: z.string(),
})

const testEmailOutboxSchema = z.array(testEmailOutboxEntrySchema)

export const getTestEmailOutbox = (): TestEmailOutboxEntry[] => {
  ensureOutboxDir()
  if (!fs.existsSync(OUTBOX_PATH)) {
    return []
  }
  try {
    const content = fs.readFileSync(OUTBOX_PATH, 'utf-8')
    const parsed = JSON.parse(content)
    const validationResult = testEmailOutboxSchema.safeParse(parsed)

    if (!validationResult.success) {
      // eslint-disable-next-line no-console
      console.error(
        `${i18n.t('errors.emailOutboxInvalidFormat')}:`,
        validationResult.error
      )
      return []
    }

    return validationResult.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`${i18n.t('errors.emailOutboxReadFailure')}:`, error)
    return []
  }
}

export const clearTestEmailOutbox = (): void => {
  ensureOutboxDir()
  if (fs.existsSync(OUTBOX_PATH)) {
    fs.unlinkSync(OUTBOX_PATH)
  }
}
