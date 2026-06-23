# Job Portal — Codebase Guide

## Project Overview
Monorepo with 3 services: a Next.js public frontend (`portal/`), a React admin dashboard (`admin/`), and an Express backend API (`server/`).

> **Frontend patterns:** `portal/` has its own engineering guide at [`portal/CLAUDE.md`](portal/CLAUDE.md) — the source of truth for data fetching (TanStack Query), forms (react-hook-form + Zod), the typed API layer, and folder structure. Read it before changing `portal/` code.

## Tech Stack

| Service | Framework | Language | Key Libraries |
|---------|-----------|----------|--------------|
| **server/** | Express.js 5 | TypeScript | Prisma (PostgreSQL), Zod, JWT, Supabase Storage, Nodemailer (Gmail SMTP), Swagger, sanitize-html |
| **portal/** | Next.js 15 (App Router, Turbopack) | TypeScript | Tailwind CSS v4, shadcn/Radix UI, TanStack Query v5, react-hook-form + Zod, sonner, dompurify (Zustand v5 is installed but not currently used) |
| **admin/** | React 19 (Vite) | TypeScript | Tailwind CSS v4, react-router-dom v7, TanStack Query v5, Zustand v5 (persist), recharts, Axios, @tanstack/react-table, react-hot-toast, dompurify |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐     ┌────────────┐
│  portal/    │────▶│              │────▶│  Prisma    │────▶│ PostgreSQL │
│  (Next.js)  │     │   server/    │     │  (ORM)     │     │            │
├─────────────┤     │  (Express)   │     └────────────┘     └────────────┘
│  admin/     │────▶│              │
│  (React)    │     └──────────────┘
└─────────────┘           │
                          ▼
                   ┌──────────────┐
                   │   Supabase   │
                   │   Storage    │
                   │  (file ups)  │
                   └──────────────┘
```

- **Client/Admin** → HTTP → **Express API** → **Prisma** → **PostgreSQL**
- File uploads via multer (memory) → **Supabase Storage** → public URL stored in DB
- Emails via **Nodemailer** (Gmail SMTP)

## Directory Structure

```
job-portal/
├── server/                          # Backend API (port 5000)
│   ├── src/
│   │   ├── index.ts                 # Entry point — middleware, routes, error handling
│   │   ├── routes/                  # auth, jobs, user, admin, blogs, upload, employer, companies
│   │   ├── controllers/             # authController, adminController, employerController, jobsController, blogsController
│   │   ├── middleware/              # authenticate, requireAdmin, requireEmployer, optionalAuth, errorHandler, notFound
│   │   ├── schemas/                 # Zod validation schemas (auth, employer, jobs, blogs)
│   │   └── lib/                     # Prisma client (db.ts), JWT utils, email (Nodemailer), Supabase, utilities
│   ├── prisma/
│   │   └── schema.prisma           # DB schema (User, Job, Application, Blog)
│   └── start.js                     # Production entry (loads dotenv + compiled dist/)
├── portal/                          # Public frontend (port 3000)
│   └── src/
│       ├── app/                     # Next.js App Router pages
│       │   ├── page.tsx             # Home page
│       │   ├── jobs/page.tsx        # Job listings
│       │   ├── jobs/[slug]/page.tsx # Job detail + apply
│       │   ├── blogs/page.tsx       # Blog listings
│       │   ├── blogs/[slug]/page.tsx # Blog detail
│       │   ├── auth/*/page.tsx      # Login, register (with role toggle), password reset, email verification
│       │   ├── dashboard/*/page.tsx # User dashboard (profile, applications)
│       │   └── dashboard/employer/  # Employer dashboard (Dashboard, Jobs, Company Profile)
│       ├── components/
│       │   ├── ui/                  # ShadCN primitives (button, card, dialog, input, select, tabs, etc.)
│       │   ├── layout/              # Header, Footer
│       │   ├── jobs/                # JobCard, JobDetailsClient
│       │   └── blog/                # BlogDetailsClient
│       ├── hooks/                   # Auth context provider + helpers (registerEmployer, role-based redirects)
│       └── lib/                     # API client class, QueryClient provider, error handler, utils
└── admin/                           # Admin dashboard (port 5173)
    └── src/
        ├── pages/                   # LoginPage, RegisterPage, DashboardPage, JobsPage, JobFormPage,
        │                            # JobViewPage, JobApplicantsPage, UsersPage, ApplicationsPage,
        │                            # BlogsPage, BlogFormPage, BlogViewPage, AnalyticsPage
        ├── components/              # Layout, ImageUpload, RichTextEditor, UI primitives
        ├── lib/                     # Axios API client with interceptors, Zustand stores (persisted), utils
        └── services/                # Alternative fetch-based API wrappers
```

## Database (PostgreSQL) — 6 Models

### User (`users`)
- Auth: email (unique), password (bcrypt), emailVerified, emailVerificationToken/Expires, passwordResetToken/Expires
- Profile: firstName, lastName, profilePicture, resume, bio, skills[], experience, education, location, website, linkedin, github
- profileCompleted (auto-calculated boolean)
- Role: USER | EMPLOYER | ADMIN (enum)
- Employer fields: companyName, companySlug (unique), companyDescription, companyLogo, companyWebsite, companySize, industry
- Account status: isActive (boolean, default true)
- Relations: applications[], postedJobs[] (via postedById on Job)

### Job (`jobs`)
- slug (unique), title, description, requirements[], responsibilities[]
- category, location, jobType (FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP), workLocationType (ONSITE|REMOTE|HYBRID), experienceLevel
- salaryMin/Max, salaryNegotiable, currency (default "NPR")
- companyName, companySlug (denormalized from employer User), companyLogo, companyWebsite
- isActive, isFeatured, isApproved (default false), applicationDeadline
- status: JobStatus enum (PENDING | APPROVED | REJECTED | RESUBMITTED, default PENDING)
- rejectionReason: String? (populated when admin rejects)
- source: JobSource enum (ADMIN | EMPLOYER, default ADMIN)
- postedById (FK to User — nullable, set when source is EMPLOYER)
- Relations: applications[], postedBy (User)

### Application (`applications`)
- message (cover letter), status (PENDING|REVIEWED|SHORTLISTED|ACCEPTED|REJECTED|HIRED)
- userId + jobId (unique compound — one application per user per job)
- Relations: user (Cascade), job (Cascade)
- statusHistory: ApplicationStatusHistory[]

### ApplicationStatusHistory (`application_status_history`)
- oldStatus + newStatus (ApplicationStatus enum), changedBy (userId or null for system)
- changedAt timestamp, applicationId FK → Application (Cascade)
- Indexed on applicationId
- Auto-logged on every status change (employer, admin), plus initial PENDING→PENDING entry on apply
- Endpoint: `GET /api/user/applications/:id/history` (auth required, scoped to own applications)

### Blog (`blogs`)
- title, slug (unique), content (rich text), excerpt, featuredImage
- SEO: metaTitle, metaDescription, metaKeywords[], structuredData (JSON-LD / Json)
- isPublished, publishedAt

### SubscriptionPlan (`subscription_plans`)
- name, slug (unique), price (Float), duration (MONTHLY|YEARLY)
- features (JSON), jobLimit (Int), featuredJobLimit (Int), sortOrder (Int)
- isActive (Boolean, default true)

### EmployerSubscription (`employer_subscriptions`)
- employerId (FK → User), planId (FK → SubscriptionPlan)
- status: PENDING|TRIALING|ACTIVE|EXPIRED|CANCELLED
- startDate, endDate, autoRenew (Boolean)
- Unique on employerId (one subscription per employer)

### SponsoredCompany (`sponsored_companies`)
- employerId (FK → User, unique), startDate, endDate, sortOrder (Int), isActive
- One sponsored entry per employer

### CVUnlock (`cv_unlocks`)
- employerId + candidateId (FK → User), unlockedAt, expiresAt
- Unique on employerId + candidateId

## Key Conventions

- **Validation**: Zod schemas defined in `server/src/schemas/` validate all request bodies; client uses react-hook-form with @hookform/resolvers/zod
- **Auth**: JWT tokens (7d expiry); email verification required before login; admin routes gated by `requireAdmin` middleware; admin registration requires `ADMIN_SECRET_KEY` env var
- **Employer flow**: Empoyers register via `/api/auth/employer/register` (role = EMPLOYER + company fields); employer routes gated by `requireEmployer` middleware; employer-posted jobs default to `status: 'PENDING'` and require admin approval before appearing publicly
- **Employer job approval flow**: Employer creates job → `status: 'PENDING'` → admin sees pending+resubmitted badge in sidebar → admin approves (status → APPROVED) or rejects (status → REJECTED + stores rejectionReason, email sent with reason) on `/job-approvals` → employer can edit rejected job → status becomes `RESUBMITTED` for re-review → job becomes visible publicly when APPROVED
- **Job expiry**: Public queries filter out jobs past `applicationDeadline` via `OR: [{ applicationDeadline: null }, { applicationDeadline: { gt: now } }]` — no cron needed
- **Profile gating**: `profileCompleted` auto-calculated; users with incomplete profiles cannot apply for jobs
- **File upload**: multer (memory storage) → Supabase Storage bucket → public URL persisted in DB
- **Rate limiting**: `express-rate-limit` with tiered limits — auth/register (3–5 req/15min), applications/uploads (10 req/15min), global safety net (100 req/15min). Per-route limiters applied before global in `index.ts:64-77`.
- **Error handling**: Centralized `errorHandler` middleware catches ZodErrors, PrismaErrors (unique, not found), JWT errors, and custom AppError — all return consistent `{ error, message }` JSON
- **Logging**: Winston logger in `server/src/lib/logger.ts` — JSON to `logs/error.log` and `logs/combined.log` (rotated, max 5MB each, 5 files), colorized console output in non-production. Log levels: `error`, `warn`, `info`, `http`, `debug`. Configured via `LOG_LEVEL` env var.
- **Pagination**: Helpers `getPaginationParams` + `createPaginationResult` return `{ data, pagination: { page, limit, total, totalPages, hasNext, hasPrev } }`
- **Slugs**: Auto-generated via `generateUniqueSlug(title)` which appends a nanoid(8) suffix for uniqueness (e.g. `senior-react-developer-aB3xK9Lm`); company slugs use the same approach (`generateUniqueSlug(companyName)`) — stored on User model as `companySlug` (unique), denormalized onto Job as `companySlug` when employer creates a job. Company profile URL uses slug: `/companies/:companySlug`
- **Subscription system**: 4 models (`SubscriptionPlan`, `EmployerSubscription`, `SponsoredCompany`, `CVUnlock`) enable monetization. Employers subscribe to plans (monthly/yearly) for job posting limits and featured job slots. Admin manages plans and sponsored companies. Endpoints: `GET /api/employer/plans`, `POST /api/employer/subscribe`, `GET /api/employer/subscription` (employer); full CRUD on plans, activate/cancel subscriptions, sponsored company management (admin); public `GET /api/sponsored-companies`.
- **Employer toggle-featured**: `PUT /api/employer/jobs/:jobId/toggle-featured` — toggles `isFeatured` on a job, respecting subscription `featuredJobLimit` via `enforceFeaturedJobLimit()`. Employer can only feature as many jobs as their plan allows.
- **CORS**: Configured with `FRONTEND_URL` and `ADMIN_URL` env vars (not wildcard). `credentials: true` for cookie/session support.
- **File upload security**: All uploads validated with magic byte detection (prevents MIME spoofing). SVG excluded from company logos (XSS risk). Company logo endpoint allows both ADMIN and EMPLOYER roles.
- **Account suspension**: User model has `isActive` boolean (default true). `authenticate` middleware checks `isActive` on every request — suspended users get 403. Login also rejects suspended accounts. Admins can suspend/unsuspend via `PUT /api/admin/users/:userId/suspend` and `PUT /api/admin/users/:userId/unsuspend` (cannot suspend ADMIN role). Admin `getUsers` now includes `isActive` field and defaults to USER+EMPLOYER roles.
- **Audit log retention**: `AuditLog` model has `@@index([createdAt])`. Admin can cleanup old logs via `DELETE /api/admin/audit-logs/cleanup` with configurable `retentionDays` body param (default 15). Deletes all logs older than the cutoff date.
- **HTML sanitization (dual-layer)**: Server-side via `sanitize-html` in `server/src/lib/sanitize.ts` (strips scripts, events, iframes, forms, objects on write) — `sanitizeRichText()` for rich body fields, `sanitizeTextOnly()` for title/excerpt keywords; applied in `blogService.ts` and `jobService.ts` on create + update. Client-side via `dompurify` in `*/lib/sanitize.ts` (DOMPurify with matching ALLOWED_TAGS) applied before every `dangerouslySetInnerHTML` render (4 sites: admin BlogViewPage + JobViewPage, client blog-details-client + job-details-client) and on RichTextEditor onChange output.
- **DB indexes**: 8 B-tree indexes in `schema.prisma` for production performance — `User: [createdAt], [role, companyName]`; `Job: [status, isFeatured, createdAt], [postedById, createdAt], [applicationDeadline]`; `Application: [jobId], [status]`; `Blog: [isPublished, publishedAt]`. Apply via `npx prisma migrate dev --name add_production_indexes`.
- **UI**: ShadCN pattern — Radix UI primitives wrapped with `class-variance-authority`, `clsx`, and `tailwind-merge` for styling
- **State**: TanStack Query for server state (API data); Zustand for pure client state (admin uses persist middleware)
- **API client (admin)**: Axios with interceptor for auth token injection and automatic `.data` extraction in `lib/api.ts`

## Available Scripts

### server/
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon (port 5000) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Production start (`node start.js`) |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |

### portal/
| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server with Turbopack (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production start |
| `npm run lint` | Run ESLint |

### admin/
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | TypeScript check + Vite build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Environment Variables (server/)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `JWT_EXPIRES_IN` | Token expiry duration (default `7d`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin operations) |
| `PORT` | Server port (default 5000) |
| `FRONTEND_URL` | Client URL for CORS (http://localhost:3000) |
| `ADMIN_URL` | Admin URL for CORS |
| `ADMIN_SECRET_KEY` | Secret key required to register new admin accounts |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP credentials |
| `FROM_EMAIL` / `FROM_NAME` | Sender email address and display name |

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check (DB connectivity verified, returns 503 if degraded) |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/send-verification` | Send email verification |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/jobs` | List jobs (filters + pagination) |
| GET | `/api/jobs/featured` | Get featured jobs |
| GET | `/api/jobs/categories` | Get categories list |
| GET | `/api/jobs/:slug` | Get job by slug |
| POST | `/api/jobs/:jobId/apply` | Apply (auth required, profile must be complete) |
| PUT | `/api/user/profile` | Update profile (auth) |
| GET | `/api/user/applications` | Get user's applications (auth) |
| GET | `/api/user/applications/:id` | Get specific application (auth) |
| GET | `/api/user/applications/:id/history` | Get application status audit trail (auth, scoped to own applications) |
| GET | `/api/blogs` | List published blogs |
| GET | `/api/blogs/latest` | Get latest blogs |
| GET | `/api/blogs/:slug` | Get blog by slug |
| POST | `/api/upload/profile-picture` | Upload profile picture (auth) |
| POST | `/api/upload/resume` | Upload resume (auth) |

### Admin (auth + ADMIN role required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/admin/register` | Admin registration (requires secret key) |
| GET | `/api/employer/plans` | List all subscription plans |
| POST | `/api/employer/subscribe` | Subscribe employer to a plan |
| GET | `/api/employer/subscription` | Get current employer subscription |
| GET | `/api/admin/plans` | List all plans (admin) |
| POST | `/api/admin/plans` | Create plan |
| PUT | `/api/admin/plans/:id` | Update plan |
| DELETE | `/api/admin/plans/:id` | Delete plan |
| GET | `/api/admin/subscriptions` | List all subscriptions |
| PUT | `/api/admin/subscriptions/:id/status` | Activate/cancel subscription |
| GET | `/api/admin/sponsored-companies` | List sponsored companies |
| POST | `/api/admin/sponsored-companies` | Create sponsored company |
| PUT | `/api/admin/sponsored-companies/:id` | Update sponsored company |
| DELETE | `/api/admin/sponsored-companies/:id` | Delete sponsored company |
| GET | `/api/sponsored-companies` | Public: list active sponsored companies |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/auth/admin/profile` | Get admin profile |
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/admin/jobs` | List all jobs |
| POST | `/api/admin/jobs` | Create job |
| GET | `/api/admin/jobs/:jobId` | Get job by ID |
| PUT | `/api/admin/jobs/:jobId` | Update job |
| DELETE | `/api/admin/jobs/:jobId` | Delete job |
| GET | `/api/admin/applications` | List all applications |
| PUT | `/api/admin/applications/:id/status` | Update application status |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:userId` | Get user details |
| GET | `/api/admin/users/:userId/profile` | Get user profile |
| DELETE | `/api/admin/users/:userId` | Delete user |
| GET | `/api/admin/blogs` | List all blogs |
| POST | `/api/admin/blogs` | Create blog |
| GET | `/api/admin/blogs/:blogId` | Get blog by ID |
| PUT | `/api/admin/blogs/:blogId` | Update blog |
| DELETE | `/api/admin/blogs/:blogId` | Delete blog |
| POST | `/api/upload/blog-image` | Upload blog image (admin) |
| GET | `/api/admin/audit-logs` | Get audit logs (paginated, newest first) |
| GET | `/api/companies/:companySlug` | Get public company profile + active jobs |
| POST | `/api/upload/company-logo` | Upload company logo (admin or employer) |
| PUT | `/api/admin/jobs/:jobId/approve` | Approve employer-posted job |
| PUT | `/api/admin/jobs/:jobId/reject` | Reject employer-posted job |
| PUT | `/api/admin/users/:userId/suspend` | Suspend user (cannot suspend ADMIN) |
| PUT | `/api/admin/users/:userId/unsuspend` | Unsuspend user |
| DELETE | `/api/admin/audit-logs/cleanup` | Delete audit logs older than N days (default 15) |
| GET | `/api-docs` | Swagger API documentation |

### Employer (auth + EMPLOYER role required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/employer/register` | Employer registration (includes company fields) |
| GET | `/api/employer/dashboard/stats` | Dashboard statistics (total, active, pending, rejected jobs, applicants) |
| GET | `/api/employer/jobs` | List employer's jobs |
| POST | `/api/employer/jobs` | Create job (source: EMPLOYER, status: PENDING) |
| GET | `/api/employer/jobs/:jobId` | Get job by ID |
| PUT | `/api/employer/jobs/:jobId` | Update job (if REJECTED → RESUBMITTED) |
| DELETE | `/api/employer/jobs/:jobId` | Delete job |
| GET | `/api/employer/jobs/:jobId/applications` | List applications for a job |
| PUT | `/api/employer/applications/:id/status` | Update application status (PENDING/REVIEWED/SHORTLISTED/ACCEPTED/REJECTED/HIRED) |
| PUT | `/api/employer/jobs/:jobId/toggle-featured` | Toggle featured status (respects subscription limit) |
| PUT | `/api/employer/profile` | Update company profile |

