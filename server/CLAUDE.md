# Backend (`server/`) — Engineering Patterns & Conventions

> **Read this before writing any backend code.** Source of truth for how the Express API is built.
> The architecture map (request flow, models, routes, security) lives in
> [`ARCHITECTURE.md`](ARCHITECTURE.md) — read that first to find things, then this for the rules.

The goal: every endpoint validates its input, business logic lives in one place, errors are thrown
one way, and the API responses the `portal/` and `admin/` apps depend on stay stable.

---

> 📒 **Always update the log.** After every feature or change (whether done by a developer or by AI),
> append a short entry to the root **[`DEVLOG.md`](../DEVLOG.md)** — newest day on top, one or two
> lines (what changed → file(s)). Keep it brief; it's the project diary.

## 0. Change Discipline — don't break what works (READ FIRST)

The #1 rule: **make the smallest change that satisfies the request.** This API is consumed by two
live apps. A careless change to a response shape, status code, or field name breaks the frontend
silently. Touch only what the task needs. Only refactor, restructure, or rename when a feature
**genuinely demands it, or when the developer explicitly asks for it** — never just to make old code
"nicer."

**Before you change anything:**
1. **Don't break the API contract.** Other apps depend on exact response shapes, field names, status
   codes, and the `{ data, pagination }` / `{ error }` envelopes. Add fields rather than rename or
   remove. If you must change a shape, say so — the portal/admin will need updates too.
2. **Respect the 3 layers — every new endpoint goes Route → Controller → Service.** Endpoints wired
   in `routes/`; validation via Zod in `schemas/`; HTTP glue in `controllers/` (thin); business logic
   + Prisma in `services/`. **No exceptions for "simple" routes** — even a one-line read gets a thin
   pass-through controller, so logic always has a predictable home. **Never put business logic or
   Prisma queries in a route handler.** Older routes that call a service directly (e.g. `GET /jobs`)
   are **legacy to migrate when you touch them**, not a pattern to copy.
3. **Validate every input with Zod.** No reading `req.body`/`req.query` raw. Never trust the client.
4. **Throw, don't hand-roll responses, for errors.** Use `createError(message, status)` from
   `middleware/errorHandler` and let the central handler format it. Don't `res.status(500).json(...)`
   ad hoc in services.
5. **Reuse the helpers** (see §0.1) — pagination, hashing, slugs, magic-byte checks already exist.
6. **Schema changes = a Prisma migration**, never hand-edit the DB. After editing `schema.prisma`,
   run a migration and regenerate the client. Remember a field added here may need to flow to the
   portal's `Job`/`User` TS types too.
7. **Check permissions in the service**, not just the route middleware (e.g. "is this job owned by
   this employer?"). Middleware proves *who* you are; the service proves *what you may touch*.
8. **Don't log secrets.** No tokens/passwords in Winston logs. Never commit `logs/combined.log`.

**Reach for a bigger change only when** the feature can't be built on the current structure, the
code is actually broken, or you're explicitly asked. Then say so first and explain why.

### 0.1 Reuse these — don't reinvent
| Need | Use | Where |
|---|---|---|
| Throw an operational error | `createError(msg, status)` | `middleware/errorHandler` |
| Hash / check password | `hashPassword`, `comparePassword` (bcrypt 12) | `lib/utils` |
| Make a slug | `generateSlug`, `generateUniqueSlug`, `generateCompanySlug` | `lib/utils` |
| Paginate | `getPaginationParams`, `createPaginationResult` | `lib/utils` |
| Validate an upload | `validateFileMagicBytes`, `validateFileType`, `validateFileSize` | `lib/utils` |
| Sign / verify JWT | `generateToken`, `verifyToken` | `lib/jwt` |
| Require auth / role | `authenticate`, `requireAdmin`, `requireEmployer`, `optionalAuth` | `middleware/auth` |
| DB access | `db` (Prisma client) | `lib/db` |
| Send email (fire-and-forget) | the `send*Email` helpers | `lib/email` |
| Sanitize HTML before storing | `sanitize-html` wrapper | `lib/sanitize` |
| Audit a sensitive action | `logAuditAction({...}).catch(()=>{})` | service layer |

### 0.2 Patterns to copy
**New endpoint:** Zod schema in `schemas/` → (migration if schema changed) → logic in `services/` →
thin controller in `controllers/` (always, even for simple reads) → route + middleware in `routes/`
→ Swagger JSDoc.

**Pagination:**
```ts
const { page, limit, skip } = getPaginationParams({ page: req.query.page, limit: req.query.limit })
const [data, total] = await Promise.all([
  db.model.findMany({ where, skip, take: limit }),
  db.model.count({ where }),
])
return createPaginationResult(data, total, page, limit)
```

**Errors:** `throw createError('Job not found', 404)` → handled centrally.

**Audit:** `logAuditAction({ actorId, action, entity, entityId, metadata, ipAddress: req.ip, userAgent: req.headers['user-agent'] }).catch(()=>{})`.

---

## 0.3 New-feature workflow — research & agree BEFORE coding
For any **new feature** (not a small tweak), do NOT jump straight to code. The owner works mostly on
the backend and wants to agree on the approach first:
1. **Research first.** Look at *what we already have* (existing services/patterns/models) and the
   *current approach*, then work out *better possible approaches* — including which one **scales**.
2. **Go wide for complex/heavy features.** Use **web search and GitHub search** to compare how others
   solve it and find the stronger, more scalable pattern — don't rely on memory alone.
3. **Ask questions** if anything is unclear *after* the research (don't guess on ambiguous scope).
4. **Present the approach to the owner** — options considered, the recommended one, and why (incl.
   scalability + tradeoffs). **Wait for the owner to finalize the approach.**
5. **Then build it**, following the agreed approach and §0 Change Discipline.
6. **After completing**, make sure it's solid (compiles, verified, no breakage) and update
   [`DEVLOG.md`](../DEVLOG.md).
7. **Only if the owner then asks for an explanation**, write the `FORABHISHEKH.md` learning doc
   (concise, plain-language; see root `CLAUDE.md`).

> In short: **research → propose → agree → build → verify → (explain only if asked).** Never skip
> straight from request to large implementation without agreeing on the approach.

## 1. Stack
Express 5 · TypeScript · Prisma (PostgreSQL/Supabase) · Zod · JWT (`jsonwebtoken`) · bcryptjs ·
Multer + Supabase Storage · Nodemailer · Winston · Helmet · express-rate-limit · Swagger.

## 2. Layout
`src/index.ts` (entry) · `routes/` · `controllers/` · `services/` · `schemas/` (Zod) ·
`middleware/` (auth, errorHandler, notFound) · `lib/` (db, jwt, utils, email, supabase, logger,
sanitize) · `prisma/schema.prisma`.

## 3. Before deploying to production
See [`ARCHITECTURE.md` §16](ARCHITECTURE.md) for the verified tech-debt list (trust-proxy, TLS
validation, graceful shutdown, stale fallback URLs, Swagger exposure, Prisma error codes). Address
those before a real launch.
