import type { FullConfig } from '@playwright/test'
import { disposeApiClient } from '../utils/api-client'
import { cleanDatabaseCompletely } from './database'

async function globalTeardown(_config: FullConfig): Promise<void> {
	await cleanDatabaseCompletely()
	await disposeApiClient()
}

export default globalTeardown
