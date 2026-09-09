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

/** Shared Recharts tooltip chrome so every chart reads as one system. */
export const chartTooltipStyle = {
  borderRadius: 12,
  boxShadow: '0 12px 28px -8px rgb(16 21 42 / 0.18)',
  border: '1px solid hsl(var(--border))',
  fontSize: 12,
  background: 'hsl(var(--popover))',
}

export const axisTick = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' }

export function colorAt(index) {
  return chartColors[index % chartColors.length]
}
