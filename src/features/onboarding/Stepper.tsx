import clsx from 'clsx'
import { Check } from 'lucide-react'

/** Compact progress indicator for multi-step flows, shown on navy. */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mt-5 flex w-full max-w-xs items-center justify-center" aria-label="Progress">
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={active ? 'step' : undefined}
                className={clsx(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition',
                  done && 'bg-gold text-navy-deep',
                  active && 'bg-white text-navy-deep ring-2 ring-gold ring-offset-2 ring-offset-navy',
                  !done && !active && 'bg-white/10 text-onnavy'
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              <span className={clsx('text-xs font-bold', active || done ? 'text-white' : 'text-onnavy/70')}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={clsx('mx-2 mb-5 h-0.5 flex-1 rounded-full', done ? 'bg-gold' : 'bg-white/15')}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
