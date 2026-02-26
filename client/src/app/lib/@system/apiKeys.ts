// @system — API key management client
import { api } from './api'

export interface ApiKey {
  id: number
  user_id: number
  name: string
  key_prefix: string
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

interface CreateApiKeyResult {
  apiKey: ApiKey
  /** Raw key — only available immediately after creation */
  rawKey: string
}

export const apiKeysApi = {
  async list(): Promise<ApiKey[]> {
    const data = await api.get<{ apiKeys: ApiKey[] }>('/api-keys')
    return data.apiKeys
  },

  async create(params: { name: string; expiresAt?: string }): Promise<CreateApiKeyResult> {
    const data = await api.post<{ apiKey: ApiKey & { key: string } }>('/api-keys', params)
    const { key: rawKey, ...apiKey } = data.apiKey
    return { apiKey, rawKey }
  },

  async revoke(id: number): Promise<void> {
    await api.delete(`/api-keys/${id}`)
  },
}
