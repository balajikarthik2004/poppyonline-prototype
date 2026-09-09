import { format, formatDistanceToNow } from 'date-fns'

const numberFormatter = new Intl.NumberFormat('en-IN')
const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const usdCompactFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 1,
  notation: 'compact',
})
const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  notation: 'compact',
})

export function formatNumber(value) {
  return numberFormatter.format(value)
}

export function formatKg(value) {
  return `${numberFormatter.format(Math.round(value))} kg`
}

/** Garment volumes are counted in pieces everywhere in this business. */
export function formatPcs(value) {
  return `${numberFormatter.format(Math.round(value))} pcs`
}

export function formatPct(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`
}

export function formatUsd(value) {
  return usdFormatter.format(value)
}

export function formatUsdCompact(value) {
  return usdCompactFormatter.format(value)
}

export function formatInrCompact(value) {
  return inrCompactFormatter.format(value)
}

export function formatDate(iso, pattern = 'dd MMM yyyy') {
  return format(new Date(iso), pattern)
}

export function formatDateTime(iso) {
  return format(new Date(iso), 'dd MMM yyyy, h:mm a')
}

export function formatRelative(iso) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

/** Compact relative time ("5m ago", "3h ago", "2d ago") for dense list rows. */
export function formatRelativeShort(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

/** Days until an ISO date; negative when the date has already passed. */
export function daysUntil(iso) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}
