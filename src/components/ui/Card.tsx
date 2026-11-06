import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
}

export function Card({ padded = true, as = 'div', className, ...props }: CardProps) {
  // All allowed tags take the same attributes we pass, so treat them as a div for typing.
  const Tag = as as 'div'
  return (
    <Tag
      className={clsx('rounded-card bg-surface shadow-card', padded && 'p-5', className)}
      {...props}
    />
  )
}

/** Uppercase eyebrow + title used at the top of cards and sections. */
export function SectionTitle({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx('mb-3 flex items-end justify-between gap-3', className)}>
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-dark">{eyebrow}</p>
        )}
        <h2 className="text-lg text-navy">{title}</h2>
      </div>
      {action}
    </div>
  )
}

/** Label-above-value list, the mobile version of the email's detail table. */
export function DetailList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-line rounded-control border border-line bg-panel">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3 sm:grid sm:grid-cols-[160px_1fr] sm:gap-4">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-navy">{item.label}</dt>
          <dd className="mt-0.5 break-words text-[15px] text-ink sm:mt-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
