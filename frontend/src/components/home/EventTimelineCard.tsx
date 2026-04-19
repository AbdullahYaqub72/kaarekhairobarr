import { CalendarDays, MapPin, Star } from 'lucide-react'
import type { EventItem } from '@/types/home'

interface EventTimelineCardProps {
  event: EventItem
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function EventTimelineCard({ event }: EventTimelineCardProps) {
  return (
    <article className="surface-panel p-5 sm:p-6 transition duration-300 hover:-translate-y-1">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-forest-50 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-forest-700">
          {event.category}
        </span>
        {event.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
            <Star className="h-3.5 w-3.5" />
            Featured
          </span>
        ) : null}
        <span className="rounded-full bg-cream-100 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-clay-700">
          {event.status}
        </span>
      </div>

      <h3 className="mt-5 font-display text-[2rem] font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
        {event.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-ink-600">{event.description}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-cream-50 px-4 py-3 text-sm text-ink-700">
          <p className="flex items-center gap-2 font-semibold text-ink-900">
            <CalendarDays className="h-4 w-4 text-forest-700" />
            {formatEventDate(event.eventDate)}
          </p>
        </div>
        <div className="rounded-2xl bg-forest-50 px-4 py-3 text-sm text-ink-700">
          <p className="flex items-center gap-2 font-semibold text-ink-900">
            <MapPin className="h-4 w-4 text-clay-700" />
            {event.location}
          </p>
        </div>
      </div>
    </article>
  )
}
