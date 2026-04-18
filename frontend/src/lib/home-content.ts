import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import { BRAND_ADDRESS } from '@/lib/brand'
import {
  createFirestoreDocument,
  db,
  deleteFirestoreDocument,
  isFirebaseConfigured,
  updateFirestoreDocument,
} from '@/lib/firebase'
import type {
  Campaign,
  CampaignInput,
  EventItem,
  EventItemInput,
  HomeContent,
  Principle,
  SiteContent,
  StatCard,
  SupportFormInput,
  Testimonial,
  TestimonialInput,
} from '@/types/home'

const SUPPORT_NOTIFICATION_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || 'kaarekhairobarr@gmail.com'

const SUPPORT_NOTIFICATION_ENDPOINT =
  process.env.NEXT_PUBLIC_SUPPORT_FORMSUBMIT_ENDPOINT?.trim() ||
  `https://formsubmit.co/ajax/${SUPPORT_NOTIFICATION_EMAIL}`

const fallbackStatCards: StatCard[] = [
  {
    label: 'Families reached',
    value: '20+',
    detail: 'Families reached through monthly ration, emergency relief, and case-based welfare support.',
  },
  {
    label: 'Volunteer hours',
    value: '200+',
    detail: 'Volunteer hours contributed across field visits, packing drives, coordination, and outreach.',
  },
  {
    label: 'Meals & ration kits till now',
    value: '2M+',
    detail: 'Support mobilized for meals and ration kits through recurring campaigns and seasonal drives.',
  },
  {
    label: 'Medical cases backed',
    value: '8',
    detail: 'Medical cases backed through treatment support, medicine assistance, and urgent follow-up.',
  },
]

const fallbackPrinciples: Principle[] = [
  {
    tag: 'Fast Coordination',
    title: 'Urgent cases move without paperwork fatigue.',
    description:
      'Requests are triaged through local volunteers so medical and ration support can move quickly.',
  },
  {
    tag: 'Visible Need',
    title: 'Campaign goals stay clear and easy to understand.',
    description:
      'Supporters see the funding gap, beneficiary focus, and where the next contribution helps most.',
  },
  {
    tag: 'Community Trust',
    title: 'Relief stays rooted in neighborhoods, not distant dashboards.',
    description:
      'The team works through local referrals, on-ground visits, and familiar community partners.',
  },
]

const fallbackSite: SiteContent = {
  badge: 'Lahore-based NGO from UET Lahore',
  heroTitle: 'Relief that begins at UET Lahore and reaches families with dignity.',
  heroSubtitle:
    'Kaare Khair o Barr is a Lahore-based welfare initiative from UET Lahore, coordinating food, medical, volunteer, and emergency support with clarity, compassion, and local trust.',
  mission:
    'We turn the goodwill of students, alumni, and supporters at UET Lahore into structured, people-first relief for families facing financial and medical hardship.',
  vision:
    'A more compassionate Lahore where support feels close, transparent, and immediate when families need it most.',
  contactEmail: SUPPORT_NOTIFICATION_EMAIL,
  contactPhone: '03268838008',
  contactAddress: BRAND_ADDRESS,
  donationProvider: 'Easypaisa',
  donationAccountNumber: '03268838008',
  instagramUrl: 'https://www.instagram.com/kaare_khair_o_barr/',
  statCards: fallbackStatCards,
  principles: fallbackPrinciples,
}

const fallbackCampaigns: Campaign[] = [
  {
    id: 'family-iftar-support',
    title: 'Family Iftar Support Circle',
    shortDescription:
      'Fund weekly meal and ration support for households balancing school, rent, and fasting season costs.',
    category: 'Ramadan Relief',
    targetAmount: 450000,
    raisedAmount: 318000,
    beneficiariesLabel: '420 meal kits committed',
    featured: true,
    accent: 'cream',
  },
  {
    id: 'dialysis-access-fund',
    title: 'Dialysis Access Fund',
    shortDescription:
      'Help cover recurring treatment sessions and transport for patients who cannot afford consistent care.',
    category: 'Medical Support',
    targetAmount: 600000,
    raisedAmount: 274000,
    beneficiariesLabel: '38 patients in active follow-up',
    featured: true,
    accent: 'forest',
  },
  {
    id: 'school-ration-kits',
    title: 'School & Ration Starter Kits',
    shortDescription:
      'Pair nutrition support with notebooks, uniforms, and essentials for families trying to keep children in school.',
    category: 'Education & Welfare',
    targetAmount: 320000,
    raisedAmount: 198000,
    beneficiariesLabel: '160 children supported',
    featured: true,
    accent: 'clay',
  },
]

