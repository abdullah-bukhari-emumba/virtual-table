# virtual-table-v2

Modern EHR (Electronic Health Record) table prototype built with Next.js 16 and Tailwind CSS v4. This iteration focuses **only** on a production-quality UI design with static sample data. Future work will layer in row virtualization to handle 100K+ records efficiently.

## Features (Current)
* Professional healthcare-themed styling (blues, neutrals, accessible contrast)
* 5-column patient record schema: Patient ID, Patient Name, Date of Birth, Diagnosis / Condition, Last Visit Date
* 20 realistic sample patient records (hardcoded)
* Scrollable table container with ~10 visible rows and sticky column headers
* Alternating row backgrounds and hover interaction states
* Responsive layout (table scales horizontally; vertical height constrained)

## Virtualization Roadmap (Planned)
When implementing high-performance rendering for 100K+ rows, consider:
1. Data Source Layer
   - Replace static array with a data provider abstraction (e.g., `getRecords(range: { start: number; end: number })`).
   - Support server-side pagination or streaming if dataset is remote.
2. Measurement & Row Height Strategy
   - Fixed row height simplifies calculations (current design uses a consistent ~44px row height). Confirm and lock this value.
   - If variable height becomes necessary (e.g., notes column), integrate dynamic measurement (ResizeObserver) or precompute heights.
3. Virtual Window Implementation
   - Maintain `scrollTop`, `viewportHeight`, and compute visible index window.
   - Render only visible rows + small overscan buffer (e.g., 5 above / below).
   - Use absolute positioning within a tall spacer element to preserve native scrollbar behavior.
4. Accessibility Considerations
   - Preserve semantic `<table>` when possible; if switching to div-based virtualization, mirror roles (`role="table"`, `rowgroup`, `row`, `cell`).
   - Keep header cells accessible with `scope="col"` and ARIA attributes.
5. Performance Optimizations
   - Memoize row components; avoid re-renders via stable data references.
   - Batch DOM writes (no layout thrash from per-row measurement).
   - Consider Web Worker for heavy formatting (unlikely needed here).
6. Keyboard Navigation & Focus Management
   - Arrow-key row traversal; focus ring styling; preserve virtualization window while moving.
7. Future Enhancements
   - Column sorting, filtering (client or server side), column resizing, and export (CSV / FHIR mapping).

## Running Locally

```powershell
pnpm install
pnpm dev
```

Visit http://localhost:3000 to view the dashboard.

## Development Notes
* Tailwind v4 via `@import "tailwindcss"` in `app/globals.css`
* All styles are utility-based; no external component libraries.
* Dark mode supported via system preference (see CSS variables in `globals.css`).

## Contributing / Next Steps
Open an issue or start a branch to add the virtualization layer. Begin by extracting the table into `components/VirtualTable.tsx` and designing a row window calculation hook (`useVirtualRows`).

---
© 2025
