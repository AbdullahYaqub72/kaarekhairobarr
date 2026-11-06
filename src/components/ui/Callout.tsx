import clsx from 'clsx'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

type CalloutTone = 'info' | 'success' | 'warning' | 'danger'

const styles: Record<CalloutTone, { box: string; icon: React.ElementType; iconClass: string }> = {
  info: { box: 'bg-callout border-l-navy-light', icon: Info, iconClass: 'text-navy-light' },
  success: { box: 'bg-success-bg border-l-success', icon: CheckCircle2, iconClass: 'text-success' },
  warning: { box: 'bg-warning-bg border-l-gold', icon: AlertTriangle, iconClass: 'text-warning' },
  danger: { box: 'bg-danger-bg border-l-danger', icon: XCircle, iconClass: 'text-danger' },
}

export function Callout({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: CalloutTone
  title?: string
  children?: React.ReactNode
  className?: string
}) {
  const { box, icon: Icon, iconClass } = styles[tone]
  return (
    <div
      className={clsx('flex gap-3 rounded-r-control border-l-[3px] px-4 py-3 text-[15px] text-ink-soft', box, className)}
      role={tone === 'danger' ? 'alert' : undefined}
    >
      <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-bold text-navy">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  )
}
