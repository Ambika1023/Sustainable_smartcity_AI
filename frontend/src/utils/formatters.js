import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Format date to "Nov 5, 2024"
 */
export function formatDate(date) {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return 'N/A'
    return format(d, 'MMM d, yyyy')
  } catch {
    return 'N/A'
  }
}

/**
 * Format date to "Nov 5, 2024 at 2:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return 'N/A'
    return format(d, "MMM d, yyyy 'at' h:mm a")
  } catch {
    return 'N/A'
  }
}

/**
 * Format relative time: "2 hours ago"
 */
export function formatRelativeTime(date) {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(d)) return 'N/A'
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return 'N/A'
  }
}

/**
 * Format number with commas: 1234 → "1,234"
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return '0'
  return Number(n).toLocaleString()
}

/**
 * Format file size: bytes → "2.3 MB"
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Truncate text: "Some long text..."
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format complaint number: 42 → "CMP-2024-0042"
 */
export function formatComplaintNumber(complaint) {
  if (!complaint) return 'N/A'
  if (complaint.complaint_number) return complaint.complaint_number
  if (typeof complaint === 'string') return complaint
  const year = new Date().getFullYear()
  const num = String(complaint).padStart(4, '0')
  return `CMP-${year}-${num}`
}

/**
 * Get initials from full name
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format percentage
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '0%'
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Format duration in days
 */
export function formatDuration(days) {
  if (days === null || days === undefined) return 'N/A'
  if (days < 1) return `${Math.round(days * 24)}h`
  if (days === 1) return '1 day'
  return `${Number(days).toFixed(1)} days`
}
