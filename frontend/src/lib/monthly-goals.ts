import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import {
  createFirestoreDocument,
  db,
  deleteFirestoreDocument,
  isFirebaseConfigured,
  updateFirestoreDocument,
} from '@/lib/firebase'
import type {
  CategoryBreakdownPoint,
  GoalCategory,
  GoalStatus,
  GoalsAnalytics,
  MonthlyGoal,
  MonthlyGoalInput,
  MonthlyGoalTrendPoint,
  YearlyGoalTrendPoint,
} from '@/types/goals'

const goalStatuses: GoalStatus[] = ['planned', 'active', 'at-risk', 'completed']
export const GOAL_CATEGORY_OPTIONS = [
  'Dialysis Patient Support',
  'Ration Cases',
  'Food Relief',
  'Medical Support',
  'Education & Welfare',
  'Emergency Relief',
  'Shelter & Rent',
  'Community Outreach',
  'Seasonal Campaign',
  'General Relief',
] as const
const defaultGoalCategory: GoalCategory = 'General Relief'

const statusOrder: Record<GoalStatus, number> = {
  'at-risk': 0,
  active: 1,
  planned: 2,
  completed: 3,
}

interface FallbackGoalSeed {
  monthOffset: number
  title: string
  category: GoalCategory
  purpose: string
  targetAmount: number
  raisedAmount: number
  status: GoalStatus
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

function isValidMonthKey(value: string) {
  return /^\d{4}-\d{2}$/.test(value)
}

function isGoalStatus(value: unknown): value is GoalStatus {
  return typeof value === 'string' && goalStatuses.includes(value as GoalStatus)
}

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

function normalizeGoalCategory(value: unknown, fallback: GoalCategory = defaultGoalCategory) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fallback
  }

  return value.trim()
}

function toIsoString(value: unknown) {
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

  return undefined
}

function parseMonthKey(monthKey: string) {
  if (!isValidMonthKey(monthKey)) {
    return parseMonthKey(getCurrentMonthKey())
  }

  const [yearValue, monthValue] = monthKey.split('-')

  return {
    year: Number(yearValue),
    monthIndex: Number(monthValue),
  }
}

function compareGoals(left: MonthlyGoal, right: MonthlyGoal) {
  if (right.year !== left.year) {
    return right.year - left.year
  }

  if (right.monthIndex !== left.monthIndex) {
    return right.monthIndex - left.monthIndex
  }

  if (left.isTargetMet !== right.isTargetMet) {
    return Number(left.isTargetMet) - Number(right.isTargetMet)
  }

  if (statusOrder[left.status] !== statusOrder[right.status]) {
    return statusOrder[left.status] - statusOrder[right.status]
  }

  if (right.remainingAmount !== left.remainingAmount) {
    return right.remainingAmount - left.remainingAmount
  }

  return left.title.localeCompare(right.title)
}

function normalizeReportingMonth(value: string) {
  return isValidMonthKey(value) ? value : getCurrentMonthKey()
}

function createFallbackGoal(id: string, seed: FallbackGoalSeed, now: Date): MonthlyGoal {
  const reportingDate = addMonths(now, seed.monthOffset)
  const monthKey = getCurrentMonthKey(reportingDate)
  const targetAmount = Math.max(0, seed.targetAmount)
  const raisedAmount = Math.max(0, seed.raisedAmount)
  const remainingAmount = Math.max(0, targetAmount - raisedAmount)
  const isTargetMet = remainingAmount === 0

  return {
    id,
    title: seed.title,
    category: seed.category,
    purpose: seed.purpose,
    targetAmount,
    raisedAmount,
    remainingAmount,
    status: isTargetMet ? 'completed' : seed.status,
    isTargetMet,
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    year: reportingDate.getFullYear(),
    monthIndex: reportingDate.getMonth() + 1,
  }
}

