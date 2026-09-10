# Comprehensive Project & Feature Analysis: Poppys Online Prototype (`poppysonline`)

> **Document Type:** Enterprise Architecture & Feature Specification Review  
> **Target Application:** Poppys Knitwear (P) Limited — Export Command Center & Industry 4.0 ERP Prototype  
> **Location / Domain:** Tirupur, Tamil Nadu (India’s Knitwear Capital)  
> **Source Directory:** `c:\Users\yuvan\OneDrive\Desktop\Yuvan\Poppsy-online\poppyonline-prototype`  

---

## 1. Executive Summary

**Poppys Online** is a modern, high-performance, domain-tailored Enterprise Resource Planning (ERP) and Export Command Center prototype engineered specifically for **Poppys Knitwear (P) Limited**—one of India's premier vertically integrated knitwear manufacturers and exporters based in Tirupur, Tamil Nadu.

Unlike generic manufacturing ERPs or spinning-mill solutions (which model processes from blow room to ring frame), this system is built around the authentic **garment export manufacturing lifecycle**: from buyer merchandising, costing, sampling, and yarn procurement, through 9 distinct manufacturing stages (Knitting, Dyeing, Compacting, Cutting, Printing, Embroidery, Sewing, Checking, Packing), culminating in final AQL inspection, container stuffing, and global shipment tracking.

The prototype features a design system named **"Indigo & Ivory"**, a local deterministic **Poppys AI** intelligence engine, reactive global filtering (multi-unit & time-window presets), role-based operational personas, and a service layer designed for drop-in backend integration.

---

## 2. Technical Stack & Architecture

### 2.1 Core Technology Stack

| Layer / Concern | Technology Selection | Rationale & Implementation Details |
| :--- | :--- | :--- |
| **Runtime & Framework** | **React 19** + **Vite 8** | Modern concurrent rendering, instant HMR, zero-bundle overhead in development. |
| **Styling & Design System** | **Tailwind CSS v4** (`@theme` CSS-first) | Built with custom tokens (`--color-ink-*`, `--color-brand-*`, `--color-poppy-*`), warm ivory canvas (`#faf8f5`), crisp borders, and subtle textures. |
| **Routing & Layout** | **React Router v7** (`createBrowserRouter`) | Centralized route manifest in `src/app/router.jsx`, nested under a responsive, multi-persona `Shell.jsx` layout. |
| **State Management** | **Zustand v5** | Lightweight global store (`src/store/appStore.js`) controlling `unitId`, `dateRangePreset`, and `userRole`. |
| **Data Visualizations** | **Recharts v3** | Responsive line charts, bar graphs, area charts, and radial gauges styled with ivory-safe color palettes (`src/lib/chartColors.js`). |
| **Iconography** | **Lucide React** | Consistent, lightweight SVG iconography across all 14 sidebar sections and data tables. |
| **Data Generators & Math** | Seeded PRNG (`src/lib/random.js`) + `date-fns` | Deterministic, stable demo data generation ensuring reproducible metric values across reloads. |
| **Linter** | **Oxlint** | High-speed static analysis and linting. |

### 2.2 Architectural Highlights & Design Patterns

```
src/
├── app/               # Router definitions and top-level route configuration
├── components/
│   ├── ai/            # AI Copilot interactive drawer and chat interfaces
│   ├── common/        # StatCard, StatGrid, PageHeader, FilterChip, EmptyState
│   ├── kpi/           # High-impact KPI display cards and trend indicators
│   ├── layout/        # Shell, Sidebar, Header, Breadcrumbs, Global Search
│   ├── tables/        # Generic DataTable, StatusBadge, RiskBadge, MiniBar
│   └── ui/            # UI Primitives (Card, Button, Badge, Input, Select, Sheet, Tabs)
├── hooks/             # Custom React hooks (e.g., useAsync with loading/error states)
├── lib/               # Date formatting, navigation trees, random seed generators, chart palette
├── mock/              # 20 domain-specific mock data modules (Buyer, Order, Machine, AI, etc.)
├── pages/             # 13 functional modules (Sales, Merch, Planning, Inventory, etc.)
├── services/          # Decoupled Async Service Layer with simulated network latency
└── store/             # Global Zustand state (Unit filter, Date range, User role)
```

