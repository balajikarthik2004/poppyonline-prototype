import { create } from 'zustand'

/**
 * Global filters. The unit selector and date-range selector in the header
 * genuinely flow through the service layer into every module.
 */
export const useAppStore = create((set) => ({
  unitId: 'all',
  dateRangePreset: '7d',
  userRole: 'MD',
  setUnitId: (unitId) => set({ unitId }),
  setDateRangePreset: (dateRangePreset) => set({ dateRangePreset }),
  setUserRole: (userRole) => set({ userRole }),
}))

export const userRoleTitles = {
  MD: 'Managing Director',
  GM: 'General Manager - Operations',
  Merchandiser: 'Senior Merchandiser',
  QA: 'Quality Assurance Head',
  Planner: 'Production Planner',
}
