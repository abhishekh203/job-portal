# Development Log

A day-wise record of what was changed in this repo, step by step. Newest day on top.
Each entry: what was asked → what was done → files touched → commit (if pushed).

---

## 2026-06-27

### 1. Upgraded portal to Next.js 16 (Vercel deploy was blocked)
- **Asked:** deploy portal to Vercel; deploy failed on "vulnerable Next.js version".
- **Did:** upgraded `portal` Next.js `15.3.2 → 16.2.9` (+ React 19.2.7, eslint-config-next 16), ran `@next/codemod upgrade`. Build verified locally (25 routes). Files: `portal/package.json`, `portal/package-lock.json`, `portal/tsconfig.json`.
- **Commit:** `63d2b0b` — *Upgrade portal to Next.js 16 to fix Vercel vulnerability block*

### 2. Rebrand NayaJagir → DarbarJob (new domain darbarjob.com)
- **Asked:** rebrand to our new domain `https://www.darbarjob.com`.
- **Did:** replaced `NayaJagir → DarbarJob` and `nayajagir → darbarjob` across `portal/src`, `admin/src`, `server/src` (UI text, page titles, emails `hello@darbarjob.com`, email templates). Renamed asset `nayajagir-mobile-v1.png → darbarjob-mobile-v1.png`. Added `metadataBase` (darbarjob.com) in `portal/src/app/layout.tsx`.

### 3. Job detail page now opens at the top
- **Asked:** clicking a job should load the page from the top.
- **Did:** added `window.scrollTo(0,0)` on mount (keyed to `job.id`) in `portal/src/components/jobs/job-details-client.tsx`.

### 4. Google Search Console verification
- **Asked:** add the GSC site-verification meta tag for darbarjob.com.
- **Did:** added `verification.google` to root metadata in `portal/src/app/layout.tsx` (renders site-wide).

### 5. Off-theme colors → design tokens (forgot/reset password + others)
- **Asked:** forgot-password didn't match theme; check signup/login/everywhere for hardcoded colors.
- **Did:** swept `portal/src`. Replaced misused `destructive`/`cta` red gradient + `text-white` with `gradient-primary` + `text-primary-foreground` in `auth/forgot-password` and `auth/reset-password` (icon, button, bg blob). Converted on-primary `text-white → text-primary-foreground` in `page.tsx`, `header.tsx`, `footer.tsx`, `mobile-job-search.tsx` (adapts in dark mode).
- **Left intentional:** multi-color placeholder company logos (`page.tsx` marquee), frosted-glass `bg-white/x dark:…` overlays, `text-primary-foreground dark:text-white` logo icons, `bg-black/50` modal scrims. Login/register already clean.

---

## 2026-06-24

### 1. Synced with remote & fixed a broken build
- **Asked:** confirm we're on `main` and pull latest.
- **Did:** Pulled `origin/main` (fast-forward `4d7507f..4698c77`, 25 files). No pull conflict.
- **Then discovered:** leftover **git stash-pop conflict markers** (`<<<<<<< Updated upstream` / `>>>>>>> Stashed changes`) breaking the app in:
  - `portal/src/app/layout.tsx`
  - `portal/src/app/globals.css`
- **Resolved** by keeping the **Forest-Teal / parchment ("Workable") theme** + Montserrat/Source-Serif fonts (the side consistent with the rest of the file and `portal/CLAUDE.md`). Fixed a mangled font var (`--font-source-serif`).
- **Verified:** frontend (3003) + backend (5050) both return 200.
- **Commit:** `9d16ff2` — *fix: resolve stash-pop conflict markers in layout and globals.css*

### 2. Started backend + frontend
- **Asked:** run backend and frontend.
- **Did:** `server` (backend) on **:5050**, `portal` (Next.js frontend) on **:3003**. Both confirmed 200.
  - Backend health: http://localhost:5050/health · API docs: http://localhost:5050/api-docs
  - Frontend: http://localhost:3003
- Note: there's also an `admin` (Vite) app, not started.

### 3. Reordered homepage sections
- **Asked:** move the phone "Job search in your pocket" section to the bottom; put "Popular searches" below "Featured Opportunities".
- **Did (in `portal/src/app/page.tsx`):**
  - Moved `<MobileJobSearch />` to the **bottom** of the page (after CTA).
  - Moved `<PopularSearches />` to **directly below the Featured Opportunities** section.
  - Fixed corrupted text: `No繁琐 forms` → `No lengthy forms`.
- **Commit:** `982601c` — *feat: reorder homepage sections* (text-fix included later in card work)

### 4. Reviewed product: what exists vs. what's missing
- **Asked:** read the backend and summarize frontend features, backend-ready-but-missing-on-UI features, and future ideas.
- **Key findings:**
  - **Backend ready, not shown on portal:** sponsored-companies showcase (`GET /api/sponsored-companies`), job `viewCount` analytics for employers.
  - **Half-built:** `CVUnlock` DB model exists with **no backend logic and no UI** (employer pay-to-unlock candidate).
  - **Missing models (future):** saved/bookmarked jobs, job alerts/notifications, companies directory list endpoint.

