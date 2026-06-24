# Project Guide for Claude

> Root context file. Read this first. It tells you what this project is, how to run it,
> how the owner likes to work, and where the detailed rules live.

## What this project is
**NayaJagir** — a job portal (job board) for Nepal. A monorepo with three apps:

| Folder | App | Stack | Dev command | Port |
|---|---|---|---|---|
| `server/` | Backend API | Node + Express + TypeScript + Prisma (Supabase Postgres) | `npm run dev` | **5050** |
| `portal/` | Public site + job-seeker/employer dashboard | Next.js 15 (App Router, Turbopack), React 19, TanStack Query, RHF+Zod, shadcn/ui, Tailwind v4 | `npm run dev` | **3003** |
| `admin/` | Admin panel | Vite + React + TypeScript | `npm run dev` | (Vite default) |

- Backend health: `http://localhost:5050/health` · API docs: `http://localhost:5050/api-docs`
- Frontend: `http://localhost:3003`

## How to run
```bash
# backend
cd server && npm run dev
# frontend (separate terminal)
cd portal && npm run dev
```

Both have deps installed. `server/.env`, `portal/.env.local`, `admin/.env` already exist.


## Detailed conventions (must follow when coding)
- **Frontend developer guide:** the architecture map is [`portal/ARCHITECTURE.md`](portal/ARCHITECTURE.md)
  (routes, providers, API client, design tokens, components); the rules are
  [`portal/CLAUDE.md`](portal/CLAUDE.md) — the source of truth. **Start with §0 "Change Discipline"**:
  make the smallest change that satisfies the request, reuse existing components/utils/tokens, match
  surrounding style, don't hand-edit `components/ui/*`, and only refactor when a feature genuinely
  demands it — then verify the page still returns 200. Other key rules: data fetching is
  **TanStack Query only** (no `useEffect`+`useState` for server data); forms are
  **react-hook-form + Zod**; UI is **shadcn/ui + Tailwind `cn()`** with theme tokens (no hard-coded
  hex); no `any`; errors via `handleApiError`; auth via `useAuth()`; one typed API layer in
  `@/lib/api` + `features/*`.
- **Backend developer guide:** the architecture map is [`server/ARCHITECTURE.md`](server/ARCHITECTURE.md)
  (request flow, models, routes, security, + a tech-debt list); the rules are
  [`server/CLAUDE.md`](server/CLAUDE.md). **Start with §0 "Change Discipline"**: don't break the API
  contract (response shapes/field names/status codes that portal & admin depend on), keep the 3 layers
  (routes → Zod schemas → services), validate every input with Zod, throw via `createError`, schema
  changes need a Prisma migration, check ownership/permissions in the service. Layout: routes in
  `server/src/routes/*`, controllers in `controllers/*`, logic in `services/*`, Zod in `schemas/*`,
  Prisma schema in `server/prisma/schema.prisma`.

## Always update the log (DEVLOG.md)
After **every feature or change** — whether done by a developer or by AI — append a **short** entry
to the root **[`DEVLOG.md`](DEVLOG.md)**: newest day on top, one or two lines (what changed → file(s),
+ commit hash if pushed). Keep it brief; it's the project diary. This rule is repeated in
`portal/CLAUDE.md` and `server/CLAUDE.md` so it applies wherever you're working.

## Git
- Branch: `main`. Remotes: **`origin`** = owner's fork (`abhishekh203/job-portal`), **`upstream`** = `Ash-333/job-portal`.
- **Commit & push only when the owner explicitly asks** ("commit and push").
- When committing, **stage only the relevant source files** — do NOT commit `server/logs/combined.log`
  (a runtime log that changes whenever the server runs).
- **Commits are authored by the repo owner only** (git user `Abhishekh`). Do **not** add a
  `Co-Authored-By: Claude ...` footer or any Claude attribution to commit messages.

## How the owner likes to work (preferences)
- **Explain in simple, plain language.** Short, clear summaries over jargon.
- Wants visual/UI changes done directly, then verified (page returns 200 / renders).
- Often shares **screenshots** of a section and says "move this" / "make this better" — identify the
  matching component and act.
