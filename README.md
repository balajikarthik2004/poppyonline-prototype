# poppysonline

Export Command Center + ERP prototype for **Poppys Knitwear (P) Limited** (Tirupur, Tamil Nadu) — a knitwear manufacturer and exporter.

> **Prototype notice.** Every operational figure in this app (production volumes, orders, inventory, quality, energy) is **illustrative demo data**, not actual Poppys operating figures. Only the descriptive company details — profile, leadership, published departmental capacities, buyer list, certifications and contact details — are drawn from the public website at [poppysonline.com](https://poppysonline.com/).

## Running it

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build
npm run lint     # oxlint
```

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 + React 19 (JavaScript, JSX) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` config) |
| Components | Hand-built primitives — no component library |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 (`createBrowserRouter`) |
| State | Zustand (unit selector, date range, user role) |
| Dates | date-fns |

## Design system

**"Indigo & Ivory"** — defined entirely in `src/index.css` (`@theme` + `:root` tokens), so pages inherit it without local colour choices.

| Role | Token / value |
| --- | --- |
| Shell (sidebar, dark surfaces) | `ink-950 → ink-900` indigo ink |
| Canvas | warm ivory `#faf8f5` with two very soft indigo/poppy blooms |
| Surface | white cards, hairline warm `border`, soft ink shadows |
| Primary | indigo `brand-500` `#3f52ab` |
| Accent | poppy coral `poppy-500` `#d84a30` — the namesake bloom; active markers, eyebrow labels, target lines |
| Status | `success` green · `warning` amber · `danger` brick · `info` blue |
| Charts | `src/lib/chartColors.js` — six ivory-safe categorical hues |
| Display type | **Plus Jakarta Sans** (headings, KPI figures via the `.num` utility) |
| UI type | **Inter** (body, tables, controls), tabular figures everywhere |
| Radius / elevation | `--radius: 0.75rem`; cool-ink shadow ramp `shadow-xs … shadow-2xl` |

Utilities worth knowing: `.paper-card` for the house card treatment, `.hover-lift` for interactive cards, `.num` for display-font figures, `.section-label` for eyebrow labels, `.knit` for the knit-loop texture on dark hero surfaces, `.ai-glow` / `.ai-sheen` for the AI module.

## Architecture

```
src/
  app/          router
  components/
    layout/     Shell, Sidebar, Header, Breadcrumbs
    ui/         Card, Button, Badge, Input, Select, Popover, Sheet, Tabs, Progress…
    common/     PageHeader, StatCard/StatGrid, FilterChip, EmptyState, InfoBanner
    kpi/        KpiCard, TrendPill
    tables/     DataTable, StatusBadge, RiskBadge, MiniBar
    ai/         AiChat, CopilotLauncher
  pages/        one barrel per module (sales, merch, planning, …)
  mock/         20 typed mock data modules (never imported by components)
  services/     async wrappers over mock/ with 150–400 ms simulated latency
  hooks/        useAsync (loading / error / empty state handling)
  lib/          utils, formatters, navigation tree, seeded RNG, chart colours
  store/        Zustand app store
```

**Backend swap-in point.** Components never import from `src/mock/` — they call `src/services/`, which today wraps the mock modules in async functions with simulated latency. Replacing those function bodies with REST/GraphQL calls requires no component changes.

**Deterministic demo data.** Mock generators use a seeded PRNG (`src/lib/random.js`), so figures stay stable across reloads instead of reshuffling on every render.

## The process route

A knitwear export house runs a different spine from a spinning mill. `src/mock/units.js` models the nine stages a garment actually travels, each carrying the company's own published daily capacity:

| Stage | Published capacity |
| --- | --- |
| Knitting | 45 circular + 4 flat knit machines → 10,000 kg/day |
| Dyeing & Processing | soft-flow dyeing → 12 t/day |
| Compacting | Tube Tex → 5,000 kg/day |
| Cutting | CAD marker, straight-knife and auto cutters |
| Printing | 10 semi-auto + 2 auto + 2 MHM (Austria), 12 colour → 25,000 pcs/day |
| Embroidery | Barudan & Tajima, 11 colour → 25,000 pcs/day |
| Sewing | 1,500 machines → 100,000 pcs/day |
| Checking | 100% check, measurement audit, needle detection |
| Ironing & Packing | press, tag, polybag, carton |

One component (`ProcessPage`) serves all nine via the `/production/:stageKey` route, so adding a stage means adding a row to `processStages`, not a page.

## Navigation

Fourteen sidebar sections, every leaf a real data-backed page:

**Dashboard** · **Poppys AI** (Copilot, Insights & Anomalies, Resolution Playbooks, Expert Network, Shop Floor) · **Sales & Export** (Buyers, Export Orders, Order Book, Shipments) · **Merchandising** (Style Library, Sampling, Costing) · **Planning** (Production Orders, Capacity Planning) · **Procurement** (Overview, Suppliers, Purchase Requisitions, Purchase Orders, GRN) · **Inventory** (Overview, Yarn Store, Fabric Store, WIP, Finished Goods, Stock Movements) · **Production** (Overview + 9 stages) · **Quality Management** (Dashboard, Lab Tests, Fabric Quality, Inline Inspection, Final AQL Audit, Rejections, Buyer Complaints) · **Maintenance** (Machine Dashboard, Preventive Maintenance, Breakdowns, Spare Parts) · **Energy & Utilities** · **Compliance & CSR** · **Master Data** (Styles, Buyers, Suppliers, Machines, Yarn Lots) · **Administration**

**Global filters.** The unit selector and date-range selector in the header genuinely filter data through the service layer.

## Domain model

`Buyer → ExportOrder → ProductionOrder → stage route → Shipment`, with `Style`, `Sample` and `CostSheet` upstream in merchandising, `YarnLot → FabricRoll → WIP → FinishedGoods` through the stores, and `LabTest`, `InlineInspection`, `AqlAudit`, `Rejection` and `Complaint` attaching to orders.

Mock dataset: 4 units, 9 process stages, 166 machines, 30 buyers across 6 regions, 22 suppliers, 64 styles, 186 export orders, 120 work orders, 42 yarn lots, 90 days of production and energy history, 96 lab tests, 84 inline inspections, 66 AQL audits, 24 sewing lines.

## The AI module

`src/mock/ai.js` computes insights, playbooks and copilot answers **locally and deterministically** over the mock dataset — there is no model call and no network egress. Insights are derived from genuine anomalies in the data (orders past their ship window, machines down, lines below 60% efficiency), so the panel never contradicts the page behind it. Every answer links through to the module that owns the data.
