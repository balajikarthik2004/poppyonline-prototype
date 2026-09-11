/**
 * Master Data Services.
 * Provides async wrappers for Styles, BOMs, Revisions, Buyers, Suppliers, Defects, and Ports.
 */
import { simulateDelay } from './delay'
import { styles, styleById } from '@/mock/styles'
import { buyers, buyerById } from '@/mock/buyers'
import { suppliers, supplierById } from '@/mock/suppliers'
import { defectCodes } from '@/mock/defects'
import { exportPorts } from '@/mock/ports'
import { createDraftRevision, approveRevision } from '@/lib/master/revisionLogic'
import { checkReferentialIntegrity } from '@/lib/master/masterValidation'
import { exportOrders } from '@/mock/orders'
import { auditLogs } from '@/mock/auditLogs'
import { createAuditEvent } from '@/lib/admin/auditLogic'

export async function getMasterStyles(filters = {}) {
  let result = styles
  if (filters.segment) result = result.filter((s) => s.segment === filters.segment)
  if (filters.status) result = result.filter((s) => s.status === filters.status)
  if (filters.buyerId) result = result.filter((s) => s.buyerId === filters.buyerId)
  return simulateDelay(result)
}

export async function getMasterStyleById(styleId) {
  const style = styleById.get(styleId) || styles.find((s) => s.id === styleId)
  return simulateDelay(style)
}

export async function createStyleBomRevision(styleId, changeReason, createdBy = 'Senior Merchandiser') {
  const style = styleById.get(styleId) || styles.find((s) => s.id === styleId)
  if (!style) throw new Error(`Style ${styleId} not found`)

  const currentRev = style.revisions?.[style.revisions.length - 1]
  const newRev = createDraftRevision(style, currentRev, { changeReason, createdBy })

  style.revisions = [...(style.revisions || []), newRev]
  style.activeRevisionVersion = newRev.version

  // Audit event
  const log = createAuditEvent({
    user: createdBy,
    role: 'Merchandiser',
    action: 'BOM Revised',
    entity: style.styleNo || style.id,
    entityType: 'Garment Style Master',
    module: 'master',
    oldStatus: currentRev?.version || 'v1.0',
    newStatus: `${newRev.version} (Draft)`,
    details: `Created draft BOM revision ${newRev.version}: ${changeReason}`,
  })
  auditLogs.unshift(log)

  return simulateDelay(style)
}

export async function approveStyleBomRevision(styleId, revisionId, approverName = 'Sakthivel') {
  const style = styleById.get(styleId) || styles.find((s) => s.id === styleId)
  if (!style) throw new Error(`Style ${styleId} not found`)

  style.revisions = approveRevision(style.revisions || [], revisionId, approverName)
  const approved = style.revisions.find((r) => r.revisionId === revisionId)
  if (approved) {
    style.bom = approved.bom
    style.activeRevisionVersion = approved.version
  }

  // Audit event
  const log = createAuditEvent({
    user: approverName,
    role: 'MD',
    action: 'Approved',
    entity: style.styleNo || style.id,
    entityType: 'Garment Style Master',
    module: 'master',
    oldStatus: 'Pending Approval',
    newStatus: 'Approved',
    details: `Approved BOM revision ${approved?.version} for bulk cutting release`,
  })
  auditLogs.unshift(log)

  return simulateDelay(style)
}

export async function getMasterBuyers(filters = {}) {
  let result = buyers
  if (filters.region) result = result.filter((b) => b.region === filters.region)
  if (filters.tier) result = result.filter((b) => b.tier === filters.tier)
  return simulateDelay(result)
}

export async function updateBuyerTerms(buyerId, updates = {}) {
  const buyer = buyerById.get(buyerId) || buyers.find((b) => b.id === buyerId)
  if (buyer) {
    Object.assign(buyer, updates)
    const log = createAuditEvent({
      user: 'Senior Merchandiser',
      role: 'Merchandiser',
      action: 'Updated',
      entity: buyer.name,
      entityType: 'Buyer Commercial Master',
      module: 'master',
      oldStatus: 'Active',
      newStatus: 'Active (Updated)',
      details: `Updated commercial terms: Incoterm=${buyer.incoterm}, Terms=${buyer.paymentTerms}`,
    })
    auditLogs.unshift(log)
  }
  return simulateDelay(buyer)
}

export async function getMasterSuppliers(filters = {}) {
  let result = suppliers
  if (filters.category) result = result.filter((s) => s.category === filters.category)
  if (filters.supplierType) result = result.filter((s) => s.supplierType === filters.supplierType)
  if (filters.status) result = result.filter((s) => s.status === filters.status)
  return simulateDelay(result)
}

export async function updateSupplierStatus(supplierId, newStatus) {
  const sup = supplierById.get(supplierId) || suppliers.find((s) => s.id === supplierId)
  if (sup) {
    const oldStatus = sup.status
    sup.status = newStatus
    const log = createAuditEvent({
      user: 'General Manager - Operations',
      role: 'GM',
      action: 'Status Changed',
      entity: sup.name,
      entityType: 'Supplier & Mill Master',
      module: 'master',
      oldStatus,
      newStatus,
      details: `Vendor status changed from ${oldStatus} to ${newStatus}`,
    })
    auditLogs.unshift(log)
  }
  return simulateDelay(sup)
}

export async function getMasterDefects(category) {
  let result = defectCodes
  if (category && category !== 'All') {
    result = result.filter((d) => d.category === category || d.process === category)
  }
  return simulateDelay(result)
}

export async function getMasterPorts() {
  return simulateDelay(exportPorts)
}


export async function getMasterHealthDiagnostics() {
  const integrity = checkReferentialIntegrity({
    styles,
    buyers,
    suppliers,
    orders: exportOrders,
  })
  return simulateDelay(integrity)
}
