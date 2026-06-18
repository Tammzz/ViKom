# ViKom Web — Design System

The canonical reference for how the web admin portal is styled. When building or
changing UI, **check here first**: reach for an existing token or component before
writing new CSS, and prefer Bootstrap utilities over bespoke styles.

Stack: React + TypeScript + Vite · Bootstrap 5.3 · react-bootstrap · bootstrap-icons.

> Status: this doc is maintained incrementally alongside the design-system
> refactor (see `~/.claude/plans/please-do-a-thorough-cozy-robin.md`).
> **Increment 1 (done):** design tokens, tamed globals, shared error alert.
> **Increment 2 (done):** `PageHeader` + `Tabs` components; `AppointmentCard`
> extended with subject/actions/footer slots; **Appointments** refactored onto
> the shared components (its custom CSS is now just page padding).
> Remaining feature refactors (dashboards, visits, availability) land in later
> increments and will be reflected here as they ship.

---

## 1. Core principles

1. **Tokens over literals.** Never hardcode a hex colour, spacing value, font
   size, radius, or shadow. Tokens already cover this and they live in
   [`:root` in index.css](./index.css).
2. **Bootstrap-first.** Use Bootstrap utilities (`d-flex`, `gap-3`, `p-4`,
   `mb-3`, `row`/`col`) and components (`Alert`, `Badge`, `Button`, `Card`,
   `Modal`) before writing custom CSS. Only write custom CSS for genuinely
   ViKom-specific visuals.
3. **Reuse shared components.** The `components/common/` library already covers
   most patterns (tables, cards, badges, empty states, etc.). Use them instead
   of re-implementing markup per page.
4. **No `!important`.** If you need it, the real fix is usually to not apply a
   conflicting Bootstrap `bg-*`/utility (those are `!important`) and let a custom
   class own the style — see `StatusBadge` for the pattern.
5. **No new bare-element selectors.** Global element styling (`body`, `h1–h6`)
   is intentional and centralised in `index.css`. Don't add more. Scope custom
   rules to a component/page class, and use the `vk-` prefix for reusable ones.

---

## 2. Design tokens

All tokens are CSS custom properties defined in [`index.css`](./index.css) `:root`.

### Colour — brand & semantic

| Token                       | Value              | Use                            |
| --------------------------- | ------------------ | ------------------------------ |
| `--bs-primary`              | `#7c56e3`          | Primary actions, active states |
| `--bs-primary-hover`        | `#6b47c9`          | Primary hover                  |
| `--bs-secondary`            | `#1e214c`          | Headings, dark emphasis        |
| `--bs-info`                 | `#1932b2`          | Informational                  |
| `--bs-success`              | `#28a745`          | Completed / available          |
| `--bs-danger`               | `#dc3545`          | Errors / cancelled             |
| `--bs-dark`                 | `#111215`          | Text, strong borders           |
| `--bs-light` / `--bs-white` | `#f8f9fa` / `#fff` | Surfaces                       |

`*-rgb` variants exist for use in `rgba(...)` (e.g. `--bs-primary-rgb`).

### Colour — neutral / gray scale

`--gray-100` `#f8f9fa` · `--gray-200` `#e9ecef` · `--gray-300` `#dee2e6` ·
`--gray-400` `#ced4da` · `--gray-500` `#adb5bd` · `--gray-600` `#6c757d` ·
`--gray-700` `#495057` · `--gray-800` `#343a40` · `--gray-900` `#111215`

Semantic aliases: `--border-color` (gray-300), `--border-strong` (dark),
`--text-muted` (gray-600), `--surface-muted` (gray-100).

### Colour — status surfaces (alerts)

`--danger-surface-bg/-fg/-border` and `--success-surface-bg/-fg/-border`.
Used by `.vk-error-alert` and Bootstrap `.alert-*` overrides — don't hardcode
alert colours.

### Spacing scale

`--space-1` 0.25 · `--space-2` 0.5 · `--space-3` 0.75 · `--space-4` 1 ·
`--space-5` 1.5 · `--space-6` 2 · `--space-7` 3 (rem). Bootstrap-aligned.
**Prefer Bootstrap padding/margin/gap utilities in JSX**; use the tokens inside
custom CSS.

### Font-size scale

`--fs-xs` 0.75 · `--fs-sm` 0.875 · `--fs-base` 1 · `--fs-md` 1.125 ·
`--fs-lg` 1.25 · `--fs-xl` 1.5 · `--fs-2xl` 2 · `--fs-hero` 4 (rem).

### Radius

`--radius-sm` 0.75 · `--radius-default` 1 · `--radius-card` 1.25 (rem) ·
`--radius-pill` 999px.

### Elevation / shadow

`--shadow-sm` · `--shadow-md` · `--shadow-lg` · `--focus-ring` (single primary
focus ring — use everywhere instead of ad-hoc focus shadows).

---

## 3. Typography

- **Body:** Poppins (`--font-primary`). **Headings:** Nunito (`--font-heading`).
- **Role-based base size** (set on `<body>` by the layout):
  - Patient-facing → 18px (`--fs-md`) default, larger for elderly users.
  - `body.role-personnel` → 16px (`--fs-base`), denser portal.
