---
type: "always_apply"
---

## 1. Code Structure & File Organization

* Use **feature-first** directory structure for scalability.
* Avoid cross-feature imports deeper than 1 level.
* Each feature should have its own `index.ts` public API file.
* Keep pure helpers in `/utils`, UI primitives in `/components`, and domain logic under `/features/<domain>`.

**Example Folder Layout:**

```
/src
  /app
  /features
    /Auth
    /Dashboard
  /components
  /hooks
  /services
  /stores
  /styles
  /types
  /utils
  /tests
```

---

## 2. Naming Conventions

* **Files:** `PascalCase` for components, `kebab-case` for non-components.
* **Exports:** Use default export for single main component per file.
* **Identifiers:** `camelCase` (variables), `PascalCase` (components/types), `UPPER_SNAKE` (constants).
* **CSS classes:** Stick to one convention (BEM or utility-first).
* **Branches:** `feature/<ticket>-desc`, `fix/<ticket>-desc`, `hotfix/<ticket>`.

---

## 3. Componentization & Reusability

* Each component should follow **Single Responsibility Principle**.
* Separate **container** (stateful) and **presentational** (stateless) components.
* Prefer **composition** (children/slots/render props) over configuration (boolean props).
* Keep components small (<200 LOC) and typed explicitly.

**Example:**

```ts
export type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};
export function Button({ children, onClick, disabled }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{children}</button>;
}
```

---

## 4. State Management Best Practices

* Prefer **local state** for UI-specific data, **global store** for shared/domain state.
* Normalize collections `{ byId, allIds }` to avoid duplication.
* Use **selectors** for derived data; avoid duplicating logic in components.
* Keep **side-effects** in thunks/effects, not components.
* Enforce immutability via linting or `immer`.

**Framework Hints:**

* React → Context + reducers or Redux/RTK.
* Vue → Pinia.
* Angular → Services + RxJS (NgRx for enterprise scale).

---

## 5. Performance Optimization

* Lazy-load large routes and features.
* Memoize heavy computations selectively (`useMemo`, `computed`).
* Virtualize large lists.
* Optimize media (responsive `srcset`, WebP/AVIF).
* Defer non-critical work (`requestIdleCallback`, web workers).
* Keep dependencies minimal and tree-shakable.

---

## 6. Testing & Debugging Strategies

* Follow **Test Pyramid**:

  * Unit (majority)
  * Integration (medium)
  * E2E (few, high-value flows)
* Test behavior, not implementation.
* Enforce coverage thresholds (≥80% for core modules).
* Use deterministic mocks and seeds.
* Generate source maps for dev/staging.

---

## 7. Version Control Workflows

* Enforce Conventional Commits (`feat:`, `fix:`, `chore:`...).
* Require PR review + passing CI.
* Include descriptive PR templates.
* Use semantic-release or changelog automation.
* Squash or merge commits based on org policy.

---

## 8. Styling & Theming

* Centralize tokens (`tokens.json`) for colors, spacing, typography.
* Avoid hard-coded colors/spacings.
* Use CSS variables for runtime theming.

**Example:**

```css
:root {
  --color-primary: #067df7;
  --space-1: 8px;
}
[data-theme="dark"] {
  --color-primary: #055bb5;
}
```

**Approaches:**

* Tailwind → utilities for layout, extract repeated styles.
* CSS Modules/SASS → scoped styles only.
* CSS-in-JS → prefer static extraction.

---

## 9. Accessibility (a11y)

* Target **WCAG 2.1 AA**.
* Prefer semantic HTML; use ARIA sparingly.
* Ensure keyboard navigation + visible focus.
* Label all inputs and associate errors.
* Add `aria-live` regions for async updates.
* Automate a11y checks (axe, pa11y) in CI.

---

## 10. Third-Party & API Integrations

* Vet and pin dependency versions.
* Use adapters/wrappers to isolate SDK logic.
* Enforce CSP & Subresource Integrity for external scripts.
* Implement retries, backoff, and fallbacks.
* Keep secrets outside repo.

---

## 11. Security & Privacy

* Sanitize all user input.
* Escape dynamic HTML.
* Enforce secure headers (CSP, HSTS).
* Avoid eval-like patterns.
* Mask or omit PII from logs.

---

## 12. Observability & Telemetry

* Add lightweight analytics + error tracking (Sentry/OTel).
* Log actionable context (not user PII).
* Measure performance metrics (TTFB, FCP, LCP, TTI).

---

## 13. TypeScript & Linting

**Recommended tsconfig.json:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "moduleResolution": "Node",
    "resolveJsonModule": true
  }
}
```

* Prefer `unknown` over `any`.
* Forbid unchecked `@ts-ignore`.
* Enforce linting via ESLint + Prettier + @typescript-eslint.

---

## 14. CI / Lint / Build Checks

* Lint (ESLint, Stylelint, Prettier).
* Unit + integration tests with coverage thresholds.
* E2E + a11y checks in CI.
* Bundle analyzer for size monitoring.
* Security audits (npm audit / Snyk).

---

## 15. Example IDE Rule Objects

```json
[
  {
    "id": "structure.feature-first",
    "category": "code-structure",
    "severity": "error",
    "description": "Use feature-first folder structure. Avoid cross-feature deep imports.",
    "autofixable": false
  },
  {
    "id": "naming.component-file",
    "category": "naming",
    "severity": "warn",
    "description": "Component files must use PascalCase and default-export a single main component.",
    "autofixable": true
  },
  {
    "id": "performance.lazy-load-routes",
    "category": "performance",
    "severity": "warn",
    "description": "Large routes must be lazy loaded.",
    "autofixable": false
  },
  {
    "id": "accessibility.wcag-aa",
    "category": "accessibility",
    "severity": "error",
    "description": "All pages must meet WCAG 2.1 AA.",
    "autofixable": false
  }
]
```

---

## 16. Validation Checklist

*

---

## 17. Quick Rationale

* **Feature-first** keeps domains isolated.
* **Strict typing** ensures refactor safety.
* **Lint/test gating** reduces regressions.
* **Tokenized styles** maintain design consistency.
* **Accessibility & security** ensure inclusive, compliant apps.
* **Adapters & abstractions** prevent vendor lock-in.
