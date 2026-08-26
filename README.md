# Meridian — RT Planning Research Workspace

**Author & maintainer:** Navid Moradimehr

A high-fidelity **frontend prototype** of a research clinical-decision-support platform for
adult glioblastoma (GBM) radiotherapy **treatment-planning review**.

> ⚠️ **Safety disclaimer** — Meridian is *not* a treatment planning system (TPS), holds **no
> regulatory or clinical approval**, and never produces a deliverable plan. Everything shown is
> synthetic prototype data. Candidate dose outputs are research forecasts that require
> recalculation in an approved local TPS, patient-specific QA, and clinician approval.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Requirements: Node 20+ (developed on Node 24 / Next.js 16).

## The walkthrough

| Screen | Route | Try it with |
|---|---|---|
| Dashboard | `/` | recent cases, metrics, activity |
| New case / import | `/cases/new` | progressive import + mock validation checklist (toggle the "missing OAR" scenario) |
| Validation & registration | `/cases/GBM-0198/validation` | the registration-issue case: warnings, confidence 0.71, overlay wipe |
| Contour review | `/cases/GBM-0241/contours` | structure toggles, slice scrubbing (arrow keys), approval gate |
| Plan intent | `/cases/GBM-0241/intent` | protocol-driven form (locked fields) |
| Generate candidate | `/cases/GBM-0241/generate` | simulated job + Remotion isodose bloom |
| **Plan review** | `/cases/GBM-0241/review` | the flagship: dose overlay, DVH, constraints, trade-off callout |
| Export & audit | `/cases/GBM-0177/export` | mock exports + audit timeline |

Mock cases: **GBM-0241** (ready for review, one deliberate optic-nerve ↔ coverage trade-off),
**GBM-0198** (registration requires review), **GBM-0177** (exported, full audit trail).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui (radix preset) + Lucide icons
- Framer Motion (UI motion, reduced-motion aware) + **Remotion** (`@remotion/player`, lazy-loaded)
  for the animated isodose composition on the Generate screen
- Recharts for DVH curves
- React Context for prototype state (`CaseContext`, `ViewerContext`)
- Procedural SVG "phantom" — deterministic synthetic head slices that contours and dose isolines
  stay registered to (no binary image assets, no real medical data)

## Architecture (target MVP)

```
Next.js frontend  →  Next.js API boundary  →  FastAPI DICOM/ML workers
                                                ├─ Orthanc DICOMweb (imaging/RT objects)
                                                ├─ PostgreSQL/Supabase (metadata, audit)
                                                ├─ Object storage (S3/MinIO)
                                                └─ Async job queue (registration/inference/optimisation)
```

- **No direct frontend→database access** — every read/write crosses the validated API boundary
- RBAC, immutable audit events, on-premise deployment are design constraints
- The mock layer is the swap point: `src/lib/mock/*` → FastAPI REST endpoints; context actions
  are named after the intended API calls; job polling contract already shaped by the Generate UI

Project planning notes are kept in a local Obsidian vault (`docs/obsidian-vault/`) —
intentionally **not** part of this repository.

## What is mocked vs what is real

**Mocked (synthetic):**
- All case/imaging/structure data (`GBM-####` labels; no patient data anywhere)
- The anatomy itself — procedurally generated abstract head slices
- DVH curves, constraint values, registration confidence, job stage timings
- Uploads, exports, reviewer identity, "planning time saved" metric

**Real (application logic):**
- Workflow state machine and its **hard gates** (approved contours + confirmed intent before
  generation; blocked states on critical breaches)
- Case/viewer state management, cross-screen linked interactions (structure ⇄ DVH ⇄ table ⇄ viewer)
- Audit trail rendering driven by real state transitions
- Design system, accessibility behaviour, `prefers-reduced-motion` handling

## Scope boundaries

- One protocol only: **GBM · 60 Gy / 30 fx**, VMAT. A separate 54 Gy protocol comes much later
  (stage 7 of the roadmap) — never merged into the first model
- No linac/OIS integration, no auto-delivery, no clinical claims — see the in-app `/about` page
- MVP roadmap (7 stages) is documented in the vault: prototype → real DICOM ingestion → DVH PoC
  → 60 Gy dose-prediction model → dose-mimicking candidates → TPS/QA integration → 54 Gy protocol

## Repository layout

```
src/types/               domain models (DTO contract mirror)
src/lib/mock/            mock data layer (backend swap point)
src/lib/phantom/         procedural slice geometry engine
src/lib/workflow.ts      stage/gate derivation
src/context/             Case + Viewer React contexts
src/components/
  shell/                 app shell, stage stepper
  primitives/            status/verdict badges, tiles, safety gate
  viewer/                slice viewport, DVH chart, constraint table, compare
  motion/                BeamArc + Remotion DoseIsolines composition/player
src/app/                 routes (dashboard, about, cases/*)
```

## Remaining backend integration work (stage 2+)

1. FastAPI service: case CRUD, DICOMweb proxying to Orthanc, registration QC endpoints
2. Auth/RBAC + session handling at the API boundary; server-side audit writes
3. Replace `src/lib/mock` with typed fetchers; keep DTO shapes from `src/types`
4. Job queue + polling contract for registration/inference/optimisation workers
5. Dose grid → real DVH computation; WADO-RS frame rendering to replace the phantom
6. De-identification pipeline enforcement server-side before anything is stored