### 5. Redesigned the job card "shape"
- **Asked:** the job page/cards don't look good — improve the shape.
- **Did (`portal/src/components/jobs/job-card.tsx`):** rounded-2xl card, hover lift + shadow, featured accent strip + "⭐ Featured" pill, bigger logo, pill badges, salary pill, circular arrow CTA, whole-card clickable (stretched link).
- **Verified:** `/jobs` and `/` return 200.

### 6. Added sections to the job detail page
- **Asked:** add missing sections — Job role, Job requirements, About company, FAQs about this job. Flag any backend changes needed.
- **Did (`portal/src/components/jobs/job-details-client.tsx`):**
  - **Job Requirements** — newly rendered (data already stored in `Job.requirements`, was never displayed). No backend change.
  - **About the Company** — new main-column section (logo, name, location, website, link to all company jobs).
  - **FAQs about this job** — new collapsible accordion, **auto-generated** from job data (type, remote/on-site, experience, salary, deadline, how to apply). No backend change.
- **Backend changes flagged (not done, optional/future):**
  - Employer-authored **custom FAQs** → add `faqs` field to `Job` + job-form inputs.
  - Real **company "About us" text** → add `companyDescription` field (only name/logo/website/location stored today).
- **Known pre-existing issue:** the job-detail page throws on the **server** in `sanitizeHtml` (DOMPurify needs a browser DOM); page still renders via client fallback (200). Not caused by these changes — fix pending.

### 7. Added project memory docs
- **Asked:** maintain a day-wise `DEVLOG.md` and a root `CLAUDE.md` so context is remembered.
- **Did:** created this file and `CLAUDE.md` at the repo root.

### 8. Authored developer guides + conventions
- **Frontend guide:** added `portal/CLAUDE.md` §0 "Change Discipline" + `portal/ARCHITECTURE.md`
  (corrected stale facts: port 3003, Forest-Teal theme, Montserrat fonts, NayaJagir).
- **Backend guide:** added `server/CLAUDE.md` (§0 Change Discipline) + `server/ARCHITECTURE.md`
  (request flow, models, security) incl. a **verified tech-debt list §16** + pagination scale-later note.
- **Standards set:** every new endpoint must go Route → Controller → Service (direct-call routes are
  legacy-to-migrate); refactor only when a feature demands it or the dev asks.
- **Learning doc rule:** `FORABHISHEKH.md` is written only on request, concise.
- **Git identity:** set repo to `abhishekh203 <abhishekhkapar@gmail.com>`; commits carry no Claude footer.
- **Log rule:** added "always update DEVLOG.md after any change" to all three CLAUDE.md files.
- **New-feature workflow:** added "research → propose → agree → build → verify → explain-if-asked"
  (incl. web/GitHub search for heavy features) to root `CLAUDE.md` + `server/CLAUDE.md` (backend-focused).

### 9. Refreshed `AGENTS.md` (was outdated)
- Fixed stale ports (server 5000→**5050**, portal 3000→**3003**), corrected model count (6→**10**) and
  documented the missing **AuditLog** model, fixed `npm start` command, and linked the new
  CLAUDE.md/ARCHITECTURE.md guides. Files: `AGENTS.md`.

### 12. Job detail page → flat "paper" layout
- Converted the boxed `Card` sections (header, description, responsibilities, requirements, about,
  FAQs, and the sidebar apply/salary/company blocks) to plain sections separated by thin top-border
  rules — no card borders/shadows. Removed the "Back to Jobs" link and unused `Card`/`ArrowLeft`
  imports. File: `portal/src/components/jobs/job-details-client.tsx`.

### 11. Reworked popular-search tiles to use real fields
- "Jobs for Women" was faked via `?search=women` (keyword search, no backing field) → replaced with
  **Internships** (`?jobType=INTERNSHIP`). Also added **Contract Jobs** (`?jobType=CONTRACT`) and
  **Hybrid Jobs** (`?workLocationType=HYBRID`). Now 7 tiles, all backed by real filters; images are
  placeholders (TODO: dedicated art). Deferred "women-encouraged" to a future `tags[]` field.
  File: `portal/src/components/home/popular-searches.tsx`.

### 10. Added `BEFORE_PRODUCTION_PLAN.md`
- Pre-launch checklist. Verified online: `nayajagir.com` is **available** (whois no-match) and was
  live ~**2019** (Wayback) → real brand-`.com` edge *if* old backlinks are clean (audit before buy).
- Captured decisions: buy `nayajagir.com` (pending), backend on local VPS (pending), Supabase now /
  cloud storage like GCS later, secrets via env only. Pulled in SEO fixes + backend hardening. File:
  `BEFORE_PRODUCTION_PLAN.md`.

---

## How to maintain this log
- Add a new dated `## YYYY-MM-DD` section at the top for each working day.
- Under it, number each task: **Asked → Did → files → commit**.
- Keep it short and factual; link commits by short hash.
