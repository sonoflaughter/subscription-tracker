import {
  type Subscription,
  subscriptionsData,
  type MonthlySpending,
  monthlySpendingData,
  type CategoryData,
  categoryColors,
  type PaymentMethod,
  paymentMethodsData,
  type YearlyComparison,
  yearlyComparisonData,
} from "./data"

import {
  sanitizeText,
  sanitizeUrl,
  isValidName,
  isValidColorHex,
  generateSafeRandomColor,
  isValidNumber,
  isValidDateString,
} from "./security"

// Store for recently deleted subscriptions (for undo functionality)
interface DeletedSubscription {
  subscription: Subscription
  timestamp: number
  timeoutId: NodeJS.Timeout
}

const recentlyDeletedSubscriptions: Map<number, DeletedSubscription> = new Map()

// Helper function to safely parse numbers
const safeNumber = (value: any): number => {
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

// Helper function to ensure text values have defaults
const safeText = (value: any, defaultValue = "Not specified"): string => {
  return sanitizeText(value) || defaultValue
}

// Helper to generate a unique ID
const generateId = (): number => {
  const maxId = subscriptionsData.reduce((max, sub) => Math.max(max, sub.id), 0)
  return maxId + 1
}

// Helper to safely parse a date
const safeParseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch (e) {
    return null
  }
}

// Sort subscriptions by next billing date
const sortSubscriptionsByDate = (subscriptions: Subscription[]): Subscription[] => {
  return [...subscriptions].sort((a, b) => {
    const dateA = safeParseDate(a.nextBillingDate)
    const dateB = safeParseDate(b.nextBillingDate)

    // Handle invalid dates
    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1

    return dateA.getTime() - dateB.getTime()
  })
}

// Get all subscriptions
export const getAllSubscriptions = (): Subscription[] => {
  return sortSubscriptionsByDate([...subscriptionsData])
}

// Get subscriptions by category
export const getSubscriptionsByCategory = (): Record<string, Subscription[]> => {
  // Start with an empty result containing at least the common categories
  const result: Record<string, Subscription[]> = {
    Entertainment: [],
    Productivity: [],
    Shopping: [],
    Music: [],
    Utilities: [],
    Other: [],
  }

  // Add subscriptions to their categories
  subscriptionsData.forEach((subscription) => {
    const category = sanitizeText(subscription.category) || "Other"
    if (!result[category]) {
      result[category] = []
    }
    result[category].push(subscription)
  })

  // Sort each category by date
  Object.keys(result).forEach((key) => {
    result[key] = sortSubscriptionsByDate(result[key])
  })

  // Remove empty categories to avoid clutter
  Object.keys(result).forEach((key) => {
    if (result[key].length === 0) {
      delete result[key]
    }
  })

  return result
}

// Get subscription by ID
export const getSubscriptionById = (id: number): Subscription | undefined => {
  return subscriptionsData.find((sub) => sub.id === id)
}

// Add a new subscription with security validation
export const addSubscription = (subscription: Omit<Subscription, "id" | "createdAt">): Subscription => {
  // Validate and sanitize all fields
  const sanitizedName = sanitizeText(subscription.name)
  if (!sanitizedName || !isValidName(sanitizedName)) {
    throw new Error("Invalid subscription name")
  }

  const price = safeNumber(subscription.price)
  if (!isValidNumber(price, 0, 10000)) {
    throw new Error("Invalid price amount")
  }

  const sanitizedCategory = sanitizeText(subscription.category) || "Other"

  // Validate billing cycle is one of the allowed values
  const validBillingCycles = ["Monthly", "Quarterly", "Biannually", "Annually"]
  const billingCycle = validBillingCycles.includes(subscription.billingCycle) ? subscription.billingCycle : "Monthly"

  // Validate date format
  if (!subscription.nextBillingDate || !isValidDateString(subscription.nextBillingDate)) {
    throw new Error("Invalid billing date")
  }

  // Sanitize logo URL
  const logo = sanitizeUrl(subscription.logo) || "/placeholder.svg?height=40&width=40"

  // Validate color or generate a safe one
  const color = isValidColorHex(subscription.color) ? subscription.color : generateSafeRandomColor()

  // Add current date as createdAt
  const today = new Date()
  const createdAt = today.toISOString().split("T")[0]

  const newSubscription = {
    id: generateId(),
    name: sanitizedName,
    category: sanitizedCategory,
    price,
    billingCycle,
    nextBillingDate: subscription.nextBillingDate,
    logo,
    color,
    createdAt,
  }

  subscriptionsData.push(newSubscription)
  return newSubscription
}

// Update an existing subscription with security validation
export const updateSubscription = (updatedSubscription: Subscription): Subscription => {
  const index = subscriptionsData.findIndex((sub) => sub.id === updatedSubscription.id)

  if (index !== -1) {
    // Validate and sanitize all fields
    const sanitizedName = sanitizeText(updatedSubscription.name)
    if (!sanitizedName || !isValidName(sanitizedName)) {
      throw new Error("Invalid subscription name")
    }

    const price = safeNumber(updatedSubscription.price)
    if (!isValidNumber(price, 0, 10000)) {
      throw new Error("Invalid price amount")
    }

    const sanitizedCategory = sanitizeText(updatedSubscription.category) || "Other"

    // Validate billing cycle is one of the allowed values
    const validBillingCycles = ["Monthly", "Quarterly", "Biannually", "Annually"]
    const billingCycle = validBillingCycles.includes(updatedSubscription.billingCycle)
      ? updatedSubscription.billingCycle
      : "Monthly"

    // Validate date format
    if (!updatedSubscription.nextBillingDate || !isValidDateString(updatedSubscription.nextBillingDate)) {
      throw new Error("Invalid billing date")
    }

    // Sanitize logo URL
    const logo = sanitizeUrl(updatedSubscription.logo) || "/placeholder.svg?height=40&width=40"

    // Validate color or use existing one
    const color = isValidColorHex(updatedSubscription.color)
      ? updatedSubscription.color
      : subscriptionsData[index].color

    const sanitizedSubscription = {
      ...updatedSubscription,
      name: sanitizedName,
      category: sanitizedCategory,
      price,
      billingCycle,
      logo,
      color,
    }

    subscriptionsData[index] = sanitizedSubscription
    return sanitizedSubscription
  }

  throw new Error(`Subscription with ID ${updatedSubscription.id} not found`)
}