const fallbackGoalSeeds: FallbackGoalSeed[] = [
  {
    monthOffset: 0,
    title: 'Family Iftar Support Circle',
    category: 'Ration Cases',
    purpose: 'Fund meal kits and ration support for families carrying Ramadan costs.',
    targetAmount: 450000,
    raisedAmount: 318000,
    status: 'active',
  },
  {
    monthOffset: 0,
    title: 'Dialysis Relief Window',
    category: 'Dialysis Patient Support',
    purpose: 'Cover treatment sessions and transport support for recurring dialysis cases.',
    targetAmount: 600000,
    raisedAmount: 274000,
    status: 'at-risk',
  },
  {
    monthOffset: 0,
    title: 'UET Student Relief Kits',
    category: 'Education & Welfare',
    purpose: 'Pair ration support with notebooks, uniforms, and exam-season basics.',
    targetAmount: 320000,
    raisedAmount: 198000,
    status: 'active',
  },
  {
    monthOffset: -1,
    title: 'Neighborhood Medical Camp',
    category: 'Community Outreach',
    purpose: 'Back volunteer doctors, medicine support, and referral follow-up.',
    targetAmount: 240000,
    raisedAmount: 240000,
    status: 'completed',
  },
  {
    monthOffset: -1,
    title: 'Emergency Rent Support',
    category: 'Shelter & Rent',
    purpose: 'Provide short-term rent relief for families on the edge of eviction.',
    targetAmount: 180000,
    raisedAmount: 122000,
    status: 'active',
  },
  {
    monthOffset: -2,
    title: 'Winter Home Essentials',
    category: 'Seasonal Campaign',
    purpose: 'Distribute blankets, heating support, and urgent household items.',
    targetAmount: 275000,
    raisedAmount: 275000,
    status: 'completed',
  },
  {
    monthOffset: -3,
    title: 'School Return Drive',
    category: 'Education & Welfare',
    purpose: 'Keep children in school with uniforms, bags, and registration support.',
    targetAmount: 210000,
    raisedAmount: 154000,
    status: 'planned',
  },
  {
    monthOffset: -12,
    title: 'Monsoon Recovery Support',
    category: 'Emergency Relief',
    purpose: 'Repair damaged essentials and restock families after seasonal flooding.',
    targetAmount: 380000,
    raisedAmount: 301000,
    status: 'active',
  },
]

export const FALLBACK_MONTHLY_GOALS = fallbackGoalSeeds
  .map((seed, index) => createFallbackGoal(`fallback-goal-${index + 1}`, seed, new Date()))
  .sort(compareGoals)

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getCurrentMonthLabel(date = new Date()) {
  return formatMonthLabel(getCurrentMonthKey(date))
}

export function formatMonthLabel(monthKey: string) {
  const { year, monthIndex } = parseMonthKey(monthKey)
  const labelDate = new Date(year, monthIndex - 1, 1)

  return new Intl.DateTimeFormat('en-PK', {
    month: 'long',
    year: 'numeric',
  }).format(labelDate)
}

export function formatMonthIndexLabel(monthIndex: number) {
  return new Intl.DateTimeFormat('en-PK', {
    month: 'long',
  }).format(new Date(2026, monthIndex - 1, 1))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactCurrency(value: number) {
  const compact = new Intl.NumberFormat('en-PK', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

  return `Rs ${compact}`
}

function normalizeGoal(id: string, value: unknown, index: number): MonthlyGoal {
  const fallbackGoal = FALLBACK_MONTHLY_GOALS[index] ?? FALLBACK_MONTHLY_GOALS[0]
  const monthKey = normalizeReportingMonth(
    getString(
      getRecordValue(value, ['monthKey', 'month_key', 'reportingMonth', 'reporting_month']),
      fallbackGoal?.monthKey ?? getCurrentMonthKey()
    )
  )
  const { year, monthIndex } = parseMonthKey(monthKey)
  const targetAmount = Math.max(
    0,
    getNumber(
      getRecordValue(value, ['targetAmount', 'target_amount']),
      fallbackGoal?.targetAmount ?? 0
    )
  )
  const raisedAmount = Math.max(
    0,
    getNumber(
      getRecordValue(value, ['raisedAmount', 'raised_amount']),
      fallbackGoal?.raisedAmount ?? 0
    )
  )
  const calculatedRemaining = Math.max(0, targetAmount - raisedAmount)
  const statusValue = getRecordValue(value, ['status'])
  const isTargetMet = getBoolean(
    getRecordValue(value, ['isTargetMet', 'is_target_met']),
    calculatedRemaining === 0
  )

  return {
    id,
    title: getString(getRecordValue(value, ['title']), fallbackGoal?.title ?? 'Monthly goal'),
    category: normalizeGoalCategory(
      getRecordValue(value, ['category', 'category_name']),
      fallbackGoal?.category ?? defaultGoalCategory
    ),
    purpose: getString(
      getRecordValue(value, ['purpose']),
      fallbackGoal?.purpose ?? 'Support a pressing community need.'
    ),
    targetAmount,
    raisedAmount,
    remainingAmount: isTargetMet ? 0 : calculatedRemaining,
    status: isGoalStatus(statusValue)
      ? statusValue
      : isTargetMet
        ? 'completed'
        : fallbackGoal?.status ?? 'active',
    isTargetMet,
    monthKey,
    monthLabel: getString(
      getRecordValue(value, ['monthLabel', 'month_label']),
      formatMonthLabel(monthKey)
    ),
    year,
    monthIndex,
    createdAt: toIsoString(getRecordValue(value, ['createdAt', 'created_at'])),
  }
}

function getFallbackGoals(monthKey?: string) {
  const filteredGoals = monthKey
    ? FALLBACK_MONTHLY_GOALS.filter((goal) => goal.monthKey === monthKey)
    : FALLBACK_MONTHLY_GOALS

  return [...filteredGoals].sort(compareGoals)
}

export async function getMonthlyGoals(monthKey?: string): Promise<MonthlyGoal[]> {
  if (!db || !isFirebaseConfigured) {
    return getFallbackGoals(monthKey)
  }

  try {
    const goalsQuery = monthKey
      ? query(collection(db, 'monthlyGoals'), where('monthKey', '==', monthKey))
      : collection(db, 'monthlyGoals')

    const snapshot = await getDocs(goalsQuery)

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs
      .map((goalSnapshot, index) => normalizeGoal(goalSnapshot.id, goalSnapshot.data(), index))
      .sort(compareGoals)
  } catch (error) {
    console.error('Unable to load monthly goals from Firebase.', error)
    return getFallbackGoals(monthKey)
  }
}

export async function createMonthlyGoal(values: MonthlyGoalInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured yet. Add the public Firebase env vars to enable goal saves.'
    )
  }

  const payload = buildMonthlyGoalPayload(values)

  await createFirestoreDocument('monthlyGoals', {
    ...payload,
    createdAt: new Date().toISOString(),
  })
}