## Client Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Home (hero, stats, featured jobs, CTA) | Public |
| `/jobs` | Job listings with search + filters | Public |
| `/jobs/[slug]` | Job detail + apply button | Public |
| `/blogs` | Blog listing with pagination | Public |
| `/blogs/[slug]` | Blog detail | Public |
| `/companies/[companySlug]` | Public company profile + active jobs | Public |
| `/about` | About page | Public |
| `/contact` | Contact form | Public |
| `/auth/login` | Login | Public (redirects if authenticated) |
| `/auth/register` | Register (with role toggle) | Public (redirects if authenticated) |
| `/auth/forgot-password` / `reset-password` | Password reset flow | Public |
| `/auth/verify-email` / `verify-email-sent` | Email verification flow | Public |
| `/dashboard` | User dashboard home | Protected |
| `/dashboard/profile` | Manage profile, skills, resume | Protected |
| `/dashboard/applications` | Track application statuses | Protected |
| `/dashboard/employer` | Employer dashboard (stats) | Protected (EMPLOYER) |
| `/dashboard/employer/jobs` | My jobs listing | Protected (EMPLOYER) |
| `/dashboard/employer/jobs/new` | Post new job | Protected (EMPLOYER) |
| `/dashboard/employer/jobs/:id` | Job detail + applicants | Protected (EMPLOYER) |
| `/dashboard/employer/jobs/:id/edit` | Edit job | Protected (EMPLOYER) |
| `/dashboard/employer/company` | Company profile | Protected (EMPLOYER) |

