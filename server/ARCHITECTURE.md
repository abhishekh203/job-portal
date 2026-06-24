# Server (Backend) — Architecture Reference

> Map of the `server/` Express API. For **rules on how to change it**, read [`CLAUDE.md`](CLAUDE.md)
> (especially §0 Change Discipline). This file is the "what exists and how it fits together" map.
>
> ⚠️ **Corrections vs. the hand-written draft:**
> - Runs on **port 5050** (via `.env`), not 5000. The code's *fallback* is still `5000` — see Issues.
> - There are **10 Prisma models** (the draft said 9 — it omitted… recount against `schema.prisma`,
>   which is the source of truth): User, Job, Application, ApplicationStatusHistory, Blog, AuditLog,
>   SubscriptionPlan, EmployerSubscription, SponsoredCompany, **CVUnlock**.
> - Extra enums beyond the draft: `SubscriptionPlanDuration`, `SubscriptionStatus`, `ExperienceLevel`.

---

## 1. What it is
An **Express 5 + TypeScript REST API** on **port 5050**, talking to **PostgreSQL (Supabase)** via
**Prisma**. Serves both `portal/` (frontend) and `admin/`. Entry: `src/index.ts`
(`npm run dev` = nodemon + ts-node).

## 2. Layered design (3 tiers)
```
routes/*.ts      → HTTP wiring: endpoints, middleware, Swagger JSDoc, parse input
controllers/*.ts → thin glue: Zod-validate, call service, format response
services/*.ts    → ALL business logic: Prisma queries, permission checks, audit, email
        ↓
Prisma Client → PostgreSQL
```
**Standard going forward: every new endpoint goes Route → Controller → Service — no exceptions**
(even trivial reads; a thin pass-through controller is fine and keeps the structure predictable).
Some older routes (e.g. `GET /jobs`) call services directly and skip the controller — that's
**legacy to migrate when you next touch the file**, not a pattern to copy. Never put business logic
or Prisma queries in a route handler.

## 3. Request lifecycle (example: `POST /api/jobs/:jobId/apply`)
```
applyLimiter (10/15min) → global limiter (100/15min) → route match
→ authenticate (verify JWT, load user, check isActive) → Zod validate body
→ applicationService.applyForJob() [job exists? approved? not expired? profile complete? not dup?]
→ create Application + ApplicationStatusHistory → 201
→ any throw → next(error) → errorHandler
```

## 4. Entry point — `src/index.ts` (setup order)
`dotenv` → 5 rate limiters → `helmet` → per-route limiters → global limiter → `cors`
(only `FRONTEND_URL` + `ADMIN_URL`, credentials) → JSON/urlencoded (10mb) → request logger →
Swagger `/api-docs` → `/health` (pings DB) → mount 11 route modules → `notFound` → `errorHandler`
→ process handlers (`uncaughtException`, `unhandledRejection`, `SIGTERM`, `SIGINT`).

Rate-limit tiers: `authStrictLimiter` 5/15m (login, reset), `authRegisterLimiter` 3/15m (register,
forgot, send-verification), `applyLimiter` 10/15m, `uploadLimiter` 10/15m, `limiter` 100/15m global.

## 5. Auth & roles
- **JWT** (`lib/jwt.ts`): payload `{ userId, email, role }`, 7-day expiry. `JWT_SECRET` required
  (throws on boot if missing — good).
- **Middleware** (`middleware/auth.ts`): `authenticate` (verifies token, **re-loads user from DB**
  every request, checks `isActive`), `requireAdmin`, `requireEmployer`, `optionalAuth`
  (used by `GET /jobs/:slug` to compute `hasApplied`).
- **Three flows:** user register → email verify → login; employer register (`/auth/employer/register`,
  company fields) → verify → login; admin register (`/auth/admin/register`, needs `ADMIN_SECRET_KEY`,
  auto-verified) → `/auth/admin/login`.
- Login enforces both `emailVerified` and `isActive` (`services/authService.ts`).

## 6. Database — `prisma/schema.prisma`
10 models (above). Key enums: `UserRole` (USER|EMPLOYER|ADMIN), `JobStatus`
(PENDING|APPROVED|REJECTED|RESUBMITTED), `ApplicationStatus`, `JobSource` (ADMIN|EMPLOYER),
`JobType`, `WorkLocationType`, `ExperienceLevel`, `SubscriptionPlanDuration`, `SubscriptionStatus`.
Indexes on hot columns (Job `[status,isFeatured,createdAt]`, Application `[jobId]`/`[status]`, etc.).
**`schema.prisma` is the source of truth for fields/enums — read it, don't trust summaries.**

## 7. Validation — `schemas/*.ts` (Zod)
`auth.ts`, `job.ts` (+ `JOB_CATEGORIES`), `blog.ts`, `employer.ts`, `admin.ts`, `user.ts`.
Query params arrive as strings → schemas use `.transform()` to coerce (page/limit/salary).
**Every endpoint validates input with a Zod schema.**

## 8. Error handling — `middleware/errorHandler.ts`
Central handler maps: `ZodError`→400 (+field details), custom `AppError.statusCode`→that code,
Prisma "Unique constraint"→409, "Record to update not found"→404, jwt→401, else→500. Stack included
only in dev. Throw operational errors with `createError(message, statusCode)` from services.

## 9. File uploads — `routes/upload.ts` (Multer memory → Supabase)
Multer in-memory Buffer → **magic-byte validation** (`utils.validateFileMagicBytes`, blocks MIME
spoofing) → size check → Supabase Storage (`lib/supabase.ts`) → public URL stored in DB.
Endpoints: profile-picture (any user, 5MB), resume (PDF/DOC/DOCX, 10MB), company-logo (admin/employer,
no SVG, 2MB), blog-image (admin, 5MB).

