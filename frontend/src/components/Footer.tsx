'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { BRAND_LOCATION } from '@/lib/brand'
import { FALLBACK_SITE_CONTENT, getSiteContent } from '@/lib/home-content'

const footerLinks = [
  { href: '/#campaigns', label: 'Campaigns' },
  { href: '/statistics', label: 'Statistics' },
  { href: '/#events', label: 'Events' },
  { href: '/#stories', label: 'Stories' },
  { href: '/#support', label: 'Support' },
]

export default function Footer() {
  const [site, setSite] = useState(FALLBACK_SITE_CONTENT)

  useEffect(() => {
    let isActive = true

    const loadSiteContent = async () => {
      const nextSite = await getSiteContent()

      if (isActive) {
        setSite(nextSite)
      }
    }

    loadSiteContent()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <footer className="mt-20 border-t border-white/50 bg-ink-900 text-cream-50">
      <div className="container-custom py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BrandLogo size="sm" className="border border-white/10" />
              <div>
                <h3 className="font-display text-2xl font-semibold">Kaare Khair o Barr</h3>
                <p className="text-xs uppercase tracking-[0.22em] text-cream-100/60">
                  {BRAND_LOCATION}
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-cream-100/70">
              A Lahore-based welfare effort rooted in UET Lahore, connecting students, alumni, and
              community supporters to dignified relief, medical help, and volunteer action.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream-100/70">
              Explore
            </h4>
            <ul className="space-y-3 text-sm text-cream-100/70">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cream-100/70">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-cream-100/70">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-cream-200" />
                <span>{site.contactEmail}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-cream-200" />
                <span>{site.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-cream-200" />
                <span>{site.contactAddress}</span>
              </li>
              <li>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream-100/55">
                  Donation Account
                </p>
                <p className="mt-1 text-cream-100/80">
                  {site.donationProvider}: {site.donationAccountNumber}
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-cream-200" />
                <Link
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  @kaare_khair_o_barr
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-cream-100/55">
          <p>&copy; {new Date().getFullYear()} Kaare Khair o Barr. Designed to keep support visible, local, and easy to act on.</p>
        </div>
      </div>
    </footer>
  )
}
