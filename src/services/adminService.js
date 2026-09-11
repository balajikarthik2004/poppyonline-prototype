/**
 * Enterprise Administration & RBAC Services.
 * Handles Persona switching, dynamic Permission Matrix, Immutable Audit Logs, and System Telemetry.
 */
import { simulateDelay } from './delay'
import { roles } from '@/mock/roles'
import { permissionModules, permissionMatrix } from '@/mock/permissions'
import { auditLogs } from '@/mock/auditLogs'
import { systemHealthMetrics } from '@/mock/systemHealth'
import { createAuditEvent, filterAuditLogs } from '@/lib/admin/auditLogic'
import { company, publishedCapacity } from '@/mock/company'
import { units } from '@/mock/units'

// Mutable in-memory permission state for live prototype role tweaking
let currentMatrix = JSON.parse(JSON.stringify(permissionMatrix))

export async function getRoles() {
  return simulateDelay(roles)
}

export async function getPermissionMatrix() {
  return simulateDelay({
    modules: permissionModules,
    matrix: currentMatrix,
  })
}

export async function updatePermission(role, moduleKey, action, value) {
  if (currentMatrix[role] && currentMatrix[role][moduleKey]) {
    const oldValue = currentMatrix[role][moduleKey][action]
    currentMatrix[role][moduleKey][action] = Boolean(value)

    const log = createAuditEvent({
      user: 'Vicky',
      role: 'MD',
      action: 'Permission Changed',
      entity: `${role} -> ${moduleKey}.${action}`,
      entityType: 'RBAC Policy Matrix',
      module: 'admin',
      oldStatus: `${action}: ${oldValue}`,
      newStatus: `${action}: ${value}`,
      details: `Updated ${action} permission on module '${moduleKey}' for role '${role}' to ${value}`,
    })
    auditLogs.unshift(log)
  }
  return simulateDelay(currentMatrix)
}

export async function getAuditLogs(filters = {}) {
  const filtered = filterAuditLogs(auditLogs, filters)
  return simulateDelay(filtered)
}

export async function logSystemAuditEvent(eventData) {
  const log = createAuditEvent(eventData)
  auditLogs.unshift(log)
  return simulateDelay(log)
}

export async function getSystemHealth() {
  return simulateDelay(systemHealthMetrics)
}

export async function getCompanyHierarchy() {
  return simulateDelay({
    company,
    units,
    publishedCapacity,
  })
}

export async function evaluateAccess(role, moduleKey, action) {
  const allowed = checkPermission(role, moduleKey, action, currentMatrix)
  return simulateDelay({ role, moduleKey, action, allowed })
}

export async function getPersonaSummary(role) {
  const summary = getRoleAccessSummary(role, currentMatrix)
  return simulateDelay(summary)
}
