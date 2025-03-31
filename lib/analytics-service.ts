import { getAllSubscriptions } from "./subscription-service"
import { sanitizeText } from "./security"

// Material Design color palette - good contrast on white backgrounds
export const chartColors = [
  "#2196F3", // Blue
  "#F44336", // Red
  "#4CAF50", // Green
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#00BCD4", // Cyan
  "#3F51B5", // Indigo
  "#E91E63", // Pink
  "#FFC107", // Amber
  "#009688", // Teal
  "#673AB7", // Deep Purple
  "#607D8B", // Blue Grey
]

// Category color mapping - using consistent Material Design colors
export const categoryColors: Record<string, string> = {
  Entertainment: chartColors[0], // Blue
  Productivity: chartColors[4], // Orange
  Shopping: chartColors[3], // Purple
  Music: chartColors[2], // Green
  Utilities: chartColors[1], // Red
  Other: chartColors[11], // Blue Grey
}

// Data types for analytics
export interface ChartDataPoint {
  name: string
  value: number
  color: string
  category: string
}

export interface MonthlyDataPoint {
  month: string
  amount: number
}

export interface CategoryMonthlyDataPoint {
  month: string
  total: number
  [key: string]: number | string // For category amounts
}

export interface YearlyComparison {
  currentYear: number
  previousYear: number
  percentageChange: number
}

// Helper function to safely parse numbers
const safeNumber = (value: any): number => {
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

// Helper to get the start of the current month
const getStartOfCurrentMonth = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// Helper to get the start of the previous month
const getStartOfPreviousMonth = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, 1)
}

// Helper to get the end of the previous month
const getEndOfPreviousMonth = (): Date => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 0)
}

// Get monthly spending data for the area chart - using real subscription data
export const getMonthlySpendingData = (): MonthlyDataPoint[] => {
  const subscriptions = getAllSubscriptions()

  // Get the current date
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Generate last 12 months of data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Create data for the last 12 months
  return Array.from({ length: 12 })
    .map((_, index) => {
      // Calculate the month and year for this data point (going back from current month)
      const monthIndex = (currentMonth - index + 12) % 12
      const yearOffset = currentMonth - index < 0 ? -1 : 0
      const dataPointYear = currentYear + yearOffset
      const monthName = months[monthIndex]

      // Calculate the start and end of this month
      const startOfMonth = new Date(dataPointYear, monthIndex, 1)
      const endOfMonth = new Date(dataPointYear, monthIndex + 1, 0)

      // Filter subscriptions that existed during this month
      const relevantSubscriptions = subscriptions.filter((sub) => {
        const createdAt = new Date(sub.createdAt)
        return createdAt <= endOfMonth
      })

      // Calculate the total amount for this month
      const amount = relevantSubscriptions.reduce((total, sub) => total + safeNumber(sub.price), 0)

      return {
        month: monthName,
        amount: Number.parseFloat(amount.toFixed(2)),
      }
    })
    .reverse() // Reverse to show oldest to newest
}

// Get monthly spending data broken down by category - using real subscription data
export const getCategoryMonthlyData = (): CategoryMonthlyDataPoint[] => {
  const subscriptions = getAllSubscriptions()

  // Get the current date
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Get all unique categories
  const categories = Array.from(new Set(subscriptions.map((sub) => sub.category || "Other")))

  // Generate data for the last 12 months
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return Array.from({ length: 12 })
    .map((_, index) => {
      // Calculate the month and year for this data point (going back from current month)
      const monthIndex = (currentMonth - index + 12) % 12
      const yearOffset = currentMonth - index < 0 ? -1 : 0
      const dataPointYear = currentYear + yearOffset
      const monthName = months[monthIndex]

      // Calculate the start and end of this month
      const startOfMonth = new Date(dataPointYear, monthIndex, 1)
      const endOfMonth = new Date(dataPointYear, monthIndex + 1, 0)

      // Start with the month name and initialize total
      const monthData: CategoryMonthlyDataPoint = {
        month: monthName,
        total: 0,
      }

      // Add data for each category
      categories.forEach((category) => {
        // Filter subscriptions in this category that existed during this month
        const categorySubscriptions = subscriptions.filter((sub) => {
          const createdAt = new Date(sub.createdAt)
          return (sub.category || "Other") === category && createdAt <= endOfMonth
        })

        // Calculate total for this category
        const categoryTotal = categorySubscriptions.reduce((total, sub) => total + safeNumber(sub.price), 0)

        // Add to the month data
        monthData[category] = categoryTotal
        monthData.total += categoryTotal
      })

      return monthData
    })
    .reverse() // Reverse to show oldest to newest
}

// Get all unique categories with their colors
export const getCategoryColors = (): { category: string; color: string }[] => {
  const subscriptions = getAllSubscriptions()

  // Get all unique categories
  const categories = Array.from(new Set(subscriptions.map((sub) => sub.category || "Other")))

  // Map categories to colors
  return categories.map((category, index) => ({
    category,
    color: categoryColors[category] || chartColors[index % chartColors.length],
  }))
}

