/**
 * BOM & Master Data Revision Management Engine.
 *
 * Handles versioning (v1.0 Approved -> v1.1 Draft -> v2.0 Released),
 * change rationales, effective dates, and structural diffing.
 */

export const REVISION_STATUSES = ['Draft', 'Pending Approval', 'Approved', 'Archived', 'Superseded']

/**
 * Creates a new draft revision derived from an existing BOM revision.
 */
export function createDraftRevision(style, currentRevision, changes = {}) {
  const currentVersion = currentRevision?.version || 'v1.0'
  const versionParts = currentVersion.replace('v', '').split('.').map(Number)
  const nextMinor = `${versionParts[0] || 1}.${(versionParts[1] || 0) + 1}`
  const newVersion = `v${nextMinor}`

  const now = new Date().toISOString()

  const newRevision = {
    revisionId: `REV-${style.id}-${newVersion.replace('.', '_')}`,
    version: newVersion,
    status: 'Draft',
    createdAt: now,
    createdBy: changes.createdBy || 'Senior Merchandiser',
    approvedBy: null,
    approvedAt: null,
    effectiveDate: changes.effectiveDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    changeReason: changes.changeReason || 'Pattern refinement & trim optimization',
    bom: JSON.parse(JSON.stringify(currentRevision?.bom || style.bom)),
  }

  return newRevision
}

/**
 * Transitions a revision to 'Approved' and sets previous approved versions to 'Superseded'.
 */
export function approveRevision(revisions, targetRevisionId, approverName = 'Managing Director') {
  const now = new Date().toISOString()

  return revisions.map((rev) => {
    if (rev.revisionId === targetRevisionId) {
      return {
        ...rev,
        status: 'Approved',
        approvedBy: approverName,
        approvedAt: now,
      }
    }
    if (rev.status === 'Approved') {
      return {
        ...rev,
        status: 'Superseded',
      }
    }
    return rev
  })
}

/**
 * Compares two BOM structures to produce a clean diff summary of modifications.
 */
export function diffBomRevisions(revA, revB) {
  if (!revA || !revB) return []

  const diffs = []
  const bomA = revA.bom || {}
  const bomB = revB.bom || {}

  // Compare Fabric
  const aFabrics = bomA.fabric || []
  const bFabrics = bomB.fabric || []
  if (aFabrics.length !== bFabrics.length) {
    diffs.push({
      category: 'Fabric',
      field: 'Component Count',
      oldValue: `${aFabrics.length} items`,
      newValue: `${bFabrics.length} items`,
    })
  }

  // Compare Total Fabric Consumption
  const aConsumption = aFabrics.reduce((s, f) => s + (f.consumptionKg || 0), 0)
  const bConsumption = bFabrics.reduce((s, f) => s + (f.consumptionKg || 0), 0)
  if (Math.abs(aConsumption - bConsumption) > 0.001) {
    diffs.push({
      category: 'Fabric Consumption',
      field: 'Total Fabric (Kg)',
      oldValue: `${aConsumption.toFixed(3)} kg`,
      newValue: `${bConsumption.toFixed(3)} kg`,
      delta: `${((bConsumption - aConsumption) / (aConsumption || 1) * 100).toFixed(1)}%`,
    })
  }

  // Compare Trims
  const aTrims = bomA.trims || []
  const bTrims = bomB.trims || []
  if (aTrims.length !== bTrims.length) {
    diffs.push({
      category: 'Trims',
      field: 'Trims Count',
      oldValue: `${aTrims.length} items`,
      newValue: `${bTrims.length} items`,
    })
  }

  return diffs
}