1. **Clean Service-Layer Decoupling (Backend Swap-in Ready):**
   Components never import mock data directly from `src/mock/`. Instead, they interact via asynchronous functions in `src/services/index.js` wrapped with `simulateDelay()` (150–400 ms latency). When transitioning to a production backend, only the service bodies need to be replaced with REST or GraphQL `fetch`/`axios` calls—leaving UI components untouched.

2. **Parametric Process Spine (`/production/:stageKey`):**
   Rather than hardcoding 9 separate production stage pages, a single dynamic controller component (`ProcessPage.jsx`) handles all 9 production departments (Knitting, Dyeing, Compacting, Cutting, Printing, Embroidery, Sewing, Checking, Packing) driven by metadata from `src/mock/units.js`.

3. **Deterministic Local AI Engine:**
   `src/mock/ai.js` computes operational insights, anomaly alerts, and Copilot Q&A deterministically over active dataset cross-sections (delayed orders, low-efficiency lines, broken-down machines) without external LLM API dependencies or latency.

4. **Hierarchical Domain Relationship Model:**
   $$\text{Buyer} \longrightarrow \text{ExportOrder} \longrightarrow \text{ProductionOrder} \longrightarrow \text{9-Stage Process Route} \longrightarrow \text{Shipment}$$
   With upstream merchandising (`Style`, `Sample`, `CostSheet`), intermediate warehouse tracking (`YarnLot` $\rightarrow$ `FabricRoll` $\rightarrow$ `WIP` $\rightarrow$ `FinishedGoods`), and quality audits (`LabTest`, `InlineInspection`, `AqlAudit`).

---

## 3. Detailed Feature Breakdown by Module

### 3.1 🏢 Executive Command Center (`/`)
* **High-Level KPIs:** Real-time metrics including Export Turnover ($100M Scale), Active Order Book Value, On-Time In-Full (OTIF) Delivery %, Factory Overall Efficiency, Energy Intensity (kWh/kg), and Carbon Footprint.
* **Live Factory Activity Stream:** Real-time log of stage completions, bundle scan events, QC passes, and dispatch alerts.
* **Risk & Bottleneck Matrix:** Automated detection of delayed orders, line efficiency dips (<60%), and machine breakdowns.
* **Sustainability Snapshot:** Specific Energy Consumption (SEC), Zero Liquid Discharge (ZLD) water recovery %, and rooftop solar power output.

---

### 3.2 🤖 Poppys AI Operations Hub (`/ai`)
* **AI Copilot (`/ai`):** Interactive conversational assistant answering domain-specific operational queries (delivery risks, yarn shortages, line bottlenecks, energy spikes) with direct deep links to resolving modules.
* **Insights & Anomalies (`/ai/insights`):** Automated anomaly detector flagging:
  - Critical shipment delays with FOB financial exposure calculations.
  - Tracking variance on 45-day confirmation-to-shipment curves.
  - Upstream machine downtime impacting downstream garmenting.
* **Resolution Playbooks (`/ai/playbooks`):** Structured standard operating procedures (SOPs) with step-by-step resolution workflows for:
  - *Shipment delay risk mitigation*
  - *Inline DHU exceeding 6%*
  - *Fabric roll shade variation*
  - *Yarn stock falling below 2-day buffer*
  - *Critical machine breakdowns*
* **Expert Network (`/ai/experts`):** Internal domain specialist directory (knitting masters, dye masters, IE engineers, AQL auditors) showing live shop-floor availability, response times, and historical issue resolution stats.
* **Shop Floor Digital Twin (`/ai/shop-floor`):** Real-time monitoring board for all 24 sewing lines detailing active styles, operator headcounts, line efficiencies, and hourly DHU rates.

---

### 3.3 🚢 Sales & Export (`/sales`)
* **Buyers Directory (`/sales/buyers`):** Profile management for international retail clients (Marks & Spencer, Next, Tesco, Waitrose, Mothercare, Debenhams, John Lewis) tracking lifetime FOB spend, active order counts, and compliance ratings.
* **Export Orders (`/sales/export-orders`):** Full export PO lifecycle tracker featuring PO numbers, style codes, quantities, FOB value ($USD), ship windows, progress % bars, and risk indicators (`onTrack`, `atRisk`, `delayed`).
* **Order Book (`/sales/order-book`):** Aggregated export demand analytics categorized by season, product segment (Infants, Boys, Men, Women), destination continent, and delivery month.
* **Shipments & Logistics (`/sales/shipments`):** Export logistics tracking with departure ports (Tuticorin, Chennai, Cochin), shipping line details, bill of lading (BL) numbers, container stuffing status, and estimated times of arrival (ETA).

