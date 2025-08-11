/* eslint-disable no-console */
import { FullConfig } from '@playwright/test'

import { cleanDatabaseCompletely } from './database'

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('- global teardown started - cleaning database...')
  await cleanDatabaseCompletely()
  console.log('- global teardown complete')
}

export default globalTeardown