const fallbackEvents: EventItem[] = [
  {
    id: 'north-karachi-relief-desk',
    title: 'North Karachi Relief Desk',
    description:
      'An on-ground intake session for ration referrals, volunteer coordination, and family case reviews.',
    eventDate: '2026-04-24T17:30:00+05:00',
    location: 'UET Lahore Community Desk',
    category: 'Campus Outreach',
    status: 'upcoming',
    featured: true,
  },
  {
    id: 'medical-support-day',
    title: 'Medical Support Day',
    description:
      'A focused follow-up day for dialysis assistance, prescription support, and transport coordination.',
    eventDate: '2026-04-28T11:00:00+05:00',
    location: 'Lahore Medical Support Camp',
    category: 'Medical Camp',
    status: 'upcoming',
    featured: true,
  },
  {
    id: 'volunteer-field-briefing',
    title: 'Volunteer Field Briefing',
    description:
      'Orientation for packing-day logistics, family verification standards, and respectful beneficiary outreach.',
    eventDate: '2026-05-02T15:00:00+05:00',
    location: 'UET Lahore Campus',
    category: 'Volunteer Meetup',
    status: 'upcoming',
    featured: false,
  },
]

const fallbackTestimonials: Testimonial[] = [
  {
    id: 'bilal-hassan',
    name: 'Bilal Hassan',
    role: 'Beneficiary Family Representative',
    content:
      'The team did not just hand over support. They checked in, understood the pressure we were under, and helped us feel seen.',
    highlight: 'Support felt personal, not transactional.',
    featured: true,
  },
  {
    id: 'dr-muhammad-ali',
    name: 'Dr. Muhammad Ali',
    role: 'Long-term Donor',
    content:
      'What keeps me donating is clarity. The organization communicates where the need is and what progress has already been made.',
    highlight: 'Clear goals made it easy to keep giving.',
    featured: true,
  },
  {
    id: 'ayesha-khan',
    name: 'Ayesha Khan',
    role: 'Volunteer Coordinator',
    content:
      'Even small improvements in the experience matter. When the site feels organized, volunteers and donors respond faster.',
    highlight: 'Better design creates real momentum.',
    featured: true,
  },
]

export const FALLBACK_HOME_CONTENT: HomeContent = {
  site: fallbackSite,
  campaigns: fallbackCampaigns,
  events: fallbackEvents,
  testimonials: fallbackTestimonials,
  source: 'fallback',
}

export const FALLBACK_SITE_CONTENT = fallbackSite

function getRecordValue(source: unknown, keys: string[]) {
  if (!source || typeof source !== 'object') {
    return undefined
  }

  const record = source as Record<string, unknown>

  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key]
    }
  }

  return undefined
}

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

function getNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function getStringArrayEntry(value: unknown): value is StatCard {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'label' in value &&
      'value' in value &&
      'detail' in value
  )
}

function getPrincipleEntry(value: unknown): value is Principle {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'tag' in value &&
      'title' in value &&
      'description' in value
  )
}

function toDateString(value: unknown, fallback: string) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }

  return fallback
}

