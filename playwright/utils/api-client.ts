import { type APIRequestContext, request } from '@playwright/test'

let apiClient: APIRequestContext | null = null
let apiClientPromise: Promise<APIRequestContext> | null = null

export async function getApiClient(): Promise<APIRequestContext> {
	if (apiClient) {
		return apiClient
	}

	if (!apiClientPromise) {
		apiClientPromise = request
			.newContext()
			.then((client) => {
				apiClient = client
				return client
			})
			.catch((error) => {
				apiClientPromise = null
				throw error
			})
	}

	return apiClientPromise
}

export async function disposeApiClient(): Promise<void> {
	const client =
		apiClient ??
		(apiClientPromise
			? await apiClientPromise.catch(() => {
					return null
				})
			: null)

	if (client) {
		await client.dispose()
	}

	apiClient = null
	apiClientPromise = null
}
