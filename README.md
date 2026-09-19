# IE Life

A private household app for Isaac & Eloise. First module: weekly meal planning and a consolidated
Woolworths shopping list.

Built on the Transform Creative react-starter template — React 19, React Router v7 (SPA), Supabase,
Vite, Vercel. **Mobile first.**

See [`CLAUDE.md`](./CLAUDE.md) for architecture and conventions, and
[`app/presentation/shopping/CLAUDE.md`](./app/presentation/shopping/CLAUDE.md) for the shopping
domain model.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the two VITE_SUPABASE_* values
npm run dev
```

## Daily commands

```bash
npm run dev          # dev server
npm run typecheck    # react-router typegen + tsc
npm test             # Vitest, single run
npm run lint         # ESLint
npm run format       # Prettier over app/
npm run build        # production build
```