- Headings `h1–h6` are globally styled (Nunito, weight 700, secondary colour).
  Don't restyle headings per page; use Bootstrap size utilities (`fs-1`…`fs-6`)
  if you need a different visual size.

---

## 4. Component library (`src/components/common/`)

Use these instead of hand-rolling markup. "Use instead of" notes the manual
pattern each one replaces.

| Component                                | Purpose                                                          | Key props                                                                    | Use instead of                                      |
| ---------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------- |
| `DataTable<T>`                           | Config-driven table card                                         | `columns`, `data`, `rowKey`, `onRowClick`, `emptyText`, `emptyIcon`, `hover` | Hand-built `<table>` / Bootstrap `Table` per page   |
| `SectionCard`                            | Standard card (bordered, light header w/ icon + optional action) | `title`, `icon`, `action`, `bodyClassName`                                   | `.card`/`.appointments-card` + manual header markup |
| `EmptyState`                             | Centered empty placeholder                                       | `icon`, `text`, `action`                                                     | `text-center py-4` empty blocks / custom `.empty-*` |
| `StatusBadge`                            | Status → coloured pill + Norwegian label                         | `status`                                                                     | Inline `<Badge>` with manual variant/label mapping  |
| `TaskBadges`                             | Comma-separated tasks → badges                                   | `tasks`, `variant`                                                           | Splitting + mapping badges inline                   |
| `InfoRow`                                | Label/value row (icon, empty fallback)                           | `label`, `value`, `icon`, `emptyText`                                        | `ListGroup.Item d-flex justify-content-between`     |
| `StatTile`                               | Compact KPI tile (icon + value + label)                          | `label`, `value`, `icon`                                                     | Custom stat-card markup                             |
| `IconButton`                             | Square outlined icon-only button                                 | `icon`, `onClick`, `title`, `loading`, `disabled`                            | Bare `<button>` with an icon                        |
| `Avatar`                                 | Initials/photo circle                                            | `name`, `size` (sm/md/lg), `imageUrl`                                        | Manual avatar divs                                  |
| `Timeline`                               | Vertical activity feed                                           | `items`, `emptyText`, `emptyIcon`                                            | Custom activity lists                               |
| `Tabs`                                   | Pill tab bar w/ count badges                                     | `tabs` (`{key,label,icon?,count?}[]`), `activeKey`, `onChange`               | Page-specific `.tab-navigation` markup              |
| `PageHeader`                             | Page title + subtitle + right-aligned actions                    | `title`, `subtitle`, `actions`                                               | Inline `<h1>` + subtitle + action-row per page      |
| `AppointmentCard`                        | Appointment card (date/time, subject, status, tasks, actions)    | `appointment`, `taskVariant`, `dateTimeText`, `subject`, `footerNote`, `actions` | Inline appointment-item markup                  |

**Still underused (target for upcoming refactors):** `AppointmentCard`,
`EmptyState`, `Tabs`, and `PageHeader` are wired into the patient feature and the
Appointments page. Dashboards and visits still re-implement these by hand —
prefer the shared versions in new work.

### Shared CSS utilities (global, in `index.css`)

- `.vk-error-alert` + `.vk-error-alert__close` — dismissible page-level error
  banner. Single source; don't redefine per page.

---

## 5. Layout standards

- **Page padding:** content area uses a consistent page padding (`2rem`); keep it
  via the layout container, not per-page overrides.
- **Page header:** every page should open with `<PageHeader>` (title + optional
  subtitle + right-aligned `actions`). Put page-level buttons (create, clean up)
  in its `actions` slot, then render `<Tabs>` / content below.
- **Detail layouts:** two-column (Bootstrap `Col lg={4}` / `lg={8}`); stack cards
  in a column with `.vk-card-stack`.
- **Grids:** use Bootstrap `row`/`col` for stat grids and card grids rather than
  bespoke CSS grid where Bootstrap suffices.

---

## 6. Bootstrap conventions

- **Do** use utilities for layout/spacing/flex/typography sizing.
- **Do** use react-bootstrap `Alert`, `Badge`, `Button`, `Card`, `Modal`, `Nav`.
- **Don't** override Bootstrap component classes globally beyond the intentional
  theming already in `index.css` (`.btn`, `.card`, `.badge`).
- **Don't** fight a Bootstrap `bg-*`/utility with `!important`; omit the
  conflicting utility and let a custom class style it (see `StatusBadge`).

---

## 7. Do / Don't

| ✅ Do                                               | ❌ Don't                                           |
| --------------------------------------------------- | -------------------------------------------------- |
| Use a token (`var(--space-4)`, `var(--gray-600)`)   | Hardcode `1rem`, `#6c757d`                         |
| Reuse a `components/common/` component              | Re-implement tables/cards/empty states inline      |
| Prefix reusable classes `vk-`                       | Add bare global selectors (`.card-item`, `button`) |
| Scope page CSS under a page/component class         | Leak styles to global element selectors            |
| Use Bootstrap utilities for spacing/flex            | Write custom flex/margin CSS that Bootstrap covers |
| Omit conflicting `bg-*` then style via custom class | Reach for `!important`                             |
