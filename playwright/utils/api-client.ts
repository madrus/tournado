import { APIRequestContext, request } from '@playwright/test'

let apiClient: APIRequestContext | null = null

export async function getApiClient(): Promise<APIRequestContext> {
  if (!apiClient) {
    apiClient = await request.newContext()
  }
  return apiClient
}

export async function disposeApiClient(): Promise<void> {
  if (apiClient) {
    await apiClient.dispose()
    apiClient = null
  }
}
