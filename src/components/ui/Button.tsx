import clsx from 'clsx'
import Link from 'next/link'
import { forwardRef } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'whatsapp'
type Size = 'md' | 'lg' | 'sm'

const variants: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-light active:bg-navy-deep',
  secondary: 'bg-surface text-navy ring-2 ring-inset ring-navy hover:bg-navy-50',
  ghost: 'bg-transparent text-navy-light hover:bg-navy-50',
  danger: 'bg-surface text-danger ring-2 ring-inset ring-danger/70 hover:bg-danger-bg',
  gold: 'bg-gold text-navy-deep hover:brightness-105 active:brightness-95',
  whatsapp: 'bg-whatsapp text-whatsapp-on hover:brightness-105',
}

// Every size keeps the 44px minimum touch target, except `sm` (used only
// inside dense admin tables on larger screens).
const sizes: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 text-sm',
  md: 'min-h-[48px] px-5 text-base',
  lg: 'min-h-[52px] px-6 text-base',
}

export interface ButtonStyleProps {
  variant?: Variant
  size?: Size
  /** Full width. Defaults to true on phones via `block`. */
  block?: boolean
}

export function buttonClasses({ variant = 'primary', size = 'md', block = false }: ButtonStyleProps) {
  return clsx(
    'inline-flex select-none items-center justify-center gap-2 rounded-control font-bold transition',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    block && 'w-full'
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, loading, disabled, children, className, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(buttonClasses({ variant, size, block }), className)}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
})

interface ButtonLinkProps extends ButtonStyleProps {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
}

export function ButtonLink({ href, children, className, external, ...style }: ButtonLinkProps) {
  const classes = clsx(buttonClasses(style), className)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
