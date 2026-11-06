'use client'

import { Check, DoorOpen, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader } from '@/components/layout/AdminShell'
import { ReasonDialog } from '@/components/shared/ReasonDialog'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionTitle } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { LoadingBlock } from '@/components/ui/Spinner'
import { useApi } from '@/hooks/useApi'
import { api } from '@/lib/api/client'
import { errorMessage, formatDate, LEAVE_META, timeAgo } from '@/lib/format'
import type { LeaveRequest } from '@/types/models'

export function LeaveRequestsScreen() {
  const { data, error, loading, reload } = useApi<{ requests: LeaveRequest[] }>('/api/admin/leave-requests')
  const [dialog, setDialog] = useState<{ request: LeaveRequest; action: 'approve' | 'decline' } | null>(null)
  const [busy, setBusy] = useState(false)

  const requests = data?.requests ?? []
  const pending = requests.filter((r) => r.status === 'pending')
  const history = requests.filter((r) => r.status !== 'pending')

  const decide = async (note: string) => {
    if (!dialog) return
    setBusy(true)
    try {
      await api(`/api/admin/leave-requests/${dialog.request.id}`, { body: { action: dialog.action, note } })
      toast.success(dialog.action === 'approve' ? `${dialog.request.userName} is now alumni.` : 'Request declined.')
      setDialog(null)
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Leave requests"
        description="Approving makes the member alumni and frees any lead positions they held."
      />

      {loading ? (
        <LoadingBlock />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-8">
          <section>
            <SectionTitle eyebrow="Waiting" title={`${pending.length} pending`} />
            {pending.length === 0 ? (
              <EmptyState icon={DoorOpen} title="No one is asking to leave">
                Requests from members appear here.
              </EmptyState>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {pending.map((request) => (
                  <li key={request.id}>
                    <Card className="flex h-full flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={request.userName} />
                        <div className="min-w-0">
                          <Link
                            href={`/admin/members/${request.uid}`}
                            className="block truncate font-bold text-navy hover:underline"
                          >
                            {request.userName}
                          </Link>
                          <p className="text-sm text-muted">Asked {timeAgo(request.createdAt)}</p>
                        </div>
                      </div>
                      <p className="rounded-control bg-panel px-4 py-3 text-[15px] text-ink-soft">
                        {request.reason || <em className="text-muted">No reason given.</em>}
                      </p>
                      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                        <Button className="sm:flex-1" onClick={() => setDialog({ request, action: 'approve' })}>
                          <Check className="h-5 w-5" aria-hidden="true" /> Approve
                        </Button>
                        <Button
                          variant="secondary"
                          className="sm:flex-1"
                          onClick={() => setDialog({ request, action: 'decline' })}
                        >
                          <X className="h-5 w-5" aria-hidden="true" /> Decline
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {history.length > 0 && (
            <section>
              <SectionTitle eyebrow="History" title="Handled requests" />
              <Card padded={false} className="divide-y divide-line">
                {history.map((request) => (
                  <div key={request.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy">{request.userName}</p>
                      <p className="text-sm text-muted">
                        {formatDate(request.createdAt)}
                        {request.reviewedByName ? ` · by ${request.reviewedByName}` : ''}
                        {request.reviewNote ? ` · "${request.reviewNote}"` : ''}
                      </p>
                    </div>
                    <Badge tone={LEAVE_META[request.status].tone} className="self-start sm:self-center">
                      {LEAVE_META[request.status].label}
                    </Badge>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}

      {dialog && (
        <ReasonDialog
          open
          onClose={() => setDialog(null)}
          onConfirm={decide}
          busy={busy}
          required={dialog.action === 'decline'}
          tone={dialog.action === 'approve' ? 'primary' : 'danger'}
          title={dialog.action === 'approve' ? `Let ${dialog.request.userName} leave?` : 'Decline this request?'}
          description={
            dialog.action === 'approve'
              ? 'They become alumni, lose app access and are removed from all teams.'
              : 'They stay a member and can ask again later. Tell them why.'
          }
          label={dialog.action === 'approve' ? 'Note' : 'Reason'}
          placeholder={dialog.action === 'approve' ? 'e.g. Thanks for everything!' : 'e.g. Let’s talk first'}
          confirmLabel={dialog.action === 'approve' ? 'Approve' : 'Decline'}
        />
      )}
    </>
  )
}
