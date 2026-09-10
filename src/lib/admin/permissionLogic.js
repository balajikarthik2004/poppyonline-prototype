/**
 * Enterprise Role-Based Access Control (RBAC) Permission Matrix & Evaluator.
 *
 * Models View (V), Edit (E), Approve (A), and Audit (Au) across all 14 enterprise modules.
 */

export const ENTERPRISE_MODULES = [
  { key: 'dashboard', label: 'Executive Dashboard', path: '/' },
  { key: 'ai', label: 'Poppys AI Suite', path: '/ai' },
  { key: 'sales', label: 'Sales & Export Orders', path: '/sales/order-book' },
  { key: 'merch', label: 'Merchandising & Costing', path: '/merch/styles' },
  { key: 'planning', label: 'PPC & Capacity Planning', path: '/planning/capacity' },
  { key: 'procurement', label: 'Procurement & PR/PO', path: '/procurement' },
  { key: 'inventory', label: 'Inventory & Stores', path: '/inventory' },
  { key: 'production', label: '9-Stage Shop Floor', path: '/production' },
  { key: 'quality', label: 'Quality Assurance & AQL', path: '/quality' },
  { key: 'maintenance', label: 'TPM Asset Care & PM', path: '/maintenance' },
  { key: 'energy', label: 'Energy & ZLD Utilities', path: '/energy' },
  { key: 'compliance', label: 'Compliance & CSR', path: '/compliance' },
  { key: 'master', label: 'Master Data Governance', path: '/master/styles' },
  { key: 'admin', label: 'Enterprise Administration', path: '/admin' },
]

/**
 * Default permission matrix for the 6 standard personas.
 * Format: { [moduleKey]: { view: boolean, edit: boolean, approve: boolean, audit: boolean } }
 */
