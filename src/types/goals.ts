export type GoalStatus = 'planned' | 'active' | 'at-risk' | 'completed'
export type GoalCategory = string

export interface MonthlyGoal {
  id: string
  title: string
  category: GoalCategory
  purpose: string
  targetAmount: number
  raisedAmount: number
  remainingAmount: number
  status: GoalStatus
  isTargetMet: boolean
  monthKey: string
  monthLabel: string
  year: number
  monthIndex: number
  createdAt?: string
}

export interface MonthlyGoalInput {
  title: string
  category: GoalCategory
  purpose: string
  targetAmount: number
  raisedAmount: number
  status: GoalStatus
  reportingMonth: string
}

export interface MonthlyGoalTrendPoint {
  monthKey: string
  label: string
  targetAmount: number
  raisedAmount: number
  remainingAmount: number
  completedGoals: number
  totalGoals: number
}

export interface YearlyGoalTrendPoint {
  year: string
  targetAmount: number
  raisedAmount: number
  remainingAmount: number
  completionRate: number
  totalGoals: number
}

export interface CategoryBreakdownPoint {
  category: GoalCategory
  targetAmount: number
  raisedAmount: number
  remainingAmount: number
  completionRate: number
  totalGoals: number
  completedGoals: number
}

export interface GoalsAnalytics {
  currentMonthKey: string
  currentMonthLabel: string
  currentMonthGoals: MonthlyGoal[]
  currentMonthTarget: number
  currentMonthRaised: number
  currentMonthRemaining: number
  currentYearTarget: number
  currentYearRaised: number
  currentYearRemaining: number
  totalGoalCount: number
  activeGoalCount: number
  completedGoalCount: number
  monthlyTrend: MonthlyGoalTrendPoint[]
  yearlyTrend: YearlyGoalTrendPoint[]
  categoryBreakdown: CategoryBreakdownPoint[]
}