## 10. Email — `lib/email.ts` (Nodemailer + Gmail SMTP)
Fire-and-forget (`.catch(()=>{})`) so it never blocks responses. Templates: verification,
password reset, job approved, job rejected, application status changed. Tokens via `crypto.randomBytes`.

## 11. Security (what's in place)
Tiered rate limiting · Helmet · strict CORS allowlist · Zod on every endpoint · dual HTML sanitize
(`sanitize-html` server-side on write, DOMPurify client-side on render) · magic-byte upload checks
(SVG excluded) · bcrypt 12 rounds · `isActive` suspension check per request · audit logging
(`AuditLog` + IP/user-agent) for sensitive admin actions.

## 12. Logging — `lib/logger.ts` (Winston)
`logs/error.log` + `logs/combined.log`, 5MB×5 rotation, colorized console in non-prod, level via
`LOG_LEVEL`. ⚠️ `combined.log` is committed-noise — never stage it (see root `CLAUDE.md`).

## 13. Employer job approval workflow
`PENDING` (employer creates: isActive=false, isApproved=false) → admin **APPROVED** (isActive=true,
+email) or **REJECTED** (+rejectionReason, +email). Employer edits a rejected job → **RESUBMITTED**
(rejectionReason cleared). Public sees only APPROVED jobs past-deadline excluded.

## 14. Route modules (11)
`auth` `/api/auth` · `jobs` `/api/jobs` · `user` `/api/user` · `blogs` `/api/blogs` ·
`admin` `/api/admin` · `upload` `/api/upload` · `employer` `/api/employer` ·
`employerSubscription` `/api/employer` · `adminSubscription` `/api/admin` ·
`sponsored` `/api` (`GET /api/sponsored-companies`) · `companies` `/api/companies`.
(Subscription routers intentionally share the `/api/employer` and `/api/admin` mounts.)

## 15. Reusable helpers — don't reinvent (`lib/utils.ts`)
`hashPassword`/`comparePassword` (bcrypt 12) · `generateSlug`/`generateUniqueSlug`/
`generateCompanySlug` · `getPaginationParams`/`createPaginationResult` · `validateFileMagicBytes`/
`validateFileType`/`validateFileSize`. Throw errors via `createError` (`middleware/errorHandler`).

---

## 16. ⚠️ Known issues / tech debt (fix later — verified 2026-06-24)

**Config / correctness**
1. **Stale fallback URLs.** `PORT||5000` (runs 5050), `FRONTEND_URL||localhost:3000` and email
   `baseUrl||localhost:3000` (frontend is 3003). If an env var is ever missing, **CORS breaks and
   verification/reset email links point to the wrong place.** Fix: correct the defaults or fail-fast
   when unset.
2. **`tls.rejectUnauthorized: false`** in `lib/email.ts` is unconditional — disables TLS cert
   validation (MITM risk in prod). Comment says "dev only" but it always runs. Gate on `NODE_ENV`.

**Production robustness**
3. **`trust proxy` is not set.** Behind a reverse proxy (Render/Nginx/etc.), `req.ip` becomes the
   proxy's IP → **rate limiting keys on one IP for everyone** and audit logs record the wrong IP.
   Fix: `app.set('trust proxy', 1)`.
4. **`process.exit(1)` on `unhandledRejection`** — a single stray promise rejection kills the whole
   server. Too aggressive; log and recover, or shut down gracefully.
5. **No graceful shutdown.** SIGTERM/SIGINT call `process.exit(0)` without closing the HTTP server or
   `db.$disconnect()` → in-flight requests dropped, DB connections leaked.
6. **Swagger `/api-docs` is served in all environments** — exposes the full API surface in prod.
   Guard behind `NODE_ENV !== 'production'` (or auth).

**Maintainability**
7. **Prisma errors detected by string-matching** (`message.includes('Unique constraint')`) instead of
   error codes (`P2002`/`P2025` on `PrismaClientKnownRequestError`). Brittle across Prisma versions.
8. **`generateUniqueSlug` isn't truly guaranteed unique** — it appends `nanoid(8)` with no DB check
   or retry-on-conflict. Collisions are astronomically unlikely, but a unique-constraint hit isn't
   handled.
9. **`generateRandomString` uses `Math.random()`** (non-crypto). Currently only used for **upload
   filenames** (low risk) — fine there, but never reuse it for tokens/secrets (email tokens correctly
   use `crypto.randomBytes`).
10. **`req.user.role` typed as `string`**, not the `UserRole` union — loose typing invites typos.
11. **`CVUnlock` model is dead code** — defined in the schema but no service or route references it.
12. **`src/index-minimal.ts`** appears to be an alternate/legacy entry point — confirm it's used or
    delete it.

None of these are on fire today; the app runs. They're hardening/cleanup items for before a serious
production deploy.

### Scale-later (not now)
- **Pagination is offset-based** (`skip`/`take` + `createPaginationResult`). Correct for current
  data sizes — it gives numbered pages + total counts the frontend uses. **Switch high-volume list
  endpoints to cursor-based** (`cursor: { id }` + `take`, no `skip`) **only if/when:** a list grows
  into the tens/hundreds of thousands of rows, you build an infinite-scroll "load more" feed (cursor
  is ideal for that), or you hit slow deep-pagination (`OFFSET` makes the DB walk past all skipped
  rows). Until then, keep offset.