function buildMonthlyGoalPayload(values: MonthlyGoalInput) {
  const monthKey = normalizeReportingMonth(values.reportingMonth)
  const { year, monthIndex } = parseMonthKey(monthKey)
  const targetAmount = Number.isFinite(values.targetAmount) ? Math.max(0, values.targetAmount) : 0
  const raisedAmount = Number.isFinite(values.raisedAmount) ? Math.max(0, values.raisedAmount) : 0
  const remainingAmount = Math.max(0, targetAmount - raisedAmount)
  const isTargetMet = remainingAmount === 0
  const category = normalizeGoalCategory(values.category)
  const now = new Date().toISOString()

  return {
    title: values.title.trim(),
    category,
    purpose: values.purpose.trim(),
    targetAmount,
    raisedAmount,
    remainingAmount,
    status: isTargetMet ? 'completed' : values.status === 'completed' ? 'active' : values.status,
    isTargetMet,
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    year,
    monthIndex,
    updatedAt: now,
  }
}

export async function updateMonthlyGoal(goalId: string, values: MonthlyGoalInput) {
  if (!db || !isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured yet. Add the public Firebase env vars to enable goal saves.'
    )
  }

  await updateFirestoreDocument('monthlyGoals', goalId, buildMonthlyGoalPayload(values))
}

export async function deleteMonthlyGoal(goalId: string) {
  if (!db || !isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured yet. Add the public Firebase env vars to enable goal saves.'
    )
  }

  await deleteFirestoreDocument('monthlyGoals', goalId)
}

export function getGoalYearOptions(goals: MonthlyGoal[]) {
  return [...new Set(goals.map((goal) => String(goal.year)))].sort((left, right) =>
    Number(right) - Number(left)
  )
}

export function getGoalMonthOptions(goals: MonthlyGoal[], selectedYear: string) {
  const relevantGoals =
    selectedYear === 'all'
      ? goals
      : goals.filter((goal) => String(goal.year) === selectedYear)

  return [...new Set(relevantGoals.map((goal) => String(goal.monthIndex).padStart(2, '0')))].sort()
}

export function filterGoalsByPeriod(
  goals: MonthlyGoal[],
  selectedYear: string,
  selectedMonth: string
) {
  return goals.filter((goal) => {
    const matchesYear = selectedYear === 'all' || String(goal.year) === selectedYear
    const matchesMonth =
      selectedMonth === 'all' || String(goal.monthIndex).padStart(2, '0') === selectedMonth

    return matchesYear && matchesMonth
  })
}

export function formatGoalScopeLabel(selectedYear: string, selectedMonth: string) {
  if (selectedYear === 'all' && selectedMonth === 'all') {
    return 'All recorded goals'
  }

  if (selectedYear !== 'all' && selectedMonth === 'all') {
    return `All months in ${selectedYear}`
  }

  if (selectedYear === 'all' && selectedMonth !== 'all') {
    return `${formatMonthIndexLabel(Number(selectedMonth))} across all years`
  }

  return `${formatMonthIndexLabel(Number(selectedMonth))} ${selectedYear}`
}

