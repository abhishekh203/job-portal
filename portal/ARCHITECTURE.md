# Portal (Client) — Architecture Reference

> Deep-dive map of the `portal/` Next.js app. For **rules on how to change it**, read
> [`CLAUDE.md`](CLAUDE.md) first (especially §0 Change Discipline). This file is the "what exists
> and how it fits together" reference.
>
> ⚠️ **Corrections vs. the original hand-written draft** (the draft described the pre-2026-06-24
> design that was replaced when we resolved a merge conflict):
> - Dev port is **3003**, not 3000.
> - Theme is **Forest Teal / parchment** (`--primary: #004038`), not Royal Blue oklch.
> - Heading font is **Montserrat**; there's also **Source Serif** (pull-quotes) + Inter (body) +
>   JetBrains Mono (code). Urbanist is gone.
> - Site title is **"NayaJagir - Find Your Dream Job"**.
> - ⚠️ Bug to revisit: the `ApiClient` fallback URL in `lib/api.ts` is `http://localhost:5000/api`,
>   but the backend runs on **:5050**. It only works because `.env.local` sets `NEXT_PUBLIC_API_URL`.

---

## 1. What it is
The public-facing **Next.js 15 (App Router + Turbopack)** app on **port 3003** — job seekers,
employers, and visitors. Separate app from `admin/` (a Vite SPA).

## 2. Tech stack (actual)
| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack), React 19 |
| Styling | Tailwind CSS v4 + shadcn/Radix |
| Server state | TanStack Query v5 |
| Client/auth state | React Context (`AuthProvider`) — **not** Zustand |
| Forms | react-hook-form + Zod |
| HTTP | custom `ApiClient` over native `fetch` — **not** Axios |
| Toasts | Sonner |
| Theming | next-themes (dark/light) |
| Fonts | Inter (body), Montserrat (headings), Source Serif (pull-quotes), JetBrains Mono (code) |
| Sanitize | DOMPurify (`@/lib/sanitize`) |
| Icons | lucide-react |

## 3. Provider stack (order matters — `app/layout.tsx`)
```
ThemeProvider → QueryProvider → AuthProvider → ErrorBoundary → SiteLayout → {children}
                                              (+ <Toaster/> inside QueryProvider)
```
`SiteLayout` conditionally hides Header/Footer on `/dashboard/*` (those have their own layouts).

## 4. Two-layout architecture
- **Public pages** → wrapped in Header + Footer via `SiteLayout`.
- **Dashboard pages** (`/dashboard/*`) → no global Header/Footer; each has its own sidebar layout
  (`dashboard/layout.tsx` for users, `dashboard/employer/layout.tsx` for employers).

## 5. Route map
**Public:** `/`, `/jobs`, `/jobs/[slug]`, `/blogs`, `/blogs/[slug]`, `/companies/[companySlug]`,
`/about`, `/contact`
**Auth:** `/auth/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`,
`/verify-email-sent` (login/register guarded by `useRedirectIfAuthenticated`)
**User dashboard** (`useRequireAuth`): `/dashboard`, `/dashboard/profile`, `/dashboard/applications`
**Employer dashboard** (EMPLOYER role): `/dashboard/employer` (+ `/jobs`, `/jobs/new`,
`/jobs/[id]`, `/jobs/[id]/edit`, `/company`, `/subscription`)

## 6. API client — `lib/api.ts`
Single `ApiClient` class; all calls funnel through one private `request<T>()` (headers + Bearer
token + JSON parse + status-aware errors). `export const api = new ApiClient(...)`.
- Token: `api.setToken()` / `api.clearToken()` ↔ `localStorage('auth_token')`; constructor reads it
  on init (browser only). **Components must not read `localStorage` directly** — go through `api`.
- Method groups: Auth, Email verification, Password reset, Jobs, Applications, Employer jobs,
  Employer, Subscriptions, Company, Blogs, Uploads, Contact.
- Exported helpers (reuse, don't reinvent): `formatSalary`, `getJobTypeLabel`, `getWorkTypeLabel`,
  `getExperienceLabel` (here) + `formatDate`, `cn` (in `lib/utils.ts`).

## 7. Auth — `hooks/use-auth.tsx`
React Context `AuthProvider` exposes: `user`, `loading`, `isAuthenticated`, `login`,
`loginWithCredentials`, `register`, `registerEmployer`, `resendVerificationEmail`, `logout`,
`refreshUser`, `updateUserProfile`. Gate pages with `useRequireAuth()`; bounce logged-in users off
auth pages with `useRedirectIfAuthenticated()`.

## 8. Design system — `app/globals.css`
- Tokens (hex, light theme): `--primary:#004038` (Forest Teal), `--secondary:#fde8ce` (apricot),
  `--accent:#bee9f4` (sky), `--background:#fdfcfc` (parchment), `--foreground:#0f161e`, plus
  `--success`, `--warning`, `--destructive`, `--cta`. Full dark theme (deep forest) under `.dark`.
- Font tokens: `--font-sans` (Inter), `--font-heading` (Montserrat), `--font-serif` (Source Serif),
  `--font-mono` (JetBrains Mono).
- Utility classes: `.gradient-primary/.gradient-accent/.gradient-cta/.gradient-mint/.gradient-warm`,
  `.glass`, `.glow-*`, `.float`, `.pulse-glow`, `.animate-marquee`, `.stat-card`,
  `.dashboard-sidebar/.dashboard-topbar/.dashboard-content`, `.category-badge`, `.heading-underline`.
- **Always use tokens, never raw hex in components** (see CLAUDE.md §0.2).

## 9. Components
- `components/ui/*` — shadcn primitives (badge, button, card, dialog, alert-dialog, dropdown-menu,
  form, input, label, select, separator, tabs, textarea, avatar, navigation-menu, sonner,
  rich-text-editor). **Add via shadcn CLI; never hand-edit.**
- Domain: `jobs/job-card.tsx`, `jobs/job-details-client.tsx`, `blog/blog-details-client.tsx`,
  `layout/{site-layout,header,footer}.tsx`, `error-boundary.tsx`, `loading.tsx`.

## 10. Error handling — `lib/error-handler.ts`
`parseApiError()` → `{message,status,code}`; `handleApiError(error, fallback?)` shows status-aware
toasts (401/403/404/422/500+). Predicates: `isNetworkError`, `isAuthError`, `isValidationError`,
`isEmailVerificationError`. Email-verification errors show a "Resend Email" toast action.

## 11. SEO
Static `metadata` in `app/layout.tsx` (NayaJagir title/OG/Twitter). Dynamic `app/sitemap.ts`
pulls jobs + blogs and emits static + per-job + per-blog URLs.

## 12. Env vars
`NEXT_PUBLIC_API_URL` (backend base — set to the `:5050` API), `NEXT_PUBLIC_APP_URL` (used by sitemap).

## 13. Portal vs Admin (quick contrast)
Portal = Next.js App Router, custom `fetch` client, React Context auth, RHF+Zod, next-themes, Sonner,
token key `auth_token`, roles USER+EMPLOYER. Admin = Vite SPA, Axios, Zustand, react-router,
react-hot-toast, token key `admin_token`, ADMIN only.
