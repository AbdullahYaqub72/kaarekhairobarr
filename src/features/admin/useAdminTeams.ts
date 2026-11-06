'use client'

import { useCallback } from 'react'
import { useApi } from '@/hooks/useApi'
import type { TeamSummary } from '@/types/models'

/** All teams (including archived) for admin screens, plus a name lookup. */
export function useAdminTeams() {
  const query = useApi<{ teams: TeamSummary[] }>('/api/admin/teams')
  const teams = query.data?.teams ?? []
  const nameOf = useCallback(
    (id: string) => query.data?.teams.find((team) => team.id === id)?.name ?? id,
    [query.data]
  )
  return { ...query, teams, activeTeams: teams.filter((team) => team.active), nameOf }
}