export function buildGoalsAnalytics(
  goals: MonthlyGoal[],
  currentDate = new Date()
): GoalsAnalytics {
  const currentMonthKey = getCurrentMonthKey(currentDate)
  const currentMonthLabel = formatMonthLabel(currentMonthKey)
  const currentYear = currentDate.getFullYear()
  const monthlyAccumulator = new Map<string, MonthlyGoalTrendPoint>()
  const yearlyAccumulator = new Map<string, YearlyGoalTrendPoint>()
  const categoryAccumulator = new Map<GoalCategory, CategoryBreakdownPoint>()

  for (const goal of goals) {
    const monthlyEntry = monthlyAccumulator.get(goal.monthKey) ?? {
      monthKey: goal.monthKey,
      label: goal.monthLabel,
      targetAmount: 0,
      raisedAmount: 0,
      remainingAmount: 0,
      completedGoals: 0,
      totalGoals: 0,
    }

    monthlyEntry.targetAmount += goal.targetAmount
    monthlyEntry.raisedAmount += goal.raisedAmount
    monthlyEntry.remainingAmount += goal.remainingAmount
    monthlyEntry.totalGoals += 1
    monthlyEntry.completedGoals += goal.isTargetMet ? 1 : 0

    monthlyAccumulator.set(goal.monthKey, monthlyEntry)

    const yearKey = String(goal.year)
    const yearlyEntry = yearlyAccumulator.get(yearKey) ?? {
      year: yearKey,
      targetAmount: 0,
      raisedAmount: 0,
      remainingAmount: 0,
      completionRate: 0,
      totalGoals: 0,
    }

    yearlyEntry.targetAmount += goal.targetAmount
    yearlyEntry.raisedAmount += goal.raisedAmount
    yearlyEntry.remainingAmount += goal.remainingAmount
    yearlyEntry.totalGoals += 1

    yearlyAccumulator.set(yearKey, yearlyEntry)

    const categoryEntry = categoryAccumulator.get(goal.category) ?? {
      category: goal.category,
      targetAmount: 0,
      raisedAmount: 0,
      remainingAmount: 0,
      completionRate: 0,
      totalGoals: 0,
      completedGoals: 0,
    }

    categoryEntry.targetAmount += goal.targetAmount
    categoryEntry.raisedAmount += goal.raisedAmount
    categoryEntry.remainingAmount += goal.remainingAmount
    categoryEntry.totalGoals += 1
    categoryEntry.completedGoals += goal.isTargetMet ? 1 : 0

    categoryAccumulator.set(goal.category, categoryEntry)
  }

  const monthlyTrend = [...monthlyAccumulator.values()].sort((left, right) =>
    left.monthKey.localeCompare(right.monthKey)
  )
  const yearlyTrend = [...yearlyAccumulator.values()]
    .map((entry) => ({
      ...entry,
      completionRate:
        entry.targetAmount > 0
          ? Math.round((entry.raisedAmount / entry.targetAmount) * 100)
          : 0,
    }))
    .sort((left, right) => left.year.localeCompare(right.year))
  const categoryBreakdown = [...categoryAccumulator.values()]
    .map((entry) => ({
      ...entry,
      completionRate:
        entry.targetAmount > 0
          ? Math.round((entry.raisedAmount / entry.targetAmount) * 100)
          : 0,
    }))
    .sort((left, right) => right.targetAmount - left.targetAmount)

  const currentMonthGoals = [...goals]
    .filter((goal) => goal.monthKey === currentMonthKey)
    .sort(compareGoals)
  const currentMonthTarget = currentMonthGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const currentMonthRaised = currentMonthGoals.reduce((sum, goal) => sum + goal.raisedAmount, 0)
  const currentMonthRemaining = currentMonthGoals.reduce(
    (sum, goal) => sum + goal.remainingAmount,
    0
  )
  const currentYearEntry = yearlyTrend.find((entry) => entry.year === String(currentYear))

  return {
    currentMonthKey,
    currentMonthLabel,
    currentMonthGoals,
    currentMonthTarget,
    currentMonthRaised,
    currentMonthRemaining,
    currentYearTarget: currentYearEntry?.targetAmount ?? 0,
    currentYearRaised: currentYearEntry?.raisedAmount ?? 0,
    currentYearRemaining: currentYearEntry?.remainingAmount ?? 0,
    totalGoalCount: goals.length,
    activeGoalCount: currentMonthGoals.filter((goal) => !goal.isTargetMet).length,
    completedGoalCount: currentMonthGoals.filter((goal) => goal.isTargetMet).length,
    monthlyTrend,
    yearlyTrend,
    categoryBreakdown,
  }
}
