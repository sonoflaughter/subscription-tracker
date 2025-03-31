/**
 * Security utilities to prevent XSS attacks
 */

// Sanitize text input to prevent XSS attacks
export function sanitizeText(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ""
  }

  // Convert to string in case a number or other type is passed
  const text = String(input)

  // Replace potentially dangerous HTML characters with their entity equivalents
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// Sanitize a URL to prevent javascript: protocol and other potentially malicious URLs
export function sanitizeUrl(url: string | null | undefined): string {
  if (url === null || url === undefined) {
    return ""
  }

  const sanitized = String(url).trim().toLowerCase()

  // Check for potentially dangerous protocols
  if (sanitized.startsWith("javascript:") || sanitized.startsWith("data:") || sanitized.startsWith("vbscript:")) {
    return ""
  }

  return url
}

// Validate that a string contains only alphanumeric characters, spaces, and basic punctuation
export function isValidName(name: string): boolean {
  // Allow letters, numbers, spaces, and common punctuation
  const validNameRegex = /^[a-zA-Z0-9\s.,&+\-_()]+$/
  return validNameRegex.test(name)
}

// Validate that a string is a valid color hex code
export function isValidColorHex(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexColorRegex.test(color)
}

// Generate a safe random color (for new subscriptions)
export function generateSafeRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`
}

// Validate a number is within a safe range
export function isValidNumber(value: number, min = 0, max = 1000000): boolean {
  return !isNaN(value) && value >= min && value <= max
}

// Safely parse a number with validation
export function safeParseNumber(value: string, defaultValue = 0): number {
  const parsed = Number.parseFloat(value)
  return !isNaN(parsed) ? parsed : defaultValue
}

// Validate a date string is in YYYY-MM-DD format
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

