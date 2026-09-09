import { endOfDay, startOfDay, startOfMonth, subDays } from 'date-fns'

export function resolveDateRange(preset, anchor = new Date()) {
  const to = endOfDay(anchor).toISOString()
  let from
  switch (preset) {
    case 'today':
      from = startOfDay(anchor)
      break
    case '30d':
      from = startOfDay(subDays(anchor, 29))
      break
    case 'thisMonth':
      from = startOfMonth(anchor)
      break
    case '7d':
    default:
      from = startOfDay(subDays(anchor, 6))
      break
  }
  return { preset, from: from.toISOString(), to }
}

export const dateRangeLabels = {
  today: 'Today',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  thisMonth: 'This Month',
}

export const dateRangePresets = ['today', '7d', '30d', 'thisMonth']

/** How many days of history a preset covers - drives mock series slicing. */
export const dateRangeDays = {
  today: 1,
  '7d': 7,
  '30d': 30,
  thisMonth: new Date().getDate(),
}