function compareEvents(left: EventItem, right: EventItem) {
  if (left.featured !== right.featured) {
    return Number(right.featured) - Number(left.featured)
  }

  const leftStatus = left.status.toLowerCase()
  const rightStatus = right.status.toLowerCase()
  const statusOrder = {
    upcoming: 0,
    ongoing: 1,
    completed: 2,
    archived: 3,
  }
  const leftStatusOrder = statusOrder[leftStatus as keyof typeof statusOrder] ?? 99
  const rightStatusOrder = statusOrder[rightStatus as keyof typeof statusOrder] ?? 99

  if (leftStatusOrder !== rightStatusOrder) {
    return leftStatusOrder - rightStatusOrder
  }

  return new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime()
}

function compareCampaigns(left: Campaign, right: Campaign) {
  if (left.featured !== right.featured) {
    return Number(right.featured) - Number(left.featured)
  }

  if (right.raisedAmount !== left.raisedAmount) {
    return right.raisedAmount - left.raisedAmount
  }

  if (right.targetAmount !== left.targetAmount) {
    return right.targetAmount - left.targetAmount
  }

  return left.title.localeCompare(right.title)
}

function compareTestimonials(left: Testimonial, right: Testimonial) {
  if (left.featured !== right.featured) {
    return Number(right.featured) - Number(left.featured)
  }

  return left.name.localeCompare(right.name)
}

function normalizeSiteContent(value: Partial<SiteContent> | undefined): SiteContent {
  if (!value) {
    return fallbackSite
  }

  const statCards = Array.isArray(value.statCards)
    ? value.statCards.filter(getStringArrayEntry).map((card, index) => ({
        label: getString(card.label, fallbackStatCards[index]?.label ?? 'Impact'),
        value: getString(card.value, fallbackStatCards[index]?.value ?? '0'),
        detail: getString(card.detail, fallbackStatCards[index]?.detail ?? ''),
      }))
    : fallbackStatCards

  const principles = Array.isArray(value.principles)
    ? value.principles.filter(getPrincipleEntry).map((item, index) => ({
        tag: getString(item.tag, fallbackPrinciples[index]?.tag ?? 'Focused Care'),
        title: getString(item.title, fallbackPrinciples[index]?.title ?? ''),
        description: getString(
          item.description,
          fallbackPrinciples[index]?.description ?? ''
        ),
      }))
    : fallbackPrinciples

  return {
    badge: getString(getRecordValue(value, ['badge']), fallbackSite.badge),
    heroTitle: getString(
      getRecordValue(value, ['heroTitle', 'hero_title']),
      fallbackSite.heroTitle
    ),
    heroSubtitle: getString(
      getRecordValue(value, ['heroSubtitle', 'hero_subtitle']),
      fallbackSite.heroSubtitle
    ),
    mission: getString(getRecordValue(value, ['mission']), fallbackSite.mission),
    vision: getString(getRecordValue(value, ['vision']), fallbackSite.vision),
    contactEmail: getString(
      getRecordValue(value, ['contactEmail', 'contact_email']),
      fallbackSite.contactEmail
    ),
    contactPhone: getString(
      getRecordValue(value, ['contactPhone', 'contact_phone']),
      fallbackSite.contactPhone
    ),
    contactAddress: getString(
      getRecordValue(value, ['contactAddress', 'contact_address']),
      fallbackSite.contactAddress
    ),
    donationProvider: getString(
      getRecordValue(value, ['donationProvider', 'donation_provider']),
      fallbackSite.donationProvider
    ),
    donationAccountNumber: getString(
      getRecordValue(value, ['donationAccountNumber', 'donation_account_number']),
      fallbackSite.donationAccountNumber
    ),
    instagramUrl: getString(
      getRecordValue(value, ['instagramUrl', 'instagram_url', 'instagram']),
      fallbackSite.instagramUrl
    ),
    statCards: statCards.length > 0 ? statCards : fallbackStatCards,
    principles: principles.length > 0 ? principles : fallbackPrinciples,
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!db || !isFirebaseConfigured) {
    return FALLBACK_SITE_CONTENT
  }

  try {
    const siteSnapshot = await getDoc(doc(db, 'siteContent', 'homepage'))

    return normalizeSiteContent(
      siteSnapshot.exists() ? (siteSnapshot.data() as Partial<SiteContent>) : undefined
    )
  } catch (error) {
    console.error('Unable to load site content from Firebase.', error)
    return FALLBACK_SITE_CONTENT
  }
}