export const DEFAULT_PERMISSION_MATRIX = {
  MD: {
    dashboard: { view: true, edit: true, approve: true, audit: true },
    ai: { view: true, edit: true, approve: true, audit: true },
    sales: { view: true, edit: true, approve: true, audit: true },
    merch: { view: true, edit: true, approve: true, audit: true },
    planning: { view: true, edit: true, approve: true, audit: true },
    procurement: { view: true, edit: true, approve: true, audit: true },
    inventory: { view: true, edit: true, approve: true, audit: true },
    production: { view: true, edit: true, approve: true, audit: true },
    quality: { view: true, edit: true, approve: true, audit: true },
    maintenance: { view: true, edit: true, approve: true, audit: true },
    energy: { view: true, edit: true, approve: true, audit: true },
    compliance: { view: true, edit: true, approve: true, audit: true },
    master: { view: true, edit: true, approve: true, audit: true },
    admin: { view: true, edit: true, approve: true, audit: true },
  },
  GM: {
    dashboard: { view: true, edit: false, approve: true, audit: true },
    ai: { view: true, edit: true, approve: true, audit: true },
    sales: { view: true, edit: false, approve: true, audit: true },
    merch: { view: true, edit: false, approve: true, audit: true },
    planning: { view: true, edit: true, approve: true, audit: true },
    procurement: { view: true, edit: true, approve: true, audit: true },
    inventory: { view: true, edit: true, approve: true, audit: true },
    production: { view: true, edit: true, approve: true, audit: true },
    quality: { view: true, edit: true, approve: true, audit: true },
    maintenance: { view: true, edit: true, approve: true, audit: true },
    energy: { view: true, edit: true, approve: true, audit: true },
    compliance: { view: true, edit: true, approve: true, audit: true },
    master: { view: true, edit: true, approve: true, audit: true },
    admin: { view: true, edit: false, approve: false, audit: true },
  },
  Merchandiser: {
    dashboard: { view: true, edit: false, approve: false, audit: false },
    ai: { view: true, edit: true, approve: false, audit: false },
    sales: { view: true, edit: true, approve: true, audit: true },
    merch: { view: true, edit: true, approve: true, audit: true },
    planning: { view: true, edit: false, approve: false, audit: false },
    procurement: { view: true, edit: true, approve: false, audit: false },
    inventory: { view: true, edit: false, approve: false, audit: false },
    production: { view: true, edit: false, approve: false, audit: false },
    quality: { view: true, edit: false, approve: false, audit: false },
    maintenance: { view: false, edit: false, approve: false, audit: false },
    energy: { view: false, edit: false, approve: false, audit: false },
    compliance: { view: true, edit: false, approve: false, audit: false },
    master: { view: true, edit: true, approve: false, audit: true },
    admin: { view: false, edit: false, approve: false, audit: false },
  },
  QA: {
    dashboard: { view: true, edit: false, approve: false, audit: true },
    ai: { view: true, edit: false, approve: false, audit: false },
    sales: { view: true, edit: false, approve: false, audit: false },
    merch: { view: true, edit: false, approve: false, audit: false },
    planning: { view: true, edit: false, approve: false, audit: false },
    procurement: { view: true, edit: false, approve: false, audit: false },
    inventory: { view: true, edit: false, approve: false, audit: true },
    production: { view: true, edit: false, approve: false, audit: true },
    quality: { view: true, edit: true, approve: true, audit: true },
    maintenance: { view: true, edit: false, approve: false, audit: false },
    energy: { view: false, edit: false, approve: false, audit: false },
    compliance: { view: true, edit: true, approve: true, audit: true },
    master: { view: true, edit: true, approve: false, audit: true },
    admin: { view: false, edit: false, approve: false, audit: false },
  },
  Planner: {
    dashboard: { view: true, edit: false, approve: false, audit: false },
    ai: { view: true, edit: true, approve: false, audit: false },
    sales: { view: true, edit: false, approve: false, audit: false },
    merch: { view: true, edit: false, approve: false, audit: false },
    planning: { view: true, edit: true, approve: true, audit: true },
    procurement: { view: true, edit: true, approve: false, audit: false },
    inventory: { view: true, edit: true, approve: false, audit: false },
    production: { view: true, edit: true, approve: true, audit: true },
    quality: { view: true, edit: false, approve: false, audit: false },
    maintenance: { view: true, edit: false, approve: false, audit: false },
    energy: { view: false, edit: false, approve: false, audit: false },
    compliance: { view: false, edit: false, approve: false, audit: false },
    master: { view: true, edit: false, approve: false, audit: false },
    admin: { view: false, edit: false, approve: false, audit: false },
  },
  Maintenance: {
    dashboard: { view: true, edit: false, approve: false, audit: false },
    ai: { view: true, edit: false, approve: false, audit: false },
    sales: { view: false, edit: false, approve: false, audit: false },
    merch: { view: false, edit: false, approve: false, audit: false },
    planning: { view: true, edit: false, approve: false, audit: false },
    procurement: { view: true, edit: true, approve: false, audit: false },
    inventory: { view: true, edit: true, approve: false, audit: false },
    production: { view: true, edit: false, approve: false, audit: false },
    quality: { view: false, edit: false, approve: false, audit: false },
    maintenance: { view: true, edit: true, approve: true, audit: true },
    energy: { view: true, edit: true, approve: true, audit: true },
    compliance: { view: true, edit: false, approve: false, audit: false },
    master: { view: true, edit: false, approve: false, audit: false },
    admin: { view: false, edit: false, approve: false, audit: false },
  },
}

/**
 * Checks whether a given persona has permission for a specific module and action.
 * @param {string} role - MD, GM, Merchandiser, QA, Planner, Maintenance
 * @param {string} moduleKey - e.g. 'quality', 'master', 'planning'
 * @param {'view'|'edit'|'approve'|'audit'} action
 * @param {object} [customMatrix] - Optional customized matrix
 */
export function checkPermission(role, moduleKey, action = 'view', customMatrix = DEFAULT_PERMISSION_MATRIX) {
  const rolePermissions = customMatrix[role] || DEFAULT_PERMISSION_MATRIX[role] || DEFAULT_PERMISSION_MATRIX.MD
  const modulePerms = rolePermissions[moduleKey]
  if (!modulePerms) return false
  return Boolean(modulePerms[action])
}

/**
 * Returns summary stats of accessible modules for a given role.
 */
export function getRoleAccessSummary(role, matrix = DEFAULT_PERMISSION_MATRIX) {
  const rolePerms = matrix[role] || DEFAULT_PERMISSION_MATRIX[role] || {}
  const modules = Object.keys(rolePerms)
  const viewable = modules.filter((m) => rolePerms[m]?.view).length
  const editable = modules.filter((m) => rolePerms[m]?.edit).length
  const approvable = modules.filter((m) => rolePerms[m]?.approve).length
  const auditable = modules.filter((m) => rolePerms[m]?.audit).length

  return {
    totalModules: ENTERPRISE_MODULES.length,
    viewable,
    editable,
    approvable,
    auditable,
  }
}
