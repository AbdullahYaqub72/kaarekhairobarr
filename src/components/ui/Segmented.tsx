'use client'

import clsx from 'clsx'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  count?: number
}

/** Tabs that scroll sideways on narrow screens instead of squeezing. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-bold transition',
              selected ? 'bg-navy text-white' : 'bg-surface text-navy shadow-card hover:bg-navy-50'
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={clsx(
                  'min-w-[22px] rounded-full px-1.5 text-center text-xs leading-[22px]',
                  selected ? 'bg-gold text-navy-deep' : 'bg-callout text-navy'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
