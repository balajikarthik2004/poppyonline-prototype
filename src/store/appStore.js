import { create } from 'zustand'
import { PERSONAS, personaByKey } from '@/lib/admin/roleLogic'
import { checkPermission } from '@/lib/admin/permissionLogic'

/**
 * Global application store with active Persona and local RBAC evaluation layer.
 */
export const useAppStore = create((set, get) => ({
  unitId: 'all',
  dateRangePreset: '7d',
  userRole: 'MD',
  setUnitId: (unitId) => set({ unitId }),
  setDateRangePreset: (dateRangePreset) => set({ dateRangePreset }),
  setUserRole: (userRole) => set({ userRole }),
  
  /** Evaluates whether the currently active persona can perform action on a module */
  canAccess: (moduleKey, action = 'view') => {
    const role = get().userRole
    return checkPermission(role, moduleKey, action)
  },

  getCurrentPersona: () => {
    const role = get().userRole
    return personaByKey.get(role) || PERSONAS[0]
  },
}))

export const userRoleTitles = {
  MD: 'Managing Director',
  GM: 'General Manager - Operations',
  Merchandiser: 'Senior Merchandiser',
  QA: 'Quality Assurance Lead',
  Planner: 'Production Planner',
  Maintenance: 'Maintenance Head',
}