function normalizeCampaign(id: string, value: Partial<Campaign>, index: number): Campaign {
  return {
    id,
    title: getString(
      getRecordValue(value, ['title']),
      fallbackCampaigns[index]?.title ?? 'Community Campaign'
    ),
    shortDescription: getString(
      getRecordValue(value, ['shortDescription', 'short_description']),
      fallbackCampaigns[index]?.shortDescription ?? 'Structured support for a pressing need.'
    ),
    category: getString(
      getRecordValue(value, ['category']),
      fallbackCampaigns[index]?.category ?? 'Relief'
    ),
    targetAmount: getNumber(
      getRecordValue(value, ['targetAmount', 'target_amount']),
      fallbackCampaigns[index]?.targetAmount ?? 100000
    ),
    raisedAmount: getNumber(
      getRecordValue(value, ['raisedAmount', 'raised_amount']),
      fallbackCampaigns[index]?.raisedAmount ?? 0
    ),
    beneficiariesLabel: getString(
      getRecordValue(value, ['beneficiariesLabel', 'beneficiaries_label']),
      fallbackCampaigns[index]?.beneficiariesLabel ?? 'Community support in progress'
    ),
    featured:
      typeof getRecordValue(value, ['featured']) === 'boolean'
        ? Boolean(getRecordValue(value, ['featured']))
        : true,
    accent:
      getRecordValue(value, ['accent']) === 'forest' ||
      getRecordValue(value, ['accent']) === 'clay' ||
      getRecordValue(value, ['accent']) === 'cream'
        ? (getRecordValue(value, ['accent']) as Campaign['accent'])
        : fallbackCampaigns[index]?.accent ?? 'forest',
  }
}

function normalizeEvent(id: string, value: Partial<EventItem>, index: number): EventItem {
  return {
    id,
    title: getString(
      getRecordValue(value, ['title']),
      fallbackEvents[index]?.title ?? 'Community Event'
    ),
    description: getString(
      getRecordValue(value, ['description']),
      fallbackEvents[index]?.description ?? 'An upcoming community support activity.'
    ),
    eventDate: toDateString(
      getRecordValue(value, ['eventDate', 'event_date']),
      fallbackEvents[index]?.eventDate ?? new Date().toISOString()
    ),
    location: getString(
      getRecordValue(value, ['location']),
      fallbackEvents[index]?.location ?? 'Karachi'
    ),
    category: getString(
      getRecordValue(value, ['category']),
      fallbackEvents[index]?.category ?? 'Community Support'
    ),
    status: getString(
      getRecordValue(value, ['status']),
      fallbackEvents[index]?.status ?? 'upcoming'
    ),
    featured: getBoolean(
      getRecordValue(value, ['featured']),
      fallbackEvents[index]?.featured ?? false
    ),
  }
}