---

### 3.4 🎨 Merchandising (`/merch`)
* **Style Library (`/merch/styles`):** Garment style catalog across all 7 product categories, detailing fabric construction (Single Jersey, Interlock, Rib, Pique, Fleece, Jacquard), GSM, size scales, Standard Minute Values (SMV), and bill of materials (BOM).
* **Sampling Management (`/merch/sampling`):** End-to-end sample approval tracking across Proto, Fit, Size Set, Salesman, and Pre-Production (PP) stages with buyer sign-off dates and feedback logs.
* **Costing & CM Sheets (`/merch/costing`):** Granular garment cost breakdowns incorporating yarn weight, knitting/dyeing loss %, processing charges, printing/embroidery embellishments, CMT (Cut-Make-Trim), trims/accessories, shipping margins, and buyer FOB quotes.

---

### 3.5 📅 Production Planning & Control (`/planning`)
* **Production Orders (`/planning/production-orders`):** Work order scheduling linked back to buyer export orders, defining batch lot sizes, target start/end dates, and routing across factory units.
* **Capacity Planning (`/planning/capacity`):** Dynamic departmental capacity allocation comparing published factory capacity (e.g., 100k sewing pcs/day, 10t knitting/day) against committed line allocations.

---

### 3.6 📦 Procurement (`/procurement`)
* **Procurement Dashboard (`/procurement`):** Spend analysis across categories (Raw Yarn, Dyes & Auxiliaries, Sewing Threads, Buttons/Zippers, Polybags & Cartons).
* **Suppliers Directory (`/procurement/suppliers`):** Vendor directory with historical quality performance, lead-time compliance %, and payment terms.
* **Purchase Requisitions (PR) (`/procurement/pr`):** Internal material indent management with automated reorder triggers.
* **Purchase Orders (PO) (`/procurement/po`):** Purchase order generation, vendor dispatch tracking, and financial commitments.
* **Goods Receipt Notes (GRN) (`/procurement/grn`):** Inward gate entry, lot weight verification, invoice matching, and quality inspection staging.

---

### 3.7 🏭 Inventory & Stores Management (`/inventory`)
* **Inventory Overview (`/inventory`):** High-level valuation and stock aging across raw materials, WIP, and finished goods.
* **Yarn Store (`/inventory/yarn`):** Inventory categorized by yarn count (20s, 30s, 40s combed cotton, melange, organic BCI), lot numbers, spinner origin, bag counts, and reorder levels.
* **Fabric Store (`/inventory/fabric`):** Greige and finished fabric roll tracking with GSM verification, shade lot grading, roll lengths, and bin locations.
* **WIP (Work-in-Progress) (`/inventory/wip`):** Staged bundle tracking between Cutting, Printing, Embroidery, and Sewing lines to detect floor stagnation.
* **Finished Goods Store (`/inventory/finished-goods`):** Carton inventory packed by buyer SKU, ready for container stuffing and dispatch.
* **Stock Movements (`/inventory/stock-movements`):** Comprehensive stock ledger tracking inward receipts, issue to floor, return to store, and inter-unit transfers.

---