// Delete a subscription with undo capability
export const deleteSubscription = (id: number): boolean => {
  const index = subscriptionsData.findIndex((sub) => sub.id === id)

  if (index !== -1) {
    // Store the subscription for potential undo
    const deletedSubscription = subscriptionsData[index]

    // Remove any existing timeout for this ID (in case of multiple deletes)
    if (recentlyDeletedSubscriptions.has(id)) {
      clearTimeout(recentlyDeletedSubscriptions.get(id)!.timeoutId)
    }

    // Set a timeout to permanently delete after 10 seconds
    const timeoutId = setTimeout(() => {
      recentlyDeletedSubscriptions.delete(id)
    }, 10000) // 10 seconds

    // Store the deleted subscription with its timeout
    recentlyDeletedSubscriptions.set(id, {
      subscription: deletedSubscription,
      timestamp: Date.now(),
      timeoutId,
    })

    // Remove from the active subscriptions
    subscriptionsData.splice(index, 1)
    return true
  }

  return false
}

// Undo a recent deletion
export const undoDelete = (id: number): boolean => {
  const deletedItem = recentlyDeletedSubscriptions.get(id)

  if (deletedItem) {
    // Clear the timeout
    clearTimeout(deletedItem.timeoutId)

    // Add the subscription back to the active list
    subscriptionsData.push(deletedItem.subscription)

    // Remove from the deleted items map
    recentlyDeletedSubscriptions.delete(id)

    return true
  }

  return false
}

// Calculate total monthly cost
export const getTotalMonthlyCost = (): number => {
  return subscriptionsData.reduce((total, sub) => total + safeNumber(sub.price), 0)
}

// Get upcoming payments (next 7 days)
export const getUpcomingPayments = (): Subscription[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time component for accurate date comparison

  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  return subscriptionsData
    .filter((sub) => {
      try {
        const billingDate = new Date(sub.nextBillingDate)
        billingDate.setHours(0, 0, 0, 0) // Reset time component

        // Include today and the next 7 days
        return billingDate >= today && billingDate <= nextWeek
      } catch (e) {
        // Skip invalid dates
        return false
      }
    })
    .sort((a, b) => {
      try {
        return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
      } catch (e) {
        return 0
      }
    })
}

// Get monthly spending data for charts
export const getMonthlySpendingData = (): MonthlySpending[] => {
  return [...monthlySpendingData]
}

// Get category spending data for charts
export const getCategorySpendingData = (): CategoryData[] => {
  const categorySpending: Record<string, number> = {}

  subscriptionsData.forEach((sub) => {
    const category = sanitizeText(sub.category) || "Other"
    if (!categorySpending[category]) {
      categorySpending[category] = 0
    }
    categorySpending[category] += safeNumber(sub.price)
  })

  const result = Object.entries(categorySpending).map(([name, value]) => ({
    name: sanitizeText(name),
    value,
    color: categoryColors[name] || categoryColors.Other,
  }))

  // If no data, return a placeholder to prevent empty charts
  if (result.length === 0) {
    return [
      {
        name: "No Data",
        value: 100,
        color: categoryColors.Other,
      },
    ]
  }

  return result
}

// Get subscription spending data for charts
export const getSubscriptionSpendingData = (): CategoryData[] => {
  const result = subscriptionsData.map((sub) => ({
    name: sanitizeText(sub.name) || "Unknown",
    value: safeNumber(sub.price),
    color: isValidColorHex(sub.color) ? sub.color : categoryColors.Other,
  }))

  // If no data, return a placeholder to prevent empty charts
  if (result.length === 0) {
    return [
      {
        name: "No Subscriptions",
        value: 100,
        color: categoryColors.Other,
      },
    ]
  }

  return result
}

// Get payment methods
export const getPaymentMethods = (): PaymentMethod[] => {
  return [...paymentMethodsData]
}

// Get yearly comparison data
export const getYearlyComparison = (): YearlyComparison => {
  return { ...yearlyComparisonData }
}

// Get average monthly cost
export const getAverageMonthlySpending = (): number => {
  const total = monthlySpendingData.reduce((sum, month) => sum + safeNumber(month.amount), 0)
  return monthlySpendingData.length > 0 ? total / monthlySpendingData.length : 0
}

// Format date for display
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch (e) {
    return "Invalid date"
  }
}

// Format relative time for display
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ""
    }

    // Reset hours to compare just the dates
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Calculate difference in days
    const diffTime = dateWithoutTime.getTime() - nowWithoutTime.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "today"
    } else if (diffDays === 1) {
      return "tomorrow"
    } else if (diffDays === -1) {
      return "yesterday"
    } else if (diffDays > 0) {
      return `in ${diffDays} days`
    } else {
      return `${Math.abs(diffDays)} days ago`
    }
  } catch (e) {
    return ""
  }
}

// Add a function to check if we have enough data for charts
export const hasEnoughDataForCharts = (): boolean => {
  return subscriptionsData.length > 0 && monthlySpendingData.length > 0
}

