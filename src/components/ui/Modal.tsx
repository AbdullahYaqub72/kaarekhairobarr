'use client'

import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  /** Buttons row at the bottom. */
  footer?: React.ReactNode
}

/** Bottom sheet on phones, centred dialog from `sm:` up. */
export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  // Portals need document.body, which only exists after mounting in the browser.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open || !mounted) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    // Focus the first field, or the panel itself.
    const first = panelRef.current?.querySelector<HTMLElement>(
      'input, textarea, select, button:not([data-close])'
    )
    ;(first ?? panelRef.current)?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, mounted])

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-navy-deep/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          'relative flex max-h-[92vh] w-full animate-slide-up flex-col bg-surface shadow-raised outline-none',
          'rounded-t-[20px] sm:max-w-lg sm:rounded-card'
        )}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4">
          <div>
            <h2 id={titleId} className="text-lg text-navy">
              {title}
            </h2>
            {description && <p className="mt-1 text-[15px] text-muted">{description}</p>}
          </div>
          <button
            type="button"
            data-close
            onClick={onClose}
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-callout"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4">{children}</div>
        {footer && (
          <div className="pb-safe border-t border-line px-5 pt-4 sm:pb-4">
            <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end sm:pb-0">{footer}</div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
