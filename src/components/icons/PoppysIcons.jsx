import React from 'react'

/**
 * Custom Poppys Online ERP Icon System
 * Built on clean scalable vector paths using `currentColor` for seamless theme,
 * dark mode, active navigation, and hover state adaptation.
 */

function createIcon(viewBox, pathData, displayName) {
  const IconComponent = ({ className = 'h-5 w-5', ...props }) => (
    <svg
      viewBox={viewBox}
      className={className}
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {pathData}
    </svg>
  )
  IconComponent.displayName = displayName
  return IconComponent
}

/* ==========================================================================
   1. LEVEL 1: PRIMARY NAVIGATION & BRAND DOMAIN ICONS
   ========================================================================== */

/** 1. Dashboard: Poppys 4-petal flower emblem framing analytics growth bars */
export function PoppysDashboardIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2C8.5 2 7 4.5 7 7c-2.5 0-5 1.5-5 5s2.5 5 5 5c0 2.5 1.5 5 5 5s5-2.5 5-5c2.5 0 5-1.5 5-5s-2.5-5-5-5c0-2.5-1.5-5-5-5z" fill="currentColor" fillOpacity="0.12" />
      <path d="M9 15v-3M12 15V9M15 15v-5" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

/** 2. Poppys AI: Friendly intelligent copilot bot with Poppy petal ear sensors */
export function PoppysAiIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2v2" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      <rect x="4" y="6" width="16" height="13" rx="4" fill="currentColor" fillOpacity="0.12" />
      <circle cx="9" cy="11.5" r="1.5" fill="currentColor" />
      <circle cx="15" cy="11.5" r="1.5" fill="currentColor" />
      <path d="M9 15.5c1 .6 2 .9 3 .9s2-.3 3-.9" strokeWidth="1.75" />
      <path d="M2 12.5c0-1.5 1-2.5 2-2.5v5c-1 0-2-1-2-2.5zM20 10c1 0 2 1 2 2.5s-1 2.5-2 2.5v-5z" fill="currentColor" />
    </svg>
  )
}

/** 3. Sales & Export: Global container vessel traversing international trade routes */
export function PoppysSalesIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M2.5 12h19M12 2.5a14 14 0 0 1 0 19M12 2.5a14 14 0 0 0 0 19" strokeOpacity="0.4" />
      <path d="M7 17.5l1.5-3.5h7l1.5 3.5H7z" fill="currentColor" />
      <rect x="9" y="11" width="6" height="3" rx="0.5" fill="currentColor" stroke="none" />
      <path d="M4 19.5c2.5 1 5.5 1 8 0s5.5-1 8 0" strokeWidth="1.5" />
    </svg>
  )
}

/** 4. Merchandising: Garment tech pack hanger integrated with thread spool */
export function PoppysMerchIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3a2 2 0 0 0-2 2c0 1.1.9 2 2 2" />
      <path d="M2 10l10-4 10 4-2 3-3-1v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9L4 13l-2-3z" fill="currentColor" fillOpacity="0.12" />
      <circle cx="15.5" cy="14.5" r="2.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.5" cy="14.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

/** 5. Planning: Master production schedule calendar with synchronized takt clock */
export function PoppysPlanningIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fillOpacity="0.12" />
      <path d="M16 2v4M8 2v4M3 9h18" />
      <circle cx="14" cy="14.5" r="4.5" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 12.5v2.2l1.5 1" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

/** 6. Procurement: Prominent multi-tier vendor procurement carton with verified goods receipt seal */
export function PoppysProcurementIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 7.5L12 2.5l9 5v9l-9 5-9-5V7.5z" fill="currentColor" fillOpacity="0.15" />
      <path d="M3 7.5l9 5 9-5M12 12.5v9.5" />
      <path d="M7.5 5L16.5 10" strokeOpacity="0.5" />
      <circle cx="17.5" cy="16.5" r="4.5" fill="currentColor" stroke="white" strokeWidth="1.75" />
      <path d="M15.5 16.5l1.3 1.3 2.5-2.5" stroke="white" strokeWidth="1.75" />
    </svg>
  )
}