## Admin Routes (react-router-dom)

| Path | Page |
|------|------|
| `/login` | Admin login |
| `/register` | Admin registration (secret key) |
| `/` | Dashboard with stats cards + recent activity |
| `/jobs` | Job list (CRUD) |
| `/jobs/new` | Create job form |
| `/jobs/:id` | View job |
| `/jobs/:id/edit` | Edit job |
| `/jobs/:id/applicants` | Job applicants list |
| `/job-approvals` | Pending job approvals (with pending count badge in sidebar) |
| `/users` | User list |
| `/applications` | All applications with status management |
| `/blogs` | Blog list |
| `/blogs/new` | Create blog (RichTextEditor) |
| `/blogs/:id` | View blog |
| `/blogs/:id/edit` | Edit blog |
| `/analytics` | Charts and analytics (recharts) |
| `/audit-logs` | Audit log viewer |
| `/plans` | Subscription plans CRUD |
| `/subscriptions` | Employer subscription management |
| `/sponsored-companies` | Sponsored companies management |

## Common Patterns for LLMs

- **Adding a new feature**: Create Zod schema → add Prisma migration → add Express route + controller → add frontend API call → add UI component/page
- **Server state**: Use TanStack Query (`useQuery`/`useMutation`) for all API data; use Zustand for client-only state (sidebar, UI toggles)
- **File structure**: Mirror existing patterns when adding pages/components; each new page gets its own directory under `app/` (client) or `pages/` (admin)
- **Prisma client**: Always import from `lib/db.ts` (singleton pattern — cached globally in dev to avoid hot-reload issues)
- **Notifications**: Use `sonner` (client) / `react-hot-toast` (admin) for toasts
- **Auth checks**: Use `useRequireAuth()` (redirects to login) or `useRedirectIfAuthenticated()` (redirects to dashboard) in client pages
- **Admin auth check**: `App.tsx` runs auth check on mount via `GET /api/auth/admin/profile`; unauthenticated users are redirected to `/login`
- **Employer registration**: Uses `/api/auth/employer/register` with additional company fields; account starts as EMPLOYER role; email verification still required
- **Employer job approval flow**: Employer creates job → `status: 'PENDING'` → admin sees pending badge in sidebar → admin approves/rejects on `/job-approvals` (rejection requires reason) → email notification sent to employer → editing a rejected job sets status to `RESUBMITTED` for re-review → job becomes visible publicly when `APPROVED`
- **Employer-scoped queries**: All employer endpoints filter by `postedById = req.user.id`; applications are fetched via the employer's job, not directly; non-owned jobs return 404 (not 403) to prevent ID enumeration
- **Dynamic profile updates**: After `updateEmployerProfile`, call `updateUserProfile()` from `useAuth` hook to sync changes into the auth context immediately
- **Public job queries**: All public endpoints filter by `status: 'APPROVED'` + `applicationDeadline > now() || null` — rejected, pending, or resubmitted jobs are invisible to public
- **Admin job listing**: Supports `status` filter as single value or array; `status: ['PENDING', 'RESUBMITTED']` used for approvals page; full status enum (`PENDING | APPROVED | REJECTED | RESUBMITTED`) supported
- **Rejection reason**: Stored on Job model; surfaced via admin reject dialog (textarea overlay), emailed to employer with styled template, displayed inline on employer job detail page with red badge
- **Application status notifications**: When an employer or admin changes an application status (`REVIEWED | SHORTLISTED | ACCEPTED | REJECTED | HIRED`), the applicant receives an email via `sendApplicationStatusEmail()` — fire-and-forget (doesn't block the response), with status-specific emoji, gradient color, and message in the template
- **Application audit trail**: Every status change is logged to `ApplicationStatusHistory` via `logApplicationStatusChange()` in `lib/db.ts`. Logged on: initial apply (PENDING→PENDING), employer status change, admin status change. The candidate can view the full timeline via `GET /api/user/applications/:id/history`. Client UI shows the timeline as an expandable section on each application card.
- **System audit logs**: Every important admin/employer action (job CRUD, approve/reject, user delete, blog CRUD, application status change) is logged to `AuditLog` via `logAuditAction()`. Includes `actorId`, `action`, `entity`, `entityId`, `metadata`, `ipAddress`, `userAgent`. Viewable by admins at `GET /api/admin/audit-logs` and in the admin dashboard under "Audit Logs".
