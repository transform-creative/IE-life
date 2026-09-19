# Project: IE Life

A private household app for Isaac & Eloise — the boring parts of running a life, in one place.
Two users, no public signup, no marketing surface.

**First module: Shopping.** Plan the week's dinners, roll the recipe ingredients up into one
consolidated list, and tick it off while ordering from Woolworths. The domain model and the
spreadsheet it replaces are documented in
[app/presentation/shopping/CLAUDE.md](app/presentation/shopping/CLAUDE.md).

**Mobile first.** This is used standing in a kitchen or walking a supermarket aisle. Every screen
is designed at phone width and _then_ allowed to spread out on desktop — see **Styling**.

---

## Stack

- **React 19** + **React Router v7** (SPA mode — `ssr: false` in `react-router.config.ts`)
- **TypeScript** throughout (strict, `~/*` alias → `./app/*`)
- **Supabase** (auth, database, storage) — project `IE-life`, ref `dfzmznfuplzjgxqiluuc`
- **Vite 7** + **Tailwind CSS 4** (used sparingly — prefer the CSS variables and utilities in `app.css`)
- **Vitest** + React Testing Library (jsdom)
- **Vercel** (deployment)

Scaffolded from the Transform Creative `react-starter` template, so some template machinery is
still present and **unused**: the `stripe-checkout` / `email-handler` / `moderate-image` edge
functions, `PaymentStepper`, Quill, and the react-email workspace. Don't build on them without
checking first — they're candidates for deletion, not extension.

---

## Project Structure

```text
/app
├── /routes          - Page-level route components (registered in routes.ts)
├── /presentation    - UI components, organized by feature
│   ├── /authentication
│   ├── /elements    - Reusable UI primitives
│   ├── /shell       - AppShell, PillNav, RequireAuth
│   └── /shopping    - Shopping + meal planning module
├── /database        - All Supabase queries/mutations
│   ├── SupabaseClient.tsx, Auth.tsx, Storage.tsx, Functions.tsx
│   ├── Fetch.tsx, Insert.tsx, Update.tsx, Delete.tsx, Helper.tsx
│   └── /shopping    - Per-module queries, same four-file split
├── /data            - Types, constants, shared utilities
│   ├── CommonTypes.tsx   - SharedContextProps and global UI types
│   ├── CustomTypes.tsx   - Composite/domain types
│   ├── supabase.ts       - Generated Supabase schema types
│   ├── BrandConfig.tsx   - Site name and copy
│   ├── dateUtils.ts      - Luxon wrappers
│   └── Objects.tsx       - App-wide constants and formatters
├── /setup           - SQL + edge function drafts. EXAMPLES ONLY — never a source of schema truth
├── root.tsx         - Root layout, shared context, ErrorBoundary
├── routes.ts        - Route config
└── app.css          - Global styles, CSS variables, utility classes
```

### Distributed context files

Area-specific guidance lives in a `CLAUDE.md` next to the code (auto-loaded when those files are
read). Maintenance rules are under **Rules** below.

- [app/presentation/shopping/CLAUDE.md](app/presentation/shopping/CLAUDE.md) — shopping/meal-planning domain model

---

## File & Component Structure

Follow the pattern in `app/data/ExampleComponent.tsx`:

```tsx
import type { SharedContextProps } from "~/data/CommonTypes";
import { useOutletContext } from "react-router";

export interface MyComponentProps {
  // props here
}

/******************************
 * MyComponent
 * One-line description — what this does and any non-obvious behaviour.
 */
export function MyComponent({}: MyComponentProps) {
  const context: SharedContextProps =
    useOutletContext();
  return <div />;
}
```

Rules:

- Always export a `Props` interface for every component
- Use `useOutletContext<SharedContextProps>()` to read global context
- Block-comment header on every top-level function, with the asterisk line
- Named exports only (route files are the exception — React Router requires a default)
- Import types with `import type` where possible

---

## Routing

React Router v7, files in `/app/routes/`, registered in `app/routes.ts`. A new route needs both.

