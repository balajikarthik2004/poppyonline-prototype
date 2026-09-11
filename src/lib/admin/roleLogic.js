/**
 * Persona & Role Definitions for Poppys ERP.
 *
 * Represents the 6 operational personas that govern system access,
 * approvals, and functional scope.
 */

export const PERSONAS = [
  {
    key: 'MD',
    title: 'Managing Director',
    name: 'Vicky',
    department: 'Executive Board',
    badge: 'Executive',
    tone: 'brand',
    description: 'Ultimate operational & commercial authority. Full viewing, editing, approval and audit permissions across all 14 enterprise modules.',
    scope: 'Group-Wide (All Units & Overseas Divisions)',
    color: '#3B82F6',
  },
  {
    key: 'GM',
    title: 'General Manager - Operations',
    name: 'S. Rajagopalan',
    department: 'Plant Operations',
    badge: 'Operations',
    tone: 'poppy',
    description: 'Direct oversight of line throughput, plant capacity, multi-unit production schedules, machine health, and energy sustainability.',
    scope: 'Units I, II, III & IV Manufacturing',
    color: '#EF4444',
  },
  {
    key: 'Merchandiser',
    title: 'Senior Merchandiser',
    name: 'K. Priya Dharshini',
    department: 'Merchandising & Sales',
    badge: 'Commercial',
    tone: 'warning',
    description: 'Governs buyer accounts, export orders, garment style library, sampling progress, and pre-production costing sheets.',
    scope: 'Export Order Book & Style Masters',
    color: '#F59E0B',
  },
  {
    key: 'QA',
    title: 'Quality Assurance Lead',
    name: 'R. Vignesh Kumar',
    department: 'Quality & Compliance',
    badge: 'Quality Gate',
    tone: 'success',
    description: 'Enforces AQL 1.5/2.5 final audits, 4-point fabric roll inspections, inline DHU tracking, 8D CAPA cases, and universal defect taxonomy.',
    scope: 'Quality Gates & Lab Certifications',
    color: '#10B981',
  },
  {
    key: 'Planner',
    title: 'Production Planner',
    name: 'M. Senthil Nathan',
    department: 'PPC & Supply Chain',
    badge: 'PPC',
    tone: 'info',
    description: 'Plans 24-line sewing allocations, fabric/yarn reservations, job card routing, cut plans, and capacity loading balance.',
    scope: 'PPC, Production Scheduling & WIP Stores',
    color: '#06B6D4',
  },
  {
    key: 'Maintenance',
    title: 'Maintenance Head',
    name: 'V. Sundaram',
    department: 'Plant Engineering & TPM',
    badge: 'Asset Care',
    tone: 'secondary',
    description: 'Oversees TPM fleet health, PM checklists sign-off, emergency breakdown tickets, critical spare parts inventory, and boiler utilities.',
    scope: 'Unit Asset Fleet & Energy Hub',
    color: '#8B5CF6',
  },
]

export const personaByKey = new Map(PERSONAS.map((p) => [p.key, p]))
