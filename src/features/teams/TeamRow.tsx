import clsx from 'clsx'
import { ChevronRight, Crown } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { POSITION_META } from '@/lib/format'
import type { TeamSummary } from '@/types/models'

/** One team in a list. Links to the roster when the viewer belongs to it. */
export function TeamRow({ team, href }: { team: TeamSummary; href?: string }) {
  const body = (
    <>
      <span
        className={clsx(
          'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold',
          team.myPosition ? 'bg-navy text-gold' : 'bg-callout text-navy'
        )}
        aria-hidden="true"
      >
        {team.name.charAt(0)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-navy">{team.name}</span>
          {team.myPosition && (
            <Badge tone={POSITION_META[team.myPosition].tone}>{POSITION_META[team.myPosition].label}</Badge>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
          {team.leadName ? (
            <>
              <Crown className="h-3.5 w-3.5 text-gold-dark" aria-hidden="true" />
              <span className="truncate">{team.leadName}</span>
            </>
          ) : (
            <span>No lead yet</span>
          )}
          <span aria-hidden="true">·</span>
          <span className="shrink-0">
            {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
          </span>
        </span>
      </span>
      {href && <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />}
    </>
  )

  const classes = 'flex min-h-[72px] items-center gap-3 px-4 py-3'
  return href ? (
    <Link href={href} className={clsx(classes, 'transition hover:bg-panel')}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  )
}