| Route             | File                      |
| ----------------- | ------------------------- |
| `/`               | `IndexRoute.tsx`          |
| `/authentication` | `AuthenticationRoute.tsx` |
| `/account`        | `AccountRoute.tsx`        |
| `/shopping`       | `ShoppingRoute.tsx`       |
| `/shopping/week`  | `ShoppingWeekRoute.tsx`   |

Every route except `/authentication` wraps its screen in `RequireAuth`, which waits for
`context.sessionReady` before deciding — `session` is null both before auth resolves and when
signed out, so redirecting on null alone would bounce a signed-in user on every refresh.

---

## Global Context (`SharedContextProps`)

Provided at `root.tsx` via `<Outlet context={...}>`:

```tsx
const context: SharedContextProps =
  useOutletContext();
const { session, popAlert, isMobile } = context;
```

Key fields:

- `session` — Supabase auth session (null if signed out)
- `isMobile` — true if the user agent looks mobile (`isMobileBrowser()`)
- `inShrink` — true below the 1200px layout breakpoint (resize-driven, so it reacts to a rotate)
- `popAlert(header, body?, isError?)` — fire a toast
- `brandConfig` — copy resolved once via `getBrandConfig()`
- `navigate` — React Router's navigate, for non-link actions only

`isMobile` is user-agent based and `inShrink` is width based. Use `inShrink` for layout decisions
and `isMobile` only for genuinely device-specific behaviour (touch handlers, native pickers).

---

## Business Logic Pattern

Files suffixed `BL.tsx` / `BL.ts` hold business logic separated from UI. Keep fetching, filtering,
aggregation and transformation out of render functions and in a `BL` file or a custom hook — they
are the parts worth unit testing, and a pure function is far cheaper to test than a component.

---

## Database Layer

All Supabase operations live in `/app/database/` — **never call `supabase.from(...)` from a
component.** Every query is wrapped in a function exported from `Fetch` / `Insert` / `Update` /
`Delete` so query shapes are auditable in one place and RLS errors land in `logError()`.

The universal idiom:

```ts
const { data, error } = await supabase
  .from("table")
  .select("*");
if (error) {
  logError(error, ["fetchThing"]);
  throw error;
}
return data;
```

A module with more than a couple of queries gets its own subfolder with the same four-file split
(`app/database/shopping/Fetch.tsx`, …), so the root files stay usable as more modules land.

Queries never filter by `household_id` and inserts never set it: RLS already restricts every row to
the caller's household, and the column defaults to `current_household_id()`. Adding either by hand
is redundant at best and a way to write into the wrong household at worst.

Schema truth comes from the **Supabase MCP server** (`list_tables`, `list_migrations`,
`generate_typescript_types`), not from `/app/setup` — those files are drafts and go stale.
Migrations live in `supabase/migrations/` and are applied through the MCP server.
Regenerate `app/data/supabase.ts` after any schema change.

---

## Styling

**Mobile first.** Author the base rules for a phone; add `@media (min-width: …)` to enhance upward.
Never write a desktop layout and shrink it with `max-width`.

Breakpoints:

| Token  | Width    | Meaning                                                                                    |
| ------ | -------- | ------------------------------------------------------------------------------------------ |
| base   | < 768px  | Phone. The default — no media query.                                                       |
| `md`   | ≥ 768px  | Tablet / small laptop. `.md-row`, `.md-hide`, `.md-show`                                   |
| shrink | < 1200px | Legacy template breakpoint — `.shrink-wrap`, `.shrink-hide`, and `.w-*` collapsing to 100% |

Prefer the CSS variables and utility classes in `app.css` over Tailwind or inline styles.

### CSS variables

- **Colors:** `--txt` (near-black), `--bkg`, `--accent` (orange), `--secondary` (cream), `--safe`,
  `--danger`, `--warning`, `--accent-sm`, `--accent-md`, `--accent-lg`, `--surface-muted`