/** 7. Inventory: Stacked yarn cheese cones and warehouse storage lots */
export function PoppysInventoryIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <ellipse cx="8.5" cy="5" rx="5.5" ry="2" fill="currentColor" fillOpacity="0.2" />
      <path d="M3 5v3c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V5" />
      <path d="M3 8v3c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V8" />
      <path d="M3 11v3c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-3" />
      <path d="M13 14l4-2 5 2v4l-5 2.5-4-2.5v-4z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 14l5 2 4-2M18 16v4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** 8. Production (MES): Modern industrial facility with circular knitting gear */
export function PoppysProductionIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M2 20h20M4 20V9l5 3V9l5 3V5h6v15" fill="currentColor" fillOpacity="0.12" />
      <rect x="6" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="11" y="14" width="3" height="3" rx="0.5" fill="currentColor" />
      <circle cx="17.5" cy="11.5" r="3" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="11.5" r="1" fill="currentColor" />
    </svg>
  )
}

/** 9. Quality Management: Shield protector with certified garment seal */
export function PoppysQualityIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z" fill="currentColor" fillOpacity="0.12" />
      <path d="M9 8.5l1.5-1 3 0 1.5 1-1 2.5h-4l-1-2.5z" strokeWidth="1.5" />
      <circle cx="16" cy="15.5" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
      <path d="M14.8 15.5l1 1 1.7-1.7" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

/** 10. Maintenance: Crossed technician wrench & machine pinion gear */
export function PoppysMaintenanceIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L3 18l3 3 5.6-5.6a4.5 4.5 0 0 0 6.1-6.1l-2.6 2.6-2.8-.7-.7-2.8 2.6-2.7z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="17.5" cy="16.5" r="4.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17.5 13.5v1M17.5 18.5v1M14.5 16.5h1M19.5 16.5h1" strokeWidth="1.75" />
      <circle cx="17.5" cy="16.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

/** 11. Energy & Utilities: Dynamic electric power bolt combined with ZLD water drop */
export function PoppysEnergyIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M13 2L4 13h6l-2 9 10-12h-6l2-8z" fill="currentColor" fillOpacity="0.15" />
      <path d="M18 10c0-2-3-5.5-3-5.5S12 8 12 10a3 3 0 0 0 6 0z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** 12. Master Data: Enterprise database cylinders with specification tag */
export function PoppysMasterDataIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <ellipse cx="8.5" cy="5" rx="5.5" ry="2" fill="currentColor" fillOpacity="0.2" />
      <path d="M3 5v4c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V5" />
      <path d="M3 9v4c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V9" />
      <path d="M3 13v4c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-4" />
      <path d="M15.5 10.5l4-4 3 3-4 4-3-3z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="8" r="0.8" fill="white" />
    </svg>
  )
}

/** 13. Administration: Multi-tier enterprise governance team with security gear */
export function PoppysAdminIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="3.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M1.5 18c0-3 3-5 6.5-5s6.5 2 6.5 5" />
      <circle cx="17.5" cy="15.5" r="4.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="15.5" r="1.5" fill="currentColor" />
      <path d="M17.5 12.5v1M17.5 17.5v1M14.5 15.5h1M19.5 15.5h1" strokeWidth="1.5" />
    </svg>
  )
}

/* ==========================================================================
   2. LEVEL 2: COMPLETE 9-STAGE MANUFACTURING SHOP FLOOR ICONS
   ========================================================================== */

/** Stage 1: Knitting - Organic cotton yarn ball with knitting needles */
export function PoppysKnittingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="7.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 8.5c2 1 5 1.5 8 .5M6 12c3 1.5 7 1.5 11 0M7.5 15.5c2.5 1 5.5 1 8.5 0" strokeWidth="1.5" />
      <path d="M4 4l16 16M20 4L4 20" strokeWidth="1.75" strokeOpacity="0.7" />
    </svg>
  )
}