### 3.8 ⚙️ Manufacturing & Production Stages (`/production`)
* **Production Overview (`/production`):** Group-wide production throughput, real-time stage output, and bottleneck identification.
* **Dedicated Departmental Modules (`/production/:stageKey`):**
  1. **Knitting (`/production/knitting`):** 45 circular + 4 flat-knit machines (10,000 kg/day capacity).
  2. **Dyeing & Processing (`/production/dyeing`):** Soft-flow dyeing vessels and finishing ranges (12 tonnes/day).
  3. **Compacting (`/production/compacting`):** Tube Tex tubular and open-width compactors (5,000 kg/day).
  4. **Cutting (`/production/cutting`):** CAD marker planning, auto-spreaders, and straight-knife cutters.
  5. **Printing (`/production/printing`):** 10 semi-automatic + 2 automatic + 2 computerized MHM machines (25,000 pcs/day).
  6. **Embroidery (`/production/embroidery`):** Barudan and Tajima multi-head machines (25,000 pcs/day).
  7. **Sewing (`/production/sewing`):** 1,500 sewing machines across 3 factories (100,000 pcs/day).
  8. **Checking (`/production/checking`):** 100% measurement verification, visual checking, and inline metal/needle detection.
  9. **Ironing & Packing (`/production/packing`):** Steam pressing, barcode tagging, polybagging, and carton make-up.

---

### 3.9 🛡️ Quality Assurance & Compliance (`/quality`)
* **Quality Dashboard (`/quality`):** First-Time-Right (FTR) %, factory Defect per Hundred Units (DHU), and top defect Pareto charts.
* **Lab Testing (`/quality/lab-tests`):** Physical and chemical test logs (Washing Fastness, Rubbing/Crocking, Dimensional Stability/Shrinkage, Spirality, Bursting Strength, pH).
* **Fabric Quality (`/quality/fabric`):** Standard 4-Point System fabric inspection roll logs with penalty point calculations.
* **Inline Inspection (`/quality/inline`):** Hourly roving QC inspections on sewing lines recording critical defects (skipped stitches, puckering, uneven hems).
* **Final AQL Audits (`/quality/aql`):** Pre-shipment statistical sampling audits (AQL 1.5/2.5/4.0 Major/Minor) generating pass/fail certifications.
* **Rejections & Complaints (`/quality/rejections`, `/quality/complaints`):** Scrap quantification, buyer chargeback logs, Root Cause Analysis (RCA), and CAPA tracking.

---

### 3.10 🔧 Machine Maintenance & Asset Care (`/maintenance`)
* **Machine Dashboard (`/maintenance`):** Health overview of 166+ production assets across units, tracking MTBF (Mean Time Between Failures) and MTTR (Mean Time To Repair).
* **Preventive Maintenance (PM) (`/maintenance/pm`):** Scheduled PM calendar, lubrication checklists, and machine calibration cycles.
* **Breakdown Incident Log (`/maintenance/breakdowns`):** Real-time breakdown ticketing, technician dispatching, and downtime duration logging.
* **Spare Parts Store (`/maintenance/spare-parts`):** Critical spare inventory (needles, loopers, belts, motors, valves) with safety buffer reorder alerts.

---

### 3.11 ⚡ Energy & Utilities (`/energy`)
* **Energy Dashboard (`/energy`):** Department-wise electricity consumption, specific power consumption per kg of fabric, boiler steam generation, and water recovery via Zero Liquid Discharge (ZLD) plants.

---

### 3.12 🌿 Compliance, CSR & Master Data (`/compliance`, `/master`, `/admin`)
* **Compliance & CSR (`/compliance`):** Oeko-Tex Standard 100 certification, SITRA accreditations, social compliance audits, effluent treatment tracking, and worker welfare initiatives.
* **Master Data Management (`/master/*`):** Centralized master registries for Styles, Buyers, Suppliers, Machines, and Yarn Lots.
* **Administration & RBAC (`/admin`):** User management, persona switching (MD, GM, Merchandiser, QA, Planner), and system telemetry.

---

## 4. Key Takeaways & Recommendations for Production Scale

1. **Backend Integration Roadmap:**
   - Migrate `src/services/index.js` endpoints to a resilient REST/GraphQL API (e.g., Node.js / FastAPI / Go microservices) connected to PostgreSQL or SAP/Oracle ERP databases.
   - Implement WebSocket or Server-Sent Events (SSE) for live shop-floor line telemetry and machine breakdown alarms.
2. **AI Engine Productionization:**
   - Connect the deterministic rule-based AI playbooks in `src/mock/ai.js` to an LLM / Retrieval-Augmented Generation (RAG) backend powered by operational vector databases and real-time machine telemetry.
3. **IoT & Edge Machine Integration:**
   - Direct integration with needle detectors, sewing machine optical counters, and energy smart meters via MQTT/OPC-UA for true automated floor data capture.