- **Surfaces:** `--lavender-gradient`, `--cream-gradient` — the two card fills the designs use
- **Fluid typography:** `--text-hero`, `--text-h1`–`--text-h5`, `--text-sm`, `--text-xsm` (`clamp()`-based)
- **Fluid spacing:** `--space-5`, `--space-10`, `--space-20`, `--space-30`
- **Borders:** `--border` (12.5px), `--border-lg` (25px), `--border-pill` (fully rounded)
- **Touch:** `--tap-min` (44px) — the minimum hit area for anything tappable

### Utility classes

- Layout: `.row`, `.col`, `.middle`, `.between`, `.center`, `.wrap`, `.grid-150/250/350`
- Mobile-first helpers: `.md-row`, `.md-col`, `.md-hide`, `.md-show`, `.tap`, `.safe-bottom`, `.scroll-x`
- Sizing: `.w-10`–`.w-100`, `.h-100`, `.dvh-50/80/100`, `.vh-*`
- Spacing: `.m-5/10/20`, `.p-5/10/20`, axis-specific (`.mt-*`, `.pb-*`, …), `.gap-5/10/20`
- Display: `.accent`, `.secondary`, `.bkg`, `.txt`, `.outline`, `.outline-accent`, `.boxed`
- Shadows: `.s-5`, `.s-10`, `.s-20`
- Animation: `.fade-sm`, `.fade-md`, `.btn-breathe`, `.skeleton`
- IE Life surfaces: `.card-lavender`, `.card-cream`, `.pill-row` (+ `.empty`), `.hero-card` with
  `.hero-title` (photo card, heading laid over a scrim), `.strike`

Use `dvh` (`.dvh-100`), never `vh`, for anything meant to be a full screen — `100vh` is taller than
the visible area on mobile Safari and pushes content under the browser chrome.

`.app-shell` is the page frame, applied once in `root.tsx`. A screen that wants two columns on a
wide monitor renders a `.split` and the shell widens itself via `:has()` — so there is no width
prop to thread through, and below 1200px `.split` does nothing and its children just stack.

### Component-level CSS

Only add a `<Component>.css` file when there are genuinely **4–5+ classes that must exist**. Before
you do, ask: could this be done with existing utilities, or by adding one or two new reusable
utilities to `app.css`? Almost always, yes.

---

## Testing

- **Vitest** (Jest-compatible API — `describe`/`it`/`expect`, globals on). Config in
  `vitest.config.ts`, separate from `vite.config.ts` because the React Router plugin errors under
  Vitest with "can't detect preamble".
- Global setup in `vitest.setup.ts` — it seeds placeholder Supabase env vars, because
  `SupabaseClient.tsx` constructs the client eagerly on import and would otherwise throw in any
  test that transitively imports it.
- **`@testing-library/react`** for components, jsdom environment.
- **Co-locate tests inside the relevant feature folder** — not nested deeply, no `__tests__` tree:
  - Shopping logic → `app/presentation/shopping/`
  - A reusable element → `app/presentation/elements/`
  - A database query → beside its file in `app/database/`
  - Shared types/utilities → `app/data/`
- Name the file after the file under test: `ShoppingBL.test.ts` beside `ShoppingBL.tsx`.
- Prefer testing `BL` functions directly over driving them through a rendered component.

---

## Commands

```bash
npm run dev          # Vite + React Router dev server
npm run build        # Production build
npm run typecheck    # react-router typegen + tsc
npm test             # Vitest, single run
npm run test:watch   # Vitest watch mode
npm run lint         # eslint app
npm run lint:fix     # eslint app --fix
npm run format       # prettier --write app
```

### Running verification commands

`npm test`, `npm run typecheck`, `npm run lint`, `npm run format` and `npx vitest run <path>` are
pre-approved in `.claude/settings.json` and must never prompt. That only holds in the canonical
shape below — every deviation is a fresh permission prompt, because Claude Code matches allow-rules
**per sub-command**, so a novel pipeline tail is a novel rule every time.

- **Run them bare, from the project root.** The working directory is already the project root.
- **Never prefix with `cd "<path>" &&`** or `Set-Location`. This is the single biggest source of
  repeat prompts.
