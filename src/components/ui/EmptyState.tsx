import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-navy-100 bg-panel px-6 py-10 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="font-bold text-navy">{title}</p>
      {children && <p className="mt-1 max-w-sm text-[15px] text-muted">{children}</p>}
      {action && <div className="mt-5 w-full max-w-xs">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-card border border-danger/20 bg-danger-bg px-5 py-6 text-center" role="alert">
      <p className="font-bold text-danger">Couldn&apos;t load this</p>
      <p className="mt-1 text-[15px] text-ink-soft">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-[44px] rounded-control px-4 font-bold text-navy-light underline-offset-4 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  )
}
