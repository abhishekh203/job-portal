# Frontend (`portal/`) — Engineering Patterns & Conventions

> **Read this before writing any frontend code.** This is the source of truth for how the
> `portal/` Next.js app is structured. Every new page, component, hook, or API call must follow
> these patterns. When you touch old code that violates them, migrate it toward these patterns
> rather than copying the old style.

The goal: one consistent way to fetch data, one way to handle forms, one typed API layer, and a
predictable folder layout — so any developer (or AI agent) can navigate the app without guessing.

---

## 1. Tech Stack (actual, not aspirational)

| Concern | Library | Notes |
|---|---|---|
| Framework | **Next.js 15 (App Router, Turbopack)** | React 19 |
| Server state / data fetching | **TanStack Query v5** | The ONLY way to fetch server data |
| Client/UI state | `useState` / `useReducer`; **Zustand** only for cross-page shared state | Don't reach for Zustand unless state is shared across routes |
| Forms | **react-hook-form + Zod** (`@hookform/resolvers/zod`) | All non-trivial forms |
| UI components | **shadcn/ui** (Radix + CVA) in `components/ui` | Don't hand-roll primitives |
| Styling | **Tailwind CSS v4** + `cn()` from `@/lib/utils` | No inline style objects, no CSS modules |
| Toasts | **sonner** (`toast` from `sonner`) | |
| Icons | **lucide-react** | |
| HTML sanitization | **dompurify** via `@/lib/sanitize` | Always sanitize `dangerouslySetInnerHTML` |

> If a library is in `package.json` but you're not using it where this doc says to, that's a bug to
> fix, not a precedent to follow.

---

## 2. Folder Structure

```
src/
├── app/                 # Routes ONLY. Pages stay thin — compose features, don't implement them.
│   ├── (route)/page.tsx
│   ├── layout.tsx, error.tsx, loading.tsx, not-found.tsx
├── components/
│   ├── ui/              # shadcn primitives — do not edit by hand except via shadcn CLI
│   ├── layout/          # header, footer, site-layout
│   └── <feature>/       # feature-specific presentational components (jobs/, blog/, ...)
├── features/            # NEW: feature logic lives here (see §3). api + hooks + schemas per feature
│   └── <feature>/
│       ├── api.ts       # typed request functions for this feature
│       ├── queries.ts   # query keys + queryOptions + useXxx hooks
│       ├── schemas.ts   # Zod schemas + inferred types for forms/responses
│       └── components/  # (optional) heavier feature components
├── hooks/               # cross-feature hooks (use-auth, etc.)
└── lib/                 # framework-agnostic infra: api client, query-client, error-handler, utils
```

**Dependency direction is one-way:** `lib → features → app`. `lib` never imports from `features`;
`features` never import from `app`. Shared things move *down*, never up.

Keep nesting shallow (max ~3 levels inside a feature). If an import path looks like a maze, flatten it.

---

## 3. Data Fetching — TanStack Query ONLY

**Rule: never fetch server data with `useEffect` + `useState`.** No more `const [data, setData] =
useState(); useEffect(() => { api.x().then(setData) }, [])`. That pattern is banned for server data.
Use TanStack Query for every read, and a mutation for every write.

### 3a. Centralized query keys + `queryOptions`
Each feature owns its keys and typed query configs. Never hand-write `queryKey: ['jobs', filters]`
inline in a component.

```ts
// features/jobs/queries.ts
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from './api'

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobKeys.lists(), filters] as const,
  detail: (slug: string) => [...jobKeys.all, 'detail', slug] as const,
}

export const jobDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: jobKeys.detail(slug),
    queryFn: () => jobsApi.getJob(slug),
  })
```

```tsx
// in a component
const { data, isLoading, error } = useQuery(jobDetailQuery(slug))
```

### 3b. Mutations invalidate exactly what changed
```ts
export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.lists() }),
  })
}
```

### 3c. Prefer Server Components for the prefetch
For pages that can render on the server, prefetch in the Server Component and hydrate:
treat the Server Component as a data loader, render results in a Client Component via the same
`queryOptions`. Add `'use client'` only where you need interactivity. Don't make a whole page a
client component just to fetch.

### 3d. Loading & error states
Use the shared skeletons in `@/components/loading` and the standard error handling in §5 — don't
invent per-page spinners.

---

## 4. Forms — react-hook-form + Zod

