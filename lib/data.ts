// Mock data for the subscription tracker application

// Subscription data
export interface Subscription {
  id: number
  name: string
  category: string
  price: number
  billingCycle: "Monthly" | "Quarterly" | "Biannually" | "Annually"
  nextBillingDate: string
  logo: string
  color: string
  createdAt: string // Add creation date to track when subscriptions were added
}

export const subscriptionsData: Subscription[] = [
  {
    id: 1,
    name: "Netflix",
    category: "Entertainment",
    price: 15.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-15",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#E50914",
    createdAt: "2025-01-15", // Added 3 months ago
  },
  {
    id: 2,
    name: "Spotify",
    category: "Music",
    price: 9.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-10",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#1DB954",
    createdAt: "2025-02-10", // Added 2 months ago
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    category: "Productivity",
    price: 52.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-22",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#FF0000",
    createdAt: "2025-01-22", // Added 3 months ago
  },
  {
    id: 4,
    name: "Amazon Prime",
    category: "Shopping",
    price: 14.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-05",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#FF9900",
    createdAt: "2024-12-05", // Added 4 months ago
  },
  {
    id: 5,
    name: "Disney+",
    category: "Entertainment",
    price: 7.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-18",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#0063e5",
    createdAt: "2025-03-18", // Added last month
  },
  {
    id: 6,
    name: "iCloud",
    category: "Utilities",
    price: 2.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-12",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#147EFB",
    createdAt: "2024-11-12", // Added 5 months ago
  },
  {
    id: 7,
    name: "YouTube Premium",
    category: "Entertainment",
    price: 11.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-08",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#FF0000",
    createdAt: "2025-03-08", // Added last month
  },
  {
    id: 8,
    name: "HBO Max",
    category: "Entertainment",
    price: 14.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-25",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#5822B4",
    createdAt: "2025-03-25", // Added last month
  },
  {
    id: 9,
    name: "Microsoft 365",
    category: "Productivity",
    price: 9.99,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-17",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#0078D4",
    createdAt: "2025-02-17", // Added 2 months ago
  },
  {
    id: 10,
    name: "Notion",
    category: "Productivity",
    price: 8.0,
    billingCycle: "Monthly",
    nextBillingDate: "2025-04-20",
    logo: "/placeholder.svg?height=40&width=40",
    color: "#000000",
    createdAt: "2025-03-20", // Added last month
  },
]

// Monthly spending data
export interface MonthlySpending {
  month: string
  amount: number
}

export const monthlySpendingData: MonthlySpending[] = [
  { month: "Jan", amount: 120.97 },
  { month: "Feb", amount: 125.97 },
  { month: "Mar", amount: 125.97 },
  { month: "Apr", amount: 135.96 },
  { month: "May", amount: 135.96 },
  { month: "Jun", amount: 145.95 },
  { month: "Jul", amount: 145.95 },
  { month: "Aug", amount: 145.95 },
  { month: "Sep", amount: 155.94 },
  { month: "Oct", amount: 155.94 },
  { month: "Nov", amount: 155.94 },
  { month: "Dec", amount: 155.94 },
]

// Category data for analytics
export interface CategoryData {
  name: string
  value: number
  color: string
}

export const categoryColors: Record<string, string> = {
  Entertainment: "#0ea5e9",
  Productivity: "#f97316",
  Shopping: "#8b5cf6",
  Music: "#10b981",
  Utilities: "#f43f5e",
  Other: "#94a3b8",
}

// Payment method data
export interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

export const paymentMethodsData: PaymentMethod[] = [
  {
    id: "pm_1",
    type: "Visa",
    last4: "4242",
    expiryMonth: 4,
    expiryYear: 28,
    isDefault: true,
  },
]

// Analytics data
export interface YearlyComparison {
  currentYear: number
  previousYear: number
  percentageChange: number
}

export const yearlyComparisonData: YearlyComparison = {
  currentYear: 1705.44,
  previousYear: 1200,
  percentageChange: 29,
}

// Add the safeNumber utility function
export const safeNumber = (value: any): number => {
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

// Add the safeText utility function
export const safeText = (value: any, defaultValue = "Not specified"): string => {
  return value ? String(value) : defaultValue
}