/** Stage 2: Dyeing & Processing - Soft-flow jet dyeing vessel with liquor drop */
export function PoppysDyeingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6h16M6 6v12a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 2h8v4H8z" />
      <path d="M12 11c0-1.5 2-4 2-4s2 2.5 2 4a2 2 0 0 1-4 0z" fill="currentColor" />
      <path d="M4 19l2 2M20 19l-2 2" />
    </svg>
  )
}

/** Stage 3: Compacting & Stabilization - Open-width / tubular felt calender roll */
export function PoppysCompactingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="8" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="8" cy="12" r="2" fill="currentColor" />
      <path d="M8 7h10a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H8" strokeWidth="1.75" />
      <path d="M11 17h8a2 2 0 0 0 2-2v-1" strokeWidth="1.5" />
    </svg>
  )
}

/** Stage 4: Cutting - CNC rotary blade knife & nested fabric lay marker */
export function PoppysCuttingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="6" cy="6" r="3" fill="currentColor" fillOpacity="0.2" />
      <circle cx="6" cy="18" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M8.5 8.5L20 20M8.5 15.5L20 4M14 12l2 2" strokeWidth="1.75" />
      <rect x="15" y="15" width="7" height="6" rx="1.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Stage 5: Printing - Squeegee carousel screen blade with ink pigment */
export function PoppysPrintingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="6" rx="1" fill="currentColor" fillOpacity="0.2" />
      <path d="M7 10l2 6h6l2-6" fill="currentColor" fillOpacity="0.15" />
      <circle cx="9.5" cy="19.5" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="19.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

/** Stage 6: Embroidery - Micro-stitch embroidery needle with floral thread motif */
export function PoppysEmbroideryIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 3l-8 14-3-3L16 6l3-3z" fill="currentColor" fillOpacity="0.2" />
      <path d="M17.5 4.5l-1 1M8 14c-2 1-4 3-4 6 3 0 5-2 6-4" strokeWidth="1.5" />
      <circle cx="14" cy="16" r="3" fill="currentColor" fillOpacity="0.25" />
      <circle cx="14" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

/** Stage 7: Sewing - Industrial flatlock & overlock sewing machine */
export function PoppysSewingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 19h18M4 19V7a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v6h-6v5" fill="currentColor" fillOpacity="0.15" />
      <path d="M14 9v4M14 15v1" strokeWidth="2" />
      <circle cx="18.5" cy="8.5" r="1" fill="currentColor" />
    </svg>
  )
}

/** Stage 8: Checking - Quality end-line inspection light table & measurement gauge */
export function PoppysCheckingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="15" rx="3" fill="currentColor" fillOpacity="0.12" />
      <path d="M7 9h6M7 13h4M16 11l2 2 3-3" strokeWidth="2" />
      <circle cx="17.5" cy="17" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
      <path d="M20 19.5l2 2" strokeWidth="2" />
    </svg>
  )
}

/** Stage 9: Packaging - Final ironed export carton box being packed */
export function PoppysPackagingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" fill="currentColor" fillOpacity="0.12" />
      <path d="M3 8l9 5 9-5M12 13v10" />
      <path d="M7 5.5l5 3 5-3" strokeOpacity="0.6" />
    </svg>
  )
}

/* ==========================================================================
   3. LEVEL 2: QUALITY, LAB & DEFECT GOVERNANCE ICONS
   ========================================================================== */

/** Lab Tests: Chemical lab Erlenmeyer flask with yarn ball dip */
export function PoppysLabIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M9 3h6M10 3v5l-6 11a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3L14 8V3" fill="currentColor" fillOpacity="0.15" />
      <path d="M6.5 16h11" strokeOpacity="0.5" />
      <circle cx="16.5" cy="16.5" r="3" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
    </svg>
  )
}

/** Fabric 4-Point Inspection: Roll fabric bolt mapping grid */
export function PoppysFabricInspectionIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="7" cy="14" r="4.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="7" cy="14" r="1.5" fill="currentColor" />
      <path d="M7 9.5L16 4l5 3-9 5.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M7 18.5l9-5.5 5 3-9 5.5L7 18.5z" />
    </svg>
  )
}

