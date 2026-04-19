import { Quote } from 'lucide-react'
import type { Testimonial } from '@/types/home'

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="surface-panel h-full p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-cream-100 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
          {testimonial.role}
        </span>
        <Quote className="h-5 w-5 text-forest-700" />
      </div>

      <p className="mt-5 font-display text-[1.65rem] font-semibold leading-tight text-ink-900 sm:text-2xl">
        {testimonial.highlight}
      </p>
      <p className="mt-4 text-sm leading-7 text-ink-600">{testimonial.content}</p>

      <div className="mt-6 soft-divider pt-4">
        <p className="text-sm font-semibold text-ink-900">{testimonial.name}</p>
      </div>
    </article>
  )
}
