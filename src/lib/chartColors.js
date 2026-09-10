/**
 * One categorical ramp for the whole app, tuned to stay legible on the ivory
 * canvas. Charts never pick their own colours.
 */
export const chartColors = ['#3f52ab', '#d84a30', '#2f8f8a', '#8b5cb8', '#b8791a', '#2e7d4f']

export const chartMuted = '#aab3d6'

export const statusColors = {
  success: '#2e7d4f',
  warning: '#b8791a',
  danger: '#a92920',
  info: '#2b6cb0',
  brand: '#3f52ab',
  poppy: '#d84a30',
}

/** Shared Recharts tooltip chrome so every chart reads as one clean, highly legible system. */
export const chartTooltipStyle = {
  borderRadius: 10,
  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.22), 0 4px 6px -2px rgba(15, 23, 42, 0.08)',
  border: '1px solid #d8dcec',
  fontSize: 12,
  fontWeight: 500,
  backgroundColor: '#ffffff',
  background: '#ffffff',
  color: '#0f172a',
  padding: '8px 12px',
  opacity: 1,
  zIndex: 1000,
}


export const chartItemStyle = {
  color: '#0f172a',
  fontWeight: 600,
  fontSize: 12,
  padding: '2px 0',
}

export const chartLabelStyle = {
  color: '#475569',
  fontWeight: 600,
  fontSize: 11,
  marginBottom: 4,
}

export const axisTick = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }

export function colorAt(index) {
  return chartColors[index % chartColors.length]
}

