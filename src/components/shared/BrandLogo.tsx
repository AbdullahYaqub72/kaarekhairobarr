import Image from 'next/image'
import { BRAND_NAME, LOGO_GOLD, LOGO_GOLD_SIZE } from '@/config/brand'

/**
 * The gold calligraphy mark. Only place it on navy (see CLAUDE.md > Brand).
 * The source is 240px wide, so keep `width` at 120 or below for sharp retina rendering.
 */
export function BrandLogo({ width = 96, priority = false }: { width?: number; priority?: boolean }) {
  const height = Math.round((width * LOGO_GOLD_SIZE.height) / LOGO_GOLD_SIZE.width)
  return (
    <Image
      src={LOGO_GOLD}
      alt={`${BRAND_NAME} logo`}
      width={width}
      height={height}
      priority={priority}
      className="h-auto select-none"
    />
  )
}
