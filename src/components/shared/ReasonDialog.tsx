'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { TextAreaField } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'

/** A confirm dialog that asks for a written reason or note. */
export function ReasonDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  label = 'Reason',
  placeholder,
  confirmLabel,
  tone = 'primary',
  required = true,
  busy = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title: string
  description?: string
  label?: string
  placeholder?: string
  confirmLabel: string
  tone?: 'primary' | 'danger'
  required?: boolean
  busy?: boolean
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (open) {
      setReason('')
      setError(undefined)
    }
  }, [open])

  const submit = () => {
    const trimmed = reason.trim()
    if (required && trimmed.length < 3) {
      setError('Please write a short reason.')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={submit}
            loading={busy}
            block
            className="sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <TextAreaField
        label={label}
        optional={!required}
        placeholder={placeholder}
        value={reason}
        maxLength={500}
        error={error}
        onChange={(event) => {
          setReason(event.target.value)
          setError(undefined)
        }}
      />
    </Modal>
  )
}