// Get category spending data for pie and bar charts - using real subscription data
export const getCategorySpendingData = (): ChartDataPoint[] => {
  const subscriptions = getAllSubscriptions()
  const categorySpending: Record<string, number> = {}

  // Calculate total spending by category
  subscriptions.forEach((sub) => {
    const category = sanitizeText(sub.category) || "Other"
    if (!categorySpending[category]) {
      categorySpending[category] = 0
    }
    categorySpending[category] += safeNumber(sub.price)
  })

  // Convert to chart data format
  const result = Object.entries(categorySpending).map(([name, value], index) => ({
    name: sanitizeText(name),
    value: Number.parseFloat(value.toFixed(2)),
    color: categoryColors[name] || chartColors[index % chartColors.length],
    category: name,
  }))

  // If no data, return a placeholder
  if (result.length === 0) {
    return [
      {
        name: "No Data",
        value: 100,
        color: categoryColors.Other,
        category: "Other",
      },
    ]
  }

  return result
}

// Get subscription spending data for charts - using real subscription data
export const getSubscriptionSpendingData = (): ChartDataPoint[] => {
  const subscriptions = getAllSubscriptions()

  // Convert to chart data format with consistent colors based on category
  const result = subscriptions.map((sub) => {
    const category = sub.category || "Other"

    // Use the category's color for consistency
    const color =
      categoryColors[category] ||
      // If category doesn't have a predefined color, assign one consistently
      chartColors[Object.keys(categoryColors).indexOf(category) % chartColors.length]

    return {
      name: sanitizeText(sub.name) || "Unknown",
      value: Number.parseFloat(safeNumber(sub.price).toFixed(2)),
      color: color,
      category: category,
    }
  })

  // If no data, return a placeholder
  if (result.length === 0) {
    return [
      {
        name: "No Subscriptions",
        value: 100,
        color: categoryColors.Other,
        category: "Other",
      },
    ]
  }

  return result
}

// Get yearly comparison data - using real subscription data
export const getYearlyComparison = (): YearlyComparison => {
  const subscriptions = getAllSubscriptions()

  // Get the current date
  const now = new Date()
  const currentYear = now.getFullYear()
  const previousYear = currentYear - 1

  // Filter subscriptions for current year and previous year
  const currentYearSubscriptions = subscriptions.filter((sub) => {
    const createdAt = new Date(sub.createdAt)
    return createdAt.getFullYear() <= currentYear
  })

  const previousYearSubscriptions = subscriptions.filter((sub) => {
    const createdAt = new Date(sub.createdAt)
    return createdAt.getFullYear() <= previousYear
  })

  // Calculate yearly totals
  const currentYearTotal = currentYearSubscriptions.reduce((total, sub) => total + safeNumber(sub.price), 0) * 12
  const previousYearTotal = previousYearSubscriptions.reduce((total, sub) => total + safeNumber(sub.price), 0) * 12

  // Calculate percentage change
  const percentageChange =
    previousYearTotal > 0 ? Math.round(((currentYearTotal - previousYearTotal) / previousYearTotal) * 100) : 0

  return {
    currentYear: Number.parseFloat(currentYearTotal.toFixed(2)),
    previousYear: Number.parseFloat(previousYearTotal.toFixed(2)),
    percentageChange,
  }
}

// Get average monthly spending - using real subscription data
export const getAverageMonthlySpending = (): number => {
  const subscriptions = getAllSubscriptions()
  const total = subscriptions.reduce((total, sub) => total + safeNumber(sub.price), 0)
  return Number.parseFloat(total.toFixed(2))
}

// Get previous month's spending based on subscriptions that existed then
export const getPreviousMonthSpending = (): number => {
  const subscriptions = getAllSubscriptions()
  const endOfPreviousMonth = getEndOfPreviousMonth()

  // Filter subscriptions that existed at the end of the previous month
  const previousMonthSubscriptions = subscriptions.filter((sub) => {
    const createdAt = new Date(sub.createdAt)
    return createdAt <= endOfPreviousMonth
  })

  // Calculate total for previous month
  const previousMonthTotal = previousMonthSubscriptions.reduce((total, sub) => total + safeNumber(sub.price), 0)

  return Number.parseFloat(previousMonthTotal.toFixed(2))
}

// Get the difference between current and previous month spending
export const getMonthlySpendingDifference = (): {
  current: number
  previous: number
  difference: number
  isIncrease: boolean
  newSubscriptions: number
} => {
  const current = getAverageMonthlySpending()
  const previous = getPreviousMonthSpending()
  const difference = Number.parseFloat((current - previous).toFixed(2))

  // Count new subscriptions added this month
  const subscriptions = getAllSubscriptions()
  const startOfCurrentMonth = getStartOfCurrentMonth()

  const newSubscriptionsThisMonth = subscriptions.filter((sub) => {
    const createdAt = new Date(sub.createdAt)
    return createdAt >= startOfCurrentMonth
  }).length

  return {
    current,
    previous,
    difference: Math.abs(difference),
    isIncrease: difference > 0,
    newSubscriptions: newSubscriptionsThisMonth,
  }
}

// Check if we have enough data for charts
export const hasEnoughDataForCharts = (): boolean => {
  return getAllSubscriptions().length > 0
}

