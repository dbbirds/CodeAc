# Home HQ

This is the active codebase for the Home HQ household management app.

**Primary repo location:** `/home/user/home-hq`

Always look here first — not `/home/user/CodeAc` (that is a separate, unrelated project).

## Tech stack
- Next.js 14 (App Router)
- TypeScript
- Firebase (Firestore + Storage + Auth)
- Tailwind CSS

## Key directories
- `app/` — Next.js pages (chores, groceries, projects, calendar)
- `components/` — UI components grouped by feature
- `lib/hooks/` — Firebase data hooks (useChores, useProjects, useGroceries, etc.)
- `lib/types.ts` — Shared TypeScript types
