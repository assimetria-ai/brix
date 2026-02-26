// @custom — collaborators management client
import { api } from '../@system/api'

export type CollaboratorRole = 'admin' | 'member' | 'viewer'
export type CollaboratorStatus = 'pending' | 'active' | 'revoked'

export interface Collaborator {
  id: number
  email: string
  name: string | null
  role: CollaboratorRole
  status: CollaboratorStatus
  invited_by: number | null
  user_id: number | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

interface ListResult {
  collaborators: Collaborator[]
  total: number
}

interface InviteResult {
  collaborator: Collaborator
  invite_token: string
}

export const collaboratorsApi = {
  async list(params?: { status?: CollaboratorStatus; role?: CollaboratorRole }): Promise<ListResult> {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.role) qs.set('role', params.role)
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return api.get<ListResult>(`/collaborators${query}`)
  },

  async invite(params: { email: string; role?: CollaboratorRole; name?: string }): Promise<InviteResult> {
    return api.post<InviteResult>('/collaborators', params)
  },

  async updateRole(id: number, role: CollaboratorRole): Promise<{ collaborator: Collaborator }> {
    return api.patch<{ collaborator: Collaborator }>(`/collaborators/${id}/role`, { role })
  },

  async remove(id: number): Promise<{ collaborator: Collaborator }> {
    return api.delete<{ collaborator: Collaborator }>(`/collaborators/${id}`)
  },
}
