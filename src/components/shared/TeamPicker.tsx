'use client'

import clsx from 'clsx'
import { Check } from 'lucide-react'

interface PickerTeam {
  id: string
  name: string
  description?: string
}

/** Multi-select of teams as large tappable rows (no tiny checkboxes). */
export function TeamPicker({
  teams,
  value,
  onChange,
  label,
  hint,
}: {
  teams: PickerTeam[]
  value: string[]
  onChange: (value: string[]) => void
  label: string
  hint?: string
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-bold text-navy">{label}</legend>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {teams.map((team) => {
          const selected = value.includes(team.id)
          return (
            <button
              key={team.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(team.id)}
              className={clsx(
                'flex min-h-[56px] items-start gap-3 rounded-control border-2 px-4 py-3 text-left transition',
                selected ? 'border-navy bg-navy-50' : 'border-line bg-surface hover:border-navy-100'
              )}
            >
              <span
                className={clsx(
                  'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
                  selected ? 'border-navy bg-navy text-white' : 'border-navy-100 bg-surface'
                )}
                aria-hidden="true"
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-navy">{team.name}</span>
                {team.description && (
                  <span className="mt-0.5 block text-sm leading-snug text-muted">{team.description}</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