/** Final AQL Audit: Pre-shipment audit clipboard with lens */
export function PoppysAqlIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4" y="5" width="14" height="16" rx="2" fill="currentColor" fillOpacity="0.12" />
      <path d="M8 3h6a1 1 0 0 1 1 1v2H7V4a1 1 0 0 1 1-1zM7 10l2 2 4-4M7 15l1.5 1.5" />
      <circle cx="16.5" cy="16.5" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
      <path d="M19 19l2.5 2.5" strokeWidth="2" />
    </svg>
  )
}

/** Rejections & Quarantine: Containment scrap box with cross mark */
export function PoppysRejectionsIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" fill="currentColor" fillOpacity="0.12" />
      <path d="M3 8l9 5 9-5M12 13v10" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
      <path d="M10.5 10.5l3 3M13.5 10.5l-3 3" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

/** Defect Taxonomy: Shield with defect alert outline */
export function PoppysDefectsIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 8v5M12 16v.5" strokeWidth="2" />
    </svg>
  )
}

/** CAPA / 8D Resolution: Corrective action document with root-cause gear */
export function PoppysCapaIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M14 2v6h6M8 12h4M8 16h3" />
      <circle cx="16.5" cy="16.5" r="3.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
    </svg>
  )
}

/* ==========================================================================
   4. LEVEL 2: LOGISTICS, GOVERNANCE & SUSTAINABILITY ICONS
   ========================================================================== */

/** Shipping: Container vessel on maritime route */
export function PoppysShippingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 16l2-6h14l2 6-2 2H5l-2-2z" fill="currentColor" fillOpacity="0.15" />
      <rect x="7" y="6" width="10" height="4" rx="0.5" fill="currentColor" />
      <path d="M2 19c2.5 1 5.5 1 8 0s5.5-1 8 0 3.5.5 4 0" strokeWidth="1.5" />
    </svg>
  )
}

/** Ports & Gateways: Sea and Air gateway anchor */
export function PoppysPortIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="5" r="2.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 7.5v13M5 12h14M5 12a7 7 0 0 0 14 0" strokeWidth="2" />
    </svg>
  )
}

/** Costing Engine: Calculator with coins breakdown */
export function PoppysCostingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="3" fill="currentColor" fillOpacity="0.12" />
      <rect x="7" y="6" width="10" height="3" rx="0.5" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

/** Sustainability & ESG: Leaf wrapping globe */
export function PoppysSustainabilityIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="13" cy="13" r="8" fill="currentColor" fillOpacity="0.1" />
      <path d="M5 13c0-4.5 3.5-8 8-8 0 4.5-3.5 8-8 8z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 13l4 4" strokeWidth="1.5" />
    </svg>
  )
}

/** Audit Logs & System Activity: Document with inspection lens */
export function PoppysAuditLogsIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M14 2v6h6M8 10h4M8 14h2" />
      <circle cx="15.5" cy="15.5" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
      <path d="M18 18l2.5 2.5" strokeWidth="2" />
    </svg>
  )
}

/** Compliance & ESG Certificate: Document with environmental leaf */
export function PoppysComplianceIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M14 2v6h6" />
      <path d="M9 16c0-2.5 2-4.5 4.5-4.5 0 2.5-2 4.5-4.5 4.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/* ==========================================================================
   5. SPECIALIZED SUB-MODULE & WORKFLOW ICONS
   ========================================================================== */

/** Global Buyers & Customer Accounts: International buyer portfolio */
export function PoppysBuyerIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="8" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M6.5 18c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5" />
      <path d="M2.5 12h3M18.5 12h3M12 2.5v2.5M12 19v2.5" strokeOpacity="0.4" />
    </svg>
  )
}

/** Export Orders & Commercial Trade Manifest: Export sales contract */
export function PoppysExportOrdersIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M14 2v6h6M8 12h5M8 16h3" />
      <path d="M16 14l5-2-1.5 5.5L16 16v3l-2.5-1.5z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Garment Style Library: Fashion apparel polo silhouette with tech pack tag */
