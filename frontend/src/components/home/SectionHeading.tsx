import clsx from 'clsx'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        'space-y-4',
        align === 'center' && 'mx-auto max-w-3xl text-center'
      )}
    >
      <span className="eyebrow">{eyebrow}</span>
      <div className="space-y-3">
        <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">{description}</p>
      </div>
    </div>
  )
}
