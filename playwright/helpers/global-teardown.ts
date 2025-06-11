/* eslint-disable no-console */
import { FullConfig } from '@playwright/test'

import { cleanDatabase } from './database'

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('🧹 Running global teardown - cleaning database...')
  await cleanDatabase()
  console.log('✅ Global teardown complete')
}

export default globalTeardown