- After a feature/fix, asks for **"commit and push"** as a separate step.
- Maintains a **day-wise [`DEVLOG.md`](DEVLOG.md)** — after meaningful work, add/append an entry
  (Asked → Did → files → commit). Newest day on top.
- When a request needs **backend changes**, say so explicitly (what field/endpoint/migration),
  even if you implement the frontend-only part now.

### New-feature workflow — research & agree BEFORE coding
For any **new feature** (not a small tweak), do NOT jump straight to code. Follow this:
1. **Research first.** Look at *what we already have* (existing components/services/patterns) and the
   *current approach*. Then figure out *better possible approaches*, including which one **scales**.
2. **Go wide for complex/heavy features.** Use **web search and GitHub search** to compare how others
   solve it and find the stronger, more scalable pattern — don't rely on memory alone.
3. **Ask questions** if anything is unclear *after* the research (don't guess on ambiguous scope).
4. **Present the approach to the owner** — the options considered, the recommended one, and why
   (incl. scalability + tradeoffs). **Wait for the owner to finalize the approach.**
5. **Then build it**, following the agreed approach (and the §0 Change Discipline of each app).
6. **After completing**, make sure it's solid code-wise (compiles, verified, no breakage).
7. **Only if the owner then asks for an explanation**, write the [`FORABHISHEKH.md`](FORABHISHEKH.md)
   learning doc (concise, plain-language — see its section below).

> In short: **research → propose → agree → build → verify → (explain only if asked).** Never skip
> straight from request to large implementation without agreeing on the approach.

## `FORABHISHEKH.md` (the learning doc) — only when asked
**Do NOT write this automatically.** Only add an entry to **`FORABHISHEKH.md`** (repo root) when the
owner explicitly asks for it. When asked, explain the work in plain, friendly language (like a sharp
friend over coffee, **not** a textbook) — **concise but understandable**, not exhaustive. Use a
quick analogy if it helps an idea stick.

When asked, briefly cover the useful parts (skip any that don't apply): the **approach & why**,
**other options considered and why rejected** (the owner values this most), key **tradeoffs**, any
**mistakes/fixes**, and **pitfalls/lessons** to carry forward. Keep it tight.

Format: newest entry on top, dated `## YYYY-MM-DD — <task title>`.
`DEVLOG.md` = *what* we did (the diary). `FORABHISHEKH.md` = *why & what to learn* (only on request).

## Known issues / things to revisit
- **Job-detail SSR error:** `sanitizeHtml` (DOMPurify) throws on the server because it needs a
  browser DOM; the page falls back to client render (still 200). Fix: use an isomorphic sanitizer
  or sanitize on the server differently. Pre-existing.
- **Auth token in `localStorage`** (XSS-exposed) — prefer httpOnly cookie when backend supports it
  (also noted in `portal/CLAUDE.md`).
- **Half-built `CVUnlock`** model exists with no backend logic or UI.
- **Backend hardening (before prod)** — see [`server/ARCHITECTURE.md` §16](server/ARCHITECTURE.md) for
  the full verified list. Top items: stale fallback URLs (`PORT||5000`, `FRONTEND_URL||:3000` while
  app runs on 5050/3003 — breaks CORS & email links if env missing), `tls.rejectUnauthorized:false`
  in email (MITM risk), `trust proxy` not set (rate limiting & audit IPs wrong behind a proxy),
  `process.exit(1)` on any unhandled rejection, no graceful shutdown, Swagger `/api-docs` exposed in
  prod, Prisma errors matched by string instead of codes.

## Quick map of features (as of 2026-06-24)
- **Live:** auth (+email verify, password reset), job browse/detail/apply, applications + status
  timeline, profile + resume/logo upload, company profile page, blogs, employer job CRUD +
  applicants + subscription, full admin panel (approvals, users, blogs, plans, sponsored, audit).
- **Backend-ready but not on portal UI:** sponsored-companies showcase, job `viewCount` analytics.
- **Future ideas:** saved jobs, job alerts/notifications, recommended jobs, company reviews,
  CV-unlock/credits, companies directory, OAuth login.

See [`DEVLOG.md`](DEVLOG.md) for the running history of changes.