export function PoppysStyleLibraryIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2a2 2 0 0 0-2 2c0 1 .8 1.8 1.8 2L4 9l2 4 2-1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-8l2 1 2-4-7.8-3c1-.2 1.8-1 1.8-2a2 2 0 0 0-2-2z" fill="currentColor" fillOpacity="0.15" />
      <path d="M10 6l2 3 2-3" />
      <rect x="14" y="13" width="7" height="8" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 16h3M16 18h2" strokeWidth="1.25" />
    </svg>
  )
}

/** Sampling: Sample development room swatch card with measurement gauge */
export function PoppysSamplingIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="13" height="16" rx="2" fill="currentColor" fillOpacity="0.12" />
      <rect x="7" y="7" width="13" height="13" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <path d="M14 11h3M14 14h3M14 17h2" strokeWidth="1.5" />
      <path d="M3 8h4M3 12h4M3 16h4" strokeWidth="1.25" />
    </svg>
  )
}

/** Suppliers & Spinning Mills: Factory spinning mill with vendor partnership badge */
export function PoppysSuppliersIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 20V9l4 3V9l4 3V6h10v14H3z" fill="currentColor" fillOpacity="0.12" />
      <rect x="14" y="9" width="3" height="3" rx="0.5" fill="currentColor" />
      <path d="M6 20v-4h4v4" />
      <circle cx="17.5" cy="16.5" r="4.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 16.5h5M17.5 14v5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Purchase Requisitions (PR): Requisition indent register on clipboard */
export function PoppysPurchaseRequisitionIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4" y="4" width="16" height="17" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z" />
      <path d="M8 10l1.5 1.5 3-3" strokeWidth="1.75" />
      <path d="M14 10h2M8 14h8M8 17h5" strokeWidth="1.5" />
    </svg>
  )
}

/** Purchase Orders (PO): Commercial PO contract sheet with verification seal */
export function PoppysPurchaseOrderIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor" fillOpacity="0.12" />
      <path d="M14 2v6h6M8 9h2M8 13h4M8 17h3" />
      <circle cx="16.5" cy="16.5" r="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 16.5h4M16.5 14.5v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Goods Receipt Notes (GRN): Inbound carton receiving with barcode and gate-in pass */
export function PoppysGrnIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 7l8-4 8 4v10l-8 4-8-4V7z" fill="currentColor" fillOpacity="0.12" />
      <path d="M4 7l8 4 8-4M12 11v10" />
      <path d="M7 13.5l2-1M7 16l2-1M7 18.5l2-1" strokeWidth="1.25" />
      <circle cx="17" cy="16" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5" />
      <path d="M15.5 16l1 1 2-2" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

/** Stock Movements & Inventory Transfers: Warehouse transfer arrows with lot box */
export function PoppysStockMovementIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="6" width="9" height="8" rx="1.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M7.5 6v8M3 10h9" strokeWidth="1.25" strokeOpacity="0.5" />
      <path d="M14 8h7M18 5l3 3-3 3" strokeWidth="1.75" />
      <path d="M10 16H3M7 13l-3 3 3 3" strokeWidth="1.75" />
      <rect x="12" y="12" width="9" height="8" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** Breakdown Incidents & Dispatch: Machine alert triangle with warning indicator */
export function PoppysBreakdownIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M10.3 3.2L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 9v4M12 17h.01" strokeWidth="2" />
    </svg>
  )
}

/** Preventive Maintenance (PM): Calendar with synchronized service gear */
export function PoppysPmIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fillOpacity="0.12" />
      <path d="M16 2v4M8 2v4M3 9h18" />
      <circle cx="14" cy="15" r="3.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 13v1M14 16v1M12 15h1M15 15h1" strokeWidth="1.5" />
    </svg>
  )
}

/** Spare Parts & Tooling Consumables: Mechanical component isometric storage cube */
export function PoppysSparePartsIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="currentColor" fillOpacity="0.12" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    </svg>
  )
}