function normalizeTestimonial(
  id: string,
  value: Partial<Testimonial>,
  index: number
): Testimonial {
  return {
    id,
    name: getString(value.name, fallbackTestimonials[index]?.name ?? 'Community Member'),
    role: getString(value.role, fallbackTestimonials[index]?.role ?? 'Supporter'),
    content: getString(
      value.content,
      fallbackTestimonials[index]?.content ?? 'Kaare Khair o Barr created meaningful support.'
    ),
    highlight: getString(
      value.highlight,
      fallbackTestimonials[index]?.highlight ?? 'Support landed where it mattered.'
    ),
    featured: getBoolean(
      getRecordValue(value, ['featured']),
      fallbackTestimonials[index]?.featured ?? true
    ),
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  if (!db || !isFirebaseConfigured) {
    return FALLBACK_HOME_CONTENT
  }

  try {
    const [siteSnapshot, campaignsSnapshot, eventsSnapshot, testimonialsSnapshot] =
      await Promise.all([
        getDoc(doc(db, 'siteContent', 'homepage')),
        getDocs(query(collection(db, 'campaigns'), where('featured', '==', true), limit(3))),
        getDocs(collection(db, 'events')),
        getDocs(
          query(collection(db, 'testimonials'), where('featured', '==', true), limit(3))
        ),
      ])

    const site = normalizeSiteContent(
      siteSnapshot.exists() ? (siteSnapshot.data() as Partial<SiteContent>) : undefined
    )

    const campaigns = campaignsSnapshot.empty
      ? fallbackCampaigns
      : campaignsSnapshot.docs
          .map((snapshot, index) =>
            normalizeCampaign(snapshot.id, snapshot.data() as Partial<Campaign>, index)
          )
          .sort(compareCampaigns)

    const events = eventsSnapshot.empty
      ? [...fallbackEvents].sort(compareEvents)
      : eventsSnapshot.docs
          .map((snapshot, index) =>
            normalizeEvent(snapshot.id, snapshot.data() as Partial<EventItem>, index)
          )
          .sort(compareEvents)
          .slice(0, 3)

    const testimonials = testimonialsSnapshot.empty
      ? fallbackTestimonials
      : testimonialsSnapshot.docs.map((snapshot, index) =>
          normalizeTestimonial(snapshot.id, snapshot.data() as Partial<Testimonial>, index)
        )

    return {
      site,
      campaigns,
      events,
      testimonials,
      source: 'firebase',
    }
  } catch (error) {
    console.error('Unable to load homepage content from Firebase.', error)
    return FALLBACK_HOME_CONTENT
  }
}

export async function getAllEvents(): Promise<EventItem[]> {
  if (!db || !isFirebaseConfigured) {
    return [...fallbackEvents].sort(compareEvents)
  }

  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'))

    if (eventsSnapshot.empty) {
      return [...fallbackEvents].sort(compareEvents)
    }

    return eventsSnapshot.docs
      .map((snapshot, index) =>
        normalizeEvent(snapshot.id, snapshot.data() as Partial<EventItem>, index)
      )
      .sort(compareEvents)
  } catch (error) {
    console.error('Unable to load events from Firebase.', error)
    return [...fallbackEvents].sort(compareEvents)
  }
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  if (!db || !isFirebaseConfigured) {
    return [...fallbackCampaigns].sort(compareCampaigns)
  }

  try {
    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'))

    if (campaignsSnapshot.empty) {
      return [...fallbackCampaigns].sort(compareCampaigns)
    }

    return campaignsSnapshot.docs
      .map((snapshot, index) =>
        normalizeCampaign(snapshot.id, snapshot.data() as Partial<Campaign>, index)
      )
      .sort(compareCampaigns)
  } catch (error) {
    console.error('Unable to load campaigns from Firebase.', error)
    return [...fallbackCampaigns].sort(compareCampaigns)
  }
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  if (!db || !isFirebaseConfigured) {
    return [...fallbackTestimonials].sort(compareTestimonials)
  }

  try {
    const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'))

    if (testimonialsSnapshot.empty) {
      return [...fallbackTestimonials].sort(compareTestimonials)
    }

    return testimonialsSnapshot.docs
      .map((snapshot, index) =>
        normalizeTestimonial(snapshot.id, snapshot.data() as Partial<Testimonial>, index)
      )
      .sort(compareTestimonials)
  } catch (error) {
    console.error('Unable to load testimonials from Firebase.', error)
    return [...fallbackTestimonials].sort(compareTestimonials)
  }
}

function buildCampaignPayload(values: CampaignInput) {
  const targetAmount = Number.isFinite(values.targetAmount) ? Math.max(0, values.targetAmount) : 0
  const raisedAmount = Number.isFinite(values.raisedAmount) ? Math.max(0, values.raisedAmount) : 0
  const accent = values.accent === 'forest' || values.accent === 'cream' || values.accent === 'clay'
    ? values.accent
    : 'forest'

  return {
    title: getString(values.title, 'Community Campaign'),
    shortDescription: getString(
      values.shortDescription,
      'Structured support for a pressing need.'
    ),
    category: getString(values.category, 'Relief'),
    targetAmount,
    raisedAmount,
    beneficiariesLabel: getString(
      values.beneficiariesLabel,
      'Community support in progress'
    ),
    featured: Boolean(values.featured),
    accent,
    updatedAt: new Date().toISOString(),
  }
}

