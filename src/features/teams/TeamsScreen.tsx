'use client'

import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, SectionTitle } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/AuthProvider'
import { useApi } from '@/hooks/useApi'
import type { TeamSummary } from '@/types/models'
import { TeamRow } from './TeamRow'

export function TeamsScreen() {
  const { isAdmin } = useAuth()
  const { data, error, loading, reload } = useApi<{ teams: TeamSummary[] }>('/api/teams')
  const mine = data?.teams.filter((team) => team.myPosition) ?? []
  const others = data?.teams.filter((team) => !team.myPosition) ?? []

  return (
    <>
      <PageHeader title="Teams" subtitle="KKB's work is split across these teams, each with a lead and co-lead." />
      <div className="space-y-6 px-4">
        {loading ? (
          <Card padded={false} className="space-y-3 p-4">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </Card>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <section>
              <SectionTitle eyebrow="Your teams" title={mine.length ? 'Teams you belong to' : 'Not in a team yet'} />
              {mine.length ? (
                <Card padded={false} className="divide-y divide-line overflow-hidden">
                  {mine.map((team) => (
                    <TeamRow key={team.id} team={team} href={`/teams/${team.id}`} />
                  ))}
                </Card>
              ) : (
                <EmptyState icon={Users} title="You'll be added by an admin">
                  Want to help a team below? Let an admin or that team&apos;s lead know.
                </EmptyState>
              )}
            </section>

            {others.length > 0 && (
              <section>
                <SectionTitle eyebrow="Other teams" title="Across KKB" />
                <Card padded={false} className="divide-y divide-line overflow-hidden">
                  {others.map((team) => (
                    // Admins can open any roster; members only their own teams.
                    <TeamRow key={team.id} team={team} href={isAdmin ? `/teams/${team.id}` : undefined} />
                  ))}
                </Card>
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