- **Never append a status echo** — no `; Write-Host "EXIT: ..."`, no `; if ($?) { ... }`, no
  `&& echo "=== done ==="`. The exit code is already reported back.
- **To trim output, only** `2>&1 | tail -N`, `| head -N`, `| grep -E "..."` (or `| Select-Object`,
  `| Select-String` in PowerShell). Not `sed`, not `awk`.
- **One command per tool call.** Don't chain a typecheck and a test run with `&&`.

Anything that mixes these with other work (`git stash && npm test`) will still prompt, by design —
split it into separate calls.

---

## Environment Variables

`.env.local` (gitignored); `.env.example` is the committed template.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Rules

- Never use default exports — always named exports (route files excepted)
- Never query Supabase directly in components — use `/app/database/` functions
- Always type `useOutletContext()` with `SharedContextProps`
- Always define a `Props` interface for every component
- Follow the comment block structure from `ExampleComponent.tsx` for components and above each function
- **Mobile first** — base styles target a phone; enhance upward with `min-width` media queries
- Prefer the existing `app.css` variables and utility classes over inline styles or Tailwind; when
  something new is needed, add a reusable entry to `app.css` rather than a one-off
- Use the `~/*` path alias instead of relative imports where possible
- Never use `opacity` in styling unless explicitly asked — use the `var(--accent-(sm|md|lg))` colors
- Prefer **Luxon** (`~/data/dateUtils`) for all date/time work over native JS `Date`
- Never use `<span>` — default to `<div>` (or the most appropriate element), and wrap raw text in
  `<p>` or `<h*>`
- Navigate with `<Link>` / `<a href>`, not `onClick` + `navigate()`. Reserve `navigate()` for
  genuine non-link actions (opening a modal, submitting a form)
- Don't treat `/app/setup` SQL as how the database actually works — verify schema through the
  Supabase MCP server (`list_tables`, `list_migrations`, `generate_typescript_types`)
- Never deploy edge functions to Supabase — that is always done manually by the developer
- **TESTS: write or update the relevant unit tests and run the suite (`npm test`).** A change isn't
  complete until they pass. Co-locate test files per the **Testing** section
- **FORMATTING: run `npm run format` after finishing a change, before reporting it done.** That is
  `prettier --write app`, so it only covers `app/` — for edits under `supabase/` or config files at
  the root, run `npx prettier --write <changed paths>`. Config is `.prettierrc`
- **VERIFICATION COMMANDS: invoke `npm test` / `npm run typecheck` / `npm run lint` /
  `npm run format` bare, never wrapped in `cd ... &&` or followed by a status echo** — see
  _Running verification commands_. Wrapping them re-prompts for permission every time

### Maintaining `CLAUDE.md` files

Context lives next to the code it describes. A directory earns a `CLAUDE.md` only when it holds
genuine non-obvious knowledge — conventions, gotchas, or design decisions a contributor couldn't
infer by reading the files. **If a CLAUDE.md says something, treat it as truth and don't go
exploring to confirm it**, unless you have good reason not to trust it.

- **Placement:** at the feature/layer folder level — mirror where test files go. Not deeply nested,
  no dedicated docs tree. Filename is always `CLAUDE.md` (uppercase, so it auto-loads).
- **Include (signal):** the folder's purpose in 1–2 lines; naming/return/error conventions;
  non-obvious coupling between files; "why it's like this" decisions; recurring footguns; pointers
  to the canonical file for a concept.
- **Exclude (bloat):** anything derivable by reading the code; the tech stack; exhaustive file
  listings; content already in root or a sibling `CLAUDE.md` (link instead); speculative or
  aspirational notes; anything that could be (or already is) a code comment. If you're not sure,
  don't add it. Be EXTREMELY harsh about cutting.
- **Maintain:** when a code change invalidates a `CLAUDE.md` claim, fix the file in the same change.
  When a fact belongs deeper than root, move it down and leave a one-line pointer — don't duplicate.
- **Bar for a new file:** ~4+ distinct, durable facts. Otherwise add a line to the nearest existing one.
