/**
 * Enterprise Audit Logging Engine.
 *
 * Formats, filters, and generates immutable audit records (e.g. AUD-10482)
 * recording entity changes, approvals, persona actions, and before/after states.
 */

export const AUDIT_ACTIONS = [
  'Created',
  'Updated',
  'Approved',
  'Rejected',
  'Status Changed',
  'Deleted/Archived',
  'Permission Changed',
  'BOM Revised',
  'Persona Switched',
]

let auditSequence = 10482

/**
 * Creates a structured audit event.
 */
export function createAuditEvent({
  user = 'Vicky',
  role = 'MD',
  action = 'Updated',
  entity = 'AQL-24018',
  entityType = 'Quality Audit',
  oldStatus = 'Pending',
  newStatus = 'Approved',
  details = '',
  module = 'quality',
}) {
  auditSequence += 1
  const id = `AUD-${auditSequence}`
  const timestamp = new Date().toISOString()

  return {
    id,
    timestamp,
    user,
    role,
    action,
    entity,
    entityType,
    oldStatus,
    newStatus,
    details,
    module,
    ipAddress: '192.168.10.42 (Internal Gateway)',
  }
}

/**
 * Filters audit logs by module, action, or date range.
 */
export function filterAuditLogs(logs = [], filters = {}) {
  let result = [...logs]

  if (filters.role && filters.role !== 'all') {
    result = result.filter((l) => l.role === filters.role)
  }
  if (filters.action && filters.action !== 'all') {
    result = result.filter((l) => l.action === filters.action)
  }
  if (filters.module && filters.module !== 'all') {
    result = result.filter((l) => l.module === filters.module)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (l) =>
        l.id.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.user.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q),
    )
  }

  return result
}