**Rule: no hand-rolled `useState` form objects with manual `if (!field) toast.error(...)`
validation.** Define a Zod schema, infer the type, wire it with RHF.

```tsx
const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  salaryMin: z.coerce.number().optional(),
})
type JobFormValues = z.infer<typeof jobSchema>

const form = useForm<JobFormValues>({
  resolver: zodResolver(jobSchema),
  defaultValues: { title: '', salaryMin: undefined },
})

const onSubmit = form.handleSubmit((values) => createJob.mutate(values))
```

Use the shadcn `Form`, `FormField`, `FormItem`, `FormMessage` components from `@/components/ui/form`
to render fields and show validation messages. Submit through a TanStack mutation (§3b), not a
bare `api.x()` call. Validation rules live in the schema, never scattered as inline `if` checks.

---

## 5. API Layer & Error Handling

- The HTTP client is `@/lib/api` (`ApiClient`). Add endpoint functions there or in a feature's
  `api.ts`, but **every function must have an explicit typed return — no `Promise<any>`, no
  `useState<any[]>`, no `as any`.** Define an interface for each response shape.
- Errors are normalized by `@/lib/error-handler`. In mutations/queries, surface user-facing errors
  with `handleApiError(error, 'Friendly fallback message')`. Don't `console.log` raw errors as the
  only handling.
- Don't duplicate utilities. `formatDate`, `formatSalary`, label maps, etc. live **once** in
  `@/lib/utils` (or a feature util) — import them, don't redefine.

---

## 6. Auth

- Auth state comes from `useAuth()` (`@/hooks/use-auth`). Gate protected pages with
  `useRequireAuth()`; redirect logged-in users away from auth pages with `useRedirectIfAuthenticated()`.
- Token storage is centralized in the API client (`api.setToken` / `api.clearToken`). Components must
  **not** touch `localStorage.getItem('auth_token')` directly.
- > Known risk to revisit: the JWT currently lives in `localStorage` (XSS-exposed). Prefer an
  > httpOnly cookie when the backend supports it. Don't add new `localStorage` token reads.

---

## 7. Components & Styling

- Pages in `app/` stay thin: compose feature components + hooks. Heavy UI/logic goes into
  `components/<feature>/` or `features/<feature>/`.
- Use shadcn primitives from `components/ui`. To add a new primitive, use the shadcn CLI — don't
  paste a custom one.
- Compose class names with `cn(...)`. No inline `style={{}}` objects for things Tailwind can express.
- Keep a single component per file; name files `kebab-case.tsx`, components `PascalCase`.
- Sanitize any server/user HTML with `sanitizeHtml` from `@/lib/sanitize` before
  `dangerouslySetInnerHTML`.

---

## 8. Naming & Conventions

- Files & folders: `kebab-case`. Components: `PascalCase`. Hooks: `useThing`. Query keys: `<feature>Keys`.
- Co-locate types with their feature; only put cross-cutting types in `lib`.
- `'use client'` only when a component needs state, effects, or browser APIs.

---

## 9. Definition of Done — checklist for any new frontend change

- [ ] Server data fetched via TanStack Query (`useQuery`/`useInfiniteQuery`/`useMutation`), not `useEffect`.
- [ ] Query key comes from a feature `*Keys` factory; mutations invalidate the right keys.
- [ ] Forms use react-hook-form + a Zod schema; no manual `if`-based validation.
- [ ] No `any` (no `Promise<any>`, `useState<any>`, `as any`). Every API response is typed.
- [ ] Errors handled via `handleApiError`; loading via shared skeletons.
- [ ] No direct `localStorage` token access; auth via `useAuth`.
- [ ] No duplicated util (`formatDate`, label maps, etc.) — imported from one place.
- [ ] Styling via Tailwind + `cn()`; UI via shadcn primitives.
- [ ] Page component is thin; logic lives in a hook/feature.
- [ ] `npm run lint` passes.

---

## 10. Migration status (legacy code to converge)

The codebase predates this doc. When you edit these areas, migrate them:
- `app/dashboard/employer/**` and several dashboard pages fetch with `useEffect` + `useState` → move to TanStack Query.
- All current forms (`auth/register`, `employer/jobs/new`, `employer/jobs/[id]/edit`, `profile`) use raw `useState` → migrate to RHF + Zod.
- `lib/api.ts` employer methods return `Promise<any>` → add typed interfaces.
- `formatDate` duplicated in `lib/api.ts` and `lib/utils.ts` → keep one.
- Inline string query keys → key factories.
