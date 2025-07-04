/* eslint-disable no-console */
import { FullConfig } from '@playwright/test'

import { cleanDatabase } from './database'

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('- global teardown started - cleaning database...')
  await cleanDatabase()
  console.log('- global teardown complete')
}

export default globalTeardown
