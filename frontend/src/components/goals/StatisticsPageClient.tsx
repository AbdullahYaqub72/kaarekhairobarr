'use client'

import Link from 'next/link'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, BarChart3, Filter, Layers3 } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import MonthlyGoalCard from '@/components/goals/MonthlyGoalCard'
import SectionHeading from '@/components/home/SectionHeading'
import {
  buildGoalsAnalytics,
  filterGoalsByPeriod,
  formatCompactCurrency,
  formatCurrency,
  formatGoalScopeLabel,
  formatMonthIndexLabel,
  getGoalMonthOptions,
  getGoalYearOptions,
  getMonthlyGoals,
} from '@/lib/monthly-goals'
import type { MonthlyGoal } from '@/types/goals'

const chartPalette = ['#1a5131', '#d4a562', '#c85631', '#0f1917', '#4da86d', '#734b24']

function formatTooltipValue(value: string | number) {
  return typeof value === 'number' ? formatCurrency(value) : value
}

export default function StatisticsPageClient() {
  const [goals, setGoals] = useState<MonthlyGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')

  useEffect(() => {
    let isActive = true

    const loadGoals = async () => {
      const nextGoals = await getMonthlyGoals()

      if (!isActive) {
        return
      }

      startTransition(() => {
        setGoals(nextGoals)
        setIsLoading(false)
      })
    }

    void loadGoals()

    return () => {
      isActive = false
    }
  }, [])

  const yearOptions = getGoalYearOptions(goals)
  const monthOptions = getGoalMonthOptions(goals, selectedYear)

  useEffect(() => {
    if (selectedMonth !== 'all' && !monthOptions.includes(selectedMonth)) {
      setSelectedMonth('all')
    }
  }, [monthOptions, selectedMonth])

  const filteredGoals = filterGoalsByPeriod(goals, selectedYear, selectedMonth)
  const analytics = buildGoalsAnalytics(filteredGoals)
  const filteredTarget = filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const filteredRaised = filteredGoals.reduce((sum, goal) => sum + goal.raisedAmount, 0)
  const filteredRemaining = filteredGoals.reduce((sum, goal) => sum + goal.remainingAmount, 0)
  const completedCount = filteredGoals.filter((goal) => goal.isTargetMet).length
  const openCount = filteredGoals.length - completedCount
  const completionRate =
    filteredTarget > 0 ? Math.round((filteredRaised / filteredTarget) * 100) : 0
  const scopeLabel = formatGoalScopeLabel(selectedYear, selectedMonth)
  const statusDistribution = [
    { name: 'Target met', value: completedCount, color: '#1a5131' },
    { name: 'Open goals', value: openCount, color: '#c85631' },
  ].filter((item) => item.value > 0)
  const categoryShareData = analytics.categoryBreakdown.map((entry) => ({
    name: entry.category,
    value: entry.targetAmount,
  }))

  return (
    <div className="pb-12">
      <section className="section-shell relative overflow-hidden pt-10 sm:pt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-mesh-radial opacity-90" />

        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="eyebrow bg-white/85 text-ink-700">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.94] tracking-[-0.05em] text-ink-900 sm:text-6xl">
              Monthly, yearly, and category-level performance in one place.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-ink-600 sm:text-lg">
              Shift the view by year and month, compare categories side by side, and keep the
              graphs aligned with the same monthly goals used throughout the site.
            </p>
          </div>

          <div className="mt-10 surface-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <span className="eyebrow bg-forest-50 text-forest-700">
                  <Filter className="h-4 w-4" />
                  Filter Scope
                </span>
                <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-ink-900">
                  {scopeLabel}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-600">
                  Use the filters to switch between full-year trends, a single month inside one
                  year, or the same month across multiple years.
                </p>
              </div>

              <Link href="/#support" className="btn-outline">
                Support a Campaign
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label" htmlFor="statsYear">
                  Year
                </label>
                <select
                  id="statsYear"
                  className="field"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                >
                  <option value="all">All years</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="statsMonth">
                  Month
                </label>
                <select
                  id="statsMonth"
                  className="field"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  <option value="all">All months</option>
                  {monthOptions.map((monthValue) => (
                    <option key={monthValue} value={monthValue}>
                      {formatMonthIndexLabel(Number(monthValue))}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="surface-panel p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Target in scope</p>
              <p className="mt-4 font-display text-4xl font-semibold text-ink-900">
                {formatCompactCurrency(filteredTarget)}
              </p>
            </div>
            <div className="surface-panel p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Raised in scope</p>
              <p className="mt-4 font-display text-4xl font-semibold text-ink-900">
                {formatCompactCurrency(filteredRaised)}
              </p>
            </div>
            <div className="surface-panel p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Remaining in scope</p>
              <p className="mt-4 font-display text-4xl font-semibold text-ink-900">
                {formatCompactCurrency(filteredRemaining)}
              </p>
            </div>
            <div className="surface-panel p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Completion rate</p>
              <p className="mt-4 font-display text-4xl font-semibold text-ink-900">
                {completionRate}%
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-600">
                {filteredGoals.length} goals tracked, {completedCount} completed.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="surface-panel p-8">
              <SectionHeading
                eyebrow="Monthly Trend"
                title="How each month is pacing within the selected scope."
                description="Targets, raised amounts, and remaining funding are rolled up month by month after the filters are applied."
              />

              <div className="mt-8 h-[340px]">
                {analytics.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyTrend}>
                      <defs>
                        <linearGradient id="raisedFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#1a5131" stopOpacity={0.36} />
                          <stop offset="95%" stopColor="#1a5131" stopOpacity={0.04} />
                        </linearGradient>
                        <linearGradient id="remainingFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#c85631" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#c85631" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(15, 25, 23, 0.08)" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis
                        tickFormatter={(value: number) => formatCompactCurrency(value)}
                        tickLine={false}
                        axisLine={false}
                        width={88}
                      />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="targetAmount"
                        name="Target"
                        stroke="#d4a562"
                        fill="transparent"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="raisedAmount"
                        name="Raised"
                        stroke="#1a5131"
                        fill="url(#raisedFill)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="remainingAmount"
                        name="Still left"
                        stroke="#c85631"
                        fill="url(#remainingFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[24px] bg-white/70 text-sm text-ink-600">
                    No monthly trend is available for the selected filters yet.
                  </div>
                )}
              </div>
            </div>

            <div className="surface-panel p-8">
              <SectionHeading
                eyebrow="Yearly Rollup"
                title="A yearly comparison for the selected month or full-year view."
                description="When a month is selected, this compares that month across years. Otherwise it shows full-year totals."
              />

              <div className="mt-8 h-[340px]">
                {analytics.yearlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.yearlyTrend} barGap={12}>
                      <CartesianGrid stroke="rgba(15, 25, 23, 0.08)" vertical={false} />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} />
                      <YAxis
                        tickFormatter={(value: number) => formatCompactCurrency(value)}
                        tickLine={false}
                        axisLine={false}
                        width={88}
                      />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Bar
                        dataKey="targetAmount"
                        name="Target"
                        radius={[12, 12, 0, 0]}
                        fill="#d4a562"
                      />
                      <Bar
                        dataKey="raisedAmount"
                        name="Raised"
                        radius={[12, 12, 0, 0]}
                        fill="#1a5131"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[24px] bg-white/70 text-sm text-ink-600">
                    No yearly trend is available for the selected filters yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
            <div className="surface-panel p-8">
              <SectionHeading
                eyebrow="Category Performance"
                title="See how every category is performing in the selected view."
                description="This compares target and raised amounts across all categories represented in the filtered dataset."
              />

              <div className="mt-8 h-[360px]">
                {analytics.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryBreakdown} layout="vertical" barGap={10}>
                      <CartesianGrid stroke="rgba(15, 25, 23, 0.08)" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(value: number) => formatCompactCurrency(value)}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        tickLine={false}
                        axisLine={false}
                        width={128}
                      />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Bar
                        dataKey="targetAmount"
                        name="Target"
                        radius={[0, 12, 12, 0]}
                        fill="#d4a562"
                      />
                      <Bar
                        dataKey="raisedAmount"
                        name="Raised"
                        radius={[0, 12, 12, 0]}
                        fill="#1a5131"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[24px] bg-white/70 text-sm text-ink-600">
                    Category performance will appear once filtered goals exist.
                  </div>
                )}
              </div>
            </div>

            <div className="surface-panel p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="eyebrow bg-forest-50 text-forest-700">
                    <Layers3 className="h-4 w-4" />
                    Category Mix
                  </span>
                  <h2 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-ink-900">
                    Target share by category
                  </h2>
                </div>
                <div className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-cream-50">
                  {analytics.categoryBreakdown.length} categories
                </div>
              </div>

              <div className="mt-8 h-[280px]">
                {categoryShareData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryShareData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={68}
                        outerRadius={108}
                        paddingAngle={4}
                      >
                        {categoryShareData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={chartPalette[index % chartPalette.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[24px] bg-white/70 text-sm text-ink-600">
                    Category mix will appear once goals are available for the selected filters.
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-[24px] bg-ink-900 p-5 text-cream-50">
                <p className="text-xs uppercase tracking-[0.2em] text-cream-100/60">
                  Status split in scope
                </p>
                {statusDistribution.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {statusDistribution.map((entry) => (
                      <div
                        key={entry.name}
                        className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                      >
                        {entry.name}: {entry.value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-cream-100/78">
                    There are no goals inside the current filter scope yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 surface-panel p-8">
            <SectionHeading
              eyebrow="Category Stats"
              title="A breakdown for every category in the selected scope."
              description="Each category card shows how much was targeted, what has been raised, and how much work is still left."
            />

            {analytics.categoryBreakdown.length > 0 ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {analytics.categoryBreakdown.map((entry, index) => (
                  <article key={entry.category} className="rounded-[24px] bg-white/78 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">
                        {entry.category}
                      </h3>
                      <span
                        className="inline-flex h-10 w-10 rounded-full"
                        style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                      />
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-ink-600">
                      <p>
                        Target: <span className="font-semibold text-ink-900">{formatCurrency(entry.targetAmount)}</span>
                      </p>
                      <p>
                        Raised: <span className="font-semibold text-ink-900">{formatCurrency(entry.raisedAmount)}</span>
                      </p>
                      <p>
                        Left: <span className="font-semibold text-ink-900">{formatCurrency(entry.remainingAmount)}</span>
                      </p>
                      <p>
                        Goals: <span className="font-semibold text-ink-900">{entry.totalGoals}</span>
                      </p>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-ink-500">
                        <span>Completion</span>
                        <span>{entry.completionRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-ink-900/10">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, entry.completionRate)}%`,
                            backgroundColor: chartPalette[index % chartPalette.length],
                          }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[24px] bg-white/70 p-6 text-sm leading-7 text-ink-600">
                No category stats are available for the selected year and month.
              </div>
            )}
          </div>

          <div className="mt-6 surface-panel p-8">
            <SectionHeading
              eyebrow="Goals In Scope"
              title="The actual records behind the graphs."
              description="This keeps the charts grounded by showing the goal entries included in the current filter selection."
            />

            {isLoading ? (
              <div className="mt-8 rounded-[24px] bg-white/70 p-6 text-sm text-ink-600">
                Loading goal analytics...
              </div>
            ) : filteredGoals.length > 0 ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {filteredGoals.map((goal) => (
                  <MonthlyGoalCard key={goal.id} goal={goal} showMonthLabel />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[24px] bg-white/70 p-6 text-sm leading-7 text-ink-600">
                There are no goals for the selected filters yet. Try another year or month, or add
                more records from the goals page.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
