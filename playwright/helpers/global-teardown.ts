/* eslint-disable no-console */
import { FullConfig } from '@playwright/test'

import { disposeApiClient } from '../utils/api-client'
import { cleanDatabaseCompletely } from './database'

async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('- global teardown started - cleaning database...')
  await cleanDatabaseCompletely()
  await disposeApiClient()
  console.log('- global teardown complete')
}

export default globalTeardown
