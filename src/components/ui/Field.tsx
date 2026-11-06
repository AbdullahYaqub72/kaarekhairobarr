import clsx from 'clsx'
import { forwardRef, useId } from 'react'

// Inputs use 16px text so iOS Safari never zooms on focus.
const controlBase =
  'block w-full rounded-control border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/70 ' +
  'transition focus:border-navy-light focus:outline-none focus:ring-2 focus:ring-navy-light/20 ' +
  'disabled:bg-panel disabled:text-muted'

interface FieldShellProps {
  id: string
  label?: string
  hint?: string
  error?: string
  optional?: boolean
  children: React.ReactNode
}

function FieldShell({ id, label, hint, error, optional, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-bold text-navy">
          <span>{label}</span>
          {optional && <span className="text-xs font-normal text-muted">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
}

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, hint, error, optional, className, id, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={clsx(controlBase, 'min-h-[48px]', error && 'border-danger', className)}
        {...props}
      />
    </FieldShell>
  )
})

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextareaProps>(function TextAreaField(
  { label, hint, error, optional, className, id, rows = 3, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={clsx(controlBase, 'py-3', error && 'border-danger', className)}
        {...props}
      />
    </FieldShell>
  )
})

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
  { label, hint, error, className, id, children, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error}>
      <select
        ref={ref}
        id={fieldId}
        className={clsx(controlBase, 'min-h-[48px] appearance-none bg-[length:16px] pr-10', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f2a5e' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
})
