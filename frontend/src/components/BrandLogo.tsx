'use client'

import { useState } from 'react'
import clsx from 'clsx'
import Image from 'next/image'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
}

const sizeClasses = {
  sm: 'h-12 w-12 rounded-2xl',
  md: 'h-16 w-16 rounded-[26px]',
  lg: 'h-28 w-28 rounded-[30px] sm:h-36 sm:w-36',
}

const sizeHints = {
  sm: '48px',
  md: '64px',
  lg: '(max-width: 640px) 112px, 144px',
}

const PRIMARY_LOGO_SRC = '/kaare-khair-logo.png'
const FALLBACK_LOGO_SRC = '/kaare-khair-logo.png'

export default function BrandLogo({
  size = 'md',
  className,
  priority = false,
}: BrandLogoProps) {
  const [src, setSrc] = useState(PRIMARY_LOGO_SRC)

  return (
    <div
      className={clsx(
        'relative overflow-hidden border border-black/10 bg-black shadow-card-glow',
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt="Kaare Khair o Barr logo"
        fill
        sizes={sizeHints[size]}
        className="object-cover object-center"
        priority={priority}
        onError={() => {
          if (src !== FALLBACK_LOGO_SRC) {
            setSrc(FALLBACK_LOGO_SRC)
          }
        }}
      />
    </div>
  )
}