export async function createCampaignItem(values: CampaignInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  const payload = buildCampaignPayload(values)

  await createFirestoreDocument('campaigns', {
    ...payload,
    createdAt: new Date().toISOString(),
  })
}

export async function updateCampaignItem(campaignId: string, values: CampaignInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await updateFirestoreDocument('campaigns', campaignId, buildCampaignPayload(values))
}

export async function deleteCampaignItem(campaignId: string) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await deleteFirestoreDocument('campaigns', campaignId)
}

function buildTestimonialPayload(values: TestimonialInput) {
  return {
    name: getString(values.name, 'Community Member'),
    role: getString(values.role, 'Supporter'),
    content: getString(
      values.content,
      'Kaare Khair o Barr created meaningful support.'
    ),
    highlight: getString(
      values.highlight,
      'Support landed where it mattered.'
    ),
    featured: Boolean(values.featured),
    updatedAt: new Date().toISOString(),
  }
}

export async function createTestimonialItem(values: TestimonialInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await createFirestoreDocument('testimonials', {
    ...buildTestimonialPayload(values),
    createdAt: new Date().toISOString(),
  })
}

export async function updateTestimonialItem(testimonialId: string, values: TestimonialInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await updateFirestoreDocument(
    'testimonials',
    testimonialId,
    buildTestimonialPayload(values)
  )
}

export async function deleteTestimonialItem(testimonialId: string) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await deleteFirestoreDocument('testimonials', testimonialId)
}

function formatSupportInterest(value: string) {
  const supportInterestLabels: Record<string, string> = {
    donation: 'Fund a campaign',
    volunteer: 'Join as a volunteer',
    partnership: 'Explore a partnership',
  }

  return supportInterestLabels[value] ?? value
}

async function sendSupportNotificationEmail(values: SupportFormInput) {
  const formData = new FormData()
  formData.append('name', values.fullName)
  formData.append('email', values.email)
  formData.append('phone', values.phone || 'Not provided')
  formData.append('interest', formatSupportInterest(values.interest))
  formData.append('message', values.message)
  formData.append('_subject', `New support request from ${values.fullName}`)
  formData.append('_template', 'table')
  formData.append('_captcha', 'false')
  formData.append('_replyto', values.email)

  const response = await fetch(SUPPORT_NOTIFICATION_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Unable to send the email notification right now.')
  }
}

export async function createEventItem(values: EventItemInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  const payload = buildEventPayload(values)

  await createFirestoreDocument('events', {
    ...payload,
    createdAt: new Date().toISOString(),
  })
}

function buildEventPayload(values: EventItemInput) {
  const normalizedEventDate = new Date(values.eventDate)
  const eventDate = Number.isNaN(normalizedEventDate.getTime())
    ? new Date().toISOString()
    : normalizedEventDate.toISOString()

  return {
    title: getString(values.title, 'Community Event'),
    description: getString(values.description, 'An upcoming community support activity.'),
    eventDate,
    location: getString(values.location, 'UET Lahore'),
    category: getString(values.category, 'Community Support'),
    status: getString(values.status, 'upcoming'),
    featured: Boolean(values.featured),
    updatedAt: new Date().toISOString(),
  }
}

export async function updateEventItem(eventId: string, values: EventItemInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await updateFirestoreDocument('events', eventId, buildEventPayload(values))
}

export async function deleteEventItem(eventId: string) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await deleteFirestoreDocument('events', eventId)
}

export async function submitSupportRequest(values: SupportFormInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add the public Firebase env vars to enable saves.')
  }

  await createFirestoreDocument('supportRequests', {
    ...values,
    createdAt: new Date().toISOString(),
    source: 'homepage',
  })

  await sendSupportNotificationEmail(values)
}
