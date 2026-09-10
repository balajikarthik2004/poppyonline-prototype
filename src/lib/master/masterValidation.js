/**
 * Master Data Referential Integrity & Schema Validation.
 *
 * Verifies that operational entities (Orders, Quality, Procurement, Production)
 * point to active, valid Master records rather than orphan IDs.
 */

export function validateStyleMaster(style) {
  const errors = []
  if (!style.id || !style.id.startsWith('STY-')) errors.push('Invalid Style ID format (must be STY-xxxx)')
  if (!style.styleNo) errors.push('Style Code is required')
  if (!style.buyerId) errors.push('Linked Buyer is required')
  if (!style.fabric) errors.push('Fabric construction is required')
  if (!style.gsm || style.gsm <= 0) errors.push('GSM must be a positive number')
  if (!style.fabricConsumptionKg || style.fabricConsumptionKg <= 0) errors.push('Fabric consumption must be > 0')
  if (!style.smv || style.smv <= 0) errors.push('Standard Minute Value (SMV) must be > 0')

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateBuyerMaster(buyer) {
  const errors = []
  if (!buyer.id) errors.push('Buyer ID is required')
  if (!buyer.name) errors.push('Buyer name is required')
  if (!buyer.paymentTerms) errors.push('Payment terms are mandatory')
  if (!buyer.incoterm) errors.push('Incoterm must be specified (FOB, CIF, etc.)')
  if (!buyer.aqlLevel) errors.push('AQL inspection policy must be assigned')

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateSupplierMaster(supplier) {
  const errors = []
  if (!supplier.id) errors.push('Supplier ID is required')
  if (!supplier.name) errors.push('Supplier name is required')
  if (!supplier.category) errors.push('Supplier category is required')
  if (supplier.leadTimeDays == null || supplier.leadTimeDays < 0) errors.push('Valid lead time in days required')
  if (supplier.rating == null || supplier.rating < 0 || supplier.rating > 5) errors.push('Rating must be between 0 and 5')

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Performs a global referential integrity health check across all registered masters.
 */
export function checkReferentialIntegrity(masters = {}) {
  const { styles = [], buyers = [], suppliers = [], orders = [] } = masters

  const buyerIds = new Set(buyers.map((b) => b.id))
  const styleIds = new Set(styles.map((s) => s.id))
  const supplierIds = new Set(suppliers.map((s) => s.id))

  const brokenBuyerRefs = styles.filter((s) => s.buyerId && !buyerIds.has(s.buyerId))
  const brokenStyleRefs = orders.filter((o) => o.styleId && !styleIds.has(o.styleId))

  const totalChecks = styles.length + orders.length
  const passedChecks = totalChecks - (brokenBuyerRefs.length + brokenStyleRefs.length)
  const healthScorePct = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100

  return {
    healthScorePct,
    totalStyles: styles.length,
    totalBuyers: buyers.length,
    totalSuppliers: suppliers.length,
    brokenBuyerRefsCount: brokenBuyerRefs.length,
    brokenStyleRefsCount: brokenStyleRefs.length,
    status: healthScorePct >= 98 ? 'Optimal' : healthScorePct >= 90 ? 'Warning' : 'Critical',
  }
}
