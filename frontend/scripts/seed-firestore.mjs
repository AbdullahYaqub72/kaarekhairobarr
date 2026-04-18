import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=')
      return [line.slice(0, index), line.slice(index + 1)]
    })
)

const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY

if (!projectId || !apiKey) {
  throw new Error('Missing Firebase env vars in .env.local.')
}

const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`

function toFirestoreValue(value) {
  if (value === null) {
    return { nullValue: null }
  }

  if (typeof value === 'string') {
    return { stringValue: value }
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value }
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value }
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((entry) => toFirestoreValue(entry)),
      },
    }
  }

  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value)
            .filter(([, entry]) => entry !== undefined)
            .map(([key, entry]) => [key, toFirestoreValue(entry)])
        ),
      },
    }
  }

  throw new Error(`Unsupported value type: ${typeof value}`)
}

async function upsertDocument(path, data) {
  const url = `${baseUrl}/${path}?key=${apiKey}`
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(data)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, toFirestoreValue(value)])
      ),
    }),
  })

  const json = await response.json()

  if (!response.ok) {
    throw new Error(
      `Unable to seed ${path}: ${json?.error?.status ?? response.status} ${json?.error?.message ?? ''}`
    )
  }

  return json
}

function addMonths(date, months) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat('en-PK', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const now = new Date()
const monthKey = getMonthKey(now)
const monthLabel = getMonthLabel(now)

const monthlyGoalSeeds = [
  {
    id: 'family-iftar-support',
    monthOffset: 0,
    title: 'Family Iftar Support Circle',
    category: 'Ration Cases',
    purpose: 'Fund meal kits and ration support for families carrying Ramadan costs.',
    targetAmount: 450000,
    raisedAmount: 318000,
    status: 'active',
  },
  {
    id: 'dialysis-relief-window',
    monthOffset: 0,
    title: 'Dialysis Relief Window',
    category: 'Dialysis Patient Support',
    purpose: 'Cover treatment sessions and transport support for recurring dialysis cases.',
    targetAmount: 600000,
    raisedAmount: 274000,
    status: 'at-risk',
  },
  {
    id: 'uet-student-relief-kits',
    monthOffset: 0,
    title: 'UET Student Relief Kits',
    category: 'Education & Welfare',
    purpose: 'Pair ration support with notebooks, uniforms, and exam-season basics.',
    targetAmount: 320000,
    raisedAmount: 198000,
    status: 'active',
  },
  {
    id: 'neighborhood-medical-camp',
    monthOffset: -1,
    title: 'Neighborhood Medical Camp',
    category: 'Community Outreach',
    purpose: 'Back volunteer doctors, medicine support, and referral follow-up.',
    targetAmount: 240000,
    raisedAmount: 240000,
    status: 'completed',
  },
  {
    id: 'emergency-rent-support',
    monthOffset: -1,
    title: 'Emergency Rent Support',
    category: 'Shelter & Rent',
    purpose: 'Provide short-term rent relief for families on the edge of eviction.',
    targetAmount: 180000,
    raisedAmount: 122000,
    status: 'active',
  },
  {
    id: 'winter-home-essentials',
    monthOffset: -2,
    title: 'Winter Home Essentials',
    category: 'Seasonal Campaign',
    purpose: 'Distribute blankets, heating support, and urgent household items.',
    targetAmount: 275000,
    raisedAmount: 275000,
    status: 'completed',
  },
  {
    id: 'school-return-drive',
    monthOffset: -3,
    title: 'School Return Drive',
    category: 'Education & Welfare',
    purpose: 'Keep children in school with uniforms, bags, and registration support.',
    targetAmount: 210000,
    raisedAmount: 154000,
    status: 'planned',
  },
  {
    id: 'monsoon-recovery-support',
    monthOffset: -12,
    title: 'Monsoon Recovery Support',
    category: 'Emergency Relief',
    purpose: 'Repair damaged essentials and restock families after seasonal flooding.',
    targetAmount: 380000,
    raisedAmount: 301000,
    status: 'active',
  },
].map((entry) => {
  const reportingDate = addMonths(now, entry.monthOffset)
  const entryMonthKey = getMonthKey(reportingDate)
  const entryMonthLabel = getMonthLabel(reportingDate)
  const remainingAmount = Math.max(0, entry.targetAmount - entry.raisedAmount)

  return [
    `monthlyGoals/${entryMonthKey}-${entry.id}`,
    {
      title: entry.title,
      category: entry.category,
      purpose: entry.purpose,
      targetAmount: entry.targetAmount,
      raisedAmount: entry.raisedAmount,
      remainingAmount,
      status: remainingAmount === 0 ? 'completed' : entry.status,
      isTargetMet: remainingAmount === 0,
      monthKey: entryMonthKey,
      monthLabel: entryMonthLabel,
      year: reportingDate.getFullYear(),
      monthIndex: reportingDate.getMonth() + 1,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ]
})

const seedEntries = [
  [
    'siteContent/homepage',
    {
      badge: 'Lahore-based NGO from UET Lahore',
      heroTitle: 'Relief that begins at UET Lahore and reaches families with dignity.',
      heroSubtitle:
        'Kaare Khair o Barr is a Lahore-based welfare initiative from UET Lahore, coordinating food, medical, volunteer, and emergency support with clarity, compassion, and local trust.',
      mission:
        'We turn the goodwill of students, alumni, and supporters at UET Lahore into structured, people-first relief for families facing financial and medical hardship.',
      vision:
        'A more compassionate Lahore where support feels close, transparent, and immediate when families need it most.',
      contactEmail: 'kaarekhairobarr@gmail.com',
      contactPhone: '03268838008',
      contactAddress: 'UET Lahore, Lahore, Pakistan',
      donationProvider: 'Easypaisa',
      donationAccountNumber: '03268838008',
      instagramUrl: 'https://www.instagram.com/kaare_khair_o_barr/',
      statCards: [
        {
          label: 'Families reached',
          value: '20+',
          detail:
            'Families reached through monthly ration, emergency relief, and case-based welfare support.',
        },
        {
          label: 'Volunteer hours',
          value: '200+',
          detail:
            'Volunteer hours contributed across field visits, packing drives, coordination, and outreach.',
        },
        {
          label: 'Meals & ration kits till now',
          value: '2M+',
          detail:
            'Support mobilized for meals and ration kits through recurring campaigns and seasonal drives.',
        },
        {
          label: 'Medical cases backed',
          value: '8',
          detail:
            'Medical cases backed through treatment support, medicine assistance, and urgent follow-up.',
        },
      ],
    },
  ],
  [
    'campaigns/family-iftar-support',
    {
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
  ],
  [
    'campaigns/dialysis-access-fund',
    {
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
  ],
  [
    'campaigns/school-ration-kits',
    {
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
  ],
  [
    'events/uet-lahore-community-desk',
    {
      title: 'UET Lahore Community Desk',
      description:
        'An on-ground intake session for ration referrals, volunteer coordination, and family case reviews.',
      eventDate: '2026-04-24T17:30:00+05:00',
      location: 'UET Lahore Community Desk',
      category: 'Campus Outreach',
      status: 'upcoming',
      featured: true,
    },
  ],
  [
    'events/lahore-medical-support-camp',
    {
      title: 'Medical Support Day',
      description:
        'A focused follow-up day for dialysis assistance, prescription support, and transport coordination.',
      eventDate: '2026-04-28T11:00:00+05:00',
      location: 'Lahore Medical Support Camp',
      category: 'Medical Camp',
      status: 'upcoming',
      featured: true,
    },
  ],
  [
    'events/uet-lahore-volunteer-briefing',
    {
      title: 'Volunteer Field Briefing',
      description:
        'Orientation for packing-day logistics, family verification standards, and respectful beneficiary outreach.',
      eventDate: '2026-05-02T15:00:00+05:00',
      location: 'UET Lahore Campus',
      category: 'Volunteer Meetup',
      status: 'upcoming',
      featured: false,
    },
  ],
  [
    'testimonials/bilal-hassan',
    {
      name: 'Bilal Hassan',
      role: 'Beneficiary Family Representative',
      content:
        'The team did not just hand over support. They checked in, understood the pressure we were under, and helped us feel seen.',
      highlight: 'Support felt personal, not transactional.',
      featured: true,
    },
  ],
  [
    'testimonials/dr-muhammad-ali',
    {
      name: 'Dr. Muhammad Ali',
      role: 'Long-term Donor',
      content:
        'What keeps me donating is clarity. The organization communicates where the need is and what progress has already been made.',
      highlight: 'Clear goals made it easy to keep giving.',
      featured: true,
    },
  ],
  [
    'testimonials/ayesha-khan',
    {
      name: 'Ayesha Khan',
      role: 'Volunteer Coordinator',
      content:
        'Even small improvements in the experience matter. When the site feels organized, volunteers and donors respond faster.',
      highlight: 'Better design creates real momentum.',
      featured: true,
    },
  ],
  ...monthlyGoalSeeds,
]

for (const [path, data] of seedEntries) {
  const response = await upsertDocument(path, data)
  console.log(`Seeded ${path}: ${response.name}`)
}
