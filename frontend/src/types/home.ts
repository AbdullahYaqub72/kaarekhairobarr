export interface StatCard {
  label: string
  value: string
  detail: string
}

export interface Principle {
  title: string
  description: string
  tag: string
}

export interface SiteContent {
  badge: string
  heroTitle: string
  heroSubtitle: string
  mission: string
  vision: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  donationProvider: string
  donationAccountNumber: string
  instagramUrl: string
  statCards: StatCard[]
  principles: Principle[]
}

export interface Campaign {
  id: string
  title: string
  shortDescription: string
  category: string
  targetAmount: number
  raisedAmount: number
  beneficiariesLabel: string
  featured: boolean
  accent: 'forest' | 'cream' | 'clay'
}

export interface CampaignInput {
  title: string
  shortDescription: string
  category: string
  targetAmount: number
  raisedAmount: number
  beneficiariesLabel: string
  featured: boolean
  accent: Campaign['accent']
}

export interface EventItem {
  id: string
  title: string
  description: string
  eventDate: string
  location: string
  category: string
  status: string
  featured: boolean
}

export interface EventItemInput {
  title: string
  description: string
  eventDate: string
  location: string
  category: string
  status: string
  featured: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  highlight: string
  featured: boolean
}

export interface TestimonialInput {
  name: string
  role: string
  content: string
  highlight: string
  featured: boolean
}

export interface HomeContent {
  site: SiteContent
  campaigns: Campaign[]
  events: EventItem[]
  testimonials: Testimonial[]
  source: 'firebase' | 'fallback'
}

export interface SupportFormInput {
  fullName: string
  email: string
  phone: string
  interest: string
  message: string
}
